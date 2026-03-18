import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const BINDINGS_PATH = path.join(ROOT, "ai", "comfy", "manifests", "workflow-bindings.json")
const STATE_PATH = path.join(ROOT, "ai", "comfy", "manifests", "generation-state.json")
const JOBS_DIR = path.join(ROOT, "ai", "comfy", "manifests", "jobs")
const PAYLOADS_DIR = path.join(ROOT, "ai", "comfy", "manifests", "payloads")

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8")
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function relativeRepoPath(targetPath) {
  return path.relative(ROOT, targetPath).split(path.sep).join("/")
}

function parseArgs(argv) {
  const result = {
    limit: null,
    environment: null,
    slug: null,
    dryRun: false,
    skipExistingOutput: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === "--limit") {
      result.limit = Number.parseInt(argv[index + 1] ?? "", 10)
      index += 1
    } else if (arg === "--environment") {
      result.environment = argv[index + 1] ?? null
      index += 1
    } else if (arg === "--slug") {
      result.slug = argv[index + 1] ?? null
      index += 1
    } else if (arg === "--dry-run") {
      result.dryRun = true
    } else if (arg === "--skip-existing-output") {
      result.skipExistingOutput = true
    }
  }

  return result
}

function loadJobs() {
  if (!fs.existsSync(JOBS_DIR)) {
    throw new Error('No existe "ai/comfy/manifests/jobs". Ejecuta antes "pnpm comfy:prepare".')
  }

  return fs
    .readdirSync(JOBS_DIR)
    .filter((entry) => entry.endsWith(".json"))
    .map((entry) => readJson(path.join(JOBS_DIR, entry)))
}

function validateBinding(name, binding) {
  if (!binding) {
    throw new Error(`Falta binding para "${name}" en workflow-bindings.json`)
  }
  if (!binding.id || binding.id === "REPLACE_ME") {
    throw new Error(`El binding "${name}" todavía no tiene node id real`)
  }
  if (!binding.input) {
    throw new Error(`El binding "${name}" no indica qué input mutar`)
  }
}

function setNodeInput(workflow, binding, value) {
  if (!binding?.id) {
    return
  }

  const node = workflow[binding.id]
  if (!node) {
    throw new Error(`No existe el nodo "${binding.id}" dentro del workflow exportado`)
  }
  node.inputs ??= {}
  node.inputs[binding.input] = value
}

function deriveSeed(slug) {
  const digest = crypto.createHash("sha256").update(slug).digest()
  return digest.readUInt32BE(0)
}

function resolveOptionalPoseReference(job, bindings) {
  const binding = bindings.nodes.poseReferenceImage
  if (!binding?.id) {
    return null
  }

  const posePath = path.join(ROOT, "ai", "comfy", "references", "poses", `${job.slug}.png`)
  return fs.existsSync(posePath) ? relativeRepoPath(posePath) : null
}

function buildWorkflowForJob(workflowTemplate, bindings, job) {
  const workflow = structuredClone(workflowTemplate)

  const requiredBindings = [
    "positivePrompt",
    "negativePrompt",
    "athleteReferenceImage",
    "environmentReferenceImage",
    "outputPrefix",
  ]

  for (const bindingName of requiredBindings) {
    validateBinding(bindingName, bindings.nodes[bindingName])
  }

  setNodeInput(workflow, bindings.nodes.positivePrompt, job.sourcePrompt)
  setNodeInput(workflow, bindings.nodes.negativePrompt, job.sourceNegativePrompt)
  setNodeInput(workflow, bindings.nodes.athleteReferenceImage, job.athleteReference)
  setNodeInput(workflow, bindings.nodes.environmentReferenceImage, job.environmentReference)
  setNodeInput(workflow, bindings.nodes.outputPrefix, job.outputPrefix)

  if (bindings.nodes.seed?.id) {
    setNodeInput(workflow, bindings.nodes.seed, deriveSeed(job.slug))
  }

  const poseReference = resolveOptionalPoseReference(job, bindings)
  if (poseReference && bindings.nodes.poseReferenceImage?.id) {
    setNodeInput(workflow, bindings.nodes.poseReferenceImage, poseReference)
  }

  return {
    workflow,
    poseReference,
  }
}

function filterJobs(jobs, args) {
  let filtered = jobs

  if (args.environment) {
    filtered = filtered.filter((job) => job.environment === args.environment)
  }
  if (args.slug) {
    filtered = filtered.filter((job) => job.slug === args.slug)
  }
  if (args.skipExistingOutput) {
    filtered = filtered.filter((job) => !fs.existsSync(path.join(ROOT, job.targetPath)))
  }
  if (Number.isFinite(args.limit) && args.limit > 0) {
    filtered = filtered.slice(0, args.limit)
  }

  return filtered
}

function buildPayloadDocument(job, workflow, poseReference) {
  return {
    slug: job.slug,
    environment: job.environment,
    targetPath: job.targetPath,
    request: {
      prompt: workflow,
    },
    references: {
      athlete: job.athleteReference,
      environment: job.environmentReference,
      pose: poseReference,
    },
  }
}

function updateState(state, jobs) {
  const next = { ...state, jobs: { ...state.jobs } }

  for (const job of jobs) {
    next.jobs[job.slug] = {
      ...(next.jobs[job.slug] ?? {}),
      id: job.id,
      environment: job.environment,
      targetPath: job.targetPath,
      status: "payload_ready",
      payloadPath: `ai/comfy/manifests/payloads/${job.slug}.json`,
      updatedAt: new Date().toISOString(),
    }
  }

  return next
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const bindings = readJson(BINDINGS_PATH)
  const state = readJson(STATE_PATH)
  const workflowPath = path.join(ROOT, bindings.workflowPath)

  if (!fs.existsSync(workflowPath)) {
    throw new Error(`No existe el workflow exportado en "${bindings.workflowPath}"`)
  }

  const workflowTemplate = readJson(workflowPath)
  const jobs = filterJobs(loadJobs(), args)

  ensureDir(PAYLOADS_DIR)

  const summaries = jobs.map((job) => {
    const { workflow, poseReference } = buildWorkflowForJob(workflowTemplate, bindings, job)
    const payload = buildPayloadDocument(job, workflow, poseReference)
    writeJson(path.join(PAYLOADS_DIR, `${job.slug}.json`), payload)
    return {
      slug: job.slug,
      environment: job.environment,
      payloadPath: `ai/comfy/manifests/payloads/${job.slug}.json`,
      hasPoseReference: Boolean(poseReference),
    }
  })

  if (!args.dryRun) {
    writeJson(STATE_PATH, updateState(state, jobs))
  }

  console.log(
    JSON.stringify(
      {
        totalPayloads: summaries.length,
        workflowPath: bindings.workflowPath,
        payloadsDir: relativeRepoPath(PAYLOADS_DIR),
        jobs: summaries,
      },
      null,
      2,
    ),
  )
}

main()
