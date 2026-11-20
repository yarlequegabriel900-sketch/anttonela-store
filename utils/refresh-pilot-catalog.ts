import { after } from "next/server";

export function refreshPublicCatalog() {
  const token = process.env.CATALOG_SYNC_GITHUB_TOKEN;
  if (!token) return;

  after(async () => {
    try {
      const response = await fetch(
        "https://api.github.com/repos/yarlequegabriel900-sketch/anttonela-store/actions/workflows/catalogo-piloto.yml/dispatches",
        {
          method: "POST",
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "anttonela-store",
          },
          body: JSON.stringify({ ref: "main" }),
          signal: AbortSignal.timeout(8000),
        }
      );
      if (!response.ok) console.error("No se pudo iniciar la actualización del catálogo público.", response.status);
    } catch {
      console.error("No se pudo conectar con GitHub para actualizar el catálogo público.");
    }
  });
}
