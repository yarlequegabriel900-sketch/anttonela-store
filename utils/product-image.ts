import productWebp from "./product-webp.json";

export function canOptimizeProductImage(image: string) {
  try {
    const url = new URL(image);
    return (
      url.origin === "https://owbttzijsdqyiarakocm.supabase.co" &&
      url.pathname.startsWith("/storage/v1/object/public/product-images/") &&
      url.search === ""
    );
  } catch {
    return false;
  }
}
const localVariants: Record<string, readonly string[]> = productWebp;

const variantIndex = { catalog: 0, detail: 1, thumbnail: 2 };

export function productImageSource(
  image: string,
  variant: keyof typeof variantIndex = "catalog"
) {
  return localVariants[image]?.[variantIndex[variant]] ?? image;
}

