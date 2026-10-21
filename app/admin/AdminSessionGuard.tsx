"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/client";

export default function AdminSessionGuard() {
  const router = useRouter();

  useEffect(() => {
    const adminYaEstabaAbierto =
      sessionStorage.getItem("admin_session_active") === "true";

    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming | undefined;

    const esRecarga = navigation?.type === "reload";

    if (esRecarga && adminYaEstabaAbierto) {
      sessionStorage.removeItem("admin_session_active");

      const cerrarSesion = async () => {
        const supabase = createClient();

        await supabase.auth.signOut();

        router.replace("/admin/login");
        router.refresh();
      };

      cerrarSesion();
      return;
    }

    sessionStorage.setItem("admin_session_active", "true");
  }, [router]);

  return null;
}