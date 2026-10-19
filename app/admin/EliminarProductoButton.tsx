"use client";

type Props = {
  productName: string;
};

export default function EliminarProductoButton({
  productName,
}: Props) {
  function confirmarEliminacion(
    e: React.MouseEvent<HTMLButtonElement>
  ) {
    const confirmado = window.confirm(
      `¿Seguro que deseas eliminar "${productName}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmado) {
      e.preventDefault();
    }
  }

  return (
    <button
      type="submit"
      onClick={confirmarEliminacion}
    >
      ELIMINAR
    </button>
  );
}