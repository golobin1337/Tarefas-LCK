"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }

    router.push("/semana");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-foreground)]">
            <CheckCircle2 size={22} />
          </div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Tarefas</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Entre com sua conta para continuar
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-sm"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-[var(--color-text)]">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
              placeholder="voce@empresa.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-[var(--color-text)]">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-md bg-[var(--color-urgent-soft)] px-3 py-2 text-sm text-[var(--color-urgent)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-md bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-[var(--color-accent-foreground)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
          Ainda não tem conta?{" "}
          <Link href="/signup" className="font-medium text-[var(--color-accent)] hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
