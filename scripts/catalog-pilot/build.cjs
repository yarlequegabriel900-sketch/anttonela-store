const fs = require("node:fs/promises");
const path = require("node:path");
const { createHash } = require("node:crypto");

const [repo, output] = process.argv.slice(2).map((value) => path.resolve(value));
const { createClient } = require(path.join(repo, "node_modules", "@supabase", "supabase-js"));
const sharp = require(path.join(repo, "node_modules", "sharp"));
const manifest = require(path.join(repo, "utils", "product-webp.json"));
const publicImages = new URL("/storage/v1/object/public/product-images/", process.env.NEXT_PUBLIC_SUPABASE_URL);
const catalogUrl = new URL(process.env.CATALOG_URL ?? "https://catalogo-anttonela.pages.dev/");
const photoCache = process.env.CATALOG_PHOTO_CACHE;
const advisors = [
  ["Fernando", "51922145920"],
  ["David", "51922568509"],
  ["Gabriel", "51926154709"],
];
const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
);

async function savePhoto(original) {
  const asset = manifest[original]?.[0];
  if (asset && /^\/fotos-productos\/[a-f0-9]+-640\.webp$/.test(asset)) {
    const filename = path.basename(asset);
    await fs.copyFile(path.join(repo, "public", asset.slice(1)), path.join(output, "fotos", filename));
    return filename;
  }

  let source;
  if (/^\/catalogo-canva\/[\w-]+\.webp$/i.test(original)) {
    source = await fs.readFile(path.join(repo, "public", original.slice(1))).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
  } else if (original.startsWith(publicImages.href)) {
    const id = createHash("sha256").update(original).digest("hex").slice(0, 24);
    const filename = `${id}-640.webp`;
    const target = path.join(output, "fotos", filename);
    const cached = photoCache && path.join(photoCache, filename);
    if (cached) {
      const reused = await fs.copyFile(cached, target).then(() => true, (error) => {
        if (error.code !== "ENOENT") throw error;
        return false;
      });
      if (reused) return filename;
    }
    const response = await fetch(original, { redirect: "error", signal: AbortSignal.timeout(20000) });
    if (response.ok) {
      const data = Buffer.from(await response.arrayBuffer());
      await sharp(data).rotate().resize({ width: 640, withoutEnlargement: true })
        .webp({ quality: 78 }).toFile(target);
      if (cached) await fs.copyFile(target, cached);
      return filename;
    } else {
      const error = await response.json().catch(() => ({}));
      if (response.status !== 404 && String(error.statusCode) !== "404") {
        throw new Error(`Una foto no se pudo consultar (HTTP ${response.status}).`);
      }
    }
  }
  if (!source) return undefined;

  const filename = createHash("sha256").update(source).digest("hex").slice(0, 24) + "-640.webp";
  await sharp(source).rotate().resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 78 }).toFile(path.join(output, "fotos", filename));
  return filename;
}

async function getProducts(db) {
  const products = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await db.from("products")
      .select("id,code,name,fabric,price_dozen,category_id,product_images(image_url)")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .order("id")
      .order("sort_order", { referencedTable: "product_images" })
      .range(offset, offset + 99);
    if (error) throw new Error(error.message);
    products.push(...data);
    if (data.length < 100) return products;
  }
}

async function build() {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false } }
  );
  const [categories, products] = await Promise.all([
    db.from("categories").select("id,name").eq("active", true).order("name"),
    getProducts(db),
  ]);
  if (categories.error) throw new Error(categories.error.message);
  await fs.mkdir(path.join(output, "fotos"), { recursive: true });
  if (photoCache) await fs.mkdir(photoCache, { recursive: true });
  const cards = [];
  let photos = 0;
  const cachedPhotos = new Map();
  let missing = 0;
  for (const product of products) {
    const gallery = [];
    for (const { image_url: original } of product.product_images ?? []) {
      if (!original) continue;
      if (!cachedPhotos.has(original)) cachedPhotos.set(original, await savePhoto(original));
      const image = cachedPhotos.get(original);
      if (!image) missing++;
      else if (!gallery.includes(image)) gallery.push(image);
    }
    const [filename] = gallery;
    let photo = '<span class="placeholder">Foto próximamente</span>';
    if (filename) {
      photo = `<button type="button" class="abrir-galeria" aria-label="Ver fotos de ${escape(product.name)}, código ${escape(product.code)}">
        <img src="./fotos/${filename}" alt="${escape(product.name)}" loading="${photos < 2 ? "eager" : "lazy"}" decoding="async">
        <span>${gallery.length} ${gallery.length === 1 ? "foto" : "fotos"}</span>
      </button>`;
      photos++;
    }
    const amount = Number(product.price_dozen);
    const price = amount > 0 ? `S/ ${amount.toFixed(2)}` : "Consultar precio";
    const message = [
      "Hola, me interesa hacer un pedido mayorista de Prendas Anttonela.",
      "",
      `*Producto:* ${product.name}`,
      `*Código:* ${product.code}`,
      ...(amount > 0 ? [`*Precio mayorista:* ${price} desde 12 unidades del mismo código. De 3 a 11, se suman S/ 0.50 por prenda.`] : []),
      "",
      amount > 0
        ? "¿Qué tallas y colores tienen disponibles? Quisiera confirmar el stock para realizar mi pedido."
        : "¿Me podría indicar el precio mayorista y qué tallas o colores tienen disponibles?",
      ...(filename ? ["", `*Foto del producto:* ${new URL(`fotos/${filename}`, catalogUrl).href}`] : []),
    ].join("\n");
    cards.push(`
      <article class="card" data-categoria="${escape(product.category_id)}" data-busqueda="${escape([product.code, product.name, product.fabric].join(" "))}" data-fotos="${gallery.join(" ")}">
        <div class="foto">${photo}</div>
        <div class="datos">
          <p class="codigo">Código ${escape(product.code)}</p>
          <h2>${escape(product.name)}</h2>
          <p class="precio">${price}${amount > 0 ? "<small> precio mayorista</small>" : ""}</p>
          <details class="asesores">
            <summary class="contacto">Consultar disponibilidad</summary>
            <p class="asesores-titulo">Elige un asesor de ventas</p>
            <div class="opciones-asesor">${advisors.map(([name, phone]) =>
              `<a href="https://wa.me/${phone}?text=${encodeURIComponent(message)}" target="_blank" rel="noopener noreferrer">${name}</a>`
            ).join("")}</div>
            ${filename ? `<a class="descargar-foto" href="./fotos/${filename}" download>Descargar foto para adjuntarla</a>` : ""}
          </details>
        </div>
      </article>`);
  }
  const options = categories.data.map(({ id, name }) => `<option value="${escape(id)}">${escape(name)}</option>`).join("");
  const template = await fs.readFile(path.join(__dirname, "catalog-launch", "index.html"), "utf8");
  const html = template.replace(/\{\{(OPCIONES|PRODUCTOS|TOTAL)\}\}/g, (_, key) =>
    ({ OPCIONES: options, PRODUCTOS: cards.join("\n"), TOTAL: String(cards.length) })[key]
  );
  await fs.writeFile(path.join(output, "index.html"), html);
  for (const file of ["catalogo.css", "catalogo.js"]) {
    await fs.copyFile(path.join(__dirname, "catalog-launch", file), path.join(output, file));
  }
  console.log(`${cards.length} productos, ${photos} portadas, ${[...cachedPhotos.values()].filter(Boolean).length} fotos y ${missing} referencias sin archivo disponible.`);
}

build().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
