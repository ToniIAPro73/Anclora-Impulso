import fs from "node:fs"
import path from "node:path"

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

export function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8")
}

export function relativeRepoPath(root, targetPath) {
  return path.relative(root, targetPath).split(path.sep).join("/")
}

export function normalizeTargetPath(root, exercise) {
  return relativeRepoPath(root, path.join(root, exercise.target_folder, exercise.target_file))
}

function resolveEnvironmentReference(referenceConfig, environment) {
  const reference = referenceConfig.environmentReferences?.[environment]
  if (!reference) {
    throw new Error(`No existe referencia visual para environment="${environment}"`)
  }
  return reference
}

function resolveAthleteReference(referenceConfig) {
  const reference = referenceConfig.testSelection?.athleteReference
  if (!reference || !reference.includes("modelo_gym_masc_31_40")) {
    throw new Error("La referencia activa de atleta debe ser el modelo masculino 31-40")
  }
  return reference
}

function targetExists(root, exercise) {
  return fs.existsSync(path.join(root, exercise.target_folder, exercise.target_file))
}

function toManifestExercise(root, exercise, referenceConfig) {
  const targetPath = normalizeTargetPath(root, exercise)

  return {
    id: exercise.id,
    slug: exercise.slug,
    name: exercise.name,
    environment: exercise.environment,
    targetPath,
    targetFolder: relativeRepoPath(root, path.join(root, exercise.target_folder)),
    targetFile: exercise.target_file,
    outputPrefix: `anclora/${exercise.environment}/${exercise.slug}`,
    sourcePrompt: exercise.prompt,
    sourceNegativePrompt: exercise.negative_prompt,
    athleteReference: resolveAthleteReference(referenceConfig),
    environmentReference: resolveEnvironmentReference(referenceConfig, exercise.environment),
    source: "data/prompts.json",
  }
}

export function buildExerciseImageManifest({
  root,
  promptData,
  referenceConfig,
  includeExisting = false,
}) {
  const sourceExercises = Array.isArray(promptData.exercises) ? promptData.exercises : []
  const exercises = sourceExercises
    .filter((exercise) => includeExisting || !targetExists(root, exercise))
    .map((exercise) => toManifestExercise(root, exercise, referenceConfig))

  const byEnvironment = exercises.reduce((accumulator, exercise) => {
    accumulator[exercise.environment] = (accumulator[exercise.environment] ?? 0) + 1
    return accumulator
  }, {})

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    source: {
      prompts: "data/prompts.json",
      references: "ai/comfy/manifests/reference-config.json",
    },
    summary: {
      totalSourceExercises: sourceExercises.length,
      totalMissing: exercises.length,
      byEnvironment,
      athleteReference: resolveAthleteReference(referenceConfig),
    },
    exercises,
  }
}

export function resolveManifestSourceExercises({ sourceExercises, manifest, missingOnly }) {
  if (!missingOnly) {
    return sourceExercises
  }

  return Array.isArray(manifest?.exercises) ? manifest.exercises : []
}
