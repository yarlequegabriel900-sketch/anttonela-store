import "./admin.css";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AdminSessionGuard from "./AdminSessionGuard";
import {
  cerrarSesion,
  eliminarProducto,
  cambiarEstadoProducto,
} from "./actions";
import EliminarProductoButton from "./EliminarProductoButton";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: products, error } = await supabase
    .from("products")
    .select(`
  id,
  code,
  name,
  fabric,
  price_dozen,
 stock_units,
  status,
  product_images (
    image_url,
    sort_order
  )
`)
    .order("created_at", { ascending: false });

  const totalProductos = products?.length || 0;

  const publicados =
    products?.filter((product) => product.status === "published").length || 0;

  const ocultos =
    products?.filter((product) => product.status !== "published").length || 0;

  return (
    <main className="admin-page">
      <AdminSessionGuard />
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

    <Link href="/admin" className="admin-sidebar-link active">
      <span>▦</span>
      Productos
    </Link>

    <Link href="/admin/nuevo" className="admin-sidebar-link">
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

      <header className="admin-topbar admin-topbar-enterprise">
  <div className="admin-topbar-title">
    <span>SISTEMA DE GESTIÓN</span>
    <strong>Panel Administrativo</strong>
  </div>

  <div className="admin-topbar-account">
    <div className="admin-session-status">
      <span className="admin-online-dot"></span>
      Sesión activa
    </div>

    <div className="admin-user-profile">
      <div className="admin-user-avatar">GY</div>

      <div className="admin-user-info">
        <strong>Gabriel</strong>
        <span>Administrador</span>
      </div>
    </div>

    <form action={cerrarSesion}>
      <button className="admin-logout" type="submit">
        CERRAR SESIÓN
      </button>
    </form>
  </div>
</header>

      <div className="admin-container">
        <section className="admin-heading">
          <div>
            <p className="admin-eyebrow">ADMINISTRACIÓN · CATÁLOGO</p>

            <h1>Panel de productos</h1>

            <p className="admin-description">
              Administra las prendas disponibles en tu catálogo mayorista.
            </p>
          </div>

          <Link className="admin-add-button" href="/admin/nuevo">
            + AGREGAR PRODUCTO
          </Link>
        </section>

       <section className="admin-stats">
  <div className="admin-stat admin-stat-total">
    <div className="admin-stat-icon">
  <svg
    viewBox="0 0 24 24"
    width="34"
    height="34"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.29 7 12 12 20.71 7" />
    <line x1="12" y1="22" x2="12" y2="12" />
  </svg>
</div>

    <div className="admin-stat-content">
      <span>TOTAL PRODUCTOS</span>
      <strong>{totalProductos}</strong>
    </div>

    <div className="admin-stat-wave" aria-hidden="true">
      <svg viewBox="0 0 220 70" preserveAspectRatio="none">
        <path d="M0 58 C35 58, 42 38, 72 42 C105 47, 115 63, 145 45 C170 30, 181 13, 220 22" />
      </svg>
    </div>
  </div>

  <div className="admin-stat admin-stat-published">
    <div className="admin-stat-icon">
  <svg
    viewBox="0 0 24 24"
    width="34"
    height="34"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20.59 13.41 11 23l-9-9V3h11l7.59 7.59a2 2 0 0 1 0 2.82z" />
    <circle cx="7.5" cy="8.5" r="1.5" />
  </svg>
</div>

    <div className="admin-stat-content">
      <span>PUBLICADOS</span>
      <strong>{publicados}</strong>
    </div>

    <div className="admin-stat-wave" aria-hidden="true">
      <svg viewBox="0 0 220 70" preserveAspectRatio="none">
        <path d="M0 58 C35 58, 42 38, 72 42 C105 47, 115 63, 145 45 C170 30, 181 13, 220 22" />
      </svg>
    </div>
  </div>

  <div className="admin-stat admin-stat-hidden">
    <div className="admin-stat-icon">
  <svg
    viewBox="0 0 24 24"
    width="36"
    height="36"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
</div>

    <div className="admin-stat-content">
      <span>OCULTOS</span>
      <strong>{ocultos}</strong>
    </div>

    <div className="admin-stat-wave" aria-hidden="true">
      <svg viewBox="0 0 220 70" preserveAspectRatio="none">
        <path d="M0 58 C35 58, 42 38, 72 42 C105 47, 115 63, 145 45 C170 30, 181 13, 220 22" />
      </svg>
    </div>
  </div>
</section>

        <section className="admin-products">
          <div className="admin-products-header">
  <div className="admin-products-title">
    <div className="admin-products-icon">◆</div>
    <h2>Productos</h2>
  </div>

  <div className="admin-products-search">
    <span>⌕</span>
    <input
      type="text"
      placeholder="Buscar producto, código o tela..."
      aria-label="Buscar productos"
    />
  </div>
</div>

          {error ? (
            <p className="admin-error">
              Error al cargar los productos.
            </p>
          ) : products && products.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Tela</th>
                  <th>Precio / docena</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                   <td>
  <div className="admin-product-cell">
    {product.product_images?.[0]?.image_url ? (
      <img
        src={product.product_images[0].image_url}
        alt={product.name}
        className="admin-product-thumbnail"
      />
    ) : (
      <div className="admin-product-thumbnail admin-product-thumbnail-empty">
        SIN FOTO
      </div>
    )}

    <div className="admin-product-details">
      <div className="admin-product-name">
        {product.name}
      </div>

      <div className="admin-code">
        Código {product.code}
      </div>
    </div>
  </div>
</td>

                    <td>{product.fabric || "Sin especificar"}</td>

                    <td>
                      S/ {Number(product.price_dozen).toFixed(2)}
                    </td>

                   <td>{product.stock_units} unidades</td>

                    <td>
                      <span
                        className={`admin-status ${
                          product.status === "published"
                            ? "published"
                            : "draft"
                        }`}
                      >
                        {product.status === "published"
                          ? "Publicado"
                          : "Oculto"}
                      </span>
                    </td>

                    <td>
                      <div className="admin-actions">
                        <Link
                          className="admin-action-button"
                          href={`/admin/editar/${product.id}`}
                        >
                         <span className="admin-action-content">
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
  EDITAR
</span>
                        </Link>

                        <form action={cambiarEstadoProducto}>
                          <input
                            type="hidden"
                            name="id"
                            value={product.id}
                          />

                          <input
                            type="hidden"
                            name="status"
                            value={product.status}
                          />

                          <button
                            className="admin-action-button"
                            type="submit"
                          >
                            {product.status === "published"
                              ? <span className="admin-action-content">
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 3l18 18" />
    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
    <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c6 0 10 8 10 8a17.6 17.6 0 0 1-2.1 3.2" />
    <path d="M6.6 6.6C3.8 8.5 2 12 2 12s4 8 10 8a9.7 9.7 0 0 0 4.1-.9" />
  </svg>
  OCULTAR
</span>
                              : "PUBLICAR"}
                          </button>
                        </form>

                        <form action={eliminarProducto}>
                          <input
                            type="hidden"
                            name="id"
                            value={product.id}
                          />

                          <EliminarProductoButton
                            productName={product.name}
                          />
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="admin-empty">
              No hay productos registrados.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}