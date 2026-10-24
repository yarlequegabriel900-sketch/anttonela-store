import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AdminSessionGuard from "../AdminSessionGuard";
import "../admin.css";

export default async function HistorialPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

let ordersQuery = supabase
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
  `);

if (
  estado &&
  ["pending", "reserved", "confirmed", "preparing", "shipped", "cancelled"].includes(
    estado
  )
) {
  ordersQuery = ordersQuery.eq("status", estado);
}

const { data: orders, error } = await ordersQuery.order(
  "created_at",
  { ascending: false }
);

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
                 Registro completo y seguimiento de todos los pedidos de PRENDAS ANTTONELA
                </p>
              </div>
            </div>
          </div>
<div className="admin-history-filters">
  <Link
    href="/admin/historial"
    className={!estado ? "active" : ""}
  >
    TODOS
  </Link>

  <Link
    href="/admin/historial?estado=pending"
    className={estado === "pending" ? "active" : ""}
  >
    PENDIENTES
  </Link>

  <Link
    href="/admin/historial?estado=reserved"
    className={estado === "reserved" ? "active" : ""}
  >
    RESERVADOS
  </Link>

  <Link
    href="/admin/historial?estado=confirmed"
    className={estado === "confirmed" ? "active" : ""}
  >
    CONFIRMADOS
  </Link>

  <Link
    href="/admin/historial?estado=preparing"
    className={estado === "preparing" ? "active" : ""}
  >
    EN PREPARACIÓN
  </Link>

  <Link
    href="/admin/historial?estado=shipped"
    className={estado === "shipped" ? "active" : ""}
  >
    ENVIADOS
  </Link>

  <Link
    href="/admin/historial?estado=cancelled"
    className={estado === "cancelled" ? "active" : ""}
  >
    ANULADOS
  </Link>
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
  <span className={`admin-history-status status-${order.status}`}>
    {order.status === "pending"
      ? "PENDIENTE"
      : order.status === "reserved"
      ? "RESERVADO"
      : order.status === "confirmed"
      ? "CONFIRMADO"
      : order.status === "preparing"
      ? "EN PREPARACIÓN"
      : order.status === "shipped"
      ? "ENVIADO"
      : order.status === "cancelled"
      ? "ANULADO"
      : order.status.toUpperCase()}
  </span>
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