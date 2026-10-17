import { createClient } from "@/utils/supabase/server";

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
      stock_dozen,
      status,
      featured
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <main>
      <div className="announcement">
        VENTA MAYORISTA · PRECIOS POR DOCENA
      </div>

      <header className="site-header">
        <a className="brand" href="/">
          PRENDAS ANTTONELA
        </a>

        <nav aria-label="Navegación principal">
          <a href="/">Inicio</a>
          <a href="#catalogo">Catálogo</a>
          <a href="#como-comprar">Cómo comprar</a>
        </nav>

        <a className="cart-link" href="#catalogo">
          Ver prendas
        </a>
      </header>

      <section className="hero">
  <div className="hero-image">
    <div className="hero-overlay"></div>

    <div className="hero-content">
      <p className="eyebrow">GAMARRA · LIMA</p>

      <h1>
        Moda mayorista
        <br />
        para tu negocio
      </h1>

      <p className="hero-description">
        Prendas seleccionadas para emprendedores y negocios.
        Venta mayorista por docena desde Gamarra.
      </p>

      <a href="#catalogo" className="primary-button">
        VER CATÁLOGO
      </a>
    </div>
  </div>
</section>

      <section className="catalog-section" id="catalogo">
        <div className="section-heading">
          <p className="eyebrow">CATÁLOGO</p>
          <h2>Prendas disponibles</h2>
        </div>

        {error ? (
          <div>
            <h3>Error al cargar el catálogo</h3>
            <p>{error.message}</p>
          </div>
        ) : products && products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-placeholder">
                  PRENDAS ANTTONELA
                </div>

                <div className="product-info">
                  <p className="product-code">
                    Código {product.code}
                  </p>

                  <h3>{product.name}</h3>

                  {product.fabric && (
                    <p>Tela: {product.fabric}</p>
                  )}

                  <strong>
                    S/ {Number(product.price_dozen).toFixed(2)} por docena
                  </strong>

                  <p>
                    Stock: {product.stock_dozen} docena
                    {product.stock_dozen === 1 ? "" : "s"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-catalog">
            <h3>Estamos preparando el catálogo</h3>
            <p>
              Próximamente encontrarás aquí las prendas disponibles
              de PRENDAS ANTTONELA.
            </p>
          </div>
        )}
      </section>

      <section id="como-comprar">
        <p className="eyebrow">PEDIDOS</p>
        <h2>Compra mayorista</h2>
        <p>
          Selecciona tus prendas y prepara tu pedido. Más adelante
          conectaremos el carrito directamente con WhatsApp.
        </p>
      </section>
    </main>
  );
}