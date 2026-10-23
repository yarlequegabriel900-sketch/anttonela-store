import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PedidoPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

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

  if (error || !order) {
    notFound();
  }

  const items = order.order_items ?? [];

  const totalUnits = items.reduce(
    (total, item) => total + Number(item.quantity_units),
    0
  );

  return (
    <main className="order-view-page">
      <section className="order-view-container">
        <div className="order-view-brand">
          <span>PRENDAS</span>
          <strong>ANTTONELA</strong>
        </div>

        <p className="order-view-eyebrow">
          COTIZACIÓN MAYORISTA
        </p>

        <h1>Detalle del pedido</h1>

        <div className="order-view-number">
          <span>NÚMERO DE PEDIDO</span>
          <strong>{order.order_number}</strong>
        </div>

        <section className="order-view-customer">
          <p>DATOS DEL CLIENTE</p>

          <div className="order-view-grid">
            <div>
              <span>NOMBRE</span>
              <strong>{order.customer_name}</strong>
            </div>

            <div>
              <span>DNI</span>
              <strong>{order.dni || "No registrado"}</strong>
            </div>

            <div>
              <span>TELÉFONO</span>
              <strong>{order.customer_phone}</strong>
            </div>

            <div>
              <span>DESTINO</span>
              <strong>{order.destination || "No registrado"}</strong>
            </div>

            <div>
              <span>AGENCIA</span>
              <strong>{order.agency || "No registrado"}</strong>
            </div>

            <div>
              <span>DIRECCIÓN</span>
              <strong>{order.address || "No registrado"}</strong>
            </div>
          </div>
        </section>

        <section className="order-view-products">
          <p>PRODUCTOS SOLICITADOS</p>

          {items.map((item) => (
            <article
              key={item.id}
              className="order-view-product"
            >
              <div>
                <span>CÓDIGO {item.product_code}</span>
                <h2>{item.product_name}</h2>
              </div>

              <div>
                <span>CANTIDAD</span>
                <strong>
                  {item.quantity_units} unidades
                </strong>
              </div>

              <div>
                <span>PRECIO</span>
                <strong>
                  S/ {Number(item.price_dozen).toFixed(2)} c/u
                </strong>
              </div>

              <div>
                <span>SUBTOTAL</span>
                <strong>
                  S/ {Number(item.subtotal).toFixed(2)}
                </strong>
              </div>
            </article>
          ))}
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

        <section className="order-view-advisor">
          <span>ASESOR SELECCIONADO</span>
          <strong>
            {order.advisor_name || "Sin asesor"}
          </strong>
        </section>
      </section>
    </main>
  );
}