import { createClient } from "@/utils/supabase/server";

export default async function CatalogoPage() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
   .select("id, code, name, slug, fabric, price_dozen, stock_units, status")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main>
        <h1>Catálogo PRENDAS ANTTONELA</h1>
        <p>Error al cargar los productos.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Catálogo PRENDAS ANTTONELA</h1>
      <p>Prendas disponibles para venta mayorista por docena.</p>

      {products && products.length > 0 ? (
        <div>
          {products.map((product) => (
            <div key={product.id}>
              <h2>{product.name}</h2>
              <p>Código: {product.code}</p>
              <p>Tela: {product.fabric || "Por especificar"}</p>
              <p>Precio por docena: S/ {Number(product.price_dozen).toFixed(2)}</p>
             <p>Stock: {product.stock_units} unidades</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay prendas publicadas actualmente.</p>
      )}
    </main>
  );
}