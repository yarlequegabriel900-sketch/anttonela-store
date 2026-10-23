"use client";

type Props = {
  orderNumber: string;
};

export default function ConfirmarPedidoButton({
  orderNumber,
}: Props) {
  function confirmarPedido(
    e: React.MouseEvent<HTMLButtonElement>
  ) {
    const confirmado = window.confirm(
      `¿Confirmar el pedido ${orderNumber}?\n\nConfirma únicamente si ya verificaste el pago del cliente.`
    );

    if (!confirmado) {
      e.preventDefault();
    }
  }

  return (
    <button
      type="submit"
      className="admin-confirm-order-button"
      onClick={confirmarPedido}
    >
      CONFIRMAR PEDIDO
    </button>
  );
}