"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const inputClassName =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring";

export function ResetPasswordForm() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [status, setStatus] = useState<"checking" | "ready" | "invalid">(
    () => (supabase ? "checking" : "invalid")
  );
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    // The recovery link's code/token is exchanged for a session by the
    // client automatically on load; PASSWORD_RECOVERY fires once that's
    // done. Also check for an already-established session in case the
    // event fired before this listener was attached.
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setStatus("ready");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setStatus("ready");
    });

    const timeout = setTimeout(() => {
      setStatus((current) => (current === "checking" ? "invalid" : current));
    }, 3000);

    return () => {
      subscription.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [supabase]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase) return;

    setIsSubmitting(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setIsSubmitting(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
  }

  if (status === "checking") {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Checking your reset link...</p>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-foreground">Link expired</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This reset link is invalid or has expired. Request a new one from
          the sign-in page.
        </p>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mt-4 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-foreground">Password updated</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your password has been changed.
        </p>
        <button
          type="button"
          onClick={() => router.push("/app")}
          className="mt-4 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition"
        >
          Open the map
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h1 className="text-lg font-semibold text-foreground">Set a new password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose a new password for your account.
      </p>

      <form className="mt-5 flex flex-col gap-3" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-sm text-foreground">
          New password
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClassName}
          />
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save password"}
        </button>
      </form>
    </div>
  );
}
