# matchowner-waitlist supabase backend subagent-driven plan

Replace all localStorage mocks in the matchowner-waitlist landing with a real Supabase backend: email/password + Google OAuth auth, persistent queue positions with anti-abuse caps, referral tracking with per-referrer dedup, and a Resend welcome email. The frontend UI (hero, form layout, dashboard card design, Framer Motion animations) is entirely preserved — only the data layer changes. Phases are strictly ordered: schema first, then auth, then queue/referrals, then dashboard wiring, then email, then deployment config. No phase requires a running Supabase instance to compile; build correctness is the only ship gate.

An orchestrator spawns one fresh subagent per phase; each reads this plan cold, executes one phase, ships `phase N:` via `claude-ship`, returns one line. Phase 0 → `/phase-review`. Rollback: `git reset --hard <plan-write-SHA>` (find via `git log --grep '^subagent-driven-plan: '`).

Resume with "continue currentp.md" in a fresh conversation.

## Orchestrator loop (cold-context boot)

Cwd must be inside the plan's repo (any depth). Git ops resolve from cwd; `currentp.md` resolves from `<toplevel>` via `git rev-parse --show-toplevel`.

**Parent context = orchestrator.** Reads plan, spawns subagents, parses one-line returns, runs closing two-step on final SUCCESS — does not edit code, ship, or touch `CLAUDE.md`. Output: one line per phase plus the closing line, no commentary or tool-call narration. Between phases run **only** pre-flight `git status --porcelain` and re-parse the tracker from one `currentp.md` read per iteration; no `git log`/`show`/`diff`. No `TaskCreate` — `currentp.md`'s tracker is the task list.

1. Read `<toplevel>/currentp.md` end-to-end.
2. Run **Pre-flight** (below). If it BLOCKS, surface to user and stop.
3. Parse **Status tracker**. Find the lowest-numbered `pending` phase. If none, jump to **Final ceremony**.
4. Spawn an `Agent` (`subagent_type: "general-purpose"`) with the **Subagent prompt** below, substituting `<N>` for the phase number and `<title>` for its title.
5. Parse the subagent's return — exactly one line:
   - `SUCCESS <short-sha>: <summary>` → emit `Phase <N> done: <short-sha> — <summary>` and loop to step 1.
   - `BLOCKED: <reason>` → surface verbatim. Stop. Do not advance.

### Pre-flight (every orchestrator entry)

Per-phase ships commit-and-push, so every entry expects a clean tree.

1. `git status --porcelain` — must be empty, or only `currentp.md` modified (leftover tracker edit from interrupted prior ship; next ship folds it in). Anything else dirty: BLOCK with `dirty tree at entry: <files> — prior phase interrupted mid-ship? Inspect, then either complete the ship manually or git checkout -- . to restart that phase`.
2. **First entry only** (every phase in Status tracker is `pending`): verify `git rev-parse @{u}` resolves and `git rev-list --left-right --count @{u}...HEAD` returns `0 0`. If either fails, BLOCK with `not synced with remote: <detail>` — the plan-write commit must be the rollback baseline for `git reset --hard` to mean what we say.

### Subagent prompt (orchestrator pastes this verbatim per iteration)

Read `<toplevel>/currentp.md` end-to-end (resolve via `git rev-parse --show-toplevel`). Find phase `<N>` (`<title>`) in **Status tracker**.

- **Phase 0:** Run `/phase-review`. It owns the entire phase 0 ceremony (pre-flight, audit, application, tracker flip, ship under `phase 0: review (...)`). Return its one-line output verbatim. Skip the bullets below.

For **phases ≥ 1**, execute the phase using its **Goal**, **Context to load**, **Targets**, **Change sketch**, and **Invariants impacted**. Constraints:

- **No verify steps.** Do not run `npm run build`, `tsc`, `lint`, or any runtime check. Ship from spec.
- **Verify-need is BLOCKED.** If the **Change sketch** surfaces genuine need for verify (unsafe to ship without testing first), return `BLOCKED: phase requires verify — replan under /pwv` without editing or shipping.
- **Tree state is trusted.** Do not re-run `git status` before editing — orchestrator pre-flight already verified clean (or `currentp.md`-only). `claude-ship --expect` is the post-edit safety net.
- **Apply the Change sketch** to **Targets** files.
- **State-file upkeep:** Run `claude-ship inspect`. Per `## diff`, `trash` `state/todo/NN.md` for items this phase resolved (or `Write` `state/todo/{max+1:02}.md` for discoveries); for prefs, follow `commands/ship.md`'s `# Preferences` block. Skip silently if `## todo` is `<no-todo>` or `## prefs` is `<no-claude-md>`.
- **Tracker update is the LAST edit before ship.** `Edit` `currentp.md` to flip phase `<N>` in **Status tracker** from `pending` to `done — <one-line artifact>` (paths touched). Last so mid-work crash leaves `pending` for clean retry.
- **Ship:**
  - Subject `phase <N>: <title>` (heredoc if shell-special).
  - Command: `claude-ship "<subject>" --expect <Targets paths> currentp.md [CLAUDE.md] [state/todo/NN.md ...]`
  - Parse stdout `<short-sha>\t<branch>\t<remote-state>` for the SUCCESS return.
  - Exit codes: `0` → SUCCESS; `5`/`6` → SUCCESS but note `<remote-state>=no-remote` or `=push-failed` in the summary; `2` → return `BLOCKED: nothing to ship — phase produced no changes`; `7` → return `BLOCKED: drift — <stderr extras>`; `3`/`4` → return `BLOCKED: commit failed — <stderr>`.
- **Return exactly one line:**
  - `SUCCESS <short-sha>: <one-sentence summary of what changed>` — phase work done, tracker flipped to `done`, ship landed.
  - `BLOCKED: <reason or question>` — on any blocker. Do not edit the tracker on BLOCKED; leave the phase `pending` so resume retries it. Do not ship a partial state.

Do not chain into the next phase. Do not output anything else — the orchestrator parses your return line.

### Final ceremony (all phases `done`)

Triggered automatically when **Status tracker** shows every phase `done`. **Do not ask the user** — approval was given at plan-write.

1. Call `trash currentp.md` via PowerShell.
2. `claude-ship "subagent-driven-plan complete: matchowner-waitlist-supabase-backend" --expect currentp.md`. Parse stdout for the cleanup short-sha. Exit codes: `0`/`5`/`6` → continue; `2` BLOCK with `plan file already absent`; `3`/`4` BLOCK with `cleanup commit failed — <stderr>`.
3. Emit one line: `Subagent-driven plan complete — 6 phases done, baseline <plan-write-SHA> → cleanup <cleanup-SHA>. Repo is clean.`

### Aborting / rolling back

    git log --grep '^subagent-driven-plan: ' -1 --format=%H
    git reset --hard <plan-write-SHA>
    git push --force-with-lease   # only if any phase already pushed

Per-phase rollback: `/unship` operates phase-agnostically on the most recent commit.

## Invariants (every phase must preserve all)

1. **No Stripe.** Billing deferred; do not install stripe or reference it anywhere.
2. **Lean schema.** One table only: `waitlist_entries`. Name/phone live in `auth.users.user_metadata`. No `profiles` table, no orgs, no subscriptions.
3. **Spanish UI only.** All new user-facing copy (error messages, button labels, email body) in Spanish (España).
4. **Position floor = 4.** Every DB write that decrements position must use `GREATEST(position - N, 4)` — never let position drop below 4.
5. **Anti-abuse caps.** `share_bumps_used ≤ 3` enforced at the query level (check before updating). `answered_date = today` check prevents double-answering the same day.
6. **Resend only.** No SendGrid, Nodemailer, Postmark, or any other email provider.
7. **Service role for writes, user client for reads.** Position bumps and entry creation use a service-role Supabase client. Dashboard reads use the user-scoped client (RLS enforced). RLS policy on `waitlist_entries`: `USING (auth.uid() = user_id)` for SELECT/UPDATE; service role bypasses RLS.
8. **Two Supabase client files only.** `src/shared/supabase/client.ts` (browser) and `src/shared/supabase/server.ts` (server with cookie management). Feature code imports from `@/shared/supabase/`, never directly from `@supabase/ssr` or `@supabase/supabase-js`.
9. **Frontend invariants preserved.** Design tokens (#3563AE primary, #ED5C2D secondary, #B8E4EF accent), `lang="es"`, `h-[100svh]` overflow-hidden on landing, Plus Jakarta Sans + Inter fonts, Framer Motion animations — none of these may change.
10. **mockUser and mockQueue deleted in Phase 4 and not before.** Phases 1–3 may leave `src/lib/mockUser.ts` and `src/lib/mockQueue.ts` on disk if dashboard components still import them. Phase 4 removes all references and deletes the files.

## Phase 0 — review (auto)

**Type:** review.
**Goal:** cold-context audit of this plan before phase 1 runs; surgical edits that elevate execution robustness without redesigning the plan.
**Context to load:** this plan file only — `/phase-review` re-reads the per-phase **Context to load** files and `## Invariants` code refs itself.
**Targets:** `currentp.md` only.
**Change sketch:** invoke `/phase-review`. It performs the audit, applies passing-guardrail findings, flips Phase 0 in **Status tracker** to `done`, ships under `phase 0: review (applied <N>)` or `phase 0: review (no findings)`, and returns one line per the orchestrator contract.
**Invariants impacted:** none (review-only).
**State-file upkeep:** none.
**Status:** pending.

## Phase 1 — Supabase setup + schema   *(build phase)*

**Type:** build.
**Goal:** Install Supabase packages, scaffold the supabase/ directory, write the `waitlist_entries` migration, and create the two shared Supabase client files.
**Context to load:**
- This plan file (invariants — especially 2, 7, 8).
- `package.json` at repo root — to confirm current deps and match semver ranges.
- `AGENTS.md` at repo root — Next.js version warning; note the caution before assuming App Router APIs.
- `C:/Users/victo/dev/BOILERPLATE/FPE-BOILERPLPATE-VICTOR/src/shared/database/supabase/client.ts` — boilerplate browser client pattern to copy verbatim (if path absent try `C:/Users/victo/dev/02-deprecated/BOILERPLATE/FPE-BOILERPLPATE-VICTOR/src/shared/database/supabase/client.ts`).
- `C:/Users/victo/dev/BOILERPLATE/FPE-BOILERPLPATE-VICTOR/src/shared/database/supabase/server.ts` — boilerplate server client pattern (same fallback path as above).
**Targets:**
- `package.json` (modified after npm install)
- `supabase/config.toml` (new, from `npx supabase init`)
- `supabase/migrations/20260610000000_waitlist.sql` (new)
- `src/shared/supabase/client.ts` (new)
- `src/shared/supabase/server.ts` (new)
- `src/shared/supabase/index.ts` (new)
- `src/types/supabase.ts` (new — hand-written types; real generated types come after `supabase db push`)
- `.env.local.example` (new)
**Risk:** `npx supabase init` requires the Supabase CLI. If the CLI is not installed, create `supabase/` manually and write `config.toml` from scratch using the minimal template below. Do not fail the phase — the migration file is the essential output.
**Change sketch:**
- Run `npm install @supabase/ssr @supabase/supabase-js` from the project root (PowerShell, inside `matchowner-waitlist/`).
- Run `npx supabase init` from the project root. If the command fails (CLI absent), create `supabase/` directory and write a minimal `supabase/config.toml`:
  ```toml
  project_id = "matchowner-waitlist"
  [api]
  port = 54321
  [db]
  port = 54322
  [studio]
  port = 54323
  [auth]
  site_url = "http://localhost:3000"
  additional_redirect_urls = ["https://localhost:3000"]
  jwt_expiry = 3600
  enable_signup = true
  email_autoconfirm = true
  [auth.external.google]
  enabled = true
  client_id = "env(SUPABASE_AUTH_GOOGLE_CLIENT_ID)"
  secret = "env(SUPABASE_AUTH_GOOGLE_SECRET)"
  ```
- Write `supabase/migrations/20260610000000_waitlist.sql`:
  ```sql
  -- Auto-update trigger function (reusable)
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
  $$ language 'plpgsql';

  CREATE TABLE IF NOT EXISTS waitlist_entries (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    position        int  NOT NULL CHECK (position >= 4),
    referral_code   text NOT NULL UNIQUE DEFAULT lower(substr(md5(gen_random_uuid()::text), 1, 8)),
    referred_by     uuid REFERENCES waitlist_entries(id) ON DELETE SET NULL,
    answered_date   date,
    share_bumps_used int NOT NULL DEFAULT 0 CHECK (share_bumps_used <= 3),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
  );

  CREATE UNIQUE INDEX ON waitlist_entries(user_id);
  CREATE INDEX ON waitlist_entries(referral_code);

  CREATE TRIGGER set_waitlist_entries_updated_at
    BEFORE UPDATE ON waitlist_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;

  -- Users can read and update their own row
  CREATE POLICY "users_own_entry" ON waitlist_entries
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  -- Service role bypasses RLS (Supabase default — no explicit policy needed)
  ```
- Write `src/shared/supabase/client.ts` mirroring the boilerplate pattern (use `createBrowserClient` from `@supabase/ssr`; read `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `process.env`). Export `createClientBrowser`.
- Write `src/shared/supabase/server.ts` mirroring the boilerplate pattern (use `createServerClient` from `@supabase/ssr`; read cookies via `cookies()` from `next/headers`; pass cookie `get`/`set`/`remove` handlers). Export `createClientServer`. Also export `updateSession(request)` for use in middleware (re-creates server client with the request and response, calls `supabase.auth.getUser()` to refresh session, returns the updated response).
- Write `src/shared/supabase/index.ts` re-exporting `createClientBrowser`, `createClientServer`, and `updateSession`.
- Write `src/types/supabase.ts` with a hand-typed interface:
  ```ts
  export interface WaitlistEntry {
    id: string
    user_id: string
    position: number
    referral_code: string
    referred_by: string | null
    answered_date: string | null   // ISO date string YYYY-MM-DD
    share_bumps_used: number
    created_at: string
    updated_at: string
  }
  ```
- Write `.env.local.example`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  RESEND_API_KEY=re_your_key
  SUPABASE_AUTH_GOOGLE_CLIENT_ID=your-google-client-id
  SUPABASE_AUTH_GOOGLE_SECRET=your-google-secret
  ```
**Invariants impacted:** 2, 4, 5, 7, 8.
**State-file upkeep:** per Subagent prompt.
**Status:** pending.

## Phase 2 — Auth: middleware + callback + signup rewrite   *(build phase)*

**Type:** build.
**Goal:** Wire real Supabase auth into the signup page (email/password + Google OAuth), add the middleware that protects `/dashboard`, add the `/auth/callback` route handler, and create `createEntryAction` that inserts a `waitlist_entries` row after signup.
**Context to load:**
- This plan file (invariants — especially 1, 2, 3, 7, 8, 10).
- `src/app/signup/page.tsx` — full current file; preserve all UI, layout, validation messages, and Spanish copy; only replace the data layer.
- `src/data/signup.ts` — copy strings (to avoid accidentally changing them).
- `src/shared/supabase/client.ts` and `src/shared/supabase/server.ts` — the import paths and exported function names established in Phase 1.
- `src/shared/supabase/index.ts` — to know what `updateSession` looks like.
- `AGENTS.md` — Next.js version caution; check `node_modules/next/dist/docs/` for route handler and middleware API if in doubt.
**Targets:**
- `src/middleware.ts` (new)
- `src/app/auth/callback/route.ts` (new)
- `src/features/waitlist/waitlist.actions.ts` (new)
- `src/app/signup/page.tsx` (modified — add password field, replace mock auth calls)
**Risk:** `cookies()` from `next/headers` is async in recent Next.js versions — `await cookies()` may be required. Check `node_modules/next/dist/docs/` before writing server.ts usage. Also: the Google OAuth redirect URI must include the production domain in Supabase dashboard — note this in a code comment but do not block the phase on it.
**Change sketch:**
- Write `src/middleware.ts`:
  ```ts
  import { NextResponse } from 'next/server'
  import type { NextRequest } from 'next/server'
  import { updateSession } from '@/shared/supabase/index'

  export async function middleware(request: NextRequest) {
    return await updateSession(request)
  }

  export const config = {
    matcher: ['/dashboard/:path*'],
  }
  ```
  The `updateSession` implementation in `src/shared/supabase/server.ts` must redirect unauthenticated requests to `/signup` (check `supabase.auth.getUser()` after refreshing the session; if `user` is null and the path starts with `/dashboard`, return `NextResponse.redirect(new URL('/signup', request.url))`).
- Write `src/app/auth/callback/route.ts` as a GET handler:
  1. Read `code` and `ref` from `request.nextUrl.searchParams`.
  2. If `code` exists: create a server Supabase client (with request/response cookies), call `supabase.auth.exchangeCodeForSession(code)`.
  3. If exchange succeeds: call the shared `createEntry` helper (see below) with the session's user id and `ref`.
  4. Redirect to `/dashboard`. On any error, redirect to `/signup?error=auth`.
- Write `src/features/waitlist/waitlist.actions.ts`:
  - Import `createClientServer` from `@/shared/supabase/server` and `createClient` from `@supabase/supabase-js` (for service role).
  - Export a `createEntry(userId: string, referralCode?: string): Promise<void>` async function (NOT a server action — shared helper called by both the server action and the callback route):
    1. Create a service-role client: `createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)`.
    2. Check if an entry already exists for `userId` — if yes, return early (idempotent).
    3. Generate `position = Math.floor(Math.random() * 171) + 80` (range 80–250).
    4. Insert into `waitlist_entries`: `{ user_id: userId, position }` (referral_code is DB-generated default).
    5. If `referralCode` is provided: look up the referrer entry by `referral_code = referralCode`. If found and `referred_by` on new entry is null: update new entry's `referred_by = referrer.id`; then update referrer's position: `GREATEST(position - 5, 4)`.
  - Export `'use server'` function `createEntryAction(referralCode?: string)`:
    1. Get the current user: `const { data: { user } } = await (await createClientServer()).auth.getUser()`.
    2. If no user, throw or return (middleware already guards the route, but be defensive).
    3. Call `await createEntry(user.id, referralCode)`.
- Edit `src/app/signup/page.tsx`:
  - Keep the file as a `'use client'` component. Preserve all JSX, Tailwind classes, Spanish copy, validation logic, and Framer Motion wrappers exactly.
  - Add `password` to form state (type string, initial `''`). Add a password `<input type="password">` field with label "Contraseña" between Correo and Teléfono, required, min 8 characters, matching the existing input styling.
  - Add password validation: if password.length < 8 show "La contraseña debe tener al menos 8 caracteres".
  - The page component is `'use client'`, so `searchParams` is a Promise in Next.js 16. Accept `{ searchParams }: { searchParams: Promise<{ ref?: string }> }` and read it with `const { ref } = React.use(searchParams)` (import `use` from `react`) at the top of the component body. Use `ref` (not `searchParams?.ref`) in all downstream calls.
  - Replace the `saveMockUser` import and call with:
    - Import `createClientBrowser` from `@/shared/supabase/client`.
    - Import `createEntryAction` from `@/features/waitlist/waitlist.actions`.
    - On form submit: `const supabase = createClientBrowser(); const { error } = await supabase.auth.signUp({ email, password, options: { data: { name, phone } } })`. On success (no error): `await createEntryAction(ref)`, then `router.push('/dashboard')`. On error: surface Supabase error message in Spanish.
    - Google button onClick: `const supabase = createClientBrowser(); await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: \`\${window.location.origin}/auth/callback?ref=\${ref ?? ''}\` } })`.
  - Do NOT delete `src/lib/mockUser.ts` — dashboard still imports it (deleted in Phase 4).
**Invariants impacted:** 3, 7, 8, 9, 10.
**State-file upkeep:** per Subagent prompt.
**Status:** pending.

## Phase 3 — Queue + referral server actions   *(build phase)*

**Type:** build.
**Goal:** Replace `mockQueue`'s localStorage bumps with real Supabase queries — server actions for answering the daily question and sharing the invite link — plus the `/r/[code]` referral redirect route.
**Context to load:**
- This plan file (invariants — especially 4, 5, 7, 8, 10).
- `src/features/waitlist/waitlist.actions.ts` — from Phase 2; extend it (do not recreate).
- `src/components/dashboard/QuestionCard.tsx` — full current file; to understand how `bumpForAnswer` is currently called (will be swapped for the new server action).
- `src/components/dashboard/InviteBlock.tsx` — full current file; to understand how `bumpForShare` is currently called.
- `src/data/questions.ts` — question ids/types; `answerQuestionAction` receives a question id.
- `src/types/supabase.ts` — `WaitlistEntry` type from Phase 1.
**Targets:**
- `src/features/waitlist/waitlist.queries.ts` (new)
- `src/features/waitlist/waitlist.actions.ts` (extended — add answer/share/referral actions)
- `src/app/r/[code]/page.tsx` (new)
**Risk:** Supabase `update` with `GREATEST` must be done via an RPC or a raw SQL expression. Using the JS client's `.update({ position: GREATEST(...) })` won't work — use `.rpc('bump_position', { entry_id, delta })` or a raw `.from('waitlist_entries').update({ position: newPosition })` after fetching and computing locally. For an anti-abuse waitlist with 500 seats, a read-then-write (non-atomic) is acceptable. Use that pattern for simplicity.
**Change sketch:**
- Write `src/features/waitlist/waitlist.queries.ts`:
  - `getEntry(userId: string): Promise<WaitlistEntry | null>` — creates user-scoped server client, `SELECT * FROM waitlist_entries WHERE user_id = userId LIMIT 1`. Returns the row or null.
  - `getPosition(userId: string): Promise<number>` — calls `getEntry`, returns `entry.position` or 250 as fallback.
- Extend `src/features/waitlist/waitlist.actions.ts` with three new `'use server'` functions:
  - `answerQuestionAction()`:
    1. Get user via `createClientServer()`.
    2. Create service-role client.
    3. Fetch entry for user. If not found, return.
    4. If `entry.answered_date` equals today's date (ISO format `YYYY-MM-DD`), return early — invariant 5.
    5. Compute `newPosition = Math.max(entry.position - 1, 4)` — invariant 4.
    6. Update: `{ position: newPosition, answered_date: new Date().toISOString().slice(0, 10) }`.
  - `shareAction()`:
    1. Get user, service-role client, fetch entry.
    2. If `entry.share_bumps_used >= 3`, return early — invariant 5.
    3. Compute `newPosition = Math.max(entry.position - 5, 4)`.
    4. Update: `{ position: newPosition, share_bumps_used: entry.share_bumps_used + 1 }`.
  - `claimReferralAction(referralCode: string)`:
    - This is called by `createEntry` (Phase 2) — already handled there. No standalone action needed. (Include as a no-op export stub so imports don't break if any file references it.)
- Write `src/app/r/[code]/page.tsx` as a **server component** (no `'use client'`):
  - Receives `{ params }: { params: Promise<{ code: string }> }` (Next.js 16 — params is a Promise).
  - Destructure with `const { code } = await params`.
  - Calls `redirect(\`/signup?ref=\${code}\`)` from `next/navigation`.
  - No HTML rendered — pure redirect. This is a server-only redirect; no cookie or localStorage needed.
**Invariants impacted:** 4, 5, 7, 8, 10.
**State-file upkeep:** per Subagent prompt.
**Status:** pending.

## Phase 4 — Dashboard wired to real data + delete mocks   *(build phase)*

**Type:** build.
**Goal:** Convert `dashboard/page.tsx` to a real async Server Component that reads from Supabase, rewire all three dashboard cards to use props + server actions instead of localStorage stores, and delete `mockUser.ts` and `mockQueue.ts`.
**Context to load:**
- This plan file (invariants — especially 9, 10).
- `src/app/dashboard/page.tsx` — full current file; understand the `useSyncExternalStore` pattern being replaced.
- `src/components/dashboard/PositionCard.tsx` — full current file.
- `src/components/dashboard/QuestionCard.tsx` — full current file.
- `src/components/dashboard/InviteBlock.tsx` — full current file.
- `src/features/waitlist/waitlist.queries.ts` — `getEntry` signature from Phase 3.
- `src/features/waitlist/waitlist.actions.ts` — `answerQuestionAction`, `shareAction` signatures from Phase 3.
- `src/data/questions.ts` — `questionForToday()` function.
- `src/types/supabase.ts` — `WaitlistEntry` type.
- `AGENTS.md` — Next.js version caution for Server Component patterns.
**Targets:**
- `src/app/dashboard/page.tsx` (rewrite)
- `src/components/dashboard/PositionCard.tsx` (modify — accept `position: number` prop)
- `src/components/dashboard/QuestionCard.tsx` (modify — accept `answeredToday: boolean` prop, call `answerQuestionAction` on submit)
- `src/components/dashboard/InviteBlock.tsx` (modify — accept `referralCode: string`, `shareBumpsUsed: number` props, call `shareAction` on share)
- `src/lib/mockUser.ts` (delete via `trash`)
- `src/lib/mockQueue.ts` (delete via `trash`)
**Risk:** `PositionCard`, `QuestionCard`, `InviteBlock` are currently `'use client'` components that use hooks. They keep `'use client'` after this phase; only their data source changes from store subscriptions to props. Server actions called from client components via direct import with `'use server'` directive work in App Router — verify the import pattern matches the Next.js version in `node_modules/next/dist/docs/`.
**Change sketch:**
- Rewrite `src/app/dashboard/page.tsx` as an async Server Component (remove `'use client'`, remove all `useSyncExternalStore` imports):
  1. `import { createClientServer } from '@/shared/supabase/server'` and `import { getEntry } from '@/features/waitlist/waitlist.queries'`.
  2. `const { data: { user } } = await (await createClientServer()).auth.getUser()` — middleware already redirects unauthenticated; this is a defensive read.
  3. If no user, `redirect('/signup')`.
  4. `const entry = await getEntry(user.id)` — if null (entry not yet created, e.g. OAuth user whose callback didn't fire `createEntry`), call `createEntry(user.id)` server-side and re-fetch.
  5. Derive `answeredToday: boolean` = `entry.answered_date === new Date().toISOString().slice(0, 10)`.
  6. Derive `question = questionForToday()`.
  7. Derive `firstName = (user.user_metadata?.name as string ?? user.email ?? 'Usuario').split(' ')[0]`.
  8. Render `<PositionCard position={entry.position} />`, `<QuestionCard question={question} answeredToday={answeredToday} />`, `<InviteBlock referralCode={entry.referral_code} shareBumpsUsed={entry.share_bumps_used} appUrl={process.env.NEXT_PUBLIC_APP_URL!} />`.
  9. Keep the greeting heading (`Hola, {firstName}`) and any existing page layout/Framer Motion wrappers in place.
- Edit `src/components/dashboard/PositionCard.tsx`:
  - Remove `useSyncExternalStore`, `readPositionSnapshot`, `subscribePosition` imports.
  - Accept `{ position }: { position: number }` prop. Use `position` directly.
  - Keep Framer Motion number animation (animate on `position` prop change using `motion.div` + `key={position}` or `useMotionValue`).
- Edit `src/components/dashboard/QuestionCard.tsx`:
  - Remove `bumpForAnswer` import from mockQueue.
  - Accept `{ question, answeredToday }: { question: DailyQuestion; answeredToday: boolean }` props (import `DailyQuestion` from `@/data/questions`).
  - On answer submit: call `await answerQuestionAction()` (imported from `@/features/waitlist/waitlist.actions`).
  - If `answeredToday` is true, render the "ya respondiste hoy" state immediately.
- Edit `src/components/dashboard/InviteBlock.tsx`:
  - Remove `bumpForShare` import from mockQueue.
  - Accept `{ referralCode, shareBumpsUsed, appUrl }: { referralCode: string; shareBumpsUsed: number; appUrl: string }` props.
  - Construct invite link: `` `${appUrl}/r/${referralCode}` ``.
  - Share buttons call `await shareAction()` (imported from `@/features/waitlist/waitlist.actions`).
  - Show remaining bumps: `3 - shareBumpsUsed` shares left; disable buttons when `shareBumpsUsed >= 3`.
- Delete `src/lib/mockUser.ts` via `trash src/lib/mockUser.ts` (PowerShell — uses the profile's Recycle Bin function, never `rm`/`Remove-Item`).
- Delete `src/lib/mockQueue.ts` via `trash src/lib/mockQueue.ts`.
- After deleting, grep for any remaining `mockUser`/`mockQueue` imports across `src/` and remove them if found.
**Invariants impacted:** 4, 5, 7, 8, 9, 10.
**State-file upkeep:** per Subagent prompt.
**Status:** pending.

## Phase 5 — Welcome email via Resend   *(build phase)*

**Type:** build.
**Goal:** Install Resend, write a branded Spanish welcome email, and fire it (fire-and-forget) from `createEntry` after a successful insert.
**Context to load:**
- This plan file (invariants — especially 3, 6).
- `src/features/waitlist/waitlist.actions.ts` — the `createEntry` function where the email call will be added.
- `src/app/globals.css` — to confirm the primary colour token (#3563AE) for the email HTML.
- `.env.local.example` — to confirm `RESEND_API_KEY` is already listed (from Phase 1).
**Targets:**
- `package.json` (modified after npm install resend)
- `src/features/waitlist/email.ts` (new)
- `src/features/waitlist/waitlist.actions.ts` (modified — add `sendWelcomeEmail` call inside `createEntry`)
**Risk:** Resend send failures must not break signup. Wrap the call in a try/catch and log the error without re-throwing — invariant is fire-and-forget.
**Change sketch:**
- Run `npm install resend` from the project root.
- Write `src/features/waitlist/email.ts`:
  ```ts
  import { Resend } from 'resend'

  const resend = new Resend(process.env.RESEND_API_KEY)

  export async function sendWelcomeEmail(
    to: string,
    name: string,
    position: number,
    referralLink: string
  ): Promise<void> {
    const firstName = name.split(' ')[0]
    await resend.emails.send({
      from: 'MatchOwner <hola@matchowner.es>',
      to,
      subject: `¡Estás dentro, ${firstName}! 🏠`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h1 style="color:#3563AE;font-size:24px;margin-bottom:8px">Bienvenido a MatchOwner</h1>
          <p style="color:#1a1a1a;font-size:16px">Hola ${firstName},</p>
          <p style="color:#1a1a1a;font-size:16px">
            Estás en el puesto <strong style="color:#ED5C2D">#${position}</strong> de 500 plazas beta.
            Los 3 primeros acceden al premio.
          </p>
          <p style="color:#1a1a1a;font-size:16px">
            Sube posiciones invitando a amigos con tu enlace:
          </p>
          <a href="${referralLink}" style="display:inline-block;background:#3563AE;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:15px;margin:8px 0">
            Mi enlace de invitación →
          </a>
          <p style="color:#666;font-size:13px;margin-top:24px">
            Cada amigo que se una te sube 5 puestos. Cada pregunta respondida, 1 puesto.
          </p>
          <p style="color:#999;font-size:12px;margin-top:32px">MatchOwner · Madrid, España</p>
        </div>
      `,
    })
  }
  ```
- Edit `src/features/waitlist/waitlist.actions.ts` inside the `createEntry` function, immediately after the successful insert (after the referrer bump logic), add:
  ```ts
  // fire-and-forget — do not await or rethrow
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://matchowner.es'
    const { data: { user } } = await createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    ).auth.admin.getUserById(userId)
    if (user?.email) {
      const name = (user.user_metadata?.name as string) ?? user.email
      const referralLink = `${appUrl}/r/${insertedEntry.referral_code}`
      sendWelcomeEmail(user.email, name, position, referralLink).catch(() => {})
    }
  } catch { /* ignore */ }
  ```
  Note: after the insert, capture the inserted row's `referral_code` (from the insert's `returning` or a follow-up select) and use it to build the referral link.
**Invariants impacted:** 3, 6.
**State-file upkeep:** per Subagent prompt.
**Status:** pending.

## Phase 6 — GitHub remote + Vercel deployment config   *(build phase)*

**Type:** build.
**Goal:** Create the GitHub remote, push the full history, and add the Vercel deployment config file so the project is one-click deployable from the Vercel dashboard.
**Context to load:**
- This plan file (invariants).
- `.env.local.example` — to confirm all env vars are documented.
- `package.json` — to confirm `"build"` script for Vercel.
**Targets:**
- `vercel.json` (new)
- `.env.local.example` (verify complete — no edits needed if Phase 1 wrote it correctly)
**Risk:** `gh repo create` requires the GitHub CLI authenticated as `Vicrru`. If `gh auth status` fails, write a `DEPLOY.md`-style note inside `vercel.json`'s `$schema` comment and leave the remote unconfigured — do not block the phase. The subagent must not interactively prompt.
**Change sketch:**
- Run `gh auth status` to confirm the GitHub CLI is authenticated.
  - If authenticated: run `gh repo create Vicrru/matchowner-waitlist --public --source=. --remote=origin --push`. This creates the repo, sets the remote, and pushes the current branch in one command.
  - If not authenticated: skip the `gh` steps and note in the tracker: "GitHub remote not configured — run `gh repo create Vicrru/matchowner-waitlist --public --source=. --remote=origin --push` manually".
- Write `vercel.json`:
  ```json
  {
    "framework": "nextjs",
    "buildCommand": "npm run build",
    "outputDirectory": ".next",
    "installCommand": "npm install"
  }
  ```
- After creating the GitHub remote (if done), add a code comment block in `vercel.json` explaining the required Vercel dashboard steps (as a `"$comment"` field, which Vercel ignores but humans can read):
  ```json
  {
    "$comment": "Vercel dashboard setup: (1) Import repo Vicrru/matchowner-waitlist. (2) Set env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_APP_URL, RESEND_API_KEY. (3) In Supabase Auth > URL Configuration, add the Vercel production URL to redirect_urls. (4) In Supabase Auth > Providers > Google, add the production callback URL.",
    "framework": "nextjs",
    "buildCommand": "npm run build",
    "outputDirectory": ".next",
    "installCommand": "npm install"
  }
  ```
**Invariants impacted:** none structural.
**State-file upkeep:** per Subagent prompt.
**Status:** pending.

## Status tracker

- Phase 0 (review) — done — applied 4 (async searchParams/params, drop referred_by UNIQUE, DailyQuestion type)
- Phase 1 (Supabase setup + schema) — done — supabase/migrations/20260610000000_waitlist.sql, src/shared/supabase/{client,server,index}.ts, src/types/supabase.ts, .env.local.example
- Phase 2 (Auth: middleware + callback + signup rewrite) — done — src/middleware.ts, src/app/auth/callback/route.ts, src/features/waitlist/waitlist.actions.ts, src/app/signup/page.tsx
- Phase 3 (Queue + referral server actions) — done — src/features/waitlist/waitlist.queries.ts, src/features/waitlist/waitlist.actions.ts (extended), src/app/r/[code]/page.tsx
- Phase 4 (Dashboard wired to real data + delete mocks) — done — src/app/dashboard/page.tsx (async SC), src/components/dashboard/{PositionCard,QuestionCard,InviteBlock}.tsx (props), src/lib/mock{User,Queue}.ts (deleted)
- Phase 5 (Welcome email via Resend) — done — src/features/waitlist/email.ts (new), src/features/waitlist/waitlist.actions.ts (fire-and-forget sendWelcomeEmail in createEntry), package.json (resend added)
- Phase 6 (GitHub remote + Vercel deployment config) — done — vercel.json (new); GitHub remote already configured at Vicrru-Git/matchowner-waitlist (gh repo create skipped)

## Open questions / parked items

- **Email confirmation.** `email_autoconfirm = true` is set in local config for frictionless dev. For production, enable email confirmation in Supabase dashboard (Auth → Email Templates → Confirm signup) and add a `/signup/confirm` page that handles the post-confirmation redirect. Deferred.
- **Admin view.** No admin dashboard for viewing all waitlist entries. Deferred — use Supabase Studio directly for now.
- **Rate limiting.** No rate limiting on signup or bump actions. Deferred — add Supabase Edge Functions or Vercel middleware rate limiting in a follow-up.
- **Position uniqueness.** Position values are not unique (two users can share the same number). For a 500-seat demo this is fine. If a strict ordered queue is needed, add a UNIQUE constraint and use a sequence or window function on insert.
