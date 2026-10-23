import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AdminSessionGuard from "../AdminSessionGuard";

export default async function AdminPedidosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      customer_name,
      customer_phone,
      dni,
      destination,
      agency,
      address,
      advisor_name,
      status,
      total,
      created_at,
      order_items (
        id,
        quantity_units
      )
    `)
    .order("created_at", { ascending: false });

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

          <Link href="/admin" className="admin-sidebar-link">
            <span>▦</span>
            Productos
          </Link>

          <Link href="/admin/nuevo" className="admin-sidebar-link">
            <span>＋</span>
            Agregar producto
          </Link>

          <Link
            href="/admin/pedidos"
            className="admin-sidebar-link active"
          >
            <span>▤</span>
            Pedidos
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

      <div className="admin-container">
        <section className="admin-heading">
          <div>
            <p className="admin-eyebrow">
              ADMINISTRACIÓN · PEDIDOS
            </p>

            <h1>Panel de pedidos</h1>

            <p className="admin-description">
              Controla las cotizaciones y pedidos realizados por tus clientes.
            </p>
          </div>
        </section>

        <section className="admin-products">
          <div className="admin-products-header">
            <div className="admin-products-title">
              <div className="admin-products-icon">◆</div>
              <h2>Pedidos recientes</h2>
            </div>
          </div>

          {error ? (
            <p className="admin-error">
              Error al cargar los pedidos.
            </p>
          ) : orders && orders.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Unidades</th>
                  <th>Total</th>
                  <th>Asesor</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const totalUnits =
                    order.order_items?.reduce(
                      (total, item) =>
                        total + Number(item.quantity_units),
                      0
                    ) || 0;

                  return (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.order_number}</strong>
                      </td>

                      <td>
                        <div className="admin-product-details">
                          <div className="admin-product-name">
                            {order.customer_name}
                          </div>

                          <div className="admin-code">
                            DNI {order.dni || "No registrado"}
                          </div>
                        </div>
                      </td>

                      <td>
                        {new Date(order.created_at).toLocaleString(
                          "es-PE",
                          {
                            timeZone: "America/Lima",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </td>

                      <td>{totalUnits} unidades</td>

                      <td>
                        S/ {Number(order.total).toFixed(2)}
                      </td>

                      <td>
                        {order.advisor_name || "Sin asesor"}
                      </td>

                      <td>
                        <span className="admin-status draft">
                          {order.status === "pending"
                            ? "Pendiente"
                            : order.status}
                        </span>
                      </td>

                      <td>
                        <div className="admin-actions">
                          <Link
                            href={`/pedido/${order.id}`}
                            className="admin-action-button"
                          >
                            VER
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="admin-empty">
              No hay pedidos registrados.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}