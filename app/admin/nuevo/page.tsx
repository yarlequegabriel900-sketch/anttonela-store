import { crearProducto } from "./actions";
export default function NuevoProductoPage() {
  return (
    <main style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      <h1>Agregar nuevo producto</h1>

      <p>Completa los datos de la prenda para publicarla en el catálogo.</p>

     <form
  action={crearProducto}
  style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginTop: "30px",
        }}
      >
        <label>
          Código
          <input
            type="text"
            name="code"
            placeholder="Ejemplo: 481"
            required
          />
        </label>

        <label>
          Nombre de la prenda
          <input
            type="text"
            name="name"
            placeholder="Ejemplo: Polo de dama"
            required
          />
        </label>

        <label>
          Descripción
          <textarea
            name="description"
            placeholder="Descripción del producto"
          />
        </label>

        <label>
          Tela
          <input
            type="text"
            name="fabric"
            placeholder="Ejemplo: Algodón Jersey"
          />
        </label>

        <label>
          Precio por docena
          <input
            type="number"
            name="price_dozen"
            step="0.01"
            placeholder="Ejemplo: 4.99"
            required
          />
        </label>

        <label>
          Stock en docenas
          <input
            type="number"
            name="stock_dozen"
            min="0"
            placeholder="Ejemplo: 10"
            required
          />
        </label>

        <button type="submit">
          GUARDAR PRODUCTO
        </button>
      </form>
    </main>
  );
}