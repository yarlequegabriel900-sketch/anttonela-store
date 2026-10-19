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

    router.push("/admin");
    router.refresh();
  }

  return (
    <main
      style={{
        maxWidth: "420px",
        margin: "80px auto",
        padding: "30px",
      }}
    >
      <h1>PRENDAS ANTTONELA</h1>
      <h2>Acceso administrador</h2>

      <form
        onSubmit={iniciarSesion}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginTop: "30px",
        }}
      >
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "INGRESANDO..." : "INICIAR SESIÓN"}
        </button>
      </form>
    </main>
  );
}