"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AddToCartProps = {
  productId: string;
  productCode: string;
  productName: string;
  priceDozen: number;
  stockUnits: number;
  imageUrl: string | null;
};

export default function AddToCart({
  productId,
  productCode,
  productName,
  priceDozen,
  stockUnits,
  imageUrl,
}: AddToCartProps) {
  const router = useRouter();

  const minimumQuantity = 3;

  const [quantity, setQuantity] = useState(
    Math.min(minimumQuantity, stockUnits)
  );

  const decrease = () => {
    setQuantity((current) =>
      Math.max(minimumQuantity, current - 1)
    );
  };

  const increase = () => {
    setQuantity((current) =>
      Math.min(stockUnits, current + 1)
    );
  };

  const addToCart = () => {
    if (stockUnits < minimumQuantity) {
      return;
    }

    const savedCart = localStorage.getItem("anttonela_cart");

    let cart = [];

    try {
      cart = savedCart ? JSON.parse(savedCart) : [];
    } catch {
      cart = [];
    }

    const existingIndex = cart.findIndex(
      (item: { id: string }) => item.id === productId
    );

    const item = {
      id: productId,
      code: productCode,
      name: productName,
      image_url: imageUrl,
      price_dozen: priceDozen,
      stock_units: stockUnits,
      quantity,
    };

    if (existingIndex >= 0) {
      cart[existingIndex] = item;
    } else {
      cart.push(item);
    }

    localStorage.setItem(
      "anttonela_cart",
      JSON.stringify(cart)
    );

    router.push("/carrito");
  };

  return (
    <div className="add-to-cart">
      <div className="add-to-cart-quantity">
        <span>CANTIDAD</span>

        <div className="quantity-selector">
          <button
            type="button"
            onClick={decrease}
            disabled={
              quantity <= minimumQuantity ||
              stockUnits < minimumQuantity
            }
          >
            −
          </button>

          <strong>
            {stockUnits >= minimumQuantity ? quantity : 0}
          </strong>

          <button
            type="button"
            onClick={increase}
            disabled={
              quantity >= stockUnits ||
              stockUnits < minimumQuantity
            }
          >
            +
          </button>
        </div>

        <small>unidades · mínimo 3</small>
      </div>

      <button
        type="button"
        className="add-to-cart-button"
        onClick={addToCart}
        disabled={stockUnits < minimumQuantity}
      >
        {stockUnits < minimumQuantity
          ? "STOCK INSUFICIENTE"
          : "AGREGAR AL CARRITO"}
      </button>
    </div>
  );
}