"use client";

type Props = {
  orderNumber: string;
};

export default function PrepararPedidoButton({
  orderNumber,
}: Props) {
  function confirmarPreparacion(
    e: React.MouseEvent<HTMLButtonElement>
  ) {
    const confirmado = window.confirm(
      `¿Enviar el pedido ${orderNumber} a preparación?\n\nConfirma únicamente cuando el pago ya esté verificado y el pedido esté listo para pasar a embalaje.`
    );

    if (!confirmado) {
      e.preventDefault();
    }
  }

  return (
    <button
      type="submit"
      className="admin-preparing-order-button"
      onClick={confirmarPreparacion}
    >
      ENVIAR A PREPARACIÓN
    </button>
  );
}