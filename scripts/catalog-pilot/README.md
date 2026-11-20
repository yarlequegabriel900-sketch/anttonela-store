# Catálogo piloto

El administrador avisa a GitHub después de guardar los cambios. GitHub genera una copia estática de las prendas publicadas, y reutiliza las fotos procesadas al ejecutar la siguiente actualización. Las visitas a esa copia no hacen consultas a Supabase.

## Preparar el acceso

1. En Cloudflare Pages, abre el proyecto `catalogo-anttonela`. Activa la política de acceso para las vistas de prueba y configura una lista de correos invitados en Cloudflare Access. Incluye a los asesores que deban abrir enlaces a las fotos.
2. Comprueba desde una ventana privada que `https://piloto.catalogo-anttonela.pages.dev/` redirige a la pantalla de acceso. Si la rama todavía no existe y la redirección no aparece, publica primero una página de prueba sin productos en la rama `piloto`, configura el acceso y repite la comprobación.
3. La política de vistas de prueba protege la rama piloto. El enlace de producción requiere una configuración de acceso independiente.

## Conectar la actualización

1. En el repositorio de GitHub, agrega la variable `NEXT_PUBLIC_SUPABASE_URL` y los secretos `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `CLOUDFLARE_ACCOUNT_ID` y `CLOUDFLARE_API_TOKEN`. Usa la clave pública de Supabase y un token de Cloudflare con permiso de edición en Pages limitado a la cuenta de la tienda.
2. Una vez comprobado el acceso, agrega la variable del repositorio `CATALOG_PILOT_PUBLISH` con valor `true`. El flujo comprueba que el enlace redirige al inicio de sesión y que la rama de producción sigue siendo `main` antes de publicar en `piloto`.
3. Ejecuta **Actualizar catálogo piloto** manualmente desde **Actions** la primera vez y abre el enlace con una cuenta invitada.
4. En Vercel, configura `CATALOG_SYNC_GITHUB_TOKEN` como variable privada de servidor. Usa un token de GitHub limitado a este repositorio con permiso **Actions: Read and write**. Despliega el administrador con esa variable. Los siguientes cambios del catálogo iniciarán la actualización automáticamente.

Las credenciales se agregan en los paneles correspondientes. Si hay un fallo, revisa la última ejecución en **Actions** y vuelve a ejecutarla después de corregirlo. Guardar un producto en el administrador sigue funcionando si el aviso a GitHub falla.
