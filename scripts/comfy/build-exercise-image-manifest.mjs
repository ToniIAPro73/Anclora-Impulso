#!/usr/bin/env node
import path from "node:path"

import {
  buildExerciseImageManifest,
  readJson,
  writeJson,
} from "./exercise-image-manifest.mjs"

const ROOT = process.cwd()
const PROMPTS_PATH = path.join(ROOT, "data", "prompts.json")
const REFERENCES_PATH = path.join(ROOT, "ai", "comfy", "manifests", "reference-config.json")
const OUTPUT_PATH = path.join(ROOT, "ai", "comfy", "manifests", "missing-exercise-images.json")

function parseArgs(argv) {
  const result = {
    includeExisting: false,
    dryRun: false,
  }

  for (const arg of argv) {
    if (arg === "--include-existing") {
      result.includeExisting = true
    } else if (arg === "--dry-run") {
      result.dryRun = true
    }
  }

  return result
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const manifest = buildExerciseImageManifest({
    root: ROOT,
    promptData: readJson(PROMPTS_PATH),
    referenceConfig: readJson(REFERENCES_PATH),
    includeExisting: args.includeExisting,
  })

  if (!args.dryRun) {
    writeJson(OUTPUT_PATH, manifest)
  }

  console.log(
    JSON.stringify(
      {
        outputPath: "ai/comfy/manifests/missing-exercise-images.json",
        ...manifest.summary,
      },
      null,
      2,
    ),
  )
}

main()
