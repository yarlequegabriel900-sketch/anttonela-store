"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/client";
type CartItem = {
  id: string;
  code: string;
  name: string;
  image_url: string | null;
  price_dozen: number;
  stock_units: number;
  quantity: number;
};
const advisors = [
  {
    name: "Fernando",
    phone: "51922145920",
  },
  {
    name: "David",
    phone: "51922568509",
  },
  {
    name: "Gabriel",
    phone: "51926154709",
  },
];
export default function CarritoPage() {
    const supabase = createClient();
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
const [customerPhone, setCustomerPhone] = useState("");
const [dni, setDni] = useState("");
const [destination, setDestination] = useState("");
const [agency, setAgency] = useState("");
const [address, setAddress] = useState("");
  const [selectedAdvisor, setSelectedAdvisor] = useState("");

  useEffect(() => {
    const savedCart = localStorage.getItem("anttonela_cart");

    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch {
        setItems([]);
      }
    }
  }, []);
  const saveItems = (newItems: CartItem[]) => {
  setItems(newItems);

  localStorage.setItem(
    "anttonela_cart",
    JSON.stringify(newItems)
  );
};

const increaseQuantity = (id: string) => {
  const newItems = items.map((item) => {
    if (item.id !== id) {
      return item;
    }

    return {
      ...item,
      quantity: Math.min(
        item.quantity + 1,
        item.stock_units
      ),
    };
  });

  saveItems(newItems);
};

const decreaseQuantity = (id: string) => {
  const newItems = items.map((item) => {
    if (item.id !== id) {
      return item;
    }

    return {
      ...item,
      quantity: Math.max(
        3,
        item.quantity - 1
      ),
    };
  });

  saveItems(newItems);
};

const removeItem = (id: string) => {
  const newItems = items.filter(
    (item) => item.id !== id
  );

  saveItems(newItems);
};

  const totalUnits = items.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const totalPrice = items.reduce(
  (total, item) =>
    total + item.price_dozen * item.quantity,
  0
);
const quoteByWhatsApp = async () => {
      if (
    !customerName.trim() ||
    !dni.trim() ||
    !customerPhone.trim() ||
    !destination.trim() ||
    !agency.trim() ||
    !address.trim()
  ) {
    alert("Completa todos los datos del cliente para continuar.");
    return;
  }

  if (!/^\d{8}$/.test(dni.trim())) {
    alert("El DNI debe tener 8 dígitos.");
    return;
  }
  if (!selectedAdvisor) {
    alert("Selecciona un asesor para continuar.");
    return;
  }

  const advisor = advisors.find(
    (item) => item.phone === selectedAdvisor
  );

  if (!advisor) {
    return;
  }
const orderNumber = `ANT-${Date.now()}`;

const { data: order, error: orderError } = await supabase
  .from("orders")
  .insert({
    order_number: orderNumber,
    customer_name: customerName.trim(),
    customer_phone: customerPhone.trim(),
    dni: dni.trim(),
    destination: destination.trim(),
    agency: agency.trim(),
    address: address.trim(),
    advisor_name: advisor.name,
    advisor_phone: advisor.phone,
    status: "pending",
    total: totalPrice,
  })
  .select("id, order_number")
  .single();

if (orderError || !order) {
  console.error(orderError);
  alert("No se pudo crear el pedido. Inténtalo nuevamente.");
  return;
}
const orderItems = items.map((item) => ({
  order_id: order.id,
  product_id: item.id,
  product_code: item.code,
  product_name: item.name,
  quantity_units: item.quantity,
  price_dozen: Number(item.price_dozen),
  subtotal: Number(item.price_dozen) * item.quantity,
}));

const { error: itemsError } = await supabase
  .from("order_items")
  .insert(orderItems);

if (itemsError) {
  console.error(itemsError);
  alert("El pedido se creó, pero ocurrió un error al guardar los productos.");
  return;
}
  const orderUrl =
  `${window.location.origin}/pedido/${order.id}`;

const message = `Hola ${advisor.name}, tienes una nueva cotización de PRENDAS ANTTONELA.

Pedido: ${order.order_number}
Cliente: ${customerName.trim()}
Total de unidades: ${totalUnits}
Total del pedido: S/ ${totalPrice.toFixed(2)}

Ver pedido completo:
${orderUrl}`;

window.location.href =
  `https://wa.me/${advisor.phone}?text=${encodeURIComponent(message)}`;
};
  return (
    <main className="cart-page">
      <header className="cart-header">
        <Link href="/#catalogo">
          ← SEGUIR COMPRANDO
        </Link>

        <div>
          <span>PRENDAS</span>
          <strong>ANTTONELA</strong>
        </div>
      </header>

      <section className="cart-container">
        <p className="cart-eyebrow">
          PEDIDO MAYORISTA
        </p>

        <h1>Tu carrito</h1>

        <p>
          {totalUnits} unidades seleccionadas
        </p>

        {items.length === 0 ? (
          <div className="cart-empty">
            <h2>Tu carrito está vacío</h2>

            <p>
              Agrega prendas desde nuestro catálogo para comenzar tu pedido.
            </p>

            <Link href="/#catalogo">
              VER CATÁLOGO
            </Link>
          </div>
        ) : (
          <div>
            {items.map((item) => (
              <div key={item.id}>
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    width={100}
                  />
                )}

                <div>
                  <span>CÓDIGO {item.code}</span>
                  <h2>{item.name}</h2>
                  <p className="cart-item-price">
  S/ {Number(item.price_dozen).toFixed(2)} c/u
</p>

<p className="cart-item-subtotal">
  Subtotal: S/{" "}
  {(Number(item.price_dozen) * item.quantity).toFixed(2)}
</p>
                  <div className="cart-quantity">
  <span>CANTIDAD</span>

  <div className="cart-quantity-controls">
    <button
      type="button"
      onClick={() => decreaseQuantity(item.id)}
      disabled={item.quantity <= 3}
    >
      −
    </button>

    <strong>{item.quantity}</strong>

    <button
      type="button"
      onClick={() => increaseQuantity(item.id)}
      disabled={item.quantity >= item.stock_units}
    >
      +
    </button>

    <small>unidades</small>
  </div>
</div>

<button
  type="button"
  className="cart-remove-button"
  onClick={() => removeItem(item.id)}
>
  ELIMINAR
</button>
                </div>
              </div>
            ))}
            <div className="cart-customer-data">
  <p className="cart-customer-eyebrow">DATOS DEL CLIENTE</p>
  <h2>Datos para el envío</h2>

  <div className="cart-customer-grid">
    <label>
      NOMBRE COMPLETO
      <input
        type="text"
        value={customerName}
        onChange={(event) => setCustomerName(event.target.value)}
        placeholder="Nombre y apellidos"
      />
    </label>

    <label>
      DNI
      <input
        type="text"
        value={dni}
        onChange={(event) => setDni(event.target.value)}
        placeholder="DNI"
        maxLength={8}
      />
    </label>

    <label>
      TELÉFONO
      <input
        type="tel"
        value={customerPhone}
        onChange={(event) => setCustomerPhone(event.target.value)}
        placeholder="Número de contacto"
      />
    </label>

    <label>
      DESTINO
      <input
        type="text"
        value={destination}
        onChange={(event) => setDestination(event.target.value)}
        placeholder="Ej. Piura"
      />
    </label>

    <label>
      AGENCIA
      <input
        type="text"
        value={agency}
        onChange={(event) => setAgency(event.target.value)}
        placeholder="Ej. Flores"
      />
    </label>

    <label>
      DIRECCIÓN
      <input
        type="text"
        value={address}
        onChange={(event) => setAddress(event.target.value)}
        placeholder="Dirección de entrega o referencia"
      />
    </label>
  </div>
</div>
            <div className="cart-summary">
  <div>
    <div className="cart-quote">
  <div className="cart-advisor">
    <span>SELECCIONA TU ASESOR</span>

    <select
      value={selectedAdvisor}
      onChange={(event) =>
        setSelectedAdvisor(event.target.value)
      }
    >
      <option value="">Elegir asesor</option>

      {advisors.map((advisor) => (
        <option
          key={advisor.phone}
          value={advisor.phone}
        >
          {advisor.name}
        </option>
      ))}
    </select>
  </div>

  <button
    type="button"
    className="cart-whatsapp-button"
    onClick={quoteByWhatsApp}
  >
    COTIZAR POR WHATSAPP
  </button>
</div>
    <span>TOTAL DE UNIDADES</span>
    <strong>{totalUnits}</strong>
  </div>

  <div>
    <span>TOTAL DEL PEDIDO</span>
    <strong>S/ {totalPrice.toFixed(2)}</strong>
  </div>
</div>
          </div>
        )}
      </section>
    </main>
  );
}