import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const PROMPTS_PATH = path.join(ROOT, "data", "prompts.json")
const REFERENCES_PATH = path.join(ROOT, "ai", "comfy", "manifests", "reference-config.json")
const BINDINGS_PATH = path.join(ROOT, "ai", "comfy", "manifests", "workflow-bindings.json")
const STATE_PATH = path.join(ROOT, "ai", "comfy", "manifests", "generation-state.json")
const JOBS_DIR = path.join(ROOT, "ai", "comfy", "manifests", "jobs")

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8")
}

function parseArgs(argv) {
  const result = {
    limit: null,
    environment: null,
    slug: null,
    dryRun: false,
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
    }
  }

  return result
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function relativeRepoPath(targetPath) {
  return path.relative(ROOT, targetPath).split(path.sep).join("/")
}

function resolveEnvironmentReference(config, environment) {
  const envRef = config.environmentReferences?.[environment]
  if (!envRef) {
    throw new Error(`No existe referencia visual para environment="${environment}"`)
  }
  return envRef
}

function buildOutputPrefix(exercise) {
  return `anclora/${exercise.environment}/${exercise.slug}`
}

function buildJob({ exercise, config, bindings, workflowExists }) {
  const athleteReference = config.testSelection.athleteReference
  const environmentReference = resolveEnvironmentReference(config, exercise.environment)
  const targetFolder = path.join(ROOT, exercise.target_folder)
  const targetPath = path.join(targetFolder, exercise.target_file)

  return {
    id: exercise.id,
    slug: exercise.slug,
    name: exercise.name,
    environment: exercise.environment,
    targetPath: relativeRepoPath(targetPath),
    targetFolder: relativeRepoPath(targetFolder),
    outputPrefix: buildOutputPrefix(exercise),
    sourcePrompt: exercise.prompt,
    sourceNegativePrompt: exercise.negative_prompt,
    athleteReference,
    environmentReference,
    workflow: {
      exists: workflowExists,
      path: bindings.workflowPath,
      bindings: bindings.nodes,
    },
  }
}

function updateState(state, jobs) {
  const next = { ...state, jobs: { ...state.jobs } }
  for (const job of jobs) {
    next.jobs[job.slug] = {
      id: job.id,
      environment: job.environment,
      targetPath: job.targetPath,
      status: "prepared",
      updatedAt: new Date().toISOString(),
    }
  }
  return next
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const promptsData = readJson(PROMPTS_PATH)
  const config = readJson(REFERENCES_PATH)
  const bindings = readJson(BINDINGS_PATH)
  const state = readJson(STATE_PATH)
  const workflowPath = path.join(ROOT, bindings.workflowPath)
  const workflowExists = fs.existsSync(workflowPath)

  let exercises = Array.isArray(promptsData.exercises) ? promptsData.exercises : []

  if (args.environment) {
    exercises = exercises.filter((exercise) => exercise.environment === args.environment)
  }
  if (args.slug) {
    exercises = exercises.filter((exercise) => exercise.slug === args.slug)
  }
  if (Number.isFinite(args.limit) && args.limit > 0) {
    exercises = exercises.slice(0, args.limit)
  }

  ensureDir(JOBS_DIR)

  const jobs = exercises.map((exercise) =>
    buildJob({
      exercise,
      config,
      bindings,
      workflowExists,
    }),
  )

  for (const job of jobs) {
    writeJson(path.join(JOBS_DIR, `${job.slug}.json`), job)
  }

  if (!args.dryRun) {
    writeJson(STATE_PATH, updateState(state, jobs))
  }

  const summary = {
    totalPrepared: jobs.length,
    workflowExists,
    athleteReference: config.testSelection.athleteReference,
    environments: [...new Set(jobs.map((job) => job.environment))],
    jobsDir: relativeRepoPath(JOBS_DIR),
  }

  console.log(JSON.stringify(summary, null, 2))
}

main()
