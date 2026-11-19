
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { canOptimizeProductImage } from "@/utils/product-image";





type SearchParams = Promise<{
  q?: string;
  categoria?: string;
}>;

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const busqueda = (params.q ?? "").trim().slice(0, 100);
  const categoria = params.categoria ?? "";

  const supabase = await createClient();

  // Categorías reales registradas en Supabase
  const { data: categories, error: categoriesError } =
    await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("active", true)
      .order("name");

  // Productos publicados, con su categoría asignada
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      code,
      name,
      slug,
      fabric,
      price_dozen,
      status,
      category_id,
      product_images (
        image_url,
        sort_order
      )
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const categorias = [
    { nombre: "Todas", valor: "" },
    ...(categories ?? []).map((item) => ({
      nombre: item.name,
      valor: item.slug,
    })),
  ];

  const categoriaSeleccionada = (categories ?? []).find(
    (item) => item.slug === categoria
  );

  const filtrados = (products ?? []).filter((producto) => {
    const contenido = normalizar(
      [
        producto.code,
        producto.name,
        producto.fabric ?? "",
      ].join(" ")
    );

    const coincideBusqueda =
      !busqueda || contenido.includes(normalizar(busqueda));

    const coincideCategoria =
      !categoria ||
      (categoriaSeleccionada !== undefined &&
        producto.category_id === categoriaSeleccionada.id);

    return coincideBusqueda && coincideCategoria;
  });

  return (
    <main
      style={{
        background: "#f5f0e9",
        minHeight: "100vh",
        color: "#241b15",
        paddingBottom: 80,
      }}
    >
      <div
        style={{
          background: "#211812",
          color: "#e6c38a",
          textAlign: "center",
          padding: 12,
          fontSize: 12,
          letterSpacing: 2,
        }}
      >
        PRENDAS ANTTONELA · VENTA MAYORISTA
      </div>

      <header
        style={{
          background: "#fffaf3",
          padding: "24px 6%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <Link href="/" style={{ color: "#241b15" }}>
          <strong style={{ fontSize: 24 }}>
            PRENDAS ANTTONELA
          </strong>
        </Link>

        <nav style={{ display: "flex", gap: 22 }}>
          <Link href="/">Inicio</Link>
          <Link href="/catalogo">Catálogo</Link>
          <Link href="/carrito">Mi carrito</Link>
        </nav>
      </header>

      <section style={{ padding: "48px 6% 24px" }}>
        <p style={{ color: "#a27a43", letterSpacing: 2 }}>
          COLECCIÓN MAYORISTA
        </p>

        <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)" }}>
          Descubre nuestro catálogo
        </h1>

        <p>
          Encuentra prendas por código, nombre o tela.
          Precios unitarios para compras mayoristas.
        </p>

        <form
          action="/catalogo"
          method="GET"
          style={{
            display: "flex",
            gap: 10,
            marginTop: 28,
            flexWrap: "wrap",
          }}
        >
          <input
            type="search"
            name="q"
            defaultValue={busqueda}
            placeholder="Buscar código, prenda o tela..."
            aria-label="Buscar prendas"
            style={{
              flex: "1 1 260px",
              padding: 17,
              border: "1px solid #d8c9b5",
              borderRadius: 8,
              background: "#fff",
              color: "#241b15",
            }}
          />

          {categoria && (
            <input
              type="hidden"
              name="categoria"
              value={categoria}
            />
          )}

          <button
            type="submit"
            style={{
              padding: "15px 28px",
              background: "#241b15",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Buscar
          </button>
        </form>
      </section>

      <section style={{ padding: "12px 6% 40px" }}>
        {categoriesError && (
          <p role="alert">
            No se pudieron cargar las categorías.
          </p>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 30,
          }}
        >
          {categorias.map((item) => {
            const query = new URLSearchParams();

            if (busqueda) query.set("q", busqueda);
            if (item.valor) query.set("categoria", item.valor);

            const url = query.toString()
              ? `/catalogo?${query.toString()}`
              : "/catalogo";

            return (
              <Link
                key={item.valor || "todas"}
                href={url}
                style={{
                  padding: "11px 18px",
                  borderRadius: 30,
                  textDecoration: "none",
                  background:
                    categoria === item.valor
                      ? "#241b15"
                      : "#ffffff",
                  color:
                    categoria === item.valor
                      ? "#ffffff"
                      : "#241b15",
                  border: "1px solid #ddcfbd",
                }}
              >
                {item.nombre}
              </Link>
            );
          })}
        </div>

        <p style={{ marginBottom: 24 }}>
          {error
            ? "No se pudo cargar el catálogo"
            : `${filtrados.length} productos encontrados`}
        </p>

        {error ? (
          <p>No se pudo cargar el catálogo.</p>
        ) : filtrados.length === 0 ? (
          <p>No encontramos prendas con esos filtros.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 24,
            }}
          >
            {filtrados.map((producto) => {
              const imagen = [...(producto.product_images ?? [])]
                .sort(
                  (a, b) => a.sort_order - b.sort_order
                )[0]?.image_url;

              return (
                <Link
                  key={producto.id}
                  href={`/producto/${producto.id}`}
                  style={{
                    textDecoration: "none",
                    color: "#241b15",
                    background: "#fff",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 4px 20px #0000000d",
                  }}
                >
                  <div
                    style={{
                      height: 280,
                      background: "#eee7de",
                      position: "relative",
                    }}
                  >
                    {imagen ? (
                      <Image
                        src={imagen}
                        alt={producto.name}
                        fill
                        sizes="(max-width: 527px) 88vw, 350px"
                        loading="lazy"
                        unoptimized={!canOptimizeProductImage(imagen)}
                        style={{ objectFit: "contain" }}
                      />
                    ) : (
                      <div
                        style={{
                          padding: 30,
                          textAlign: "center",
                        }}
                      >
                        Imagen próximamente
                      </div>
                    )}
                  </div>

                  <div style={{ padding: 18 }}>
                    <small>CÓDIGO {producto.code}</small>

                    <h2
                      style={{
                        fontSize: 19,
                        margin: "10px 0",
                      }}
                    >
                      {producto.name}
                    </h2>

                    <p>
                      Tela: {producto.fabric || "Por definir"}
                    </p>

                    <strong
                      style={{
                        color: "#946b32",
                        fontSize: 22,
                      }}
                    >
                      S/{" "}
                      {Number(producto.price_dozen).toFixed(2)}
                    </strong>

                    <p style={{ fontSize: 12 }}>
                      PRECIO UNITARIO MAYORISTA
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
