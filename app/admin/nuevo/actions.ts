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

  const { data: product, error } = await supabase
  .from("products")
  .insert({
    code,
    name,
    slug,
    description,
    fabric,
    price_dozen,
    stock_dozen,
    status: "published",
    featured: false,
  })
  .select("id")
  .single();

  if (error) {
    throw new Error(error.message);
  }
const images = formData
  .getAll("images")
  .filter((file): file is File => file instanceof File && file.size > 0);
  for (let index = 0; index < images.length; index++) {
  const file = images[index];

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

  const filePath = `${product.id}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Error al subir imagen: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(filePath);

  const { error: imageError } = await supabase
    .from("product_images")
    .insert({
      product_id: product.id,
      image_url: publicUrlData.publicUrl,
      sort_order: index,
    });

  if (imageError) {
    throw new Error(`Error al guardar imagen: ${imageError.message}`);
  }
}
  revalidatePath("/catalogo");
  revalidatePath("/admin");

  redirect("/admin");
}