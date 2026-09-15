# CLAUDE.md

Working notes for this repo: conventions, environment quirks, and deployment facts that are easy to get wrong. The full spec is [PLAN.md](PLAN.md); this file is the short operational companion. Keep it updated as small decisions land.

## What this is

Single-page portfolio for **Sanskar Rai** (handle **SansySasy**), a Python engineer working in cloud and DevOps, whose Dynamics 365 work in production is Business Central integration. Live domain will be **sansysasy.com**. Currently at `https://portfolio.rai-sanskar304.workers.dev` with `noindex` set until launch.

**Positioning rule (corrected 2026-09-14): never describe him as a D365 F&O consultant.** Tectura was functional training that earned MB-310; X++ and the thirteen extension modules are self-study; MB-500 is targeted for November 2026. The Copilot rollout was a real engagement. The role line is `Python Engineer · Cloud & DevOps · Dynamics 365 Integration`.

**Phase status:** Phases 0, 1 and 2 plus the positioning correction are merged to `main`. **Phase 3 (effects) was merged to `main` on 2026-09-16 (PR #4). Phase 4 is not started and must not be started without Sanskar saying so.** LinkedIn, the MB-310 credential link and the MB-500 target are in. Sanskar deferred his proofread of the Phase 2 copy to later; expect corrections to arrive at any point. The contact address stays the resume one (`sanskarrai@hotmail.com`) until a mailbox exists on the domain.

## Commands

```bash
pnpm dev                          # dev server on :5173
pnpm build                        # tsc -b && vite build -> dist/
pnpm lint                         # oxlint
pnpm typecheck                    # tsc -b
pnpm exec wrangler deploy --dry-run   # validate wrangler.jsonc against dist/
```

Two pages: `/` is the site, `/styleguide.html` is the unlinked design review page (tokens, type scale, monogram options, headline candidates, components). Both are Vite entries declared in `vite.config.ts`. On the deployed Worker the styleguide is served at `/styleguide`, since static assets drop the `.html`.

**Measuring the site.** Build first, then serve `dist/` and audit it. Chrome is at `C:\Program Files\Google\Chrome\Application\chrome.exe`; set `CHROME_PATH` to it.

```bash
pnpm build
node node_modules/vite/bin/vite.js preview --port 4173 --strictPort
pnpm dlx lighthouse@latest http://localhost:4173/ --preset=desktop --chrome-flags="--headless=new"
```

Last measured on the Phase 3 build, 2026-09-15, as the median of five mobile runs alternated with a same-day build of `main`: mobile performance 93 (range 92–98) against Phase 2's 90, LCP 2.4s against 2.2s, TBT 182ms against 274ms, CLS 0.001 against 0.051; accessibility and best practices 100; desktop 100 / 100 / 100 with LCP 0.6s. Initial JavaScript is about 95 KB gzipped, and the sphere is a separate 9 KB chunk. **SEO scores 66 on purpose**, because the page carries a pre-launch `noindex` and `robots.txt` disallows everything; both are removed at launch. Lighthouse exits non-zero on Windows from a temp-directory cleanup error even when the run succeeded, so read the JSON rather than the exit code.

**Verifying effects.** With the preview server running, `node scripts/verify-effects.mjs` drives headless Chrome and checks every effect: the hero's fit at rest and pressed, reveals, the sphere and a drag, count-ups, magnet lines, dossier scroll isolation, in-page and deep links, the light theme, reduced motion and a touch phone, plus console errors, with screenshots saved to disk. Use it rather than the Browser pane for anything animated.

Two accessibility traps already hit and fixed: a `<dl>` may not contain `<p>` (use `<ul>` for figure grids), and a button's `aria-label` must contain its visible text or the accessible name mismatches.

## Design system facts

- Tokens live in `src/styles/globals.css`. Every hex is declared **once** in a light set (`--l-*`) and a dark set (`--d-*`); the theme rules only remap which set is active, so the two themes cannot drift. Tailwind sees them through `@theme inline`, which is what makes `bg-bg`, `text-muted`, `border-line` and `font-display` work.
- **The accent is per-theme, deliberately.** The brand orange `#ff6f37` fails WCAG AA on the light paper background (2.52:1), so light uses `#ea5f18` for graphics and `#bd3e0c` for accent text. Measured ratios: dark 17.65 body / 7.12 muted / 8.52 accent text; light 17.16 / 5.83 / 4.95, graphics 3.10, near-black on a solid accent button 5.79. Re-measure if any of these change.
- Theme state: `data-theme` on `<html>`, `system` removes the attribute so the media query applies. The inline script in `index.html` and `styleguide.html` applies the stored choice before first paint and must stay in sync with `applyTheme()` in `src/lib/theme.ts`.
- Fonts come from `@fontsource-variable/*` imported in the entry files. **Decided 2026-09-13:** display font is **Archivo** (Roboto Flex was the alternative and has been removed), and the mark is the **modular grid monogram**; the roundel stays reserved for the back of the lanyard badge, and the ligature is unused.

## Effects (Phase 3)

React Bits sources are **MIT + Commons Clause**: free to use and modify inside this website, not to be resold or redistributed as components. The licence text lives at `src/effects/LICENSE-react-bits.md`, and every adapted file names its origin and lists its local changes in a header comment.

| Section | Effect | File | Notes |
|---|---|---|---|
| Hero name | Text Pressure | `src/effects/PressureName.tsx` | Sized in CSS with `cqi` units, animates Archivo `wght` + `wdth` only for a fine pointer near the hero |
| Hero role line | Decrypted Text | `src/effects/DecryptLine.tsx` | Reveals the full line once; does not cycle roles, so all three stay readable |
| Every section heading | Word rise | `src/effects/SplitHeading.tsx` | CSS transitions on spans, not GSAP |
| Every section body | Fade and 12px rise | `src/effects/Reveal.tsx` | IntersectionObserver plus CSS |
| Work cards | Spotlight | `src/effects/spotlight.ts` | Pseudo-element placed by custom properties, no React state |
| Stack | Infinite Menu sphere | `src/effects/StackSphere.tsx` | Lazy chunk, desktop fine pointers only; the full list always renders below it |
| Numbers | Magnet Lines, count-up | `src/effects/MagnetField.tsx`, `CountUp.tsx` | Magnet field in its own band, never behind the figures |
| Whole page | Film grain | `body::before` in `globals.css` | Static SVG noise tile |
| Whole page | Smooth wheel scroll | `src/lib/smoothScroll.ts` | Lenis; overlays pause it and carry `data-lenis-prevent` |

**Deliberately not used, and why.** React Bits *Noise* redraws a million random pixels every other frame forever, so the grain is static CSS instead. *Glass Surface*, *Tilted Card* and *Counter* would pull in the Motion library for effects the nav's existing blur, the spotlight and a small count-up already cover. **GSAP** is not needed at all. The only animation dependencies are `lenis` and `gl-matrix`.

**Bugs fixed in the originals:** Decrypted Text hid its screen-reader copy with `visibility: hidden`, so nothing was announced. Infinite Menu never cancelled its render loop or removed listeners, so each re-render stacked another loop, and it set `touch-action: none`, which traps page scrolling on phones. Text Pressure sized itself in a debounced effect, so the hero painted at 24px and then jumped.

Every effect is static under `prefers-reduced-motion`, and content must still read correctly with every effect removed. Reveals hide content only after `main.tsx` adds `reveal-ready` to `<html>`.

**The initial render is split.** `App.tsx` renders the nav and hero immediately and mounts every other section in a React transition, which renders in small interruptible slices; that removed the largest long task on mobile. A URL that arrives with a hash renders everything at once and then scrolls to the section explicitly, because React's scheduled first render finishes after the browser's own anchor scroll has given up. The nav's scroll-spy waits for the sections via `useActiveSection(ids, enabled)`.

**Fonts are split by need.** Every page imports the weight-only `@fontsource-variable/archivo` (35 KB Latin). The width-axis file (88 KB) is registered in `globals.css` as its own family, `Archivo Pressure`, and applied to `.pressure-name` only inside a media query that mirrors the effect's gate: fine pointer, hover, at least 768px, motion allowed. Mobile and reduced-motion visitors never download it. Loading it for everyone pushed mobile LCP from 2.2s to 2.6s, because Lighthouse counts the fonts a text element needs toward its paint.

## Gotchas found the hard way

- **A `cd` in the Bash tool moves the working directory for every later call, PowerShell included.** On 2026-09-15 a `cd` into a package inside `node_modules` made the next `pnpm add` install into that package and register it in the project lockfile as a fake importer. Use absolute paths, or start PowerShell commands with `Set-Location C:\MyWebsite`, and check `package.json` after any install.
- **Repairing a tampered package under `node_modules/.pnpm`.** `pnpm install --force` does not overwrite a package directory that still exists, and plain `pnpm install` does not recreate one that was deleted: it answers "Already up to date" from its own state file. The working sequence is delete the directory with a literal path (the harness refuses a recursive delete whose target is a variable), then `pnpm install --force`. `pnpm remove` followed by `pnpm add` does not help, because pnpm keeps and reuses the virtual-store directory.
- **The Browser pane runs no animation frames and no IntersectionObserver callbacks while it is hidden.** Synchronous layout reads still work there, but anything driven by `requestAnimationFrame` (the pressure name, count-ups, the sphere) or by observers (reveals, lazy mounts) stalls, and screenshots time out. Verify effects in headless Chrome instead, over the DevTools protocol with Node's built-in `WebSocket`: no dependencies, real mouse input, reduced-motion and touch emulation, and screenshots saved to disk.
- **Lenis already honours `scroll-margin-top`.** Passing an `offset` as well doubles it: in-page links landed 192px down instead of 96px.
- **Below-the-fold sections use `content-visibility: auto`**, so their positions are estimates until they render. The smooth-scroll link handler re-checks the target on arrival and corrects, at most twice. Anything else that scrolls to a section programmatically needs the same care.
- **The built CSS is rewritten by Lightning CSS**, for example `min-width: 768px` becomes a range query, so check that a rule exists in the source, not by grepping `dist`.
- **Lighthouse mobile varies by several points between identical runs here** (total blocking time from 70ms to 320ms on the same build). Run it at least three times, never while another headless Chrome is busy, and quote the median. To compare against an earlier phase, build `main` in a git worktree and alternate runs between the two servers, so machine load hits both equally.
- **In DevTools-protocol tests, change emulation on `about:blank` before navigating.** Switching to reduced motion or a phone viewport and then navigating straight from a desktop page produced false positives, such as the 88 KB width font appearing to load on a phone. Clean loads, Lighthouse's included, never fetch it.
- **A git worktree under the Temp scratch folder cannot be fully removed afterwards.** `node_modules` exceeds Windows' path limit there, and native `.node` binaries stay locked. Put measurement worktrees on a short path, or accept the leftovers in the session temp folder.
- **`gh pr merge` can half-succeed.** On 2026-09-16 GitHub returned a 502 during a squash merge: the commit landed on `main`, but the pull request stayed open and no push event fired, so neither CI nor Cloudflare built it and production kept the old site. After any merge error, check `git ls-remote origin refs/heads/main`, the PR state, and whether a build started. Do not retry the merge once `main` already holds the change; close the PR with a note, and any normal push to `main` triggers the deploy.
- **`backdrop-filter` creates a containing block for fixed positioning.** The nav uses `backdrop-blur`, so an overlay rendered inside it was clipped to the 64px nav height while every DOM assertion still passed. `Sheet` therefore portals into `document.body`. Check overlays visually, not only through the DOM.
- The Bash tool mangles long multi-line heredocs; write source files with the Write tool instead.

## Environment quirks (Windows)

- **New tools are not on the PATH of already-open shells.** In PowerShell, refresh first:
  `$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")`
- Node 24 LTS is in `C:\Program Files\nodejs`. pnpm 12 was installed with `npm -g` (into `%AppData%\Roaming\npm`) because corepack could not write to Program Files.
- **Heredocs are bash-only.** PowerShell parses `<<'EOF'` as an error; use the Bash tool for multi-line file writes and commit messages.
- **`Set-Content -Encoding utf8` adds a BOM** in Windows PowerShell 5.1, which breaks YAML parsing. Write YAML/JSON with bash `printf`/heredoc or `[IO.File]::WriteAllText`.

## pnpm 12 notes

- Build-script approval is **not** in `package.json` any more. It lives in `pnpm-workspace.yaml` as `allowBuilds`, and it is a **mapping**, not a list:
  ```yaml
  allowBuilds:
    esbuild: true
    workerd: true
  ```
  Without it, `pnpm install` fails with `ERR_PNPM_IGNORED_BUILDS` and a non-zero exit, which breaks remote builds.
- The lockfile is pnpm 12 format. Any CI or build image must run pnpm 12, see the deploy variable below.

## Deployment

Static-only **Cloudflare Worker** (not Pages: the dashboard no longer exposes Pages when creating an application). Config in `wrangler.jsonc`, assets from `dist/`, `not_found_handling: "404-page"` serving `public/404.html`.

| Setting | Value |
|---|---|
| Worker name | `portfolio` — must match `name` in `wrangler.jsonc` |
| Production branch | `main` |
| Build command | `pnpm run build` |
| Deploy command | `npx wrangler deploy` |
| Non-production branches | `npx wrangler versions upload` (gives a preview URL per version) |
| Build variable | **`PNPM_VERSION=12.4.1`** — required; the build image ships pnpm 10.11.1, which cannot read a pnpm 12 lockfile |
| Node version | from `.node-version` (`24`); build image default is already 24.18 |

**DNS, decided 2026-09-13.** At Phase 6 the nameservers for sansysasy.com move to Cloudflare and the domain is attached to the Worker as a custom domain. **GoDaddy stays the registrar**: ownership, billing and renewal do not move, and this is not a domain transfer. Only which dashboard holds the DNS records changes. A Worker custom domain requires an active Cloudflare zone, so external DNS is not an option for the apex. No DNS change before Phase 6.

## Conventions

- **Commits:** conventional prefixes (`feat:`, `fix:`, `chore:`, `docs:`), imperative subject, body explaining why. End with the co-author trailer for the model that wrote it.
- **Git identity** is repo-local and uses the GitHub no-reply address, so no personal email lands in public history.
- Line endings are normalized to LF by `.gitattributes`. `.claude/settings.local.json` is machine-specific and ignored.
- `index.html` carries a **pre-launch `noindex`**. Removing it is the first item on the launch checklist.
- **Content rules:** first person, specific over generic. Employers may be named. **No client names, no screenshots.** Numbers are limited to what the public resume already states.
- **Design rules:** one signature animated effect per section; content must be excellent with every effect disabled; both light and dark themes are token-driven and must pass WCAG AA.
- Vendored React Bits components keep a header comment with origin URL, licence and the date vendored, and are patched locally (pixel-ratio cap, pause when off-screen, theme tokens, `aria-hidden`).
