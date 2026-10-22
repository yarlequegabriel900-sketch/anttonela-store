"use client";

import { useState } from "react";

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

  return (
    <div className="product-detail-gallery">
      <div className="product-detail-main-image">
        <img
          src={images[activeIndex].image_url}
          alt={`${productName} - imagen ${activeIndex + 1}`}
        />

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
              <img
                src={image.image_url}
                alt={`${productName} - miniatura ${index + 1}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}