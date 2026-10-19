"use client";

import { useState } from "react";
import { createClient } from "@/utils/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function cambiarPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError("No se pudo actualizar la contraseña. Solicita un nuevo enlace.");
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();

    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="admin-login-brand">
          <span>PRENDAS</span>
          <strong>ANTTONELA</strong>
        </div>

        <div className="admin-login-heading">
          <p>ADMINISTRACIÓN</p>
          <h1>Nueva contraseña</h1>
          <span>
            Crea una nueva contraseña para acceder al panel administrador.
          </span>
        </div>

        <form
          onSubmit={cambiarPassword}
          className="admin-login-form"
        >
          <label>
            Nueva contraseña
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>

          <label>
            Confirmar contraseña
            <input
              type="password"
              placeholder="Repite la contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>

          {error && (
            <p className="admin-login-error">{error}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "ACTUALIZANDO..." : "CAMBIAR CONTRASEÑA"}
          </button>
        </form>

        <p className="admin-login-footer">
          Acceso exclusivo · PRENDAS ANTTONELA
        </p>
      </section>
    </main>
  );
}