import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import RealtimeProducts from "./RealtimeProducts";

export default async function Home() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
code,
name,
description,
fabric,
price_dozen,
stock_units,
status,
featured,
product_images (
  image_url,
  sort_order
)
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <main>
      <RealtimeProducts />
      {/* BARRA SUPERIOR */}
      <div className="announcement">
        VENTA MAYORISTA · PRECIOS POR DOCENA
      </div>

      {/* NAVEGACIÓN */}
      <header className="site-header">
        <a className="brand" href="/">
          <span>PRENDAS</span>
          <span>ANTTONELA</span>
        </a>

        <nav aria-label="Navegación principal">
          <a href="/">Inicio</a>
          <a href="#catalogo">Catálogo</a>
          <a href="#como-comprar">Cómo comprar</a>
        </nav>

        <a className="cart-link" href="#catalogo">
          Ver prendas →
        </a>
      </header>

      {/* PORTADA */}
      <section className="editorial-hero">
        <div className="editorial-background" />

        <div className="editorial-hero-content">
          <div className="hero-copy">
            <p className="eyebrow">MODA MAYORISTA · GAMARRA</p>

            <h1>
              Tu próximo
              <br />
              pedido empieza
              <br />
              <em>aquí.</em>
            </h1>

            <p className="hero-description">
              Descubre prendas para tu negocio, revisa sus detalles y arma tu
              pedido por docena. Coordinamos el pago y el envío por WhatsApp.
            </p>

            <a href="#catalogo" className="primary-button">
              Explorar catálogo <span>↗</span>
            </a>

            <p className="hero-note">
              Catálogo oficial · Atención mayorista
            </p>
          </div>

          <div className="collection-card">
            <div className="collection-top">
              <span>COLECCIÓN</span>
              <span>01 / ANTTONELA</span>
            </div>

            <div className="collection-art">
              <div className="shape shape-one" />
              <div className="shape shape-two" />
              <div className="shape shape-three" />

              <div className="collection-message">
                <span>Tu marca.</span>
                <em>Tu estilo.</em>
                <span>Tu negocio.</span>
              </div>
            </div>

            <p>FOTOGRAFÍAS DEL CATÁLOGO SE AGREGARÁN AQUÍ</p>
          </div>
        </div>
      </section>

      {/* CATÁLOGO */}
      <section className="catalog-section" id="catalogo">
        <div className="catalog-header">
          <div>
            <p className="eyebrow">PRENDAS DISPONIBLES</p>
            <h2>Catálogo mayorista</h2>
          </div>

          <div className="catalog-search">
            <input
              type="text"
              placeholder="Buscar por código, nombre o tela..."
              aria-label="Buscar productos"
            />
            <button type="button">Buscar</button>
          </div>
        </div>

        <div className="catalog-layout">
          <aside className="catalog-sidebar">
            <div className="filter-box">
              <p>CATEGORÍAS</p>
              <button type="button" className="active">
                Todas
              </button>
              <button type="button">Polos</button>
              <button type="button">Shorts</button>
              <button type="button">Vestidos</button>
              <button type="button">Pantalones</button>
              <button type="button">Accesorios</button>
              <button type="button">Niños</button>
              <button type="button">Niñas</button>
              <button type="button">Varones</button>
            </div>

            <div className="filter-box price-filter">
              <p>RANGO DE PRECIO</p>
              <span>⌄</span>
            </div>
          </aside>

          <div className="catalog-products">
  {error ? (
    <div className="empty-catalog">
      <h3>Error al cargar el catálogo</h3>
      <p>{error.message}</p>
    </div>
  ) : products && products.length > 0 ? (
    <div className="products-grid">
      {products.map((product) => (
     <Link
  href={`/producto/${product.id}`}
  className="product-card-link"
  key={product.id}
>
  <article className="product-card">
          <div className="product-image">
            {product.product_images?.[0]?.image_url ? (
  <img
    src={product.product_images[0].image_url}
    alt={product.name}
    className="product-photo"
  />
) : (
  <span className="product-photo-label">
    FOTO DE PRENDA
  </span>
)}

            <button
              className="favorite-button"
              type="button"
              aria-label="Agregar a favoritos"
            >
              ♡
            </button>
          </div>

          <div className="product-info">
            <p className="product-code">
              Código {product.code}
            </p>

            <h3>{product.name}</h3>

            <p>
              Tela: {product.fabric || "Por definir"}
            </p>

            <strong>
              S/ {Number(product.price_dozen).toFixed(2)} por docena
            </strong>

            <p className="product-stock">
  Stock: {product.stock_units} unidades
</p>
            <a
              className="whatsapp-product"
              href="#como-comprar"
              aria-label={`Consultar ${product.name}`}
            >
              ◉
            </a>
          </div>
        </article>
        </Link>
      ))}
    </div>
  ) : (
    <div className="empty-catalog">
      <h3>Estamos preparando el catálogo</h3>
      <p>
        Próximamente encontrarás aquí las prendas disponibles de
        PRENDAS ANTTONELA.
      </p>
    </div>
  )}
</div>
</div>
</section>

{/* CÓMO COMPRAR */}
<section className="how-to-buy" id="como-comprar">
  <p className="eyebrow">FÁCIL Y DIRECTO</p>
  <h2>¿Cómo hacer tu pedido?</h2>

  <p>
    Elige tus prendas por docena y prepara tu pedido. Coordinaremos la
    atención y el envío directamente por WhatsApp.
  </p>
</section>
</main>
);
}