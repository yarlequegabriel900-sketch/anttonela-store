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
     <span className="admin-action-content admin-delete-content">
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v5" />
    <path d="M14 11v5" />
  </svg>
  ELIMINAR
</span>
    </button>
  );
}