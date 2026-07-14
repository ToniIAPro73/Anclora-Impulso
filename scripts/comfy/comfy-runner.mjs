import fs from "node:fs"
import path from "node:path"
import { randomUUID } from "node:crypto"

const ROOT = process.cwd()
const PAYLOADS_DIR = path.join(ROOT, "ai", "comfy", "manifests", "payloads")

export function buildComfyUrl({ baseUrl, apiPrefix = "", pathname, query }) {
  const normalizedBase = baseUrl.replace(/\/+$/, "")
  const normalizedPrefix = apiPrefix ? `/${apiPrefix.replace(/^\/+|\/+$/g, "")}` : ""
  const normalizedPath = `/${pathname.replace(/^\/+/, "")}`
  const url = new URL(`${normalizedBase}${normalizedPrefix}${normalizedPath}`)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value ?? "")
    }
  }

  return url.toString()
}

export function extractImageOutputs(historyEntry) {
  const outputs = historyEntry?.outputs ?? {}
  const images = []

  for (const [nodeId, nodeOutput] of Object.entries(outputs)) {
    for (const image of nodeOutput?.images ?? []) {
      images.push({
        filename: image.filename,
        subfolder: image.subfolder ?? "",
        type: image.type ?? "output",
        nodeId,
      })
    }
  }

  return images
}

export function getFirstImageOutput(historyEntry) {
  return extractImageOutputs(historyEntry)[0] ?? null
}

export function resolvePayloadFiles({ payloadsDir = PAYLOADS_DIR, payloads = null, slug = null, limit = null }) {
  let files = payloads ?? fs.readdirSync(payloadsDir).filter((entry) => entry.endsWith(".json"))
  files = [...files].sort((left, right) => left.localeCompare(right))

  if (slug) {
    files = files.filter((file) => file === `${slug}.json`)
  }

  if (Number.isFinite(limit) && limit > 0) {
    files = files.slice(0, limit)
  }

  return files
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

function parseArgs(argv) {
  const result = {
    baseUrl: process.env.COMFY_BASE_URL ?? "http://127.0.0.1:8188",
    apiPrefix: process.env.COMFY_API_PREFIX ?? "",
    apiKey: process.env.COMFY_API_KEY ?? "",
    slug: null,
    limit: null,
    timeoutMs: 10 * 60 * 1000,
    pollMs: 2000,
    dryRun: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === "--base-url") {
      result.baseUrl = argv[index + 1] ?? result.baseUrl
      index += 1
    } else if (arg === "--api-prefix") {
      result.apiPrefix = argv[index + 1] ?? result.apiPrefix
      index += 1
    } else if (arg === "--slug") {
      result.slug = argv[index + 1] ?? null
      index += 1
    } else if (arg === "--limit") {
      result.limit = Number.parseInt(argv[index + 1] ?? "", 10)
      index += 1
    } else if (arg === "--timeout-ms") {
      result.timeoutMs = Number.parseInt(argv[index + 1] ?? "", 10)
      index += 1
    } else if (arg === "--poll-ms") {
      result.pollMs = Number.parseInt(argv[index + 1] ?? "", 10)
      index += 1
    } else if (arg === "--dry-run") {
      result.dryRun = true
    }
  }

  return result
}

function buildHeaders(apiKey) {
  const headers = {
    "Content-Type": "application/json",
  }

  if (apiKey) {
    headers["X-API-Key"] = apiKey
  }

  return headers
}

async function queuePrompt({ baseUrl, apiPrefix, apiKey, prompt }) {
  const clientId = randomUUID()
  const requestedPromptId = randomUUID()
  const response = await fetch(buildComfyUrl({ baseUrl, apiPrefix, pathname: "/prompt" }), {
    method: "POST",
    headers: buildHeaders(apiKey),
    body: JSON.stringify({
      prompt,
      client_id: clientId,
      prompt_id: requestedPromptId,
    }),
  })

  if (!response.ok) {
    throw new Error(`Comfy prompt queue failed: HTTP ${response.status} ${await response.text()}`)
  }

  const body = await response.json()
  return body.prompt_id ?? requestedPromptId
}

async function getHistory({ baseUrl, apiPrefix, apiKey, promptId }) {
  const response = await fetch(buildComfyUrl({ baseUrl, apiPrefix, pathname: `/history/${promptId}` }), {
    headers: buildHeaders(apiKey),
  })

  if (!response.ok) {
    throw new Error(`Comfy history request failed for ${promptId}: HTTP ${response.status} ${await response.text()}`)
  }

  return response.json()
}

async function waitForHistory({ baseUrl, apiPrefix, apiKey, promptId, timeoutMs, pollMs }) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    const history = await getHistory({ baseUrl, apiPrefix, apiKey, promptId })
    const entry = history[promptId]
    if (entry?.outputs) {
      return entry
    }
    await new Promise((resolve) => setTimeout(resolve, pollMs))
  }

  throw new Error(`Timed out waiting for Comfy prompt ${promptId}`)
}

async function downloadImage({ baseUrl, apiPrefix, apiKey, image }) {
  const response = await fetch(buildComfyUrl({
    baseUrl,
    apiPrefix,
    pathname: "/view",
    query: {
      filename: image.filename,
      subfolder: image.subfolder ?? "",
      type: image.type ?? "output",
    },
  }), {
    headers: apiKey ? { "X-API-Key": apiKey } : {},
  })

  if (!response.ok) {
    throw new Error(`Comfy image download failed for ${image.filename}: HTTP ${response.status}`)
  }

  return Buffer.from(await response.arrayBuffer())
}

async function runPayload({ payloadPath, options }) {
  const payload = readJson(payloadPath)
  const prompt = payload.request?.prompt
  if (!prompt) {
    throw new Error(`Payload sin request.prompt: ${payloadPath}`)
  }

  if (options.dryRun) {
    return {
      slug: payload.slug,
      targetPath: payload.targetPath,
      status: "dry_run",
    }
  }

  const promptId = await queuePrompt({ ...options, prompt })
  const historyEntry = await waitForHistory({ ...options, promptId })
  const image = getFirstImageOutput(historyEntry)
  if (!image) {
    throw new Error(`Comfy prompt ${promptId} no produjo imágenes`)
  }

  const imageBytes = await downloadImage({ ...options, image })
  const targetPath = path.join(ROOT, payload.targetPath)
  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.writeFileSync(targetPath, imageBytes)

  return {
    slug: payload.slug,
    promptId,
    targetPath: payload.targetPath,
    sourceImage: image,
    status: "written",
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const files = resolvePayloadFiles({ slug: args.slug, limit: args.limit })
  const results = []

  for (const file of files) {
    results.push(await runPayload({
      payloadPath: path.join(PAYLOADS_DIR, file),
      options: args,
    }))
  }

  console.log(JSON.stringify({
    total: results.length,
    baseUrl: args.baseUrl,
    apiPrefix: args.apiPrefix,
    dryRun: args.dryRun,
    results,
  }, null, 2))
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
