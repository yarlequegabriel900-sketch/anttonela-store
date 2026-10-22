"use client";

import { ChangeEvent, useEffect, useState } from "react";

type PreviewImage = {
  file: File;
  url: string;
};

export default function ImageUploader() {
  const [previews, setPreviews] = useState<PreviewImage[]>([]);

  function handleImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    setPreviews((previous) => {
      previous.forEach((image) => URL.revokeObjectURL(image.url));

      return files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
    });
  }

  useEffect(() => {
    return () => {
      previews.forEach((image) => URL.revokeObjectURL(image.url));
    };
  }, [previews]);

  return (
    <div className="admin-image-uploader">
      <label className="admin-image-upload">
        {previews.length === 0 ? (
          <>
            <div className="admin-image-upload-icon">+</div>

            <div>
              <strong>AGREGAR IMÁGENES</strong>
              <span>Selecciona las fotos de la prenda</span>
            </div>
          </>
        ) : (
          <div className="admin-image-preview-area">
            <div className="admin-image-preview-grid">
              {previews.map((image, index) => (
                <div className="admin-image-preview-item" key={image.url}>
                  <img
                    src={image.url}
                    alt={`Vista previa ${index + 1}`}
                  />

                  {index === 0 && (
                    <span className="admin-image-main-badge">
                      PRINCIPAL
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="admin-image-add-more">
              <span>+</span>
              CAMBIAR / AGREGAR IMÁGENES
            </div>
          </div>
        )}

        <input
          type="file"
          name="images"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleImages}
        />
      </label>

      {previews.length > 0 && (
        <p className="admin-image-count">
          {previews.length}{" "}
          {previews.length === 1 ? "imagen seleccionada" : "imágenes seleccionadas"}
        </p>
      )}
    </div>
  );
}