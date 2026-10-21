"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/client";

export default function AdminSessionGuard() {
  const router = useRouter();

  useEffect(() => {
    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming | undefined;

    if (navigation?.type === "reload") {
      const cerrarSesion = async () => {
        const supabase = createClient();

        await supabase.auth.signOut();

        router.replace("/admin/login");
        router.refresh();
      };

      cerrarSesion();
    }
  }, [router]);

  return null;
}