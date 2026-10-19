import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  cerrarSesion,
  eliminarProducto,
  cambiarEstadoProducto,
} from "./actions";
import EliminarProductoButton from "./EliminarProductoButton";
export default async function AdminPage() {
  const supabase = await createClient();
const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  redirect("/admin/login");
}
  const { data: products, error } = await supabase
    .from("products")
    .select("id, code, name, fabric, price_dozen, stock_dozen, status")
    .order("created_at", { ascending: false });

  return (
    <main>
      <h1>Administrador PRENDAS ANTTONELA</h1>
      <p>Panel de administración del catálogo.</p>
<form action={cerrarSesion}>
  <button type="submit">CERRAR SESIÓN</button>
</form>
      <h2>Productos</h2>

     <Link href="/admin/nuevo">
  <button type="button">+ AGREGAR PRODUCTO</button>
</Link>

      {error && <p>Error al cargar los productos.</p>}

      {!error && products && products.length > 0 ? (
        <div>
          {products.map((product) => (
            <div key={product.id}>
              <hr />

              <h3>{product.name}</h3>

              <p>Código: {product.code}</p>
              <p>Tela: {product.fabric || "Sin especificar"}</p>
              <p>
                Precio por docena: S/{" "}
                {Number(product.price_dozen).toFixed(2)}
              </p>
              <p>Stock: {product.stock_dozen} docenas</p>
              <p>Estado: {product.status}</p>
              <Link href={`/admin/editar/${product.id}`}>
  <button type="button">EDITAR</button>
</Link>
<form action={cambiarEstadoProducto}>
  <input type="hidden" name="id" value={product.id} />
  <input type="hidden" name="status" value={product.status} />

  <button type="submit">
    {product.status === "published" ? "OCULTAR" : "PUBLICAR"}
  </button>
</form>
<form action={eliminarProducto}>
  <input type="hidden" name="id" value={product.id} />

  <EliminarProductoButton productName={product.name} />
</form>
            </div>
          ))}
        </div>
      ) : (
        !error && <p>No hay productos registrados.</p>
      )}
    </main>
  );
}