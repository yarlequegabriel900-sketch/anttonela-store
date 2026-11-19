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
