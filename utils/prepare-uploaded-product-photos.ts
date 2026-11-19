import sharp from "sharp";

export async function prepareUploadedProductPhotos(formData: FormData) {
  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const photos: Buffer[] = [];

  for (const file of files) {
    try {
      const bytes = Buffer.from(await file.arrayBuffer());
      const image = sharp(bytes, { limitInputPixels: 60_000_000 });
      const { format, width, height, pages } = await image.metadata();
      if (
        format === "webp" && width && height &&
        Math.max(width, height) <= 1280 && bytes.length <= 350_000 &&
        (pages ?? 1) === 1
      ) {
        photos.push(bytes);
      } else {
        photos.push(await image.rotate()
          .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 78 })
          .toBuffer());
      }
    } catch {
      throw new Error(`No se pudo preparar «${file.name}». Elige una imagen JPG, PNG o WebP válida.`);
    }
  }

  return photos;
}
