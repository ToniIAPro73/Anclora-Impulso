#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const DEFAULT_MANIFEST_PATH = path.join(ROOT, "ai", "comfy", "manifests", "missing-exercise-images.json")
const DEFAULT_OUTPUT_DIR = path.join(ROOT, "ai", "image-generation-prompts")

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function normalizeLimit(value) {
  const parsed = Number.parseInt(value ?? "", 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function parseArgs(argv) {
  const result = {
    manifestPath: DEFAULT_MANIFEST_PATH,
    outputDir: DEFAULT_OUTPUT_DIR,
    format: "all",
    environment: null,
    slug: null,
    limit: null,
    batchSize: 25,
    dryRun: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === "--manifest") {
      result.manifestPath = path.resolve(argv[index + 1] ?? result.manifestPath)
      index += 1
    } else if (arg === "--output-dir") {
      result.outputDir = path.resolve(argv[index + 1] ?? result.outputDir)
      index += 1
    } else if (arg === "--format") {
      result.format = argv[index + 1] ?? result.format
      index += 1
    } else if (arg === "--environment") {
      result.environment = argv[index + 1] ?? null
      index += 1
    } else if (arg === "--slug") {
      result.slug = argv[index + 1] ?? null
      index += 1
    } else if (arg === "--limit") {
      result.limit = normalizeLimit(argv[index + 1])
      index += 1
    } else if (arg === "--batch-size") {
      result.batchSize = normalizeLimit(argv[index + 1]) ?? result.batchSize
      index += 1
    } else if (arg === "--dry-run") {
      result.dryRun = true
    }
  }

  return result
}

export function buildPromptExports({ manifest, limit = null, environment = null, slug = null }) {
  let exercises = Array.isArray(manifest.exercises) ? manifest.exercises : []

  if (environment) {
    exercises = exercises.filter((exercise) => exercise.environment === environment)
  }
  if (slug) {
    exercises = exercises.filter((exercise) => exercise.slug === slug)
  }
  if (Number.isFinite(limit) && limit > 0) {
    exercises = exercises.slice(0, limit)
  }

  return exercises.map((exercise, index) => ({
    index: index + 1,
    slug: exercise.slug,
    name: exercise.name,
    environment: exercise.environment,
    prompt: exercise.sourcePrompt,
    negativePrompt: exercise.sourceNegativePrompt,
    output: {
      targetPath: exercise.targetPath,
      targetFolder: exercise.targetFolder,
      targetFile: exercise.targetFile,
    },
    references: {
      character: exercise.athleteReference,
      environment: exercise.environmentReference,
    },
    generationNotes: [
      "Use the provided character/model reference to keep identity consistent.",
      "Use the provided environment reference when the tool supports image references.",
      "Generate a square or 4:3 premium fitness app illustration.",
      "Save the final image exactly with the targetFile name.",
    ],
  }))
}

export function formatJsonl(rows) {
  return `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`
}

function csvEscape(value) {
  const text = String(value ?? "")
  return `"${text.replaceAll('"', '""')}"`
}

export function formatCsv(rows) {
  const headers = [
    "slug",
    "name",
    "environment",
    "targetPath",
    "targetFile",
    "prompt",
    "negativePrompt",
    "characterReference",
    "environmentReference",
  ]
  const lines = rows.map((row) => [
    row.slug,
    row.name,
    row.environment,
    row.output.targetPath,
    row.output.targetFile,
    row.prompt,
    row.negativePrompt,
    row.references.character,
    row.references.environment,
  ].map(csvEscape).join(","))

  return `${headers.join(",")}\n${lines.join("\n")}\n`
}

export function formatMarkdownBatch(rows, { batchTitle }) {
  const sections = rows.map((row) => [
    `## ${row.index}. ${row.name}`,
    "",
    `- Slug: \`${row.slug}\``,
    `- Environment: \`${row.environment}\``,
    `- Target path: \`${row.output.targetPath}\``,
    `- Character reference: \`${row.references.character}\``,
    `- Environment reference: \`${row.references.environment}\``,
    "",
    "Prompt:",
    "",
    "```text",
    row.prompt,
    "```",
    "",
    "Negative prompt:",
    "",
    "```text",
    row.negativePrompt,
    "```",
  ].join("\n"))

  return [`# ${batchTitle}`, "", ...sections].join("\n\n") + "\n"
}

function chunkRows(rows, batchSize) {
  const chunks = []
  for (let index = 0; index < rows.length; index += batchSize) {
    chunks.push(rows.slice(index, index + batchSize))
  }
  return chunks
}

function writeExports({ rows, outputDir, format, batchSize }) {
  ensureDir(outputDir)
  const written = []
  const shouldWrite = (targetFormat) => format === "all" || format === targetFormat

  if (shouldWrite("jsonl")) {
    const filePath = path.join(outputDir, "missing-exercise-image-prompts.jsonl")
    fs.writeFileSync(filePath, formatJsonl(rows), "utf8")
    written.push(filePath)
  }

  if (shouldWrite("csv")) {
    const filePath = path.join(outputDir, "missing-exercise-image-prompts.csv")
    fs.writeFileSync(filePath, formatCsv(rows), "utf8")
    written.push(filePath)
  }

  if (shouldWrite("markdown")) {
    const batchesDir = path.join(outputDir, "batches")
    ensureDir(batchesDir)
    chunkRows(rows, batchSize).forEach((batchRows, index) => {
      const batchNumber = String(index + 1).padStart(3, "0")
      const filePath = path.join(batchesDir, `batch-${batchNumber}.md`)
      fs.writeFileSync(filePath, formatMarkdownBatch(batchRows, {
        batchTitle: `Exercise Image Prompt Batch ${batchNumber}`,
      }), "utf8")
      written.push(filePath)
    })
  }

  return written
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const manifest = readJson(args.manifestPath)
  const rows = buildPromptExports({
    manifest,
    limit: args.limit,
    environment: args.environment,
    slug: args.slug,
  })

  const written = args.dryRun
    ? []
    : writeExports({
        rows,
        outputDir: args.outputDir,
        format: args.format,
        batchSize: args.batchSize,
      })

  const byEnvironment = rows.reduce((accumulator, row) => {
    accumulator[row.environment] = (accumulator[row.environment] ?? 0) + 1
    return accumulator
  }, {})

  console.log(JSON.stringify({
    totalPrompts: rows.length,
    byEnvironment,
    outputDir: path.relative(ROOT, args.outputDir).split(path.sep).join("/"),
    format: args.format,
    batchSize: args.batchSize,
    written: written.map((filePath) => path.relative(ROOT, filePath).split(path.sep).join("/")),
  }, null, 2))
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
