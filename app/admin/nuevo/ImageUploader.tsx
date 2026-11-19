"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

type PreviewImage = {
  file: File;
  url: string;
};

async function preparePhoto(file: File) {
  const bitmap = await createImageBitmap(file);
  try {
    const edge = Math.max(bitmap.width, bitmap.height);
    if (file.type === "image/webp" && edge <= 1280 && file.size <= 350_000) return file;

    const scale = Math.min(1, 1280 / edge);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error();
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", 0.78);
    });
    if (blob?.type !== "image/webp") throw new Error();
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } finally {
    bitmap.close();
  }
}

export default function ImageUploader() {
  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const selection = useRef(0);

  async function handleImages(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    const current = ++selection.current;
    setPreviews([]);
    input.value = "";
    input.setCustomValidity(files.length ? "Espera a que se preparen las fotos." : "");
    setMessage(files.length ? "Preparando fotos en WebP…" : "");
    if (!files.length) return;

    try {
      const optimized = new DataTransfer();
      let totalBytes = 0;
      for (const file of files) {
        const photo = await preparePhoto(file).catch(() => {
          throw new Error(`No se pudo preparar «${file.name}». Elige un JPG, PNG o WebP válido.`);
        });
        if (current !== selection.current) return;
        totalBytes += photo.size;
        if (totalBytes > 4_000_000) {
          throw new Error("Las fotos aún pesan demasiado juntas. Selecciona menos fotos por vez.");
        }
        optimized.items.add(photo);
      }
      input.files = optimized.files;
      input.setCustomValidity("");
      setPreviews(Array.from(optimized.files, (file) => ({ file, url: URL.createObjectURL(file) })));
      setMessage("");
    } catch (error) {
      if (current !== selection.current) return;
      const reason = error instanceof Error ? error.message : "No se pudieron preparar las fotos.";
      input.setCustomValidity(reason);
      setMessage(reason);
    }
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
          ref={inputRef}
          type="file"
          name="images"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleImages}
        />
      </label>

      {message && (
        <>
          <p role="status">{message}</p>
          <button type="button" onClick={() => {
            selection.current++;
            inputRef.current?.setCustomValidity("");
            setMessage("");
          }}>
            Quitar selección
          </button>
        </>
      )}
 

      {previews.length > 0 && (
        <p className="admin-image-count">
          {previews.length}{" "}
          {previews.length === 1 ? "imagen seleccionada" : "imágenes seleccionadas"}
        </p>
      )}
    </div>
  );
}