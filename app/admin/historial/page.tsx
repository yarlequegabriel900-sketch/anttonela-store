import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AdminSessionGuard from "../AdminSessionGuard";
import "../admin.css";

export default async function HistorialPedidosPage() {
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
      advisor_name,
      status,
      total,
      created_at,
      confirmed_at,
      shipped_at,
      cancelled_at,
      order_items (
        id,
        quantity_units
      )
    `)
    .in("status", ["shipped", "cancelled"])
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `No se pudo cargar el historial: ${error.message}`
    );
  }

  const historyOrders = orders || [];

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
            <span>+</span>
            Agregar producto
          </Link>

          <Link href="/admin/pedidos" className="admin-sidebar-link">
            <span>▤</span>
            Pedidos
          </Link>

          <Link
            href="/admin/historial"
            className="admin-sidebar-link active"
          >
            <span>◷</span>
            Historial
          </Link>

          <Link href="/catalogo" className="admin-sidebar-link">
            <span>◫</span>
            Ver catálogo
          </Link>
        </nav>
      </aside>

      <section className="admin-content">
        <div className="admin-products">
          <div className="admin-products-header">
            <div className="admin-products-title">
              <div className="admin-products-icon">◆</div>

              <div>
                <h1>Historial de pedidos</h1>
                <p>
                  Pedidos enviados y anulados de PRENDAS ANTTONELA
                </p>
              </div>
            </div>
          </div>

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
              {historyOrders.map((order) => {
                const units = (order.order_items || []).reduce(
                  (total, item) =>
                    total + Number(item.quantity_units),
                  0
                );

                return (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.order_number}</strong>
                    </td>

                    <td>
                      <strong>{order.customer_name}</strong>
                      <br />
                      <small>DNI: {order.dni || "—"}</small>
                    </td>

                    <td>
                      {new Date(order.created_at).toLocaleString(
                        "es-PE",
                        {
                          timeZone: "America/Lima",
                        }
                      )}
                    </td>

                    <td>{units}</td>

                    <td>
                      S/ {Number(order.total).toFixed(2)}
                    </td>

                    <td>{order.advisor_name || "—"}</td>

                    <td>
                      {order.status === "shipped"
                        ? "ENVIADO"
                        : "ANULADO"}
                    </td>

                    <td>
                      <Link
                        href={`/pedido/${order.id}`}
                        className="admin-action-button"
                      >
                        VER
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {historyOrders.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    Todavía no hay pedidos en el historial.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}