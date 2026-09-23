"use client";

import { useEffect, useState } from "react";
import { Loader2, LogOut, User } from "lucide-react";

import { ProfileDialog } from "@/components/account/profile-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchOwnProfile, type Profile } from "@/lib/supabase/profile-queries";

type AccountMenuProps = {
  onSignOut: () => void;
  isSigningOut: boolean;
};

export function AccountMenu({ onSignOut, isSigningOut }: AccountMenuProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase!.auth.getUser();
      if (cancelled || !user) return;
      setUserId(user.id);
      setEmail(user.email ?? "");

      try {
        const own = await fetchOwnProfile();
        if (!cancelled) setProfile(own);
      } catch {
        // The menu still works without a profile; the dialog hides that section.
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const label = profile?.username ?? email;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          title="Account"
          disabled={isSigningOut}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background/90 p-1.5 text-muted-foreground shadow-sm backdrop-blur transition hover:bg-accent hover:text-foreground cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSigningOut ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <User className="size-3.5" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {label && (
            <>
              <DropdownMenuLabel className="max-w-48 truncate">
                {label}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            disabled={!userId}
            onSelect={() => setIsProfileOpen(true)}
          >
            <User />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onSignOut}>
            <LogOut />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {userId && (
        <ProfileDialog
          open={isProfileOpen}
          onOpenChange={setIsProfileOpen}
          userId={userId}
          email={email}
          profile={profile}
          onProfileChange={setProfile}
        />
      )}
    </>
  );
}
