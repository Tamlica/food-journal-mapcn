"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AtSign, Eye, EyeOff, Loader2, Lock, User } from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const inputClassName =
  "w-full rounded-lg border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground/60 focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60";

function Field({
  icon: Icon,
  children,
  trailing,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      {children}
      {trailing}
    </div>
  );
}

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

type Mode = "sign-in" | "sign-up";

const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/app";

  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    const param = searchParams.get("error");
    return param === "confirmation_failed"
      ? "That confirmation link is invalid or has expired."
      : param;
  });
  const [notice, setNotice] = useState<string | null>(null);

  const isBusy = isSubmitting || isResetting || isGoogleLoading;
  const supabase = getSupabaseBrowserClient();

  async function handleGoogleSignIn() {
    if (!supabase) {
      setError("Supabase env is missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    setIsGoogleLoading(true);
    setError(null);
    setNotice(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    // On success the browser navigates to Google, so keep the loading state.
    if (oauthError) {
      setIsGoogleLoading(false);
      setError(oauthError.message);
    }
  }

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
      if (signInError) {
        setIsSubmitting(false);
        setError(signInError.message);
        return;
      }
      // Leave isSubmitting on through the navigation so the button stays
      // in its loading state instead of flashing back to idle while the
      // redirect is in flight.
      router.push(next);
      router.refresh();
      return;
    }

    const normalizedUsername = username.trim().toLowerCase();
    if (!USERNAME_PATTERN.test(normalizedUsername)) {
      setIsSubmitting(false);
      setError("Username must be 3–30 characters: letters, numbers or underscores.");
      return;
    }

    const { data: isAvailable } = await supabase.rpc("is_username_available", {
      candidate: normalizedUsername,
    });
    if (isAvailable === false) {
      setIsSubmitting(false);
      setError("That username is already taken.");
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: { username: normalizedUsername },
      },
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

    setIsResetting(true);
    setError(null);
    setNotice(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/reset-password` }
    );
    setIsResetting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setNotice("Check your email for a password reset link.");
  }

  return (
    <div className="flex w-full flex-col rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10 lg:min-h-[34rem]">
      <Image
        src="/makanmap-logo-trans.png"
        alt="MakanMap"
        width={56}
        height={56}
        priority
        className="size-20 rounded-xl"
      />

      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
        {mode === "sign-in" ? "Welcome back!" : "Create your account"}
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {mode === "sign-in"
          ? "Sign in to see your places."
          : "One account, your places only."}
      </p>

      <form className="mt-6 flex flex-col gap-3" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1.5 text-sm text-foreground">
          Email
          <Field icon={AtSign}>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isBusy}
              className={inputClassName}
            />
          </Field>
        </label>

        {mode === "sign-up" && (
          <label className="flex flex-col gap-1.5 text-sm text-foreground">
            Username
            <Field icon={User}>
              <input
                type="text"
                required
                minLength={3}
                maxLength={30}
                pattern="[A-Za-z0-9_]{3,30}"
                autoComplete="username"
                placeholder="your_name"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                disabled={isBusy}
                className={inputClassName}
              />
            </Field>
            <span className="text-xs text-muted-foreground">
              Used for your public page. Letters, numbers and underscores.
            </span>
          </label>
        )}

        <label className="flex flex-col gap-1.5 text-sm text-foreground">
          Password
          <Field
            icon={Lock}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-muted-foreground transition hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            }
          >
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isBusy}
              className={`${inputClassName} pr-10`}
            />
          </Field>
        </label>

        {mode === "sign-in" && (
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={isBusy}
            className="inline-flex items-center gap-1 self-end text-xs text-primary underline-offset-2 hover:underline cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResetting && <Loader2 className="size-3 animate-spin" />}
            {isResetting ? "Sending..." : "Forgot password?"}
          </button>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
        {notice && <p className="text-sm text-primary">{notice}</p>}

        <button
          type="submit"
          disabled={isBusy}
          className="mt-1 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting
            ? "Please wait..."
            : mode === "sign-in"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
        <hr className="flex-1 border-border" />
        or
        <hr className="flex-1 border-border" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isBusy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isGoogleLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <GoogleLogo className="size-4" />
        )}
        {isGoogleLoading ? "Redirecting..." : "Continue with Google"}
      </button>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {mode === "sign-in" ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "sign-in" ? "sign-up" : "sign-in");
            setError(null);
            setNotice(null);
          }}
          disabled={isBusy}
          className="cursor-pointer font-semibold text-primary underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mode === "sign-in" ? "Sign up" : "Sign in"}
        </button>
      </p>

      <div className="mt-auto flex items-center justify-between gap-4 pt-8 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} MakanMap</span>
        <span className="flex items-center gap-3">
          <Link href="/terms" className="underline underline-offset-2">
            Terms
          </Link>
          <Link href="/privacy" className="underline underline-offset-2">
            Privacy Policy
          </Link>
        </span>
      </div>
    </div>
  );
}
