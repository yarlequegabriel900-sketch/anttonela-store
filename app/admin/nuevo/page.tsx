import Link from "next/link";
import { crearProducto } from "./actions";
import "../admin.css";

export default function NuevoProductoPage() {
  return (
    <main className="admin-page">
      {/* BARRA SUPERIOR */}
      <header className="admin-topbar">
        <div className="admin-brand">
          <div className="admin-brand-icon">N</div>

          <div>
            <span>PRENDAS</span>
            <strong>ANTTONELA</strong>
          </div>
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

          <form action={crearProducto} className="admin-product-form">
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