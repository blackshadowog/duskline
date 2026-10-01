import { fetchProfile, storeProfile, supabase, cloudConfigured } from "./supabase";
import { pickNewer } from "./cloud";
import { GUNS, MISSIONS } from "./data";
import {
  createDefaultSave,
  loadSave,
  profileStorageKey,
  resetSave,
  writeSave,
  type SaveData,
} from "./save";

export interface AuthSession {
  email: string;
  admin: boolean;
  displayName: string;
  source: "local" | "cloud";
  id?: string;
}

export type AuthMode = "signin" | "signup" | "reset" | "updatePassword";

export type AuthResult =
  | { ok: true; session: AuthSession }
  | { ok: false; error: string };

interface LocalAccount {
  passwordHash: string;
  createdAt: number;
}

const ACCOUNTS_KEY = "duskline-local-accounts-v1";
const SESSION_KEY = "duskline-local-session-v1";
const LEGACY_MIGRATION_KEY = "duskline-legacy-profile-migrated-v1";

// This client-only admin account is a convenience for a local game prototype,
// not secure production authentication. A real deployment needs a server.
const ADMIN_EMAIL = "atiwari73874@gmail.com";
const ADMIN_PASSWORD = "black@123";

function readAccounts(): Record<string, LocalAccount> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, LocalAccount>) : {};
  } catch {
    return {};
  }
}

function writeAccounts(accounts: Record<string, LocalAccount>) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // The game can still be played for this tab if browser storage is disabled.
  }
}

async function hashPassword(password: string) {
  const bytes = new TextEncoder().encode(password);
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (n) => n.toString(16).padStart(2, "0")).join("");
  }

  // Fallback for non-secure local previews. SHA-256 is used when WebCrypto exists.
  let a = 0x811c9dc5;
  for (const byte of bytes) {
    a ^= byte;
    a = Math.imul(a, 0x01000193);
  }
  return `local-${(a >>> 0).toString(16).padStart(8, "0")}`;
}

function makeSession(email: string, admin: boolean, source: "local" | "cloud" = "local", id?: string): AuthSession {
  const name = email.split("@")[0] || "Operative";
  return { email, admin, displayName: admin ? "COMMANDER" : name.toUpperCase(), source, id };
}

export function readSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { email?: string };
    if (!parsed.email) return null;
    const email = parsed.email.trim().toLowerCase();
    if (cloudConfigured && email !== ADMIN_EMAIL) return null;
    return makeSession(email, email === ADMIN_EMAIL);
  } catch {
    return null;
  }
}

function writeSession(session: AuthSession) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: session.email }));
  } catch {
    // Authentication lasts for the current React session when storage is blocked.
  }
}

export async function clearSession() {
  if (uploadTimer) window.clearTimeout(uploadTimer);
  uploadTimer = undefined;
  await flushPendingUpload();
  if (supabase) await supabase.auth.signOut();
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore unavailable storage.
  }
}

let uploadTimer: number | undefined;
let pendingUpload: { userId: string; save: SaveData } | null = null;
let uploadChain: Promise<void> = Promise.resolve();

async function flushPendingUpload() {
  const pending = pendingUpload;
  pendingUpload = null;
  if (pending) {
    // Serialize writes so an older request cannot finish after a newer campaign save.
    uploadChain = uploadChain.then(() => storeProfile(pending.userId, pending.save)).catch(() => {
      // Local storage remains the offline backup; Settings allows manual retry.
    });
  }
  await uploadChain;
}

async function loadCloudProgress(email: string, userId: string): Promise<SaveData> {
  const key = profileStorageKey(email);
  const serverSave = await fetchProfile(userId);
  if (serverSave) {
    // Do not migrate an unrelated pre-login save onto an established cloud account.
    const local = loadSave(key);
    const preferred = pickNewer(local, serverSave);
    if (preferred.source === "cloud") {
      writeSave(serverSave, key, true);
    } else if ((local.updatedAt ?? 0) > (serverSave.updatedAt ?? 0)) {
      await storeProfile(userId, local);
    }
    return preferred.save;
  }
  const local = loadAccountSave(makeSession(email, false, "cloud", userId));
  await storeProfile(userId, { ...local, updatedAt: Date.now() });
  return local;
}

export async function restoreCloudSession(): Promise<AuthSession | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return null;
  const email = data.user.email.toLowerCase();
  await loadCloudProgress(email, data.user.id);
  return makeSession(email, false, "cloud", data.user.id);
}

export async function authenticate(emailInput: string, password: string, mode: AuthMode): Promise<AuthResult> {
  const email = emailInput.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (mode !== "reset" && password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

  if (email === ADMIN_EMAIL) {
    if (mode === "signup") return { ok: false, error: "This reserved account can only sign in." };
    if (password !== ADMIN_PASSWORD) return { ok: false, error: "Email or password is incorrect." };
    const session = makeSession(email, true);
    writeSession(session);
    return { ok: true, session };
  }

  if (supabase) {
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (error) return { ok: false, error: error.message };
        return { ok: false, error: "Password reset email sent! Check your inbox." };
      }
      if (mode === "updatePassword") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) return { ok: false, error: error.message };
        // Immediately fetch user to complete login
        const { data } = await supabase.auth.getUser();
        if (!data.user) return { ok: false, error: "Failed to verify session after update." };
        await loadCloudProgress(email, data.user.id);
        return { ok: true, session: makeSession(email, false, "cloud", data.user.id) };
      }

      const result = mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) return { ok: false, error: result.error.message };
      if (!result.data.user || !result.data.session) {
        return { ok: false, error: "Account created. Confirm the email link, then sign in to start your cloud campaign." };
      }
      await loadCloudProgress(email, result.data.user.id);
      return { ok: true, session: makeSession(email, false, "cloud", result.data.user.id) };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Cloud login unavailable. Please try again." };
    }
  }

  const accounts = readAccounts();
  const existing = accounts[email];
  const inputHash = await hashPassword(password);
  if (mode === "signup") {
    if (existing) return { ok: false, error: "An account with this email already exists." };
    accounts[email] = { passwordHash: inputHash, createdAt: Date.now() };
    writeAccounts(accounts);
  } else {
    if (!existing || existing.passwordHash !== inputHash) {
      return { ok: false, error: "Email or password is incorrect." };
    }
  }

  const session = makeSession(email, false);
  writeSession(session);
  return { ok: true, session };
}

function adminSave(save: SaveData): SaveData {
  const ownedGuns = GUNS.map((gun) => gun.id);
  return {
    ...save,
    coins: Number.MAX_SAFE_INTEGER,
    ownedGuns,
    equipped: ownedGuns.includes(save.equipped) ? save.equipped : "warden",
    items: { medkit: 999, adrenaline: 999, thermal: 999, ammo: 999 },
    upgrades: { armor: 3, steady: 3, reload: 3, lungs: 3, bounty: 3 },
    unlocked: MISSIONS.length - 1,
  };
}

export function loadAccountSave(session: AuthSession): SaveData {
  const key = profileStorageKey(session.email);
  let hasProfile = false;
  try {
    hasProfile = localStorage.getItem(key) !== null;
  } catch {
    // Continue with in-memory defaults.
  }

  if (!hasProfile && !session.admin) {
    // Only migrate a real pre-login campaign. Writing empty defaults here would
    // give this device a newer timestamp and overwrite a real cloud save.
    try {
      if (localStorage.getItem(LEGACY_MIGRATION_KEY) !== "1" && localStorage.getItem("duskline-save-v2")) {
        const previous = loadSave();
        const hasProgress = previous.unlocked > 0 || previous.stats.missions > 0 || previous.coins !== 500 || previous.ownedGuns.length > 1;
        if (hasProgress) writeSave(previous, key);
        localStorage.setItem(LEGACY_MIGRATION_KEY, "1");
      }
    } catch {
      // Continue with defaults if localStorage is unavailable.
    }
  }

  const profile = hasProfile || !session.admin ? loadSave(key) : createDefaultSave();
  return session.admin ? adminSave(profile) : profile;
}

export function persistAccountSave(data: SaveData, session: AuthSession) {
  const stamped = { ...(session.admin ? adminSave(data) : data), updatedAt: Date.now() };
  writeSave(stamped, profileStorageKey(session.email));
  if (session.source === "cloud" && session.id) {
    pendingUpload = { userId: session.id, save: stamped };
    if (uploadTimer) window.clearTimeout(uploadTimer);
    uploadTimer = window.setTimeout(() => { void flushPendingUpload(); }, 850);
  }
}

export function resetAccountSave(session: AuthSession) {
  const clean = resetSave(profileStorageKey(session.email));
  return session.admin ? adminSave(clean) : clean;
}