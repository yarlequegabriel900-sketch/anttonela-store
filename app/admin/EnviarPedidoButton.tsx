"use client";

type Props = {
  orderNumber: string;
};

export default function EnviarPedidoButton({
  orderNumber,
}: Props) {
  function confirmarEnvio(
    e: React.MouseEvent<HTMLButtonElement>
  ) {
    const confirmado = window.confirm(
      `¿Marcar el pedido ${orderNumber} como enviado?\n\nConfirma únicamente si el pedido ya salió hacia la agencia o destino del cliente.`
    );

    if (!confirmado) {
      e.preventDefault();
    }
  }

  return (
    <button
      type="submit"
      className="admin-shipping-order-button"
      onClick={confirmarEnvio}
    >
      MARCAR COMO ENVIADO
    </button>
  );
}