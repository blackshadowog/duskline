import { useRef, useState } from "react";
import { audio } from "../game/audio";
import { exportSaveFile, exportSyncCode, importSaveFile, importSyncCode, pickNewer } from "../game/cloud";
import { loadSave, profileStorageKey, type SaveData } from "../game/save";
import { cloudConfigured, fetchProfile, storeProfile, supabase } from "../game/supabase";

interface Props {
  save: SaveData;
  email: string;
  onImport: (save: SaveData) => void;
}

export default function SyncPanel({ save, email, onImport }: Props) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const announce = (message: string) => {
    setStatus(message);
    window.setTimeout(() => setStatus((current) => current === message ? "" : current), 4500);
  };

  const exportCode = async () => {
    audio.ui();
    const value = exportSyncCode(save);
    setCode(value);
    try {
      await navigator.clipboard.writeText(value);
      announce("Sync code copied. Paste it on your other device.");
    } catch {
      announce("Copy the code below and paste it on your other device.");
    }
  };

  const importCode = () => {
    const parsed = importSyncCode(code);
    if (!parsed) {
      audio.error();
      announce("Invalid sync code. Please check it and try again.");
      return;
    }
    onImport(parsed);
    audio.purchase();
    announce("Your campaign progress was restored.");
  };

  const download = () => {
    audio.ui();
    const blob = new Blob([exportSaveFile(save)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `duskline-${email.split("@")[0]}-save.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    announce("Backup downloaded.");
  };

  const upload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = importSaveFile(String(reader.result ?? ""));
      if (!parsed) {
        audio.error();
        announce("This is not a valid DUSKLINE save file.");
        return;
      }
      onImport(parsed);
      audio.purchase();
      announce("Your campaign progress was restored.");
    };
    reader.readAsText(file);
  };

  const syncNow = async () => {
    if (!supabase) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw new Error("Sign in again to sync your campaign.");
      const remote = await fetchProfile(data.user.id);
      const local = loadSave(profileStorageKey(email));
      const preferred = pickNewer(local, remote);
      if (preferred.source === "cloud") {
        onImport(preferred.save);
        announce("Newer progress downloaded from your cloud profile.");
      } else {
        await storeProfile(data.user.id, { ...local, updatedAt: Date.now() });
        announce("Your campaign was uploaded to your cloud profile.");
      }
      audio.coin();
    } catch (error) {
      audio.error();
      announce(error instanceof Error ? error.message : "Cloud sync failed. Your local save is safe.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="settings-group sync-panel">
      <div className="card-label">CAMPAIGN SYNC / CROSS-DEVICE</div>
      <p className="sync-blurb">
        {cloudConfigured
          ? "Your campaign is saved to your account. Sign in with the same email and password on another device to continue."
          : "This build has no cloud backend configured. Saves stay on this browser; use a sync code or backup file to move to another device."}
      </p>

      {cloudConfigured && (
        <button type="button" className="deploy-btn sync-import" disabled={busy} onClick={() => { void syncNow(); }}>
          {busy ? "SYNCING..." : "SYNC CLOUD NOW"} <span>→</span>
        </button>
      )}

      <div className="sync-row">
        <button type="button" className="chip" onClick={() => { void exportCode(); }}>EXPORT SYNC CODE</button>
        <button type="button" className="chip" onClick={download}>DOWNLOAD BACKUP</button>
        <button type="button" className="chip" onClick={() => fileRef.current?.click()}>UPLOAD BACKUP</button>
        <input
          ref={fileRef}
          type="file"
          hidden
          accept="application/json,.json"
          onChange={(event) => {
            upload(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>

      <textarea
        className="sync-code-box"
        placeholder="Paste a DL1- sync code here to import progress..."
        value={code}
        onChange={(event) => setCode(event.target.value)}
        rows={code ? 4 : 2}
        spellCheck={false}
      />
      <button type="button" className="chip" onClick={importCode} disabled={!code.trim()}>
        IMPORT FROM CODE
      </button>
      <div className="sync-status" role="status">
        {status || (cloudConfigured ? "Cloud profile connected. Manual backups are also available." : "Local mode only. Add a Supabase project to enable automatic cross-device saves.")}
      </div>
    </div>
  );
}