import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import test from "node:test"

import {
  buildExerciseImageManifest,
  resolveManifestSourceExercises,
} from "./exercise-image-manifest.mjs"

function makeTempRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "anclora-exercise-images-"))
  fs.mkdirSync(path.join(root, "backend", "public", "exercises", "existing-push-up"), { recursive: true })
  fs.writeFileSync(path.join(root, "backend", "public", "exercises", "existing-push-up", "existing_push_up.png"), "fake")
  return root
}

const referenceConfig = {
  testSelection: {
    athleteReference: "ai/comfy/references/athlete/modelos-masc/modelo_gym_masc_31_40.png",
  },
  environmentReferences: {
    gym: "ai/comfy/references/environments/entorno_gym.png",
    home: "ai/comfy/references/environments/entorno_home.png",
    outdoor: "ai/comfy/references/environments/entorno_outside.png",
  },
}

test("buildExerciseImageManifest keeps only missing targets by default and uses 31-40 model references", () => {
  const root = makeTempRepo()
  const promptData = {
    exercises: [
      {
        id: "existing",
        name: "Existing Push Up",
        slug: "existing-push-up",
        target_folder: "backend/public/exercises/existing-push-up/",
        target_file: "existing_push_up.png",
        environment: "home",
        prompt: "Existing prompt",
        negative_prompt: "Existing negative",
      },
      {
        id: "missing",
        name: "Missing Squat",
        slug: "missing-squat",
        target_folder: "backend/public/exercises/missing-squat/",
        target_file: "missing_squat.png",
        environment: "gym",
        prompt: "Missing prompt",
        negative_prompt: "Missing negative",
      },
    ],
  }

  const manifest = buildExerciseImageManifest({
    root,
    promptData,
    referenceConfig,
  })

  assert.equal(manifest.summary.totalSourceExercises, 2)
  assert.equal(manifest.summary.totalMissing, 1)
  assert.equal(manifest.exercises.length, 1)
  assert.equal(manifest.exercises[0].slug, "missing-squat")
  assert.equal(manifest.exercises[0].athleteReference, referenceConfig.testSelection.athleteReference)
  assert.equal(manifest.exercises[0].environmentReference, referenceConfig.environmentReferences.gym)
  assert.equal(manifest.exercises[0].targetPath, "backend/public/exercises/missing-squat/missing_squat.png")
})

test("resolveManifestSourceExercises returns manifest exercises when missing-only mode is enabled", () => {
  const sourceExercises = [
    { slug: "all-1" },
    { slug: "all-2" },
  ]
  const manifest = {
    exercises: [
      { slug: "missing-1" },
    ],
  }

  assert.deepEqual(resolveManifestSourceExercises({ sourceExercises, manifest, missingOnly: false }), sourceExercises)
  assert.deepEqual(resolveManifestSourceExercises({ sourceExercises, manifest, missingOnly: true }), manifest.exercises)
})
