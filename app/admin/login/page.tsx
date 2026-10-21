"use client";

import { useState } from "react";
import { createClient } from "@/utils/client";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
const [recovering, setRecovering] = useState(false);

  async function iniciarSesion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }
window.location.href = "/admin";
  }
async function recuperarPassword() {
  setError("");
  setMessage("");

  if (!email) {
    setError("Primero escribe tu correo electrónico.");
    return;
  }

  setRecovering(true);

  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo:
      "https://anttonela-store-6lpt.vercel.app/admin/reset-password",
  });

  if (error) {
    setError("No se pudo enviar el correo de recuperación.");
    setRecovering(false);
    return;
  }

  setMessage(
    "Te enviamos un enlace para cambiar tu contraseña. Revisa tu correo."
  );

  setRecovering(false);
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
        <h1>Bienvenido</h1>
        <span>
          Ingresa tus datos para administrar el catálogo mayorista.
        </span>
      </div>

      <form
        onSubmit={iniciarSesion}
        className="admin-login-form"
      >
        <label>
          Correo electrónico
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && (
          <p className="admin-login-error">{error}</p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "INGRESANDO..." : "INICIAR SESIÓN"}
        </button>
        <button
  type="button"
  onClick={recuperarPassword}
  disabled={recovering}
>
  {recovering
    ? "ENVIANDO..."
    : "OLVIDÉ MI CONTRASEÑA"}
</button>

{message && (
  <p className="admin-login-success">{message}</p>
)}
      </form>

      <p className="admin-login-footer">
        Acceso exclusivo · PRENDAS ANTTONELA
      </p>
    </section>
  </main>
);
}