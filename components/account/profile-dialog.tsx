"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserIdentity } from "@supabase/supabase-js";
import { Check, Copy, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PLACE_STATUS_OPTIONS, STATUS_STYLE } from "@/lib/constants/food-journal";
import { useFoodJournalStore } from "@/lib/stores/use-food-journal-store";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PlaceStatus } from "@/lib/types/food-journal";
import {
  USERNAME_PATTERN,
  isUsernameAvailable,
  updateOwnProfile,
  type Profile,
} from "@/lib/supabase/profile-queries";

const inputClassName =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60";

const buttonClassName =
  "inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60";

type Feedback = { type: "error" | "success"; message: string } | null;

function FeedbackText({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return (
    <p
      className={
        feedback.type === "error"
          ? "text-sm text-destructive"
          : "text-sm text-primary"
      }
    >
      {feedback.message}
    </p>
  );
}

type ProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  email: string;
  profile: Profile | null;
  onProfileChange: (profile: Profile) => void;
};

export function ProfileDialog({
  open,
  onOpenChange,
  userId,
  email,
  profile,
  onProfileChange,
}: ProfileDialogProps) {
  const [identities, setIdentities] = useState<UserIdentity[] | null>(null);

  const reloadIdentities = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data } = await supabase.auth.getUserIdentities();
    setIdentities(data?.identities ?? []);
  }, []);

  useEffect(() => {
    if (!open) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let cancelled = false;
    void supabase.auth.getUserIdentities().then(({ data }) => {
      if (!cancelled) setIdentities(data?.identities ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  // null while loading so the password section doesn't flash the wrong form.
  const hasPassword =
    identities === null
      ? null
      : identities.some((identity) => identity.provider === "email");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>
            Manage your public page, email and password.
          </DialogDescription>
        </DialogHeader>

        {profile && (
          <PublicProfileSection
            userId={userId}
            profile={profile}
            onProfileChange={onProfileChange}
          />
        )}
        <hr className="border-border" />
        <PlacesVisibilitySection />
        <hr className="border-border" />
        <EmailSection currentEmail={email} />
        <hr className="border-border" />
        <SignInMethodsSection
          identities={identities}
          hasPassword={hasPassword}
          onChange={reloadIdentities}
        />
        <hr className="border-border" />
        <PasswordSection
          email={email}
          hasPassword={hasPassword}
          onPasswordSet={reloadIdentities}
        />
      </DialogContent>
    </Dialog>
  );
}

function PublicProfileSection({
  userId,
  profile,
  onProfileChange,
}: {
  userId: string;
  profile: Profile;
  onProfileChange: (profile: Profile) => void;
}) {
  const [username, setUsername] = useState(profile.username);
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [isPublic, setIsPublic] = useState(profile.isPublic);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [copied, setCopied] = useState(false);

  const publicUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/u/${profile.username}`;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const normalized = username.trim().toLowerCase();

    if (!USERNAME_PATTERN.test(normalized)) {
      setFeedback({
        type: "error",
        message: "Username must be 3–30 characters: letters, numbers or underscores.",
      });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      if (normalized !== profile.username) {
        const available = await isUsernameAvailable(normalized);
        if (!available) {
          setFeedback({ type: "error", message: "That username is already taken." });
          return;
        }
      }

      const updated = await updateOwnProfile(userId, {
        username: normalized,
        displayName: displayName.trim() || null,
        bio: bio.trim() || null,
        isPublic,
      });
      onProfileChange(updated);
      setUsername(updated.username);
      setFeedback({ type: "success", message: "Profile saved." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Could not save profile.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setFeedback({ type: "error", message: "Could not copy the link." });
    }
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <h3 className="text-sm font-semibold text-foreground">Public page</h3>

      <label className="flex flex-col gap-1 text-sm text-foreground">
        Username
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          disabled={isSaving}
          autoComplete="username"
          className={inputClassName}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-foreground">
        Display name
        <input
          type="text"
          value={displayName}
          maxLength={60}
          onChange={(event) => setDisplayName(event.target.value)}
          disabled={isSaving}
          className={inputClassName}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-foreground">
        Bio
        <textarea
          value={bio}
          maxLength={200}
          rows={2}
          onChange={(event) => setBio(event.target.value)}
          disabled={isSaving}
          className={inputClassName}
        />
      </label>

      <label className="flex items-start gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(event) => setIsPublic(event.target.checked)}
          disabled={isSaving}
          className="mt-0.5 size-4 cursor-pointer"
        />
        <span>
          Make my public page visible
          <span className="block text-xs text-muted-foreground">
            Only places you mark as public are shown. Notes are never shared.
          </span>
        </span>
      </label>

      {profile.isPublic && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
          <span className="min-w-0 flex-1 truncate">{publicUrl}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex shrink-0 items-center gap-1 text-foreground cursor-pointer"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}

      <FeedbackText feedback={feedback} />

      <button type="submit" disabled={isSaving} className={buttonClassName}>
        {isSaving && <Loader2 className="size-4 animate-spin" />}
        {isSaving ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}

function PlacesVisibilitySection() {
  const places = useFoodJournalStore((state) => state.places);
  const setPublicByStatus = useFoodJournalStore((state) => state.setPublicByStatus);
  const [pendingStatus, setPendingStatus] = useState<PlaceStatus | null>(null);
  const [busyStatus, setBusyStatus] = useState<PlaceStatus | null>(null);

  async function apply(status: PlaceStatus, isPublic: boolean) {
    setPendingStatus(null);
    setBusyStatus(status);
    await setPublicByStatus(status, isPublic);
    setBusyStatus(null);
  }

  const totalPublic = places.filter((place) => place.isPublic).length;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Places on your public page</h3>
        <p className="text-xs text-muted-foreground">
          {totalPublic} of {places.length} public. New places stay private. Uncheck
          individual places from each place&apos;s edit form.
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {PLACE_STATUS_OPTIONS.map(({ value, label }) => {
          const inStatus = places.filter((place) => place.status === value);
          const publicCount = inStatus.filter((place) => place.isPublic).length;
          const isBusy = busyStatus === value;
          const isConfirming = pendingStatus === value;

          return (
            <li
              key={value}
              className="flex flex-col gap-2 rounded-md border border-border bg-background px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-sm text-foreground">
                  <span
                    className={`inline-block size-2 rounded-full ${STATUS_STYLE[value].dotClassName}`}
                  />
                  {label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {publicCount} of {inStatus.length} public
                </span>
              </div>

              {isConfirming ? (
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-foreground">
                    Make {inStatus.length - publicCount} {label.toLowerCase()} place
                    {inStatus.length - publicCount === 1 ? "" : "s"} public?
                  </span>
                  <span className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => apply(value, true)}
                      className="rounded-md bg-primary px-2 py-1 text-primary-foreground cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingStatus(null)}
                      className="rounded-md border border-border px-2 py-1 text-muted-foreground cursor-pointer"
                    >
                      Cancel
                    </button>
                  </span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isBusy || busyStatus !== null || publicCount === inStatus.length}
                    onClick={() => setPendingStatus(value)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-2 py-1.5 text-xs text-foreground transition hover:bg-accent cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isBusy && <Loader2 className="size-3 animate-spin" />}
                    Show all
                  </button>
                  <button
                    type="button"
                    disabled={isBusy || busyStatus !== null || publicCount === 0}
                    onClick={() => apply(value, false)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-2 py-1.5 text-xs text-foreground transition hover:bg-accent cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Hide all
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EmailSection({ currentEmail }: { currentEmail: string }) {
  const [email, setEmail] = useState(currentEmail);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setIsSaving(true);
    setFeedback(null);
    const { error } = await supabase.auth.updateUser(
      { email: email.trim() },
      { emailRedirectTo: `${window.location.origin}/app` }
    );
    setIsSaving(false);

    if (error) {
      setFeedback({ type: "error", message: error.message });
      return;
    }
    setFeedback({
      type: "success",
      message: "Check your inbox to confirm the change. Your current email stays active until then.",
    });
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <h3 className="text-sm font-semibold text-foreground">Email</h3>
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={isSaving}
        autoComplete="email"
        aria-label="Email"
        className={inputClassName}
      />
      <FeedbackText feedback={feedback} />
      <button
        type="submit"
        disabled={isSaving || email.trim() === currentEmail}
        className={buttonClassName}
      >
        {isSaving && <Loader2 className="size-4 animate-spin" />}
        {isSaving ? "Sending..." : "Update email"}
      </button>
    </form>
  );
}

function SignInMethodsSection({
  identities,
  hasPassword,
  onChange,
}: {
  identities: UserIdentity[] | null;
  hasPassword: boolean | null;
  onChange: () => Promise<void>;
}) {
  const [isBusy, setIsBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const googleIdentity = identities?.find(
    (identity) => identity.provider === "google"
  );
  const googleEmail =
    typeof googleIdentity?.identity_data?.email === "string"
      ? googleIdentity.identity_data.email
      : null;

  async function handleLink() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setIsBusy(true);
    setFeedback(null);
    const { error } = await supabase.auth.linkIdentity({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/app` },
    });
    // On success the browser navigates to Google, so keep the busy state.
    if (error) {
      setIsBusy(false);
      setFeedback({ type: "error", message: error.message });
    }
  }

  async function handleUnlink() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !googleIdentity) return;

    setIsBusy(true);
    setFeedback(null);
    const { error } = await supabase.auth.unlinkIdentity(googleIdentity);
    if (error) {
      setIsBusy(false);
      setFeedback({ type: "error", message: error.message });
      return;
    }
    await onChange();
    setIsBusy(false);
    setFeedback({ type: "success", message: "Google account unlinked." });
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground">Sign-in methods</h3>

      <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2">
        <span className="min-w-0 text-sm text-foreground">
          Google
          <span className="block truncate text-xs text-muted-foreground">
            {identities === null
              ? "Loading..."
              : googleIdentity
                ? `Connected${googleEmail ? ` as ${googleEmail}` : ""}`
                : "Not connected"}
          </span>
        </span>

        {identities !== null &&
          (googleIdentity ? (
            <button
              type="button"
              onClick={handleUnlink}
              disabled={isBusy || !hasPassword}
              title={hasPassword ? undefined : "Set a password first"}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1.5 text-xs text-foreground transition hover:bg-accent cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBusy && <Loader2 className="size-3 animate-spin" />}
              Unlink
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLink}
              disabled={isBusy}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1.5 text-xs text-foreground transition hover:bg-accent cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBusy && <Loader2 className="size-3 animate-spin" />}
              Link Google account
            </button>
          ))}
      </div>

      {googleIdentity && hasPassword === false && (
        <p className="text-xs text-muted-foreground">
          Set a password below before you can unlink Google, so you don&apos;t
          lose access to your account.
        </p>
      )}
      <FeedbackText feedback={feedback} />
    </div>
  );
}

function PasswordSection({
  email,
  hasPassword,
  onPasswordSet,
}: {
  email: string;
  hasPassword: boolean | null;
  onPasswordSet: () => Promise<void>;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  // Google-only accounts have no password yet, so there is nothing to verify.
  const isSettingFirstPassword = hasPassword === false;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", message: "New passwords do not match." });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    if (!isSettingFirstPassword) {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (verifyError) {
        setIsSaving(false);
        setFeedback({ type: "error", message: "Current password is incorrect." });
        return;
      }
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsSaving(false);

    if (error) {
      setFeedback({ type: "error", message: error.message });
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setFeedback({
      type: "success",
      message: isSettingFirstPassword
        ? "Password set. You can now sign in with email and password."
        : "Password updated.",
    });
    await onPasswordSet();
  }

  if (hasPassword === null) return null;

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <h3 className="text-sm font-semibold text-foreground">
        {isSettingFirstPassword ? "Set a password" : "Password"}
      </h3>
      {isSettingFirstPassword && (
        <p className="text-xs text-muted-foreground">
          You signed up with Google. Add a password to also sign in with{" "}
          {email || "your email"}.
        </p>
      )}
      {!isSettingFirstPassword && (
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          disabled={isSaving}
          autoComplete="current-password"
          placeholder="Current password"
          aria-label="Current password"
          className={inputClassName}
        />
      )}
      <input
        type="password"
        required
        minLength={6}
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
        disabled={isSaving}
        autoComplete="new-password"
        placeholder="New password"
        aria-label="New password"
        className={inputClassName}
      />
      <input
        type="password"
        required
        minLength={6}
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        disabled={isSaving}
        autoComplete="new-password"
        placeholder="Confirm new password"
        aria-label="Confirm new password"
        className={inputClassName}
      />
      <FeedbackText feedback={feedback} />
      <button type="submit" disabled={isSaving} className={buttonClassName}>
        {isSaving && <Loader2 className="size-4 animate-spin" />}
        {isSaving
          ? "Updating..."
          : isSettingFirstPassword
            ? "Set password"
            : "Update password"}
      </button>
    </form>
  );
}
