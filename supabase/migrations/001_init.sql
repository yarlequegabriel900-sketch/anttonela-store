-- PRENDAS ANTTONELA: esquema inicial independiente.
-- Ejecutar en el SQL Editor del proyecto Supabase nuevo.

create extension if not exists pgcrypto;

create type public.product_status as enum ('draft', 'published', 'sold_out', 'archived');
create type public.order_status as enum ('pending_whatsapp', 'confirmed', 'payment_pending', 'paid', 'preparing', 'shipped', 'cancelled');

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  fabric text,
  category_id uuid references public.categories(id) on delete set null,
  price_per_dozen numeric(12,2) not null check (price_per_dozen >= 0),
  dozen_quantity integer not null default 12 check (dozen_quantity > 0),
  status public.product_status not null default 'draft',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color text,
  size text,
  stock_dozens integer not null default 0 check (stock_dozens >= 0),
  active boolean not null default true,
  unique (product_id, color, size)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  city text not null,
  address text,
  shipping_agency text,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  customer_id uuid not null references public.customers(id),
  status public.order_status not null default 'pending_whatsapp',
  subtotal numeric(12,2) not null check (subtotal >= 0),
  shipping_cost numeric(12,2) not null default 0 check (shipping_cost >= 0),
  total numeric(12,2) not null check (total >= 0),
  customer_notes text,
  whatsapp_opened_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_code_snapshot text not null,
  product_name_snapshot text not null,
  color_snapshot text,
  size_snapshot text,
  quantity_dozens integer not null check (quantity_dozens > 0),
  unit_price_per_dozen numeric(12,2) not null check (unit_price_per_dozen >= 0),
  line_total numeric(12,2) not null check (line_total >= 0)
);

create index products_public_catalog_idx on public.products(status, category_id, featured);
create index product_variants_product_idx on public.product_variants(product_id, active);
create index orders_created_at_idx on public.orders(created_at desc);
create index orders_status_idx on public.orders(status);

-- Seguridad: activar RLS desde el inicio.
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Los visitantes solo pueden leer categorías activas y productos publicados.
create policy "Public can read active categories" on public.categories
  for select to anon, authenticated using (active = true);
create policy "Public can read published products" on public.products
  for select to anon, authenticated using (status = 'published');
create policy "Public can read images of published products" on public.product_images
  for select to anon, authenticated using (
    exists (select 1 from public.products p where p.id = product_id and p.status = 'published')
  );
create policy "Public can read active variants of published products" on public.product_variants
  for select to anon, authenticated using (
    active = true and exists (select 1 from public.products p where p.id = product_id and p.status = 'published')
  );

-- No se crean políticas públicas para insertar clientes/pedidos ni modificar inventario.
-- El checkout se implementará mediante backend con validación, límites y controles antiabuso.
-- Las operaciones administrativas requieren autenticación y políticas específicas.
