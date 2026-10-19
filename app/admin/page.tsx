import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, code, name, fabric, price_dozen, stock_dozen, status")
    .order("created_at", { ascending: false });

  return (
    <main>
      <h1>Administrador PRENDAS ANTTONELA</h1>
      <p>Panel de administración del catálogo.</p>

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
            </div>
          ))}
        </div>
      ) : (
        !error && <p>No hay productos registrados.</p>
      )}
    </main>
  );
}