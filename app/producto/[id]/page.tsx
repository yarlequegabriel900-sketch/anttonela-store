import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ProductGallery from "./ProductGallery";
import WhatsAppQuote from "./WhatsAppQuote";
import AddToCart from "./AddToCart";
type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductoPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      id,
      code,
      name,
      description,
      fabric,
      price_dozen,
      stock_units,
      status,
      product_images (
        id,
        image_url,
        sort_order
      )
    `)
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (error || !product) {
    notFound();
  }

  const images = [...(product.product_images || [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return (
    <main className="product-detail-page">
      <div className="product-detail-topbar">
        <Link href="/#catalogo" className="product-detail-back">
          ← VOLVER AL CATÁLOGO
        </Link>

        <div className="product-detail-brand">
          <span>PRENDAS</span>
          <strong>ANTTONELA</strong>
        </div>
      </div>

      <section className="product-detail-container">
  <ProductGallery
  images={images}
  productName={product.name}
/>

        <div className="product-detail-info">
          <p className="product-detail-eyebrow">
            CATÁLOGO MAYORISTA
          </p>

          <p className="product-detail-code">
            CÓDIGO {product.code}
          </p>

          <h1>{product.name}</h1>

          <div className="product-detail-divider" />

          <div className="product-detail-price">
            <span>PRECIO POR DOCENA</span>
            <strong>
              S/ {Number(product.price_dozen).toFixed(2)}
            </strong>
          </div>

          <div className="product-detail-data">
            <div>
              <span>TELA</span>
              <strong>{product.fabric || "Por definir"}</strong>
            </div>

            <div>
              <span>STOCK DISPONIBLE</span>
             <strong>
  {product.stock_units} unidades
</strong>
            </div>
          </div>

          <div className="product-detail-description">
            <span>DESCRIPCIÓN</span>
            <p>
              {product.description ||
                "Consulta los detalles de esta prenda con nuestro equipo de ventas."}
            </p>
          </div>
<AddToCart
  productId={product.id}
  productCode={product.code}
  productName={product.name}
  priceDozen={Number(product.price_dozen)}
  stockUnits={product.stock_units}
  imageUrl={images[0]?.image_url || null}
/>
          <WhatsAppQuote
  productName={product.name}
  productCode={product.code}
  priceDozen={Number(product.price_dozen)}
  productId={product.id}
/>

          <p className="product-detail-note">
            Venta mayorista · Atención directa de PRENDAS ANTTONELA
          </p>
        </div>
      </section>
    </main>
  );
}