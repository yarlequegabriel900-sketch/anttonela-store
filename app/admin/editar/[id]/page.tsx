import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import {
  actualizarProducto,
  eliminarImagenProducto,
} from "../../actions";
import "../../admin.css";
import ImageUploader from "../../nuevo/ImageUploader";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  redirect("/admin/login");
}

  const { data: product, error } = await supabase
  .from("products")
  .select(`
    id,
    code,
    name,
    description,
    fabric,
    price_dozen,
    stock_dozen,
    status,
    featured,
    product_images (
      id,
      image_url,
      sort_order
    )
  `)
  .eq("id", id)
  .single();
  if (error || !product) {
    notFound();
  }

  return (
  <main className="admin-new-product admin-edit-product">
    <div className="admin-new-product-overlay" />

    <div className="admin-new-product-content">
      <div className="admin-new-product-topbar">
        <div>
          <span className="admin-new-product-eyebrow">
            ADMINISTRACIÓN · CATÁLOGO
          </span>
          <h1>Editar producto</h1>
          <p>
            Actualiza la información de la prenda seleccionada.
          </p>
        </div>

        <Link href="/admin" className="admin-back-button">
          ← VOLVER AL ADMINISTRADOR
        </Link>
      </div>

      <section className="admin-product-form-card">
        <div className="admin-product-form-header">
          <div>
            <span>EDICIÓN DE PRODUCTO</span>
            <h2>{product.name}</h2>
          </div>

          <div className="admin-edit-code">
            {product.code}
          </div>
        </div>

        <form action={actualizarProducto} className="admin-product-form">
          <input type="hidden" name="id" value={product.id} />

          <div className="admin-form-grid">
            <label>
              <span>CÓDIGO</span>
              <input
                type="text"
                name="code"
                defaultValue={product.code}
                required
              />
            </label>

            <label>
              <span>NOMBRE DEL PRODUCTO</span>
              <input
                type="text"
                name="name"
                defaultValue={product.name}
                required
              />
            </label>
          </div>

          <label>
            <span>DESCRIPCIÓN</span>
            <textarea
              name="description"
              defaultValue={product.description || ""}
              rows={5}
            />
          </label>

          <div className="admin-form-grid">
            <label>
              <span>TELA</span>
              <input
                type="text"
                name="fabric"
                defaultValue={product.fabric || ""}
              />
            </label>

            <label>
              <span>ESTADO</span>
              <select name="status" defaultValue={product.status}>
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </label>
          </div>
<div className="admin-edit-images">
  <div className="admin-edit-images-heading">
    <span>IMÁGENES DEL PRODUCTO</span>
    <p>Imágenes actualmente publicadas para este producto.</p>
  </div>

  {product.product_images && product.product_images.length > 0 ? (
    <div className="admin-edit-images-grid">
      {product.product_images
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((image, index) => (
          <div className="admin-edit-image-card" key={image.id}>
            <img
              src={image.image_url}
              alt={`${product.name} - imagen ${index + 1}`}
            />

           {index === 0 && (
  <span className="admin-edit-image-main">
    IMAGEN PRINCIPAL
  </span>
)}

<form action={eliminarImagenProducto}>
  <input type="hidden" name="image_id" value={image.id} />
  <input type="hidden" name="product_id" value={product.id} />

  <button
    type="submit"
    className="admin-edit-image-delete"
    title="Eliminar imagen"
  >
    🗑 ELIMINAR
  </button>
</form>
          </div>
        ))}
    </div>
  ) : (
    <div className="admin-edit-images-empty">
      Este producto todavía no tiene imágenes.
    </div>
  )}

  <div className="admin-edit-add-images">
    <div className="admin-edit-add-images-title">
      <span>AGREGAR NUEVAS IMÁGENES</span>
      <p>
        Las imágenes seleccionadas se agregarán a las imágenes actuales del producto.
      </p>
    </div>

    <ImageUploader />
  </div>
</div>

          <div className="admin-form-grid">
            <label>
              <span>PRECIO POR DOCENA</span>
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
              <span>STOCK EN DOCENAS</span>
              <input
                type="number"
                name="stock_dozen"
                step="1"
                min="0"
                defaultValue={product.stock_dozen}
                required
              />
            </label>
          </div>

          <div className="admin-form-actions">
            <Link href="/admin" className="admin-cancel-button">
              CANCELAR
            </Link>

            <button type="submit" className="admin-save-button">
              GUARDAR CAMBIOS →
            </button>
          </div>
        </form>
      </section>
    </div>
  </main>
);
}