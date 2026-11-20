const search = document.querySelector("#buscar");
const category = document.querySelector("#categoria");
const results = document.querySelector("#resultados");
const empty = document.querySelector("#vacio");
const requestedCodes = new Set(
  (new URLSearchParams(window.location.hash.slice(1)).get("pedido") ?? "").split(",").filter(Boolean)
);
const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const cards = [...document.querySelectorAll(".card")].map((element) => ({
  element,
  text: normalize(element.dataset.busqueda),
  category: element.dataset.categoria,
  code: element.querySelector(".codigo").textContent.replace(/^Código\s+/, ""),
}));

function filterCatalog() {
  const query = normalize(search.value.trim());
  const selectedCategory = category.value;
  let count = 0;
  for (const card of cards) {
    const visible = requestedCodes.size
      ? requestedCodes.has(card.code)
      : card.text.includes(query) && (!selectedCategory || card.category === selectedCategory);
    card.element.hidden = !visible;
    if (visible) count++;
  }
  results.textContent = `${count} ${count === 1 ? "producto" : "productos"}`;
  empty.hidden = count !== 0;
}

search.addEventListener("input", filterCatalog);
category.addEventListener("change", filterCatalog);
document.querySelector("#filtros").hidden = requestedCodes.size > 0;
if (requestedCodes.size) {
  document.body.classList.add("vista-pedido");
  document.querySelector("#titulo").textContent = "Fotos de tu pedido";
  document.querySelector(".intro > p:not(.tipo)").textContent = "Pulsa una prenda para ver las fotos de su código.";
  document.querySelector("#volver-catalogo").hidden = false;
  empty.textContent = "Estas prendas ya no aparecen en el catálogo.";
}
filterCatalog();

const galleryDialog = document.querySelector("#galeria");
const galleryPhoto = document.querySelector("#galeria-foto");
const galleryTitle = document.querySelector("#galeria-titulo");
const galleryCode = document.querySelector("#galeria-codigo");
const galleryCount = document.querySelector("#galeria-contador");
const galleryThumbs = document.querySelector("#galeria-miniaturas");
let galleryPhotos = [];
let galleryIndex = 0;

function showPhoto(index) {
  galleryIndex = (index + galleryPhotos.length) % galleryPhotos.length;
  galleryPhoto.src = "./fotos/" + galleryPhotos[galleryIndex];
  galleryPhoto.alt = `${galleryTitle.textContent}, foto ${galleryIndex + 1}`;
  galleryCount.textContent = `${galleryIndex + 1} de ${galleryPhotos.length}`;
  for (const [index, button] of [...galleryThumbs.children].entries()) {
    button.setAttribute("aria-pressed", String(index === galleryIndex));
  }
}

function openGallery(card) {
  galleryPhotos = card.dataset.fotos.split(" ").filter(Boolean);
  if (!galleryPhotos.length) return;
  galleryTitle.textContent = card.querySelector("h2").textContent;
  galleryCode.textContent = card.querySelector(".codigo").textContent;
  document.querySelector("#galeria-controles").hidden = galleryPhotos.length < 2;
  galleryThumbs.hidden = galleryPhotos.length < 2;
  galleryThumbs.replaceChildren(...(galleryPhotos.length < 2 ? [] : galleryPhotos.map((photo, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Ver foto ${index + 1}`);
    const image = document.createElement("img");
    image.alt = "";
    image.loading = "lazy";
    image.src = "./fotos/" + photo;
    button.append(image);
    button.addEventListener("click", () => showPhoto(index));
    return button;
  })));
  showPhoto(0);
  card.querySelector(".abrir-galeria").focus();
  galleryDialog.showModal();
}

document.querySelector(".productos").addEventListener("click", (event) => {
  if (event.target.closest("details, a, .agregar-cotizacion")) return;
  const card = event.target.closest(".card");
  if (card) openGallery(card);
});

const quoteDialog = document.querySelector("#cotizacion");
const quoteButton = document.querySelector("#ver-cotizacion");
const quoteList = document.querySelector("#cotizacion-lista");
const quoteAdvisors = document.querySelector("#cotizacion-asesores");
const quoteStatus = document.querySelector("#cotizacion-estado");
const quoteAmounts = document.querySelector("#cotizacion-importes");
const minimumPerCode = 3;
const maximumPerCode = 12;
const minimumCombined = 12;
const quote = new Map();
const sellers = cards[0]?.element.querySelectorAll(".opciones-asesor a") ?? [];
const quoteLinks = [...sellers].map((seller) => seller.cloneNode(true));
quoteAdvisors.replaceChildren(...quoteLinks);

function formatSoles(cents) {
  return `S/ ${cents / 100n}.${String(cents % 100n).padStart(2, "0")}`;
}

function unitPrice({ price, quantity }) {
  return price + (quantity < minimumCombined ? 50n : 0n);
}

function updateQuote() {
  const items = [...quote.values()];
  const total = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const combined = items.length > 1;
  const invalid = items.some(({ quantity }) =>
    !Number.isSafeInteger(quantity) || quantity < 1 ||
    (combined && (quantity < minimumPerCode || quantity > maximumPerCode))
  );
  const missing = items.length ? Math.max(0, minimumCombined - total) : 0;
  const canSend = items.length > 0 && !invalid && missing === 0;
  const priced = items.filter(({ price }) => price !== null);
  const amount = invalid ? 0n : priced.reduce(
    (sum, item) => sum + unitPrice(item) * BigInt(item.quantity),
    0n
  );
  const amountLabel = invalid ? "Corrige las cantidades para calcular el total."
    : priced.length === 0 ? "Total pendiente de confirmar."
    : priced.length < items.length ? `Subtotal con precio publicado: ${formatSoles(amount)}. Hay precios por confirmar.`
    : `Total estimado: ${formatSoles(amount)}`;
  quoteAmounts.textContent = amountLabel;
  quoteAmounts.hidden = items.length === 0;
  for (const [index, row] of [...quoteList.children].entries()) {
    const item = items[index];
    if (!item) continue;
    const subtotal = row.querySelector(".cotizacion-subtotal");
    if (subtotal) {
      subtotal.textContent = item.price === null ? "Precio por confirmar"
        : invalid ? "" : `${formatSoles(unitPrice(item))} c/u · ${formatSoles(unitPrice(item) * BigInt(item.quantity))}`;
    }
  }
  quoteButton.hidden = quote.size === 0;
  quoteButton.textContent = `Ver cotización (${quote.size})`;
  document.querySelector("#cotizacion-vacia").hidden = quote.size > 0;
  document.querySelector("#cotizacion-envio").hidden = !canSend;
  quoteStatus.hidden = items.length === 0;
  quoteStatus.textContent = invalid
    ? combined ? "Elige entre 3 y 12 unidades por código." : "Indica una cantidad de al menos una unidad."
    : missing > 0
      ? `Total: ${total} de 12 prendas. ${missing === 1 ? "Falta 1 prenda" : `Faltan ${missing} prendas`} para enviar.`
      : `Total: ${total} prendas.`;
  if (!canSend) {
    for (const link of quoteLinks) link.removeAttribute("href");
    return;
  }
  if (!combined) {
    const { sellerLinks, quantity } = items[0];
    for (const [index, link] of quoteLinks.entries()) {
      const url = new URL(sellerLinks[index].href);
      const message = url.searchParams.get("text").replace(
        /^(\*Código:\* .+)$/m,
        (_, code) => `${code}\n*Cantidad solicitada:* ${quantity} ${quantity === 1 ? "unidad" : "unidades"}\n${amountLabel}`
      );
      url.searchParams.set("text", message);
      link.href = url.href;
    }
    return;
  }
  const gallery = new URL(window.location.pathname, window.location.origin);
  gallery.hash = new URLSearchParams({ pedido: items.map(({ code }) => code).join(",") }).toString();
  const message = [
    "Hola, me interesa cotizar este pedido mayorista de Prendas Anttonela:",
    "",
    ...items.map((item) => {
      const { code, name, quantity, price } = item;
      const subtotal = price === null ? "precio por confirmar" : formatSoles(unitPrice(item) * BigInt(quantity));
      return `• ${code} · ${name} · ${quantity} und. · ${subtotal}`;
    }),
    "",
    `*Total:* ${total} prendas`,
    amountLabel,
    "Precio mayorista desde 12 unidades por código. De 3 a 11, se suman S/ 0.50 por prenda.",
    "",
    `*Fotos del pedido:* ${gallery.href}`,
    "",
    "¿Qué tallas y colores tienen disponibles? ¿Me confirman el stock y las condiciones mayoristas, por favor?",
  ].join("\n");
  for (const [index, link] of quoteLinks.entries()) {
    const url = new URL(sellers[index].href);
    url.searchParams.set("text", message);
    link.href = url.href;
  }
}

function renderQuote() {
  quoteList.replaceChildren(...[...quote.values()].map((item) => {
    const row = document.createElement("div");
    row.className = "cotizacion-prenda";
    const product = document.createElement("strong");
    product.textContent = `${item.code} · ${item.name}`;
    const label = document.createElement("label");
    const combined = quote.size > 1;
    label.textContent = combined ? "Unidades (3–12)" : "Unidades (mín. 12)";
    const units = document.createElement("input");
    units.type = "number";
    units.min = String(combined ? minimumPerCode : minimumCombined);
    if (combined) units.max = String(maximumPerCode);
    units.step = "1";
    units.value = item.quantity == null ? "" : String(item.quantity);
    units.setAttribute("aria-label", `Unidades de ${item.code}`);
    units.addEventListener("input", () => {
      const value = units.valueAsNumber;
      item.quantity = Number.isFinite(value) ? value : null;
      updateQuote();
    });
    label.append(units);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Quitar";
    remove.setAttribute("aria-label", `Quitar ${item.code} de la cotización`);
    remove.addEventListener("click", () => {
      quote.delete(item.code);
      item.button.textContent = "Añadir a mi cotización";
      renderQuote();
      quoteDialog.querySelector("button").focus();
    });
    const subtotal = document.createElement("p");
    subtotal.className = "codigo cotizacion-subtotal";
    row.append(product, label, remove, subtotal);
    return row;
  }));
  updateQuote();
}

for (const { element } of cards) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "agregar-cotizacion";
  button.textContent = "Añadir a mi cotización";
  const code = element.querySelector(".codigo").textContent.replace(/^Código\s+/, "");
  const name = element.querySelector("h2").textContent;
  const publishedPrice = element.querySelector(".precio").textContent.match(/^S\/\s*(\d+)\.(\d{2})\b/);
  const price = publishedPrice ? BigInt(publishedPrice[1] + publishedPrice[2]) : null;
  const sellerLinks = element.querySelectorAll(".opciones-asesor a");
  button.addEventListener("click", () => {
    if (!quote.has(code)) {
      quote.set(code, { code, name, sellerLinks, price, quantity: minimumPerCode, button });
      button.textContent = "En mi cotización";
      updateQuote();
      return;
    }
    renderQuote();
    quoteDialog.showModal();
  });
  element.querySelector(".datos").append(button);
}

quoteButton.addEventListener("click", () => {
  renderQuote();
  quoteDialog.showModal();
});
document.querySelector("#foto-anterior").addEventListener("click", () => showPhoto(galleryIndex - 1));
document.querySelector("#foto-siguiente").addEventListener("click", () => showPhoto(galleryIndex + 1));
galleryDialog.addEventListener("keydown", (event) => {
  if (galleryPhotos.length < 2) return;
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    showPhoto(galleryIndex + (event.key === "ArrowLeft" ? -1 : 1));
  }
});
