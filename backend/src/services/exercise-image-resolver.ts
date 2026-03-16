import fs from 'fs';
import path from 'path';

type ResolvedExerciseImage = {
  dirSlug: string;
  fileStem: string;
  publicPath: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function loadAvailableExerciseImages(): ResolvedExerciseImage[] {
  const exercisesDir = path.resolve(process.cwd(), 'public/exercises');

  if (!fs.existsSync(exercisesDir)) {
    return [];
  }

  return fs
    .readdirSync(exercisesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const dirSlug = entry.name;
      const dirPath = path.join(exercisesDir, dirSlug);
      const files = fs
        .readdirSync(dirPath, { withFileTypes: true })
        .filter((file) => file.isFile() && /\.(png|jpg|jpeg|webp)$/i.test(file.name));

      return files.map((file) => ({
        dirSlug,
        fileStem: slugify(path.parse(file.name).name),
        publicPath: `/exercises/${dirSlug}/${file.name}`,
      }));
    });
}

let cachedImages: ResolvedExerciseImage[] | null = null;

function getAvailableExerciseImages() {
  if (!cachedImages) {
    cachedImages = loadAvailableExerciseImages();
  }

  return cachedImages;
}

export function resolveExerciseImageUrl(exerciseName: string) {
  const availableImages = getAvailableExerciseImages();
  const exerciseSlug = slugify(exerciseName);

  const exactMatch =
    availableImages.find((image) => image.dirSlug === exerciseSlug) ??
    availableImages.find((image) => image.fileStem === exerciseSlug);

  if (exactMatch) {
    return exactMatch.publicPath;
  }

  const partialMatch =
    availableImages.find((image) => image.dirSlug.startsWith(exerciseSlug)) ??
    availableImages.find((image) => exerciseSlug.startsWith(image.dirSlug)) ??
    availableImages.find((image) => image.fileStem.startsWith(exerciseSlug)) ??
    availableImages.find((image) => exerciseSlug.startsWith(image.fileStem));

  return partialMatch?.publicPath ?? null;
}
