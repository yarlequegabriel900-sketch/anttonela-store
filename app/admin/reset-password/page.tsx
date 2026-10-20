"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function prepararRecuperacion() {
      setError("");

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      // Si Supabase nos envió un código PKCE, lo cambiamos por una sesión.
      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error(
            "ERROR EXCHANGE CODE:",
            exchangeError
          );

          setError(
            `No se pudo validar el enlace: ${exchangeError.message}`
          );
          return;
        }

        // Quitamos el código de la URL para evitar intentar usarlo otra vez.
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }

      // Comprobamos que realmente exista una sesión antes
      // de permitir el cambio de contraseña.
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error(
          "ERROR GET SESSION:",
          sessionError
        );

        setError(
          `No se pudo comprobar la sesión: ${sessionError.message}`
        );
        return;
      }

      if (!session) {
        setError(
          "No existe una sesión de recuperación válida. Solicita un nuevo enlace."
        );
        return;
      }

      setReady(true);
    }

    prepararRecuperacion();
  }, []);

  async function cambiarPassword(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (!ready) {
      setError(
        "La sesión de recuperación todavía no está disponible."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    // Verificación final antes de intentar modificar la contraseña.
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      setError(
        sessionError
          ? `Error de sesión: ${sessionError.message}`
          : "La sesión de recuperación ya no es válida."
      );
      setLoading(false);
      return;
    }

    const { error: updateError } =
      await supabase.auth.updateUser({
        password,
      });

    if (updateError) {
      console.error(
        "ERROR UPDATE PASSWORD:",
        updateError
      );

      setError(
        `No se pudo cambiar la contraseña: ${updateError.message}`
      );
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();

    router.replace("/admin/login");
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
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              minLength={6}
              disabled={!ready || loading}
            />
          </label>

          <label>
            Confirmar contraseña
            <input
              type="password"
              placeholder="Repite la contraseña"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              required
              minLength={6}
              disabled={!ready || loading}
            />
          </label>

          {error && (
            <p className="admin-login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!ready || loading}
          >
            {loading
              ? "ACTUALIZANDO..."
              : ready
                ? "CAMBIAR CONTRASEÑA"
                : "VALIDANDO ENLACE..."}
          </button>
        </form>

        <p className="admin-login-footer">
          Acceso exclusivo · PRENDAS ANTTONELA
        </p>
      </section>
    </main>
  );
}