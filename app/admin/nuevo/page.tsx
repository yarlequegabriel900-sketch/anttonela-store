import ImageUploader from "./ImageUploader";
import Link from "next/link";
import { crearProducto } from "./actions";
import "../admin.css";

export default function NuevoProductoPage() {
  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
  <div className="admin-sidebar-logo">
    <div className="admin-sidebar-logo-mark">PA</div>

    <div>
      <span>PRENDAS</span>
      <strong>ANTTONELA</strong>
    </div>
  </div>

  <nav className="admin-sidebar-nav">
    <p>MENÚ PRINCIPAL</p>

    <Link href="/admin" className="admin-sidebar-link">
      <span>▦</span>
      Productos
    </Link>

    <Link href="/admin/nuevo" className="admin-sidebar-link active">
      <span>＋</span>
      Agregar producto
    </Link>

    <a
      href="/"
      target="_blank"
      rel="noopener noreferrer"
      className="admin-sidebar-link"
    >
      <span>◫</span>
      Ver catálogo
    </a>
  </nav>

  <div className="admin-sidebar-bottom">
    <span>Panel administrativo</span>
    <strong>PRENDAS ANTTONELA</strong>
  </div>
</aside>
      {/* BARRA SUPERIOR */}
    <header className="admin-topbar">
  <div className="admin-brand">
    <span>PRENDAS</span>
    <strong>ANTTONELA</strong>
  </div>

  <Link href="/admin" className="admin-back-button">
    ← VOLVER AL PANEL
  </Link>
</header>
      {/* CONTENIDO */}
      <section className="admin-new-product">
        <div className="admin-new-heading">
          <p className="admin-eyebrow">ADMINISTRACIÓN · CATÁLOGO</p>

          <h1>Agregar producto</h1>

          <p>
            Registra una nueva prenda para incorporarla al catálogo mayorista.
          </p>
        </div>

        <div className="admin-product-form-card">
          <div className="admin-form-header">
            <div>
              <p className="admin-eyebrow">NUEVA PRENDA</p>
              <h2>Información del producto</h2>
            </div>

            <span>PRENDAS ANTTONELA</span>
          </div>

        <form
  action={crearProducto}
  className="admin-product-form"
  encType="multipart/form-data"
>
            <div className="admin-form-grid">
              <label>
                <span>CÓDIGO</span>
                <input
                  type="text"
                  name="code"
                  placeholder="Ejemplo: 481"
                  required
                />
              </label>

              <label>
                <span>NOMBRE DE LA PRENDA</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Ejemplo: Polo de dama"
                  required
                />
              </label>

              <label>
                <span>TELA</span>
                <input
                  type="text"
                  name="fabric"
                  placeholder="Ejemplo: Algodón Jersey"
                />
              </label>

              <label>
                <span>PRECIO POR DOCENA</span>

                <div className="admin-price-input">
                  <span>S/</span>

                  <input
                    type="number"
                    name="price_dozen"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                  />
                </div>
              </label>

              <label>
                <span>STOCK EN DOCENAS</span>
                <input
                  type="number"
                  name="stock_dozen"
                  min="0"
                  placeholder="Ejemplo: 10"
                  required
                />
              </label>
            </div>

            <label className="admin-description-field">
              <span>DESCRIPCIÓN</span>

              <textarea
                name="description"
                placeholder="Describe brevemente la prenda..."
                rows={5}
              />
            </label>
<div className="admin-images-field">
  <div className="admin-images-heading">
    <div>
      <span>IMÁGENES DEL PRODUCTO</span>
      <p>
        Puedes seleccionar varias imágenes. La primera será la imagen principal.
      </p>
    </div>
  </div>

  <ImageUploader />
</div>
            <div className="admin-form-actions">
              <Link href="/admin" className="admin-cancel-button">
                CANCELAR
              </Link>

              <button type="submit" className="admin-save-button">
                GUARDAR PRODUCTO →
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}