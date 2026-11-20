# Actualización del catálogo público

El administrador avisa a GitHub tras guardar un cambio de producto. GitHub genera una copia estática de las prendas publicadas y reutiliza las fotos procesadas. Cloudflare Pages publica la copia en https://catalogo-anttonela.pages.dev/. Las visitas a esa página no consultan Supabase.

## Activar

1. En GitHub, abre **Settings → Secrets and variables → Actions**. Registra la variable `NEXT_PUBLIC_SUPABASE_URL` y los secretos `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `CLOUDFLARE_ACCOUNT_ID` y `CLOUDFLARE_API_TOKEN`. Usa la clave pública de Supabase y un token de Cloudflare con permiso **Cloudflare Pages: Edit** limitado a la cuenta de la tienda.
2. En **Actions → Actualizar catálogo público**, ejecuta **Run workflow** sobre `main` para comprobar la generación. Para activar la publicación, crea la variable de GitHub `CATALOG_PUBLIC_PUBLISH` con valor `true` y ejecuta el flujo de nuevo. Verifica el enlace público.
3. En Vercel, agrega `CATALOG_SYNC_GITHUB_TOKEN` como variable privada de **Production**. Usa un token de GitHub limitado a este repositorio con permiso **Actions: Read and write**. Vuelve a desplegar el administrador.
4. Guarda un cambio autorizado desde el administrador y verifica en GitHub que aparezca una ejecución. Tras finalizar, comprueba la prenda en el catálogo público.

Guarda los tokens solo en los paneles correspondientes. Si falla la solicitud a GitHub, el producto sigue guardado y se puede lanzar el flujo manualmente. Si falla la publicación en Cloudflare, el catálogo conserva la última versión publicada.
