"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function cerrarSesion() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/admin/login");
}
export async function actualizarProducto(formData: FormData) {
  const supabase = await createClient();
  const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  redirect("/admin/login");
}

  const id = String(formData.get("id") || "");
  const code = String(formData.get("code") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const fabric = String(formData.get("fabric") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const status = String(formData.get("status") || "draft");

  const priceDozen = Number(formData.get("price_dozen"));
  const stockDozen = Number(formData.get("stock_dozen"));

  if (!id || !code || !name) {
    throw new Error("Faltan datos obligatorios del producto.");
  }

  if (
    !Number.isFinite(priceDozen) ||
    !Number.isFinite(stockDozen) ||
    priceDozen < 0 ||
    stockDozen < 0
  ) {
    throw new Error("Precio o stock inválido.");
  }

  const { error } = await supabase
    .from("products")
    .update({
      code,
      name,
      fabric,
      description,
      price_dozen: priceDozen,
      stock_dozen: stockDozen,
      status,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`No se pudo actualizar el producto: ${error.message}`);
  }

  redirect("/admin");
}
export async function eliminarProducto(formData: FormData) {
  const supabase = await createClient();
  const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  redirect("/admin/login");
}
  const id = String(formData.get("id") || "");

  if (!id) {
    throw new Error("No se encontró el producto.");
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`No se pudo eliminar el producto: ${error.message}`);
  }

  redirect("/admin");
}
export async function cambiarEstadoProducto(formData: FormData) {
  const supabase = await createClient();
  const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  redirect("/admin/login");
}

  const id = String(formData.get("id") || "");
  const estadoActual = String(formData.get("status") || "");

  if (!id) {
    throw new Error("No se encontró el producto.");
  }

  const nuevoEstado =
    estadoActual === "published" ? "draft" : "published";

  const { error } = await supabase
    .from("products")
    .update({
      status: nuevoEstado,
    })
    .eq("id", id);

  if (error) {
    throw new Error(
      `No se pudo cambiar el estado del producto: ${error.message}`
    );
  }

  redirect("/admin");
}