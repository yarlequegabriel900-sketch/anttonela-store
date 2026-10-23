import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AdminSessionGuard from "../../../AdminSessionGuard";
import AnularPedidoButton from "../../../AnularPedidoButton";
import ConfirmarPedidoButton from "../../../ConfirmarPedidoButton";
import {
  actualizarDatosPedido,
  actualizarCantidadPedido,
  eliminarProductoPedido,
  agregarProductoPedido,
  anularPedido,
  confirmarPedido,
} from "../../../actions";
type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditarPedidoPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: order, error } = await supabase
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
      advisor_phone,
      status,
      total,
      created_at,
      order_items (
        id,
        product_id,
        product_code,
        product_name,
        quantity_units,
        price_dozen,
        subtotal
      )
    `)
    .eq("id", id)
    .single();

const { data: products, error: productsError } = await supabase
  .from("products")
  .select("id, code, name, price_dozen, stock_units")
  .order("code", { ascending: true });

if (productsError) {
  throw new Error(
    `No se pudieron cargar los productos: ${productsError.message}`
  );
}
  if (error || !order) {
    notFound();
  }
if (
  order.status === "cancelled" ||
  order.status === "shipped"
) {
  redirect("/admin/historial");
}
  const items = order.order_items ?? [];

  const totalUnits = items.reduce(
    (total, item) => total + Number(item.quantity_units),
    0
  );

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
<Link href="/admin/historial" className="admin-sidebar-link">
  <span>◷</span>
  Historial
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

            <h1>Editar pedido</h1>

            <p className="admin-description">
              {order.order_number}
            </p>
          </div>

          <Link
            href="/admin/pedidos"
            className="admin-add-button"
          >
            ← VOLVER A PEDIDOS
          </Link>
        </section>

        <section className="admin-products">
          <div className="admin-products-header">
            <div className="admin-products-title">
              <div className="admin-products-icon">◆</div>
              <h2>Datos del cliente</h2>
            </div>
          </div>

          <form action={actualizarDatosPedido}>
  <input
    type="hidden"
    name="id"
    value={order.id}
  />

  <div className="order-view-grid">
    <div>
      <span>NOMBRE</span>
      <input
        type="text"
        name="customer_name"
        defaultValue={order.customer_name}
        required
      />
    </div>

    <div>
      <span>DNI</span>
      <input
        type="text"
        name="dni"
        defaultValue={order.dni || ""}
        maxLength={8}
      />
    </div>

    <div>
      <span>TELÉFONO</span>
      <input
        type="text"
        name="customer_phone"
        defaultValue={order.customer_phone}
        required
      />
    </div>

    <div>
      <span>DESTINO</span>
      <input
        type="text"
        name="destination"
        defaultValue={order.destination || ""}
      />
    </div>

    <div>
      <span>AGENCIA</span>
      <input
        type="text"
        name="agency"
        defaultValue={order.agency || ""}
      />
    </div>

    <div>
      <span>DIRECCIÓN</span>
      <input
        type="text"
        name="address"
        defaultValue={order.address || ""}
      />
    </div>
  </div>

  <button
    type="submit"
    className="admin-add-button"
    style={{ marginTop: "22px" }}
  >
    GUARDAR DATOS DEL CLIENTE
  </button>
</form>
        </section>

        <section className="admin-products">
          <div className="admin-products-header">
            <div className="admin-products-title">
              <div className="admin-products-icon">◆</div>
              <h2>Productos del pedido</h2>
            </div>
          </div>
<form action={agregarProductoPedido} className="admin-add-order-product">
  <input
    type="hidden"
    name="order_id"
    value={order.id}
  />

  <select name="product_id" required defaultValue="">
    <option value="" disabled>
      Seleccionar producto
    </option>

    {(products || []).map((product) => (
      <option key={product.id} value={product.id}>
        {product.code} — {product.name} — Stock: {product.stock_units}
      </option>
    ))}
  </select>

  <input
    type="number"
    name="quantity_units"
    min="1"
    defaultValue="1"
    required
  />

  <button
    type="submit"
    className="admin-action-button"
  >
    AGREGAR PRODUCTO
  </button>
</form>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.product_name}</strong>
                  </td>

                  <td>{item.product_code}</td>

                  <td>
  <form action={actualizarCantidadPedido}>
    <input
      type="hidden"
      name="order_id"
      value={order.id}
    />

    <input
      type="hidden"
      name="item_id"
      value={item.id}
    />

    <div className="admin-order-quantity">
      <input
        type="number"
        name="quantity_units"
        min="1"
        defaultValue={item.quantity_units}
        required
      />

      <button
        type="submit"
        className="admin-action-button"
      >
        ACTUALIZAR
      </button>
    </div>
  </form>
</td>

                  <td>
                    S/ {Number(item.price_dozen).toFixed(2)}
                  </td>

                  <td>
                    S/ {Number(item.subtotal).toFixed(2)}
                  </td>
                  <td>
  <form action={eliminarProductoPedido}>
    <input
      type="hidden"
      name="order_id"
      value={order.id}
    />

    <input
      type="hidden"
      name="item_id"
      value={item.id}
    />

    <button
      type="submit"
      className="admin-action-button"
    >
      QUITAR
    </button>
  </form>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="order-view-summary">
          <div>
            <span>TOTAL DE UNIDADES</span>
            <strong>{totalUnits}</strong>
          </div>

          <div>
            <span>TOTAL DEL PEDIDO</span>
            <strong>
              S/ {Number(order.total).toFixed(2)}
            </strong>
          </div>
        </section>
        {order.status !== "confirmed" && (
  <section className="admin-order-confirm-zone">
    <div>
      <strong>Confirmar pedido</strong>
      <p>
        Confirma el pedido cuando hayas verificado el pago del cliente.
      </p>
    </div>

    <form action={confirmarPedido}>
      <input
        type="hidden"
        name="order_id"
        value={order.id}
      />

     <ConfirmarPedidoButton
  orderNumber={order.order_number}
/>
    </form>
  </section>
)}
        <section className="admin-order-danger-zone">
  <div>
    <strong>Anular pedido</strong>
    <p>
      El pedido se conservará en el historial y no contará como venta.
    </p>
  </div>

  <form action={anularPedido}>
    <input
      type="hidden"
      name="order_id"
      value={order.id}
    />

    <AnularPedidoButton
  orderNumber={order.order_number}
/>
  </form>
</section>
      </div>
    </main>
  );
}