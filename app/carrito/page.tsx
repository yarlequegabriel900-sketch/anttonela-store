"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  const [items, setItems] = useState<CartItem[]>([]);
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
const quoteByWhatsApp = () => {
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

  const productsText = items
    .map(
      (item) =>
        `• ${item.name}
Código: ${item.code}
Cantidad: ${item.quantity} unidades
Precio: S/ ${Number(item.price_dozen).toFixed(2)} c/u
Subtotal: S/ ${(Number(item.price_dozen) * item.quantity).toFixed(2)}`
    )
    .join("\n\n");

  const message = `Hola ${advisor.name}, vengo de la web de PRENDAS ANTTONELA.

Quiero cotizar este pedido:

${productsText}

Total de unidades: ${totalUnits}
Total del pedido: S/ ${totalPrice.toFixed(2)}

Quisiera información para realizar mi pedido.`;

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