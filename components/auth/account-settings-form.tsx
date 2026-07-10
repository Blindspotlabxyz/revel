"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

type Profile = {
  id: string;
  email: string | null;
  name: string | null;
  username: string | null;
  image: string | null;
  hasPassword: boolean;
  displayLabel: string;
};

export function AccountSettingsForm() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadingProfile(true);
      try {
        const res = await fetch("/api/account/profile");
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) {
            setProfileError(data.error ?? "Could not load profile.");
          }
          return;
        }
        if (!cancelled) {
          setProfile(data as Profile);
          setName(data.name ?? "");
          setUsername(data.username ?? "");
        }
      } catch {
        if (!cancelled) setProfileError("Could not load profile.");
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileError(null);
    setProfileMessage(null);
    setProfileLoading(true);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setProfileError(data.error ?? "Could not save profile.");
        return;
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              name: data.name,
              username: data.username,
              displayLabel: data.displayLabel,
            }
          : prev
      );
      setProfileMessage("Profile saved.");
    } catch {
      setProfileError("Network error. Try again.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: profile?.hasPassword ? currentPassword : undefined,
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setPasswordError(data.error ?? "Could not update password.");
        return;
      }

      setPasswordMessage(data.message ?? "Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setProfile((prev) => (prev ? { ...prev, hasPassword: true } : prev));
    } catch {
      setPasswordError("Network error. Try again.");
    } finally {
      setPasswordLoading(false);
    }
  }

  if (loadingProfile) {
    return (
      <p className="mt-8 text-sm text-muted">Loading your profile...</p>
    );
  }

  const label = profile?.displayLabel ?? "Revel user";

  return (
    <div className="mt-8 space-y-4">
      <Card>
        <CardContent className="pt-0">
          <CardTitle>Profile</CardTitle>
          <div className="mt-4 flex items-center gap-4">
            {profile?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.image}
                alt={label}
                className="h-16 w-16 rounded-full border border-border object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background text-lg font-medium">
                {label.charAt(0).toUpperCase()}
              </span>
            )}
            <div>
              <p className="font-medium text-foreground">{label}</p>
              {profile?.email ? (
                <p className="text-sm text-muted">{profile.email}</p>
              ) : null}
              {profile?.username ? (
                <p className="text-sm text-muted">@{profile.username}</p>
              ) : null}
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleProfileSubmit}>
            <div className="space-y-2">
              <Label htmlFor="profile-name">Display name</Label>
              <Input
                id="profile-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How should we address you?"
                maxLength={80}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-username">Username</Label>
              <Input
                id="profile-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. mojeeb"
                maxLength={24}
              />
              <p className="text-xs text-muted">
                3–24 characters. Letters, numbers, and underscore only.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={profile?.email ?? ""}
                disabled
                readOnly
              />
              <p className="text-xs text-muted">
                Email is used for sign-in and cannot be changed here.
              </p>
            </div>
            {profileError ? (
              <p className="text-sm text-red-600">{profileError}</p>
            ) : null}
            {profileMessage ? (
              <p className="text-sm text-primary">{profileMessage}</p>
            ) : null}
            <Button type="submit" disabled={profileLoading}>
              {profileLoading ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-0">
          <CardTitle>
            {profile?.hasPassword ? "Change password" : "Set a password"}
          </CardTitle>
          <p className="mt-2 text-sm text-muted">
            {profile?.hasPassword
              ? "Update the password you use with email sign-in."
              : "You signed in with Google. Optionally set a password so you can also sign in with email."}
          </p>

          <form className="mt-6 space-y-4" onSubmit={handlePasswordSubmit}>
            {profile?.hasPassword ? (
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm new password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            {passwordError ? (
              <p className="text-sm text-red-600">{passwordError}</p>
            ) : null}
            {passwordMessage ? (
              <p className="text-sm text-primary">{passwordMessage}</p>
            ) : null}
            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading
                ? "Updating..."
                : profile?.hasPassword
                  ? "Update password"
                  : "Set password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
