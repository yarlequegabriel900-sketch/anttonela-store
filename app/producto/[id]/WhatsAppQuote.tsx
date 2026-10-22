"use client";

import { useState } from "react";

type Props = {
  productName: string;
  productCode: string;
  priceDozen: number;
  productId: string;
};

const advisors = [
  {
    name: "FERNANDO",
    phone: "51922145920",
  },
  {
    name: "DAVID",
    phone: "51922568509",
  },
  {
    name: "GABRIEL",
    phone: "51926154709",
  },
];

export default function WhatsAppQuote({
  productName,
  productCode,
  priceDozen,
  productId,
}: Props) {
  const [open, setOpen] = useState(false);

  const contactAdvisor = (phone: string) => {
    const productUrl = `${window.location.origin}/producto/${productId}`;

    const message = [
      "Hola, vengo de la web de PRENDAS ANTTONELA.",
      "",
      `Quiero cotizar: ${productName}`,
      `Código: ${productCode}`,
      `Precio: S/ ${Number(priceDozen).toFixed(2)} por docena`,
      "",
      `Producto: ${productUrl}`,
      "",
      "Quisiera información para realizar mi pedido.",
    ].join("\n");

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
      message
    )}`;

    window.location.href = whatsappUrl;
  };

  return (
    <div className="whatsapp-quote">
      <button
        type="button"
        className="product-detail-whatsapp-button"
        onClick={() => setOpen((current) => !current)}
      >
        <span>◉</span>
        COTIZAR POR WHATSAPP
      </button>

      {open && (
        <div className="whatsapp-advisors">
          <div className="whatsapp-advisors-heading">
            <span>ATENCIÓN PERSONALIZADA</span>
            <h3>Elige tu asesor</h3>
            <p>
              Selecciona con quién deseas realizar la cotización de esta
              prenda.
            </p>
          </div>

          <div className="whatsapp-advisors-list">
            {advisors.map((advisor) => (
              <button
                type="button"
                key={advisor.phone}
                className="whatsapp-advisor"
                onClick={() => contactAdvisor(advisor.phone)}
              >
                <div>
                  <span>ASESOR</span>
                  <strong>{advisor.name}</strong>
                </div>

                <span className="whatsapp-advisor-action">
                  CONTACTAR →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}