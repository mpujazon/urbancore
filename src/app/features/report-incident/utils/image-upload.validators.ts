const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

const ACCEPTED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.heic',
  '.heif',
];

const MAX_FILE_SIZE_MB = 5;

export function validateImageFile(file: File): string | null {
  const fileName = file.name.toLowerCase();

  const hasValidMimeType = ACCEPTED_IMAGE_TYPES.includes(file.type);

  const hasValidExtension = ACCEPTED_IMAGE_EXTENSIONS.some((extension) =>
    fileName.endsWith(extension)
  );

  if (!hasValidMimeType && !hasValidExtension) {
    return 'Solo se permiten imágenes JPG, PNG, WebP, HEIC o HEIF.';
  }

  const sizeMb = file.size / 1024 / 1024;

  if (sizeMb > MAX_FILE_SIZE_MB) {
    return `La imagen no puede superar ${MAX_FILE_SIZE_MB} MB.`;
  }

  return null;
}
