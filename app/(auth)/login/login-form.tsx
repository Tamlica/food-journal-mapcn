"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const inputClassName =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring";

type Mode = "sign-in" | "sign-up";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/app";

  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const supabase = getSupabaseBrowserClient();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase) {
      setError("Supabase env is missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setNotice(null);

    if (mode === "sign-in") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setIsSubmitting(false);
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push(next);
      router.refresh();
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    setIsSubmitting(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setNotice("Check your email to confirm your account, then sign in.");
    setMode("sign-in");
  }

  async function handleForgotPassword() {
    if (!supabase) return;
    if (!email) {
      setError("Enter your email above first, then tap “Forgot password.”");
      return;
    }

    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/reset-password` }
    );

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setNotice("Check your email for a password reset link.");
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h1 className="text-lg font-semibold text-foreground">
        {mode === "sign-in" ? "Sign in" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {mode === "sign-in"
          ? "Sign in to see your places."
          : "One account, your places only."}
      </p>

      <form className="mt-5 flex flex-col gap-3" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-sm text-foreground">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-foreground">
          Password
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClassName}
          />
        </label>

        {mode === "sign-in" && (
          <button
            type="button"
            onClick={handleForgotPassword}
            className="self-end text-xs text-muted-foreground underline-offset-2 hover:underline cursor-pointer"
          >
            Forgot password?
          </button>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
        {notice && <p className="text-sm text-primary">{notice}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition disabled:opacity-60"
        >
          {isSubmitting
            ? "Please wait..."
            : mode === "sign-in"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "sign-in" ? "sign-up" : "sign-in");
          setError(null);
          setNotice(null);
        }}
        className="mt-4 w-full text-center text-sm text-muted-foreground underline-offset-2 hover:underline cursor-pointer"
      >
        {mode === "sign-in"
          ? "Need an account? Create one"
          : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
