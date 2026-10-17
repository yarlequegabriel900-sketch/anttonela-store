# PRENDAS ANTTONELA — tienda mayorista independiente

Primer prototipo de frontend con Next.js, TypeScript y CSS, más un esquema inicial de base de datos para Supabase/PostgreSQL.

## Incluye
- Portada adaptable a celulares.
- Navegación por categorías.
- Catálogo visual con productos de demostración claramente marcados.
- Sección de cómo comprar.
- Migración SQL inicial para categorías, productos, fotos, variantes, clientes, pedidos y detalle de pedidos.
- Archivo `.env.example` para configurar el backend después.

## Requisitos
- Node.js 20.9 o posterior.
- Un proyecto Supabase nuevo para la base de datos y el almacenamiento.

## Ejecutar el frontend
1. Instala Node.js.
2. En esta carpeta, ejecuta `npm install`.
3. Ejecuta `npm run dev`.
4. Abre `http://localhost:3000`.

## Configurar la base de datos
1. Crea un proyecto nuevo en Supabase. No reutilices las hojas ni el proyecto del ERP.
2. Abre el SQL Editor en Supabase.
3. Ejecuta `supabase/migrations/001_init.sql`.
4. Copia `.env.example` a `.env.local` y añade la URL y la clave pública del proyecto.

## Estado de esta entrega
Esta es la base inicial de diseño y esquema, no una tienda lista para recibir pedidos reales. El catálogo usa datos demo y los botones de compra están desactivados intencionalmente. Los siguientes pasos son conectar Supabase, crear el acceso administrativo, implementar subida de fotos y construir el checkout protegido en backend.

**Seguridad:** nunca expongas claves `service_role` en el navegador. No publiques pedidos reales hasta implementar y probar las validaciones de stock, precio, duplicados y permisos.
