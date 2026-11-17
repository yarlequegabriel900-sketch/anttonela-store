import Link from "next/link";


export default function Home() {
 

 
  return (
    <main>
      
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
         <Link href="/catalogo">Catálogo</Link>
          <a href="#como-comprar">Cómo comprar</a>
        </nav>

        <Link className="cart-link" href="/catalogo">
  Ver prendas →
</Link>
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

          <Link href="/catalogo" className="primary-button">
  Explorar catálogo <span>↗</span>
</Link>

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