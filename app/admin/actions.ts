"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
 const stockUnits = Number(formData.get("stock_units"));

  if (!id || !code || !name) {
    throw new Error("Faltan datos obligatorios del producto.");
  }

  if (
   !Number.isFinite(stockUnits) ||
priceDozen < 0 ||
stockUnits < 0
  ) {
    throw new Error("Precio o stock inválido.");
  }

  // ACTUALIZAR DATOS DEL PRODUCTO
  const { error } = await supabase
    .from("products")
    .update({
      code,
      name,
      fabric,
      description,
      price_dozen: priceDozen,
     stock_units: stockUnits,
      status,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`No se pudo actualizar el producto: ${error.message}`);
  }

  // OBTENER NUEVAS IMÁGENES SELECCIONADAS
  const images = formData
    .getAll("images")
    .filter(
      (file): file is File =>
        file instanceof File && file.size > 0
    );

  // SI HAY NUEVAS IMÁGENES, BUSCAR EL ÚLTIMO ORDEN ACTUAL
  if (images.length > 0) {
    const { data: existingImages, error: existingImagesError } =
      await supabase
        .from("product_images")
        .select("sort_order")
        .eq("product_id", id)
        .order("sort_order", { ascending: false })
        .limit(1);

    if (existingImagesError) {
      throw new Error(
        `No se pudieron consultar las imágenes actuales: ${existingImagesError.message}`
      );
    }

    const nextSortOrder =
      existingImages && existingImages.length > 0
        ? existingImages[0].sort_order + 1
        : 0;

    // SUBIR NUEVAS IMÁGENES
    for (let index = 0; index < images.length; index++) {
      const file = images[index];

      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath = `${id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(
          `Error al subir imagen: ${uploadError.message}`
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      const { error: imageError } = await supabase
        .from("product_images")
        .insert({
          product_id: id,
          image_url: publicUrlData.publicUrl,
          sort_order: nextSortOrder + index,
        });

      if (imageError) {
        throw new Error(
          `Error al guardar imagen: ${imageError.message}`
        );
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin");
  revalidatePath(`/admin/editar/${id}`);

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
export async function eliminarImagenProducto(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const imageId = String(formData.get("image_id") || "");
  const productId = String(formData.get("product_id") || "");

  if (!imageId || !productId) {
    throw new Error("No se encontró la imagen.");
  }

  const { data: image, error: imageSearchError } = await supabase
    .from("product_images")
    .select("id, image_url")
    .eq("id", imageId)
    .eq("product_id", productId)
    .single();

  if (imageSearchError || !image) {
    throw new Error("No se pudo encontrar la imagen.");
  }

  const marker = "/product-images/";

  if (image.image_url.includes(marker)) {
    const filePath = image.image_url.split(marker)[1];

    if (filePath) {
      const decodedFilePath = decodeURIComponent(filePath);

      const { error: storageError } = await supabase.storage
        .from("product-images")
        .remove([decodedFilePath]);

      if (storageError) {
        throw new Error(
          `No se pudo eliminar la imagen del almacenamiento: ${storageError.message}`
        );
      }
    }
  }

  const { error: deleteError } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId)
    .eq("product_id", productId);

  if (deleteError) {
    throw new Error(
      `No se pudo eliminar la imagen: ${deleteError.message}`
    );
  }

  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin");
  revalidatePath(`/admin/editar/${productId}`);
}
export async function actualizarDatosPedido(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const id = String(formData.get("id") || "");

  const customerName = String(
    formData.get("customer_name") || ""
  ).trim();

  const dni = String(
    formData.get("dni") || ""
  ).trim();

  const customerPhone = String(
    formData.get("customer_phone") || ""
  ).trim();

  const destination = String(
    formData.get("destination") || ""
  ).trim();

  const agency = String(
    formData.get("agency") || ""
  ).trim();

  const address = String(
    formData.get("address") || ""
  ).trim();

  if (!id) {
    throw new Error("No se encontró el pedido.");
  }

  if (!customerName || !customerPhone) {
    throw new Error(
      "El nombre y teléfono del cliente son obligatorios."
    );
  }

  if (dni && !/^\d{8}$/.test(dni)) {
    throw new Error("El DNI debe tener 8 dígitos.");
  }

  const { error } = await supabase
    .from("orders")
    .update({
      customer_name: customerName,
      dni,
      customer_phone: customerPhone,
      destination,
      agency,
      address,
    })
    .eq("id", id);

  if (error) {
    throw new Error(
      `No se pudo actualizar el pedido: ${error.message}`
    );
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/editar/${id}`);
  revalidatePath(`/pedido/${id}`);

  redirect(`/admin/pedidos/editar/${id}`);
}
  export async function actualizarCantidadPedido(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const orderId = String(formData.get("order_id") || "");
  const itemId = String(formData.get("item_id") || "");
  const quantityUnits = Number(formData.get("quantity_units"));

  if (!orderId || !itemId) {
    throw new Error("No se encontró el pedido o producto.");
  }

  if (
    !Number.isInteger(quantityUnits) ||
    quantityUnits < 1
  ) {
    throw new Error("La cantidad debe ser mayor a 0.");
  }

  const { data: item, error: itemError } = await supabase
    .from("order_items")
    .select("price_dozen")
    .eq("id", itemId)
    .eq("order_id", orderId)
    .single();

  if (itemError || !item) {
    throw new Error("No se encontró el producto del pedido.");
  }

  const newSubtotal =
    Number(item.price_dozen) * quantityUnits;

  const { error: updateItemError } = await supabase
    .from("order_items")
    .update({
      quantity_units: quantityUnits,
      subtotal: newSubtotal,
    })
    .eq("id", itemId)
    .eq("order_id", orderId);

  if (updateItemError) {
    throw new Error(
      `No se pudo actualizar la cantidad: ${updateItemError.message}`
    );
  }

  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("subtotal")
    .eq("order_id", orderId);

  if (itemsError) {
    throw new Error(
      `No se pudo recalcular el pedido: ${itemsError.message}`
    );
  }

  const newTotal = (orderItems || []).reduce(
    (total, currentItem) =>
      total + Number(currentItem.subtotal),
    0
  );

  const { error: orderError } = await supabase
    .from("orders")
    .update({
      total: newTotal,
    })
    .eq("id", orderId);

  if (orderError) {
    throw new Error(
      `No se pudo actualizar el total: ${orderError.message}`
    );
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/editar/${orderId}`);
  revalidatePath(`/pedido/${orderId}`);

  redirect(`/admin/pedidos/editar/${orderId}`);
}