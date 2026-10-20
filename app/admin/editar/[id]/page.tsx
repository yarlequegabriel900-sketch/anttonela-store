import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { actualizarProducto } from "../../actions";
type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  // Buscar el producto que se quiere editar
  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, code, name, description, fabric, price_dozen, stock_dozen, status, featured"
    )
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
  <main style={{ maxWidth: "700px", margin: "50px auto", padding: "30px" }}>
    <Link href="/admin">← VOLVER AL ADMINISTRADOR</Link>

    <h1 style={{ marginTop: "30px" }}>Editar producto</h1>

    <form
      action={actualizarProducto}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        marginTop: "30px",
      }}
    >
      <input type="hidden" name="id" value={product.id} />

      <label>
        Código
        <input
          type="text"
          name="code"
          defaultValue={product.code}
          required
        />
      </label>

      <label>
        Nombre del producto
        <input
          type="text"
          name="name"
          defaultValue={product.name}
          required
        />
      </label>

      <label>
        Descripción
        <textarea
          name="description"
          defaultValue={product.description || ""}
          rows={4}
        />
      </label>

      <label>
        Tela
        <input
          type="text"
          name="fabric"
          defaultValue={product.fabric || ""}
        />
      </label>

      <label>
        Precio por docena
        <input
          type="number"
          name="price_dozen"
          step="0.01"
          min="0"
          defaultValue={product.price_dozen}
          required
        />
      </label>

      <label>
        Stock en docenas
        <input
          type="number"
          name="stock_dozen"
          step="1"
          min="0"
          defaultValue={product.stock_dozen}
          required
        />
      </label>

      <label>
        Estado
        <select name="status" defaultValue={product.status}>
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
        </select>
      </label>

      <button type="submit">
        GUARDAR CAMBIOS
      </button>
    </form>
  </main>
);
}