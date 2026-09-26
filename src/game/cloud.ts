import { DEFAULT_SAVE, type SaveData } from "./save";

const SYNC_PREFIX = "DL1-";

export function normalizeSave(raw: unknown): SaveData | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Partial<SaveData>;
  if (typeof p.coins !== "number" || !Number.isFinite(p.coins) || !Array.isArray(p.ownedGuns)) return null;
  return {
    ...structuredClone(DEFAULT_SAVE),
    ...p,
    updatedAt: typeof p.updatedAt === "number" ? p.updatedAt : 0,
    items: { ...DEFAULT_SAVE.items, ...(p.items ?? {}) },
    upgrades: { ...DEFAULT_SAVE.upgrades, ...(p.upgrades ?? {}) },
    stats: { ...DEFAULT_SAVE.stats, ...(p.stats ?? {}) },
    settings: { ...DEFAULT_SAVE.settings, ...(p.settings ?? {}) },
  };
}

export function exportSyncCode(save: SaveData): string {
  const bytes = new TextEncoder().encode(JSON.stringify({ ...save, updatedAt: Date.now() }));
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return `${SYNC_PREFIX}${btoa(binary)}`;
}

export function importSyncCode(code: string): SaveData | null {
  try {
    const clean = code.trim().replace(/\s+/g, "");
    if (!clean.startsWith(SYNC_PREFIX)) return null;
    const binary = atob(clean.slice(SYNC_PREFIX.length));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return normalizeSave(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    return null;
  }
}

export function exportSaveFile(save: SaveData): string {
  return JSON.stringify({ ...save, updatedAt: Date.now() }, null, 2);
}

export function importSaveFile(text: string): SaveData | null {
  try {
    return normalizeSave(JSON.parse(text));
  } catch {
    return null;
  }
}

export function pickNewer(local: SaveData, remote: SaveData | null): { save: SaveData; source: "local" | "cloud" } {
  if (remote && (remote.updatedAt ?? 0) > (local.updatedAt ?? 0)) return { save: remote, source: "cloud" };
  return { save: local, source: "local" };
}
