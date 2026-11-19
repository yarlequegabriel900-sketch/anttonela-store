const { createHash } = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");
const sharp = require("sharp");

const root = path.join(__dirname, "..");
const directory = path.join(root, "public", "fotos-productos");
const manifest = path.join(root, "utils", "product-webp.json");

async function main() {
  const { NEXT_PUBLIC_SUPABASE_URL: url, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key } =
    process.env;
  if (!url || !key) throw new Error("Falta la configuración pública de Supabase.");

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const urls = new Set();
  let products = 0;
  const imageRoot = new URL("/storage/v1/object/public/product-images/", url);

  for (let offset = 0; ; offset += 100) {
    const { data, error } = await supabase.from("products")
      .select("id, product_images(image_url)")
      .eq("status", "published")
      .order("id")
      .range(offset, offset + 99);
    if (error) throw new Error(error.message);

    products += data.length;
    for (const product of data) {
      for (const image of product.product_images ?? []) {
        if (image.image_url?.startsWith(imageRoot.href)) urls.add(image.image_url);
      }
    }
    if (data.length < 100) break;
  }

  if (!urls.size) throw new Error("No se encontraron fotos públicas para convertir.");
  await fs.mkdir(directory, { recursive: true });
  const files = {};
  let converted = 0;
  let bytes = 0;
  let missing = 0;

  photos: for (const original of [...urls].sort()) {
    const name = createHash("sha256").update(original).digest("hex").slice(0, 24);
    const variants = [
      { width: 640, quality: 78, file: `${name}-640.webp` },
      { width: 960, quality: 80, file: `${name}-960.webp` },
    ];
    let source;
    for (const { width, quality, file } of variants) {
      const target = path.join(directory, file);
      const existing = await fs.stat(target).catch((error) => {
        if (error.code !== "ENOENT") throw error;
      });
      if (existing?.size) {
        bytes += existing.size;
        continue;
      }
      if (!source) {
        const response = await fetch(original, {
          redirect: "error",
          signal: AbortSignal.timeout(20000),
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          if (response.status === 404 || String(error.statusCode) === "404") {
            missing++;
            continue photos;
          }
          throw new Error(`No se pudo leer una foto pública (HTTP ${response.status}). ${error.message ?? ""}`);
        }
        source = Buffer.from(await response.arrayBuffer());
        converted++;
      }
      const webp = await sharp(source).rotate().resize({ width, withoutEnlargement: true })
        .webp({ quality, effort: 5 }).toBuffer();
      await fs.writeFile(`${target}.tmp`, webp);
      await fs.rename(`${target}.tmp`, target);
      bytes += webp.length;
    }
    const thumbnail = `${name}-192.webp`;
    const thumbnailPath = path.join(directory, thumbnail);
    const existingThumbnail = await fs.stat(thumbnailPath).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
    if (existingThumbnail?.size) {
      bytes += existingThumbnail.size;
    } else {
      const webp = await sharp(path.join(directory, variants[0].file))
        .resize({ width: 192, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
      await fs.writeFile(`${thumbnailPath}.tmp`, webp);
      await fs.rename(`${thumbnailPath}.tmp`, thumbnailPath);
      bytes += webp.length;
    }
    files[original] = [...variants.map(({ file }) => file), thumbnail]
      .map((file) => `/fotos-productos/${file}`);
    if (Object.keys(files).length % 20 === 0) {
      console.log(`Preparadas ${Object.keys(files).length} de ${urls.size} fotos.`);
    }
  }

  if (!Object.keys(files).length) throw new Error("Ninguna foto pública está disponible.");
  await fs.writeFile(`${manifest}.tmp`, JSON.stringify(files, null, 2) + "\n");
  await fs.rename(`${manifest}.tmp`, manifest);
  console.log(`${products} productos publicados, ${Object.keys(files).length} fotos preparadas, ${missing} archivos ausentes, ${converted} originales descargados, ${(bytes / 1e6).toFixed(2)} MB en WebP.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
