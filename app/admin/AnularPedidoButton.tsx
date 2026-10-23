"use client";

type Props = {
  orderNumber: string;
};

export default function AnularPedidoButton({
  orderNumber,
}: Props) {
  function confirmarAnulacion(
    e: React.MouseEvent<HTMLButtonElement>
  ) {
    const confirmado = window.confirm(
      `¿Seguro que deseas anular el pedido ${orderNumber}?\n\nEl pedido pasará al Historial y dejará de estar activo.`
    );

    if (!confirmado) {
      e.preventDefault();
    }
  }

  return (
    <button
      type="submit"
      className="admin-cancel-order-button"
      onClick={confirmarAnulacion}
    >
      ANULAR PEDIDO
    </button>
  );
}