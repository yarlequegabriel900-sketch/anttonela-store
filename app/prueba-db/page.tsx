import { createClient } from "@/utils/supabase/server";

export default async function PruebaDB() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, code, name, price_dozen, status")
    .limit(5);

  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>PRENDAS ANTTONELA</h1>
      <h2>Prueba de conexión con Supabase</h2>

      {error ? (
        <>
          <h3>❌ Error de conexión</h3>
          <pre>{error.message}</pre>
        </>
      ) : (
        <>
          <h3>✅ Conexión correcta</h3>
          <p>Productos encontrados: {data?.length ?? 0}</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </>
      )}
    </main>
  );
}