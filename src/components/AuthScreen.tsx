import { useState, useEffect, type FormEvent } from "react";
import { audio } from "../game/audio";
import { authenticate, type AuthMode, type AuthSession } from "../game/auth";
import { cloudConfigured } from "../game/supabase";
import { Icon } from "./Icons";

export default function AuthScreen({ onAuthenticated }: { onAuthenticated: (session: AuthSession) => void }) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) {
      setMode("updatePassword");
      // Clear hash so it doesn't trigger again on reload
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await authenticate(email, password, mode);
      if (!result.ok) {
        setError(result.error);
        audio.error();
        return;
      }
      audio.ensure();
      audio.setVolumes(0.6, 0.8);
      audio.playMusic("menu", 45);
      audio.purchase();
      onAuthenticated(result.session);
    } catch {
      setError("Could not access local account storage. Check your browser settings.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="screen auth-screen">
      <div className="auth-art" />
      <div className="auth-vignette" />
      <div className="scanlines" />
      <header className="auth-brand">
        <span className="brand-mark"><Icon name="crosshair" /></span>
        <div><strong>DUSKLINE</strong><small>SNIPER OPERATIONS</small></div>
      </header>

      <section className="auth-layout">
        <div className="auth-copy">
          <div className="eyebrow"><span className="pulse-dot" /> LONG-RANGE OPERATIONS · 5 THEATRES</div>
          <h1>Remember<br /><em>every shot.</em></h1>
          <p>{cloudConfigured ? "Your campaign, weapons, and mission records follow you to any device." : "Your campaign, weapons, and mission records stay on this device until cloud sync is configured."}</p>
          <div className="auth-features">
            <span><Icon name="crosshair" /> 25 OPERATIONS</span>
            <span><Icon name="map" /> 5 THEATRES</span>
            <span><Icon name="skull" /> BOSS FIGHTS</span>
          </div>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <div className="auth-form-head">
            <span className="card-label">OPERATIVE ACCESS</span>
            <h2>{mode === "signin" ? "Welcome back." : mode === "signup" ? "Create your file." : mode === "reset" ? "Reset Password" : "New Password"}</h2>
            <p>{mode === "signin" ? "Sign in to resume your campaign." : mode === "signup" ? (cloudConfigured ? "Your progress will sync securely across devices." : "A new profile saves progress on this device.") : mode === "reset" ? "Enter your email to receive a password reset link." : "Enter your new password below."}</p>
          </div>

          {mode !== "updatePassword" && (
            <div className="auth-tabs" role="tablist">
              <button type="button" className={mode === "signin" ? "active" : ""} onClick={() => { setMode("signin"); setError(""); }}>SIGN IN</button>
              <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setError(""); }}>CREATE ACCOUNT</button>
            </div>
          )}

          {mode !== "updatePassword" && (
            <label className="auth-field">
              <span>EMAIL ADDRESS</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="operative@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
          )}

          {mode !== "reset" && (
            <label className="auth-field">
              <span>{mode === "updatePassword" ? "NEW PASSWORD" : "PASSWORD"}</span>
              <div className="password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={6}
                  required
                />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  <Icon name="eye" />
                </button>
              </div>
            </label>
          )}

          {mode === "signin" && cloudConfigured && (
            <button type="button" className="auth-forgot-btn" onClick={() => { setMode("reset"); setError(""); }} style={{ background: "none", border: "none", color: "var(--accent-teal)", fontSize: "0.8rem", cursor: "pointer", textAlign: "right", padding: "0.25rem 0", marginTop: "-0.5rem", marginBottom: "0.5rem" }}>
              Forgot password?
            </button>
          )}

          {error && <div className="auth-error" role="alert">{error}</div>}

          <button className="auth-submit" type="submit" disabled={busy}>
            <span>{busy ? "WORKING..." : mode === "signin" ? "ENTER FIELD HQ" : mode === "signup" ? "CREATE PROFILE" : mode === "reset" ? "SEND RESET LINK" : "UPDATE PASSWORD"}</span>
            <Icon name="play" />
          </button>

          {mode === "reset" && (
            <button type="button" onClick={() => setMode("signin")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", cursor: "pointer", marginTop: "1rem", width: "100%" }}>
              Back to Sign In
            </button>
          )}
        </form>
      </section>

      <footer className="auth-footer"><span>CLASSIFIED · LEVEL 04 CLEARANCE</span><span>SECURE CONNECTION NOT REQUIRED · OFFLINE READY</span></footer>
    </main>
  );
}