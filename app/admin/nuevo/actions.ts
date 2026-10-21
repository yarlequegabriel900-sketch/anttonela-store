"use server";

import { createClient } from "../../../utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearProducto(formData: FormData) {
  const supabase = await createClient();
const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  redirect("/admin/login");
}
  const code = String(formData.get("code") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const fabric = String(formData.get("fabric") || "").trim();
  const price_dozen = Number(formData.get("price_dozen"));
  const stock_dozen = Number(formData.get("stock_dozen"));

  const slug = `${name}-${code}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { error } = await supabase.from("products").insert({
    code,
    name,
    slug,
    description,
    fabric,
    price_dozen,
    stock_dozen,
    status: "published",
    featured: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/catalogo");
  revalidatePath("/admin");

  redirect("/admin");
}