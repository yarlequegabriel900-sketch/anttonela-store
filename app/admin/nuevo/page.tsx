import ImageUploader from "./ImageUploader";
import Link from "next/link";
import { crearProducto } from "./actions";
import { createClient } from "@/utils/supabase/server";
import "../admin.css";

export default async function NuevoProductoPage() {
  const supabase = await createClient();

  const { data: categorias, error: categoriasError } = await supabase
    .from("categories")
    .select("id, name")
    .eq("active", true)
    .order("name");
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
  <span>CATEGORÍA *</span>

  <select
    name="category_id"
    required
    defaultValue=""
    disabled={Boolean(categoriasError) || !categorias?.length}
    style={{
      width: "100%",
      padding: "12px",
      border: "1px solid #d8c8b8",
      borderRadius: "8px",
      backgroundColor: "#fff",
      color: "#241b17",
      fontSize: "14px",
    }}
  >
    <option value="" disabled>
      Selecciona una categoría
    </option>

    {(categorias ?? []).map((categoria) => (
      <option key={categoria.id} value={categoria.id}>
        {categoria.name}
      </option>
    ))}
  </select>

  {categoriasError || !categorias?.length ? (
    <small style={{ color: "#b42318" }}>
      No hay categorías disponibles. Verifica las categorías en Supabase.
    </small>
  ) : null}
</label>
              <label>
                <span>Precio unitario</span>

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
  <span>STOCK EN UNIDADES</span>
  <input
    type="number"
    name="stock_units"
    min="0"
    placeholder="Ejemplo: 120"
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