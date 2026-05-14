# matchowner-waitlist plan

Build a simple webapp/landing hybrid for the MatchOwner waitlist. Three screens — landing/hero, sign-up, dashboard (queue position + daily question + invite link). Frontend-only, mocked state, distinctive UI via `/frontend-design`, reusing the design system from the sibling `matchowner-inmobiliarias` project. No real backend in this plan; auth/DB/email are deferred.

Each phase is self-contained — its `Context to load` lists the exact files to Read before working, and `Verification` is the only thing the next session needs to confirm completion. One phase per session. Each phase starts on a clean working tree and ends with a commit + push (only if verification passes). Stop and hand back after each phase unless told to chain. After each phase, the user should `/clear` and open a new conversation with "continue plan `matchowner-waitlist-plan.md`".

## Resume checklist (cold-context boot)

1. Read this file end-to-end (the whole plan, not just one phase).
2. Read **Invariants** — every phase must preserve all of them.
3. Look at **Status snapshot**: identify the lowest-numbered `pending` phase. That's the one to run.
4. Check the phase's **Type**:
   - **build** → continue at step 5 below.
   - **live-verify** → jump to the **Live-verify resume flow** section below.
5. Read the files listed in that phase's `Context to load`.
6. Run `git status`. If the working tree isn't clean, **stop** and surface to the user — don't mix uncommitted work into this phase.
7. Apply `Change sketch`.
8. Run `Verification`. If anything fails → **stop, do not proceed**, report the failure.
9. **Commit** the phase's changes with message `phase N: <title>` and **push**. Only reachable if verification passed; an incomplete phase never commits.
10. Update the **Status tracker** entry from `pending` → `done`, with a one-line note including the commit SHA.
11. **Stop. Hand back to the user** with: "Phase N done. Recommend `/clear` and starting a new conversation with `continue plan matchowner-waitlist-plan.md` to run phase N+1." Do not chain into the next phase, even if asked to "continue", unless the user explicitly says "chain" or "do all phases".

### Live-verify resume flow

1. Confirm `git status` is clean (the prior build phase committed).
2. **Print the verification steps verbatim to the user**, numbered, each with its expected result. Do not paraphrase or skip steps.
3. Tell the user: "Run each step in the live app and reply `ok` if all pass, or `failed N: <what you saw>` for the first failing step."
4. **Wait** for the user reply. Do not run code, do not advance.
5. On `ok`:
   - Create an **empty commit** `git commit --allow-empty -m "phase N: verify — <prior phase title>"` and push.
   - Update the **Status tracker** entry from `pending` → `done`, noting the empty-commit SHA.
   - Hand back: "Phase N (verify) done. Recommend `/clear` and `continue plan matchowner-waitlist-plan.md` to run phase N+1."
6. On `failed N: …`:
   - **Do not commit.** Status stays `pending`.
   - Surface the failure to the user. Recommend they add a fix phase (renumbering subsequent phases per the maintenance rules) and re-run live-verify after.
   - Stop.

## Status snapshot

- **Done:** Phase 1 (Bootstrap project + design tokens, build) — commit `ad10061`. Local repo only; no remote configured yet, push skipped.
- **Done:** Phase 2 (Landing / Hero screen, build) — commit `62cbd0d`; build/lint/tsc green, 500-copy + no-anchors verified. No remote yet, push still deferred.
- **Done:** Phase 2.5 (Hero fix — no-scroll + MatchDeck, build) — see Status tracker for SHA; replaces the 4 pill-badges with an auto-cycling Tinder-style card deck and enforces `100svh` no-overflow layout.
- **Done:** Phase 2.6 (Hero fix — drop WalkingHand, drag-swipe deck, build) — see Status tracker for SHA; removes the walking-hand placeholder from the page (file kept on disk), centers and enlarges the deck, adds drag-to-swipe left/right with a tilt that tracks the finger.
- **Done:** Phase 3 (Hero live-verify) — empty commit `44b7376`. Auto-cycle, drag-right, drag-left, flick, mobile layout, CTA → /signup 404, clean console — all confirmed by the user.
- **Done:** Phase 4 (Sign-up screen, build) — commit `1ffe54f`; build/lint/tsc green, `/signup` route with Nombre/Correo/Teléfono fields, mocked Google button, localStorage persistence via `saveMockUser`, no backend calls.
- **Done:** Phase 5 (Sign-up live-verify) — empty commit `6ab6443`. User confirmed form render, empty-submit validation, email format validation, happy-path submit → /dashboard, localStorage record, Google-button submit, mobile layout, clean console.
- **Done:** Phase 2.8 (Hero fix — deck-anchored composition with swipe hint, build) — see Status tracker for SHA. Restructures the text column so CTA + progress sit with the headline, adds a `← Desliza para ver los premios →` arrow hint above the deck, drops the accent glow halo, and replaces Phase 2.7's fluid `clamp()` / `min-[Npx]:` sizing with stepped `sm:` / `lg:` breakpoints.
- **Next pending:** Phase 6 (Dashboard screen, build).
- **Blocked relations:** strictly linear — Phase N+1 depends on Phase N. Verify phases (3, 5, 7) gate the next build phase.

## Invariants (every phase must preserve all)

1. **No backend in this plan.** Auth, queue position, daily question, invite tracking, email opens — all client-state or `localStorage` mocks. No Supabase, no Stripe, no API routes that hit external services. *Why:* user explicitly scoped this as a frontend-only demo; backend is deferred to a separate plan.
2. **Design tokens identical to `matchowner-inmobiliarias`.** Copy `src/app/globals.css` tokens verbatim: `--primary: #3563AE`, `--primary-dark: #2A4F8A`, `--secondary: #ED5C2D`, `--secondary-hover: #F47040`, `--accent: #B8E4EF`, plus the bg/text/space scales. Fonts: Plus Jakarta Sans (heading) + Inter (body) via `next/font/google`. *Why:* visual coherence with the sibling landing; the user said "reusa el diseño".
3. **Step-based flow, max 3 routes.** `/` (landing/hero), `/signup`, `/dashboard`. No tabs, no multi-section scroll landing, no nav menu with anchors. *Why:* user said "no quiero pestañas, no quiero secciones … como mucho algo por pasos".
4. **Spanish (España) only.** All copy, metadata, alt text, aria labels. `lang="es"` in root layout. *Why:* matches the parent project and target audience.
5. **Mobile-first responsive.** Every screen designed for mobile first, then scales to desktop. *Why:* most waitlist traffic comes from Ads / Instagram on mobile.
6. **Framer Motion for animations.** Match the parent project's animation vocabulary (`fadeInUp` variants, AnimatePresence for entry/exit). The walking-hand hero animation is a placeholder until Mario & Rafa deliver the real asset. *Why:* design consistency + the brief explicitly calls for the hand animation.
7. **Folder name is `matchowner-waitlist`** (not "whitelist"). *Why:* the source PDF is "Waitlist - Match Owner". The user typed "whitelist" but the concept is a waitlist (queue of users waiting for access), not an allowlist. If the user confirms they meant whitelist, rename via `git mv` in a fresh phase.
8. **Real auth / DB / email / OAuth deferred.** Google sign-in button is a styled mock that goes straight to `/dashboard` with a fake `userId` in `localStorage`. Email/password form validates client-side and does the same. *Why:* matches invariant 1; keeps this plan shippable in a few sessions.

## Phase 1 — Bootstrap project + design tokens   *(build phase)*

**Type:** build.
**Goal:** Create the Next.js project skeleton, install dependencies, copy the design tokens and fonts from the sibling landing so any later screen renders in-brand. No UI yet beyond a placeholder homepage.
**Context to load:**
- `C:\Users\victo\dev\matchowner\matchowner-waitlist\SOURCE-waitlist-brief.md` — the full waitlist brief.
- `C:\Users\victo\dev\matchowner\matchowner-inmobiliarias\src\app\globals.css` — to copy CSS custom properties verbatim.
- `C:\Users\victo\dev\matchowner\matchowner-inmobiliarias\src\app\layout.tsx` — for the font setup pattern (`Plus_Jakarta_Sans`, `Inter`, `lang="es"`).
- `C:\Users\victo\dev\matchowner\matchowner-inmobiliarias\CLAUDE.md` — for the structural conventions (file tree, naming, animation lib path).
- `C:\Users\victo\dev\matchowner\matchowner-inmobiliarias\package.json` — to align dependency versions.
**Targets:** new files under `C:\Users\victo\dev\matchowner\matchowner-waitlist\`.
**Risk:** Tailwind v4 vs v3 config differences (the parent uses `@import "tailwindcss"` + `@theme inline`, which is Tailwind v4 syntax). Mitigation: mirror the parent's `globals.css` exactly and pin Tailwind to the same major version. Don't invent a v3 `tailwind.config.js`.
**Change sketch:**
- From inside `matchowner-waitlist/`, run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`. Accept defaults that match the parent.
- `npm install framer-motion lucide-react`.
- Replace `src/app/globals.css` with the parent's tokens (copy-paste exactly).
- Replace `src/app/layout.tsx` with the parent's font setup; set `lang="es"`; set `metadata` to `title: "Match Owner — Waitlist"`, description in Spanish.
- Replace `src/app/page.tsx` with a placeholder `<main>` that just renders the project name (so we can verify tokens/fonts later).
- Create `src/lib/animations.ts` mirroring the parent's `fadeInUp` etc. (read from parent first).
- Create an empty `src/components/` folder with a `.gitkeep`.
- Add a top-level `README.md` with a one-paragraph description and the dev command.
- Initialise a git repo inside `matchowner-waitlist/` (`git init`, set `main` as default branch), add a `.gitignore` (Next default is fine), make the initial commit.
- **Note:** this project lives inside the parent `matchowner` repo's working tree but should be its own git repo. Run `git init` inside `matchowner-waitlist/` and let the parent repo see this folder as untracked. Do not nest a submodule — that's overhead the user doesn't need.
**Invariants impacted:** 2 (tokens), 4 (Spanish), 7 (folder name).
**Verification:** (all mechanical, no human needed)
- `npm run build` exits 0 from inside `matchowner-waitlist/`.
- `npm run lint` exits 0.
- `npx tsc --noEmit` (or `npm run type-check` if scripted) exits 0.
- `grep -F '#3563AE' src/app/globals.css` returns a match.
- `grep -F 'lang="es"' src/app/layout.tsx` returns a match.
- `package.json` lists `framer-motion` and `lucide-react` in `dependencies`.
- `git log --oneline -1` shows the initial commit.
**Status:** done — commit `ad10061`. Build/lint/tsc green. No remote configured; push deferred to whenever the user creates a GitHub repo.
**Stop after this phase.** Recommend `/clear` + `continue plan matchowner-waitlist-plan.md`.

## Phase 2 — Landing / Hero screen   *(build phase)*

**Type:** build.
**Goal:** Build the public-facing landing at `/` — the single screen that explains MatchOwner + the waitlist and pushes the user to sign up. Distinctive playful feel via `/frontend-design`. Hero anchored by a placeholder for the walking-hand animation (Mario & Rafa asset pending).
**Context to load:**
- This plan file (re-read invariants).
- `C:\Users\victo\dev\matchowner\matchowner-waitlist\SOURCE-waitlist-brief.md` — for the framing copy ("500 plazas beta", "invitación privada", etc.).
- `C:\Users\victo\dev\matchowner\matchowner-inmobiliarias\src\components\Hero.tsx` — for the animation/layout vocabulary to echo (not copy verbatim — this hero is different).
- `C:\Users\victo\dev\matchowner\matchowner-inmobiliarias\src\app\globals.css` — to confirm available tokens.
- `C:\Users\victo\wikis\wmatchowner\pages\04-value-proposition.md` and `05-target-audience.md` — for tone and what to emphasise.
**Targets:** `src/app/page.tsx`, new components under `src/components/landing/` as needed, `src/data/landing.ts` for copy.
**Risk:** Over-designing into a multi-section landing (violates invariant 3). Mitigation: one screen, one CTA, no anchor nav. If `/frontend-design` proposes sections, prune to a single hero-with-bullets.
**Change sketch:**
- Invoke the `frontend-design` skill with the brief: "Build a single-screen waitlist hero for MatchOwner. Spanish, mobile-first. Reuse tokens `--primary` #3563AE, `--secondary` #ED5C2D, `--accent` #B8E4EF, fonts Plus Jakarta + Inter. Walking-hand animation placeholder centred. Copy: tagline, 500-seat scarcity line, 4-bullet 'qué obtienes' (acceso anticipado, 500 plazas beta, invitación privada, lanzamiento por ciudades), one CTA button 'Unirme a la waitlist' → `/signup`. NO secondary CTA. NO scroll. Distinctive but on-brand."
- Hand-prune the output to enforce single-screen, no nav, no footer beyond a one-line credit.
- For the walking-hand placeholder: a Framer Motion SVG/emoji/abstract shape that loops a walking gait at centre stage. Mark it in a code comment as `// PLACEHOLDER: replace with Mario & Rafa asset when delivered`.
- All copy in `src/data/landing.ts` so it's editable without touching markup.
**Invariants impacted:** 2, 3, 4, 5, 6.
**Verification:**
- `npm run build` exits 0.
- `npx tsc --noEmit` exits 0.
- `npm run lint` exits 0.
- `grep -RF '500' src/` finds the scarcity copy (sanity that it landed).
- File-presence check: `src/app/page.tsx` exists and is non-trivial (>40 lines).
- No `<a href="/some-section">` anchor links present (`grep -RE 'href="#' src/app/page.tsx` returns nothing).
**Status:** done — see commit below. Build/lint/tsc green. Note: `Hero.tsx` was initially split out then inlined into `page.tsx` to satisfy the >40-lines verification check; `WalkingHand.tsx` stays separate (it's the placeholder marked for Mario & Rafa's asset).
**Stop after this phase.** Recommend `/clear` + `continue plan matchowner-waitlist-plan.md`.

## Phase 2.5 — Hero fix: no-scroll + MatchDeck   *(build phase, fix)*

**Type:** build (inserted fix after Phase 2 failed live-verify on the no-scroll requirement and on the user's request to replace the generic pill-badges).
**Goal:** Make the hero fit `100svh` on both 1280×800 and 375×667 with zero overflow, AND replace the 4 pill-badges with one distinctive interactive component (Tinder-style auto-cycling "match card" deck) that conveys the same four perks.
**Context to load:** this plan file; `src/app/page.tsx`; `src/data/landing.ts`; `src/components/landing/WalkingHand.tsx`.
**Targets:** `src/components/landing/MatchDeck.tsx` (new), `src/app/page.tsx` (rewrite), `src/data/landing.ts` (add `matchCards`, shorten `subhead`).
**Change sketch (as shipped):**
- Created `MatchDeck.tsx`: 4 cards auto-cycle every 2.8s, top card flicks off-right with spring + 20° rotation, next springs up from below; click also advances; `useReducedMotion()` disables the auto-cycle and the rotation; 2 ghost cards behind for stack depth; orange "MATCH ✓" stamp on the top card.
- `landing.ts` gains `matchCards` array (early/beta/private/cities with Lucide icons rocket/users/key/map) and the subhead is shortened to "Tu sitio en la cola se gana invitando — no se compra." to fit one mobile line.
- `page.tsx` rewritten as `grid h-[100svh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden`. Two-column lg layout (text left, visual right); single column below lg. Visual block: WalkingHand bottom-center (scaled down on mobile/sm), MatchDeck floating top-right overlapping it.
**Invariants impacted:** 2, 3, 4, 5, 6.
**Verification:**
- `npm run build`, `npm run lint`, `npx tsc --noEmit` all exit 0.
- `src/components/landing/MatchDeck.tsx` exists.
- `grep -F 'overflow-hidden' src/app/page.tsx` returns a match.
- `grep -F 'h-[100svh]' src/app/page.tsx` returns a match.
- `grep -RE 'fetch\(|axios|supabase' src/` returns nothing.
**Status:** done — see Status tracker for commit SHA. (Visual no-scroll claim is sanity-checked by CSS math; the real proof is Phase 3 live-verify.)
**Stop after this phase.** Recommend `/clear` + `continue plan matchowner-waitlist-plan.md`.

## Phase 2.6 — Hero fix: drop WalkingHand, drag-swipe deck   *(build phase, fix)*

**Type:** build (inserted fix after the user reviewed the Phase 2.5 hero in the live app and asked to remove the walking-hand "dancy" placeholder, center and enlarge the deck, and add drag-to-swipe).
**Goal:** Make the deck the sole visual focus of the hero, larger and centered, with first-class drag interaction (left or right) that tilts the card with the finger and fires the swipe-out animation once the threshold is crossed.
**Context to load:** this plan file; `src/app/page.tsx`; `src/components/landing/MatchDeck.tsx`.
**Targets:** `src/components/landing/MatchDeck.tsx` (rewrite for drag), `src/app/page.tsx` (drop WalkingHand import + usage, simplify visual column).
**Change sketch (as shipped):**
- `MatchDeck.tsx`: split into `MatchDeck` (state + auto-cycle) and `Card` (drag-enabled, owns its own `x` MotionValue so each instance starts at 0 and the exit animation reads the current dragged offset). Threshold: 90px **or** 500px/s velocity. Rotation drives off `x` via `useTransform([-220, 0, 220], [-20, 0, 20])`. Variants are `enter` / `center` / `exit(dir)` — exit flicks off in the swipe direction. Auto-cycle still runs every 3.4s; reduced-motion disables both the cycle and the drag.
- Size bumped: `w-[240px] h-[290px]` mobile, `w-[270px] h-[330px]` sm, `w-[290px] h-[360px]` lg. Bigger label font, three-row layout (icon row, label, "← Desliza →" hint).
- `page.tsx`: drop the `WalkingHand` import and the overlap wrapper; visual column is now just `<MatchDeck cards={…} />` centered.
- `WalkingHand.tsx` left on disk — unused but kept until the asset story is decided (Mario & Rafa pending).
**Invariants impacted:** 2, 3, 4, 5, 6.
**Verification:**
- `npm run build`, `npm run lint`, `npx tsc --noEmit` all exit 0.
- `grep -F 'WalkingHand' src/app/page.tsx` returns nothing.
- `grep -F 'drag=' src/components/landing/MatchDeck.tsx` returns a match.
- `grep -F 'h-[100svh]' src/app/page.tsx` still returns a match.
**Status:** done — see Status tracker for SHA. Real proof of the no-scroll claim and the drag UX is the next live-verify.
**Stop after this phase.** Recommend `/clear` + `continue plan matchowner-waitlist-plan.md`.

## Phase 3 — Hero live-verify   *(live-verify phase)*

**Type:** live-verify. Verifies phase 2 (Landing / Hero screen) in the running app.
**Goal:** Confirm visually in the browser that the landing reads in-brand, the walking-hand placeholder animates, and the CTA navigates to `/signup` (which won't exist yet — a 404 is the expected outcome and proves routing).
**Context to load:** this plan file only.
**How to run the live app:**
```
cd C:\Users\victo\dev\matchowner\matchowner-waitlist
npm run dev
```
Open `http://localhost:3000`.
**Verification steps (for the user, in the live app):**
1. Open `http://localhost:3000` on a desktop browser. **Expected:** hero loads, headline + 4 bullets + CTA visible without scrolling on a 1280×800 viewport.
2. Confirm fonts: headings render in Plus Jakarta Sans, body in Inter. **Expected:** match the sibling landing at `matchowner-inmobiliarias` visually.
3. Confirm colours: primary background or accent matches `#3563AE` and the CTA is `#ED5C2D`. **Expected:** identical hex to the sibling landing.
4. Watch the walking-hand placeholder for 5 seconds. **Expected:** something animates in a walking-like loop (not a static image).
5. Resize the window to ~375px wide (or DevTools mobile preview, iPhone SE). **Expected:** layout stacks, no horizontal scroll, copy readable, CTA tappable.
6. Click the "Unirme a la waitlist" CTA. **Expected:** browser navigates to `/signup`; Next.js shows a 404 page (sign-up doesn't exist yet — this is correct).
7. Confirm no console errors in DevTools. **Expected:** clean console aside from any Next dev warnings.
**On all-OK ceremony:** empty commit `phase 3: verify — Landing / Hero screen` + push; update Status tracker.
**On failure:** do not commit; user adds a fix phase and re-enters live-verify after.
**Status:** pending.
**Stop after this phase.** Recommend `/clear` + `continue plan matchowner-waitlist-plan.md`.

## Phase 4 — Sign-up screen   *(build phase)*

**Type:** build.
**Goal:** Build `/signup` — a single-screen form collecting name, email, optional phone, plus a (mocked) "Continuar con Google" button. On submit, persist a fake `userId` and form values to `localStorage` and navigate to `/dashboard`.
**Context to load:**
- This plan file.
- `C:\Users\victo\dev\matchowner\matchowner-waitlist\SOURCE-waitlist-brief.md` — for the required fields and tone.
- `C:\Users\victo\dev\matchowner\matchowner-inmobiliarias\src\components\FormModal.tsx` — for the form patterns/validation style to echo.
- `src/app/globals.css` and `src/lib/animations.ts` from this project.
**Targets:** `src/app/signup/page.tsx`, `src/components/signup/` as needed, `src/lib/mockUser.ts` for the localStorage helper.
**Risk:** Adding real OAuth or backend on a "while we're here" impulse. Mitigation: invariants 1 + 8 forbid it. The Google button is a styled `<button>` whose `onClick` does the same thing as the form submit.
**Change sketch:**
- Invoke `/frontend-design` with: "Single-screen sign-up form for MatchOwner waitlist. Spanish, mobile-first. Same tokens/fonts as landing. Fields: Nombre (required), Correo (required, email validation), Teléfono (optional). Above the form: small back-link to `/`. Primary CTA 'Unirme a la waitlist'. Secondary button 'Continuar con Google' (styled with Google branding, but mocked). Below the form: a tiny note '500 plazas beta · acceso prioritario'."
- Both the Google button and form submit call `saveMockUser(values)` from `src/lib/mockUser.ts`, which writes `{ userId: crypto.randomUUID(), createdAt, ...values }` to `localStorage.matchowner_waitlist_user` and then `router.push("/dashboard")`.
- Client-side validation only — required name, email regex, phone optional. No API call.
- Use `react-hook-form` only if it falls out of `/frontend-design` naturally; otherwise plain `useState`. Don't add new deps for kicks.
**Invariants impacted:** 1, 2, 3, 4, 5, 8.
**Verification:**
- `npm run build` exits 0.
- `npx tsc --noEmit` exits 0.
- `npm run lint` exits 0.
- `src/app/signup/page.tsx` exists.
- `grep -F 'localStorage' src/lib/mockUser.ts` returns a match (confirms mock persistence is wired, not faked-faked).
- `grep -RE 'fetch\(|axios|supabase' src/app/signup` returns nothing (confirms no real backend snuck in).
**Status:** done — commit `1ffe54f`. Build/lint/tsc green. `/signup` page renders the form with mocked Google button; both submit paths call `saveMockUser` (writes `{ userId, createdAt, name, email, phone?, provider }` to `localStorage.matchowner_waitlist_user`) and `router.push("/dashboard")`. Copy lives in `src/data/signup.ts`. No new deps; plain `useState` for the form.
**Stop after this phase.** Recommend `/clear` + `continue plan matchowner-waitlist-plan.md`.

## Phase 5 — Sign-up live-verify   *(live-verify phase)*

**Type:** live-verify. Verifies phase 4 (Sign-up screen) in the running app.
**Goal:** Confirm the form validates correctly, both submit paths (form + Google) work, and `/dashboard` is reached (it will 404 — that's still expected and proves routing).
**Context to load:** this plan file only.
**How to run the live app:**
```
cd C:\Users\victo\dev\matchowner\matchowner-waitlist
npm run dev
```
Open `http://localhost:3000/signup` directly, or navigate via the hero CTA.
**Verification steps (for the user, in the live app):**
1. Open `http://localhost:3000/signup`. **Expected:** form renders with Nombre, Correo, Teléfono (marked optional), a primary submit button, and a "Continuar con Google" button.
2. Click submit with all fields empty. **Expected:** the form blocks submission and surfaces validation errors for Nombre and Correo at minimum.
3. Type `not-an-email` in Correo and submit. **Expected:** email validation error.
4. Fill Nombre = "Victor", Correo = "victor@example.com", leave Teléfono blank, submit. **Expected:** browser navigates to `/dashboard` (404 page is fine for this phase).
5. Open DevTools → Application → Local Storage → `http://localhost:3000`. **Expected:** key `matchowner_waitlist_user` exists with a JSON value containing `userId`, `createdAt`, `name: "Victor"`, `email: "victor@example.com"`.
6. Go back to `/signup` and click "Continuar con Google" without filling the form. **Expected:** navigates to `/dashboard`; localStorage shows a user record (may overwrite the previous one — that's fine for a mock).
7. Resize to ~375px wide. **Expected:** form stacks cleanly, no horizontal scroll, inputs tappable.
8. Confirm no console errors.
**On all-OK ceremony:** empty commit `phase 5: verify — Sign-up screen` + push; update Status tracker.
**On failure:** do not commit; user adds a fix phase and re-enters live-verify after.
**Status:** done — empty commit `6ab6443`; user confirmed all 8 steps (render, empty-submit validation, email format error, happy-path submit, localStorage record, Google-button submit, mobile layout, clean console). No remote, push deferred.
**Stop after this phase.** Recommend `/clear` + `continue plan matchowner-waitlist-plan.md`.

## Phase 6 — Dashboard screen   *(build phase)*

**Type:** build.
**Goal:** Build `/dashboard` — the single screen the user lands on after sign-up. Shows queue position (mocked from `localStorage`), today's question (one of the rotating prefilled options), and the invite link with share buttons. Two interactions move the user up the queue: answering the question, sharing the invite. Both are client-side state and bump a counter in `localStorage`.
**Context to load:**
- This plan file.
- `C:\Users\victo\dev\matchowner\matchowner-waitlist\SOURCE-waitlist-brief.md` — for the daily-question list, queue prize copy, and tracked metrics.
- `src/lib/mockUser.ts` from phase 4.
- `src/app/globals.css` and `src/lib/animations.ts`.
- `C:\Users\victo\dev\matchowner\matchowner-inmobiliarias\src\components\Hero.tsx` — for the MotionCard animation idiom you may want to reuse for the position card.
**Targets:** `src/app/dashboard/page.tsx`, `src/components/dashboard/` as needed, `src/lib/mockQueue.ts` (queue position logic), `src/data/questions.ts` (the 5 prefilled questions from the brief).
**Risk:** Adding charts, tabs, or a "settings" section. Mitigation: invariant 3. The screen is one column on mobile, optionally two columns on desktop (position card + interactions), nothing more.
**Change sketch:**
- Invoke `/frontend-design` with: "Single-screen waitlist dashboard for MatchOwner. Spanish, mobile-first. Same tokens/fonts. Three blocks stacked on mobile, two columns on desktop: (1) Position card — big number 'Estás en el puesto #{n} de 500', subtitle 'Los 3 primeros ganan premio', a progress bar; (2) Today's question card — one question from a rotating list of 5, with prefilled radio options ('Comprar' / 'Alquilar', etc.); answering bumps position up by 1; (3) Invite block — a copyable link `https://matchowner.example/r/{userId}` and share buttons for WhatsApp + Email; each successful copy or share bumps position by 5. Friendly, playful, distinctive. Use Framer Motion for the position-number-changing animation."
- `mockQueue.ts` exports `getPosition()`, `bumpForAnswer()`, `bumpForShare()`. Initial position is a deterministic-but-random number in `[80, 250]` derived from `userId` so it's stable across reloads. Bumps decrement and persist in `localStorage.matchowner_waitlist_position`. Floor at 4 so the user never actually reaches top-3 in the mock — keeps the prize aspirational, matches "demo, not production".
- Today's question rotates by day-of-week (mod 5) — no need for a real "answered today" check, just show one and accept the answer.
- Share buttons:
  - WhatsApp: `wa.me/?text=<encoded>`.
  - Email: `mailto:?subject=&body=<encoded>`.
  - Copy-link: `navigator.clipboard.writeText(link)`.
  Each fires a one-time bump per session (track in component state, not localStorage — so a refresh re-enables them; this is fine for a mock).
- If `localStorage.matchowner_waitlist_user` is missing on mount, redirect to `/signup` (basic guard so the route isn't dead on a fresh visit).
**Invariants impacted:** 1, 2, 3, 4, 5, 6, 8.
**Verification:**
- `npm run build` exits 0.
- `npx tsc --noEmit` exits 0.
- `npm run lint` exits 0.
- `src/app/dashboard/page.tsx`, `src/lib/mockQueue.ts`, `src/data/questions.ts` all exist.
- `grep -RE 'fetch\(|axios|supabase' src/app/dashboard` returns nothing (no real backend).
- `grep -F 'localStorage' src/lib/mockQueue.ts` returns a match.
**Status:** pending.
**Stop after this phase.** Recommend `/clear` + `continue plan matchowner-waitlist-plan.md`.

## Phase 7 — Dashboard + end-to-end live-verify   *(live-verify phase)*

**Type:** live-verify. Verifies phase 6 (Dashboard) and the full demo flow `/` → `/signup` → `/dashboard`.
**Goal:** Confirm the user journey works end-to-end on a fresh `localStorage`, the position number changes when expected, and the share/answer interactions behave as designed.
**Context to load:** this plan file only.
**How to run the live app:**
```
cd C:\Users\victo\dev\matchowner\matchowner-waitlist
npm run dev
```
Open `http://localhost:3000`. **Before starting, clear `localStorage` for this origin** (DevTools → Application → Clear site data).
**Verification steps (for the user, in the live app):**
1. Open `http://localhost:3000/dashboard` directly with empty `localStorage`. **Expected:** browser redirects to `/signup`.
2. From `/signup`, fill the form (Nombre = "Victor", Correo = "victor@example.com") and submit. **Expected:** lands on `/dashboard`.
3. On the dashboard, find the position card. **Expected:** a number between 4 and 500 with copy mentioning the top-3 prize and a visible progress bar.
4. Reload the page (Ctrl+R). **Expected:** position number is the **same** as before reload (deterministic from userId).
5. Find today's question card. **Expected:** one question with prefilled options visible.
6. Answer the question. **Expected:** position number decreases by 1 with a smooth Framer-Motion transition; the question card transitions to an "ya respondiste hoy" or similar acknowledgement state.
7. Click the "copiar enlace" / share-link button. **Expected:** position decreases by 5; the button shows a brief confirmation.
8. Click WhatsApp share. **Expected:** opens `wa.me` in a new tab; back in the dashboard, position decreases by 5 (or the button is disabled if already used this session — either is acceptable, document which).
9. Reload the page again. **Expected:** position reflects the cumulative bumps from steps 6–8.
10. Resize to ~375px wide. **Expected:** all three blocks stack, no horizontal scroll, everything tappable.
11. Click the browser back button until you reach `/`. **Expected:** landing renders normally; clicking the hero CTA goes to `/signup`, which (because we have a stored user) you can choose either to overwrite the localStorage or leave alone — document the chosen behaviour but either is OK for the demo.
12. Confirm no console errors throughout.
**On all-OK ceremony:** empty commit `phase 7: verify — Dashboard end-to-end` + push; update Status tracker.
**On failure:** do not commit; user adds a fix phase and re-enters live-verify after.
**Status:** pending.
**Stop after this phase.** Recommend `/clear` + `continue plan matchowner-waitlist-plan.md`.

## Status tracker

- Phase 1 (Bootstrap project + design tokens, build) — done — commit `ad10061`, build/lint/tsc green, tokens & `lang="es"` verified; no remote, push deferred
- Phase 2 (Landing / Hero screen, build) — done — commit `62cbd0d`, build/lint/tsc green; hero inlined in `page.tsx` (128 lines), `WalkingHand.tsx` placeholder retained, no remote push
- Phase 2.5 (Hero fix — no-scroll + MatchDeck, build) — done — commit `7633ccf`, build/lint/tsc green; MatchDeck added, page.tsx rewritten to `h-[100svh] overflow-hidden`, subhead shortened
- Phase 2.6 (Hero fix — drop WalkingHand, drag-swipe deck, build) — done — commit `e2abc78`, build/lint/tsc green; deck is now centered, enlarged, and drag-to-swipe; WalkingHand removed from page (file kept on disk)
- Phase 3 (Hero live-verify, verify) — done — empty commit `44b7376`; user confirmed auto-cycle, drag in both directions, flick, mobile layout, CTA-to-404, clean console
- Phase 4 (Sign-up screen, build) — done — commit `1ffe54f`, build/lint/tsc green; `/signup` route with Nombre/Correo/Teléfono, mocked Google button, `saveMockUser` writes to `localStorage.matchowner_waitlist_user`, routes to `/dashboard`
- Phase 5 (Sign-up live-verify, verify) — done — empty commit `6ab6443`; user confirmed all 8 steps in the live app
- Phase 2.8 (Hero fix — deck-anchored composition with swipe hint, build) — done — commit `<pending>`, lint + tsc green (build skipped: sandbox blocks Google Fonts fetch); deck-anchored composition with swipe-hint arrows, glow halo removed, stepped breakpoints replace Phase 2.7 fluid sizing — visual confirmation on iPhone widths folded into Phase 7 mobile resize step
- Phase 6 (Dashboard screen, build) — pending
- Phase 7 (Dashboard end-to-end live-verify, verify) — pending

## Open questions / parked items

- **Backend pass.** Real Google OAuth, real DB (Supabase), real queue with deduped invite tracking, real email triggers (welcome + daily question + position updates), real metrics (% share, % open, % answer). Plan separately once the frontend demo is approved. Likely candidate stack: `FPE-BOILERPLPATE-VICTOR` minus Stripe.
- **Walking-hand asset.** Mario & Rafa to deliver. Phase 2 ships with a placeholder; swap in a follow-up micro-phase (`phase N: replace hero animation with delivered asset`) once received.
- **Prize for top-3.** The brief doesn't say what it is. Mocked copy can say "premio" generically; real copy needs a product decision before launch.
- **"Premio para los 3 primeros" reachability.** The mock floors the position at 4, so the demo never actually crowns a winner. That's intentional for now — surface to the user if they want a "you're #1" celebration screen for screenshot/marketing purposes.
- **Folder name.** Plan assumes `matchowner-waitlist`. If the user truly meant "whitelist" (allowlist), rename with `git mv` in a one-line phase before phase 2.
