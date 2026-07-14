import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import test from "node:test"

import {
  buildPromptExports,
  formatCsv,
  formatJsonl,
  formatMarkdownBatch,
} from "./export-image-prompts.mjs"

const manifest = {
  summary: {
    totalMissing: 2,
    byEnvironment: {
      gym: 1,
      home: 1,
    },
    athleteReference: "ai/comfy/references/athlete/modelos-masc/modelo_gym_masc_31_40.png",
  },
  exercises: [
    {
      slug: "ab-wheel-rollouts",
      name: "Ab Wheel Rollouts",
      environment: "gym",
      targetPath: "backend/public/exercises/ab-wheel-rollouts/ab_wheel_rollouts.png",
      targetFolder: "backend/public/exercises/ab-wheel-rollouts",
      targetFile: "ab_wheel_rollouts.png",
      sourcePrompt: "Prompt for ab wheel",
      sourceNegativePrompt: "Negative for ab wheel",
      athleteReference: "ai/comfy/references/athlete/modelos-masc/modelo_gym_masc_31_40.png",
      environmentReference: "ai/comfy/references/environments/entorno_gym.png",
    },
    {
      slug: "wall-push-ups",
      name: "Wall Push-ups",
      environment: "home",
      targetPath: "backend/public/exercises/wall-push-ups/wall_push_ups.png",
      targetFolder: "backend/public/exercises/wall-push-ups",
      targetFile: "wall_push_ups.png",
      sourcePrompt: "Prompt for wall push-ups",
      sourceNegativePrompt: "Negative for wall push-ups",
      athleteReference: "ai/comfy/references/athlete/modelos-masc/modelo_gym_masc_31_40.png",
      environmentReference: "ai/comfy/references/environments/entorno_home.png",
    },
  ],
}

test("formatJsonl exports one generator-ready prompt per missing exercise", () => {
  const rows = buildPromptExports({ manifest, limit: null, environment: null, slug: null })
  const lines = formatJsonl(rows).trim().split("\n").map((line) => JSON.parse(line))

  assert.equal(lines.length, 2)
  assert.equal(lines[0].slug, "ab-wheel-rollouts")
  assert.equal(lines[0].prompt, "Prompt for ab wheel")
  assert.equal(lines[0].negativePrompt, "Negative for ab wheel")
  assert.equal(lines[0].output.targetPath, "backend/public/exercises/ab-wheel-rollouts/ab_wheel_rollouts.png")
  assert.equal(lines[0].references.character, "ai/comfy/references/athlete/modelos-masc/modelo_gym_masc_31_40.png")
})

test("formatCsv escapes prompts and includes destination filename", () => {
  const csv = formatCsv(buildPromptExports({ manifest, limit: 1, environment: null, slug: null }))

  assert.match(csv, /^slug,name,environment,targetPath,targetFile,prompt,negativePrompt,characterReference,environmentReference/)
  assert.match(csv, /ab-wheel-rollouts/)
  assert.match(csv, /ab_wheel_rollouts\.png/)
})

test("formatMarkdownBatch writes copy-paste image generation cards", () => {
  const markdown = formatMarkdownBatch(buildPromptExports({ manifest, limit: 1, environment: "gym", slug: null }), {
    batchTitle: "Batch 001",
  })

  assert.match(markdown, /# Batch 001/)
  assert.match(markdown, /## 1\. Ab Wheel Rollouts/)
  assert.match(markdown, /Target path/)
  assert.doesNotMatch(markdown, /Wall Push-ups/)
})

test("buildPromptExports writes files in the requested formats", () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "anclora-prompts-"))
  const rows = buildPromptExports({ manifest, limit: null, environment: null, slug: null })

  fs.writeFileSync(path.join(outputDir, "prompts.jsonl"), formatJsonl(rows))
  fs.writeFileSync(path.join(outputDir, "prompts.csv"), formatCsv(rows))
  fs.writeFileSync(path.join(outputDir, "prompts.md"), formatMarkdownBatch(rows, { batchTitle: "Prompts" }))

  assert.equal(fs.existsSync(path.join(outputDir, "prompts.jsonl")), true)
  assert.equal(fs.existsSync(path.join(outputDir, "prompts.csv")), true)
  assert.equal(fs.existsSync(path.join(outputDir, "prompts.md")), true)
})
