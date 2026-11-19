"use client";

import Image from "next/image";
import { useState } from "react";
import { canOptimizeProductImage } from "@/utils/product-image";

type ProductImage = {
  id: string;
  image_url: string;
  sort_order: number;
};

type Props = {
  images: ProductImage[];
  productName: string;
};

export default function ProductGallery({
  images,
  productName,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const previousImage = () => {
    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  };

  const nextImage = () => {
    setActiveIndex((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  };

  if (images.length === 0) {
    return (
      <div className="product-detail-gallery">
        <div className="product-detail-main-image">
          <div className="product-detail-no-image">
            FOTO DE PRENDA
          </div>
        </div>
      </div>
    );
  }

  const activeImage = images[activeIndex];
  const optimized = canOptimizeProductImage(activeImage.image_url);

  return (
    <div className="product-detail-gallery">
      <div className="product-detail-main-image">
        <Image
          src={activeImage.image_url}
          alt={`${productName} - imagen ${activeIndex + 1}`}
          fill
          sizes="(max-width: 900px) 92vw, (max-width: 1400px) 48vw, 680px"
          loading="eager"
          unoptimized={!optimized}
        />
        {optimized && (
          <a
            href={activeImage.image_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              padding: "7px 11px",
              background: "#17130f",
              color: "#fff",
              borderRadius: 4,
            }}
          >
            Ver foto original
          </a>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="product-gallery-arrow product-gallery-arrow-left"
              onClick={previousImage}
              aria-label="Imagen anterior"
            >
              ‹
            </button>

            <button
              type="button"
              className="product-gallery-arrow product-gallery-arrow-right"
              onClick={nextImage}
              aria-label="Siguiente imagen"
            >
              ›
            </button>
          </>
        )}

        <div className="product-gallery-counter">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {images.length > 1 && (
        <div className="product-detail-thumbnails">
          {images.map((image, index) => (
            <button
              type="button"
              key={image.id}
              className={`product-detail-thumbnail ${
                activeIndex === index ? "active" : ""
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <Image
                src={image.image_url}
                alt={`${productName} - miniatura ${index + 1}`}
                width={88}
                height={108}
                loading="lazy"
                unoptimized={!canOptimizeProductImage(image.image_url)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
