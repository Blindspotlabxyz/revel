import { createHash, randomBytes } from "crypto";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function validateUsername(username: string): string | null {
  const value = normalizeUsername(username);
  if (!USERNAME_RE.test(value)) {
    return "Username must be 3–24 characters: letters, numbers, or underscore.";
  }
  return null;
}

export function validateDisplayName(name: string): string | null {
  const value = name.trim();
  if (value.length < 1 || value.length > 80) {
    return "Display name must be 1–80 characters.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (password.length > 128) {
    return "Password is too long.";
  }
  return null;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createPasswordResetToken(): {
  token: string;
  tokenHash: string;
  expiresAt: Date;
} {
  const token = randomBytes(32).toString("hex");
  return {
    token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  };
}

export function displayLabel(user: {
  name?: string | null;
  username?: string | null;
  email?: string | null;
}): string {
  return user.name?.trim() || user.username?.trim() || user.email || "Revel user";
}
