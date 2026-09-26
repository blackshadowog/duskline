# Cross-device campaign saves

DUSKLINE uses Supabase Auth and a private per-user Postgres row for cloud saves. Without a configured Supabase project, the game still works in local/offline mode with exportable sync codes, but signing in on a second device cannot recover progress automatically.

1. Create a Supabase project and open its SQL editor. Run `supabase/schema.sql` to create the `duskline_profiles` table and owner-only row-level security policies.
2. Copy `.env.example` to `.env.local` and fill in the project URL and **publishable/anon key** from Supabase Settings > API. Never use a service-role key in the browser. Rebuild/redeploy the game so Vite includes the public config.
3. In Supabase Authentication > Providers, enable Email. Confirm that the Site URL / allowed redirect URLs include the deployed game origin. Configure email confirmation for your deployment: when enabled, users must verify their email before signing in. In development you can disable confirmation in the Supabase dashboard.
4. Sign up or sign in on device A, play, and wait a moment for the debounced sync. On device B, sign in with the same verified email and password; your server save loads before the campaign opens.

The old browser-only profile is migrated into a new cloud account when no server save exists. In Settings > Cross-device sync, users can download/upload a backup or use a manual sync code if a backend is not configured. On sign-in the newer save timestamp wins, so offline progress on a returning device is not silently lost. No passwords or service-role secrets are stored in the campaign row.

The built-in admin shortcut is **only a local demo mode**; it is not a secure server-side admin system and is not granted database privileges. For a public multiplayer/economy deployment, remove that shortcut and enforce any admin permissions in server-side policies/functions.