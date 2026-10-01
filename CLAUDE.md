# CLAUDE.md

Working notes for this repo: conventions, environment quirks, and deployment facts that are easy to get wrong. The full spec is [PLAN.md](PLAN.md); this file is the short operational companion. Keep it updated as small decisions land.

## What this is

Single-page portfolio for **Sanskar Rai** (handle **SansySasy**), a Python engineer working in cloud and DevOps, whose Dynamics 365 work in production is Business Central integration. Live domain will be **sansysasy.com**. Currently at `https://portfolio.rai-sanskar304.workers.dev` with `noindex` set until launch.

**Positioning rule (corrected 2026-09-14): never describe him as a D365 F&O consultant.** Tectura was functional training that earned MB-310; X++ and the thirteen extension modules are self-study; MB-500 is targeted for November 2026. The Copilot rollout was a real engagement. The role line is `Python Engineer · Cloud & DevOps · Dynamics 365 Integration`.

**Phase status:** Phases 0, 1 and 2 plus the positioning correction are merged to `main`. Phase 3 (effects) was merged to `main` on 2026-09-16 (PR #4). Phase 4 (heavy and custom effects) was merged to `main` on 2026-09-30 (PR #5), after he approved the badge design. **Phase 5a (repos, dossiers and downloads) was started on his go on 2026-10-01; its dossiers (3 to 6) were merged to `main` the same day (PR #6).** Still open in 5a: his review of the two clean-room showcase repos before they are published, and of the sanitised runbooks before they are linked. **Phase 5b is cancelled** (see the cost rule below). After 5a comes launch (Phase 6), on his go.

**Cost rule (decided 2026-10-01): nothing that costs money to keep running.** Sanskar will not maintain a VPS, a paid AI API key or an F&O development VM for a portfolio. So: no `api/` service, no live demo, no contact form backend, no recorded walkthroughs, no status page. The site is fully static on Cloudflare's free plan, contact is an email link, and anything proposed later has to fit that. Do not suggest features that need a server, a key or a VM. LinkedIn, the MB-310 credential link and the MB-500 target are in. Sanskar deferred his proofread of the Phase 2 copy to later; expect corrections to arrive at any point. The contact address stays the resume one (`sanskarrai@hotmail.com`) until a mailbox exists on the domain.

## Commands

```bash
pnpm dev                          # dev server on :5173
pnpm build                        # tsc -b && vite build -> dist/
pnpm lint                         # oxlint
pnpm typecheck                    # tsc -b
pnpm exec wrangler deploy --dry-run   # validate wrangler.jsonc against dist/
node scripts/render-og.mjs        # re-render public/og.png after changing the name, role line or palette
node scripts/render-runbooks.mjs  # re-render public/runbooks/*.pdf after editing runbooks/*.md
```

Two pages: `/` is the site, `/styleguide.html` is the unlinked design review page (tokens, type scale, monogram options, headline candidates, components, and the lanyard badge's artwork laid flat in the active theme). Both are Vite entries declared in `vite.config.ts`. On the deployed Worker the styleguide is served at `/styleguide`, since static assets drop the `.html`.

**Measuring the site.** Build first, then serve `dist/` and audit it. Chrome is at `C:\Program Files\Google\Chrome\Application\chrome.exe`; set `CHROME_PATH` to it.

```bash
pnpm build
node node_modules/vite/bin/vite.js preview --port 4173 --strictPort
pnpm dlx lighthouse@latest http://localhost:4173/ --preset=desktop --chrome-flags="--headless=new"
```

Last measured on the Phase 4 build, 2026-09-30, as the median of five mobile runs alternated with a same-day build of `main` (Phase 3): mobile performance 94 (range 91–95) against 94 (92–96), LCP 2.43s against 2.43s, TBT 109ms against 112ms, CLS 0 for both; accessibility and best practices 100; desktop 100 / 100 / 100 with LCP 0.62s over three runs. The lanyard chunk was requested in none of the runs. Initial JavaScript is about 105 KB gzipped (Phase 3: 95 KB); the sphere is a separate 9 KB chunk and the lanyard a 260 KB one plus the 139 KB model. **SEO scores 66 on purpose**, because the page carries a pre-launch `noindex` and `robots.txt` disallows everything; both are removed at launch. Lighthouse exits non-zero on Windows from a temp-directory cleanup error even when the run succeeded, so read the JSON rather than the exit code.

**Verifying effects.** With the preview server running, `node scripts/verify-effects.mjs` drives headless Chrome and checks every effect: the hero's fit at rest and pressed, reveals, the sphere and a drag, count-ups, magnet lines, the heat map, the failover sequence step by step, the lanyard (not fetched before input, column height unchanged, comes to rest, drag, cursor restored), the particle heading (live, scatters, returns exactly home, stops), both calculators' arithmetic, dossier scroll isolation, in-page and deep links, the light theme, reduced motion and a touch phone, plus console errors, with screenshots saved to disk. Use it rather than the Browser pane for anything animated. It uses the GPU (`VERIFY_SWIFTSHADER=1` for the software renderer), counts WebGL draws and 2D fills from page start to prove loops stop at rest, gives every navigation and evaluation its own timeout, and on the overall guard (`VERIFY_TIMEOUT_MS`, default 8 minutes) writes a partial report naming the stage it stopped in. The CDP client is shared with `render-og.mjs` in `scripts/lib/cdp.mjs`. Against production on 2026-09-30, the deep-link check once reported `#contact` 2,201px down instead of 96px; the rerun and three isolated probes all landed at 96, so treat a single miss there as a slow-load flake and rerun before chasing it.

Two accessibility traps already hit and fixed: a `<dl>` may not contain `<p>` (use `<ul>` for figure grids), and a button's `aria-label` must contain its visible text or the accessible name mismatches.

## Design system facts

- Tokens live in `src/styles/globals.css`. Every hex is declared **once** in a light set (`--l-*`) and a dark set (`--d-*`); the theme rules only remap which set is active, so the two themes cannot drift. Tailwind sees them through `@theme inline`, which is what makes `bg-bg`, `text-muted`, `border-line` and `font-display` work.
- **The accent is per-theme, deliberately.** The brand orange `#ff6f37` fails WCAG AA on the light paper background (2.52:1), so light uses `#ea5f18` for graphics and `#bd3e0c` for accent text. Measured ratios: dark 17.65 body / 7.12 muted / 8.52 accent text; light 17.16 / 5.83 / 4.95, graphics 3.10, near-black on a solid accent button 5.79. Re-measure if any of these change.
- Theme state: `data-theme` on `<html>`, `system` removes the attribute so the media query applies. The inline script in `index.html` and `styleguide.html` applies the stored choice before first paint and must stay in sync with `applyTheme()` in `src/lib/theme.ts`.
- Fonts come from `@fontsource-variable/*` imported in the entry files. **Decided 2026-09-13:** display font is **Archivo** (Roboto Flex was the alternative and has been removed), and the mark is the **modular grid monogram**; the roundel stays reserved for the back of the lanyard badge, and the ligature is unused.

## Effects (Phases 3 and 4)

React Bits sources are **MIT + Commons Clause**: free to use and modify inside this website, not to be resold or redistributed as components. The licence text lives at `src/effects/LICENSE-react-bits.md`, and every adapted file names its origin and lists its local changes in a header comment.

| Section | Effect | File | Notes |
|---|---|---|---|
| Hero name | Text Pressure | `src/effects/PressureName.tsx` | Sized in CSS with `cqi` units, animates Archivo `wght` + `wdth` only for a fine pointer near the hero |
| Hero role line | Decrypted Text | `src/effects/DecryptLine.tsx` | Reveals the full line once; does not cycle roles, so all three stay readable |
| Every section heading | Word rise | `src/effects/SplitHeading.tsx` | CSS transitions on spans, not GSAP |
| Every section body | Fade and 12px rise | `src/effects/Reveal.tsx` | IntersectionObserver plus CSS |
| Work cards | Spotlight | `src/effects/spotlight.ts` | Pseudo-element placed by custom properties, no React state |
| Stack | Infinite Menu sphere | `src/effects/StackSphere.tsx` | Lazy chunk, desktop fine pointers only; the full list always renders below it. Zoomed out to twice the original's view (`VIEW_HEIGHT` 0.7) so four or five tools show at once, with a gentler pull-back while dragging (Sanskar, 2026-09-30) |
| Numbers | Magnet Lines, count-up | `src/effects/MagnetField.tsx`, `CountUp.tsx` | Magnet field in its own band, never behind the figures |
| Whole page | Film grain | `body::before` in `globals.css` | Static SVG noise tile |
| Whole page | Smooth wheel scroll | `src/lib/smoothScroll.ts` | Lenis; overlays pause it and carry `data-lenis-prevent` |
| About | Lanyard badge (Phase 4) | `src/effects/lanyard/` | React Bits adapted; own Verlet rope, runtime textures, gate below |
| Contact heading | Particle text (Phase 4) | `src/effects/ParticleHeading.tsx` | Custom 2D canvas over the real `<h2>`, desktop fine pointers, stops at rest |
| Operations | Failover simulation (Phase 4) | `src/sims/FailoverSim.tsx` | Replaced the static topology diagram; buttons plus a polite live region |
| Numbers | Heat-map calendar (Phase 4) | `src/viz/HeatMapCalendar.tsx` | Static SVG; the daily shape is illustrative and says so, the 26,000 total is real |
| Dossiers | Slab and token calculators (Phase 4) | `src/sims/SlabPricingCalc.tsx`, `TokenCostCalc.tsx` | Illustrative credit rates and editable example prices, labelled as such |
| 404 page | Letter glitch (Phase 4) | `public/404.html` | Plain JS, written from scratch; redraws changed cells only |

**The lanyard, in detail.** The chunk (about 260 KB gzipped: three, React Three Fiber, meshline, the QR encoder) is fetched only when all of these hold: a fine pointer that hovers, a window at least **1024px** wide, motion allowed, WebGL 2, About within 600px, and **the visitor has already moved, clicked, scrolled a wheel or pressed a key** (`useFirstInteraction`). A bare page load, Lighthouse's included, never requests it. The column reserves its height (`.lanyard-slot`, 40rem) from the first render, so the swap from the static badge causes no layout shift. The static `Badge` (`src/ui/Badge.tsx`) is the column everywhere else, the placeholder while loading, and stays in the DOM as `sr-only` once the canvas is live. Any failure inside the scene falls back to it through an error boundary.
- **Physics is a 5-particle Verlet rope** (`ropePhysics.ts`), not Rapier. `@react-three/rapier` inlines its WASM, which made the chunk 1.1 MB gzipped; the rope is about 150 lines. Drags are spread across substeps so a release keeps its velocity (a fling), release speed is capped, the drag target and the free card are held inside the view by soft walls, and the card's turn about its own axis has **two resting faces**: sideways speed kicks it, a fast spin turns freely and settles on the nearer face, and **a click flips it** and it stays flipped, so the QR can be scanned (Sanskar could not reach the back when it always swung home). A "Drag to swing · click to flip" hint shows under the card once it is live.
- **No drei.** The model loads through three's `GLTFLoader`, and the environment is a PMREM of the original's light strips around a dim grey room. The original's fourth light (a big panel at intensity 10) sits almost behind the camera; its clearcoat reflection turned the dark card mid-grey, so it was replaced by a soft light above.
- **Textures are drawn at runtime** from the theme tokens in `badgeArt.ts`: a 1536 x 1423 colour atlas (both faces), a half-size material atlas (red iridescence, green roughness, blue metalness: the foil stripe on the front and the roundel ring on the back are polished metal with a thin film), and the strap print. The atlas is not square so a card unit is square on the model. Face placement comes from UV coefficients fitted to `card.glb` (error under 0.0003); the back is upright and not mirrored when the card turns. The QR on the back links LinkedIn and is always dark modules on a light panel, because many scanners cannot read an inverted code. On the light card the small labels are drawn heavier (800) and darker (70% from muted to text), because texture filtering and the room light washed thin grey type out; the dark card keeps the muted token.
- `card.glb` had its 2.3 MB embedded texture resized away and was pruned with `@gltf-transform/cli` (2.4 MB to 139 KB). Quantizing would save another 37 KB but moves transforms onto the nodes, and the scene uses the raw geometries.
- Rendering is **on demand** (`frameloop="demand"`): frames run while the rope moves or the card is held, never while the canvas is off screen, and the scene comes to rest about 4 seconds after a swing.

**Deliberately not used, and why.** React Bits *Noise* redraws a million random pixels every other frame forever, so the grain is static CSS instead. *Glass Surface*, *Tilted Card* and *Counter* would pull in the Motion library for effects the nav's existing blur, the spotlight and a small count-up already cover. **GSAP** is not needed at all. For the lanyard, **Rapier** and **drei** were installed, measured and removed (above). The animation dependencies are `lenis` and `gl-matrix` (Phase 3), and `three`, `@react-three/fiber`, `meshline` and `uqr` (Phase 4, lanyard chunk only).

**Bugs fixed in the originals:** Decrypted Text hid its screen-reader copy with `visibility: hidden`, so nothing was announced. Infinite Menu never cancelled its render loop or removed listeners, so each re-render stacked another loop, and it set `touch-action: none`, which traps page scrolling on phones. Text Pressure sized itself in a debounced effect, so the hero painted at 24px and then jumped. Lanyard ran its render loop forever and woke the card on every frame (`setAngvel(..., true)`), so the physics never slept, allocated its scratch vectors on every render, and could overshoot its band smoothing after a long frame.

**Particle heading.** The `<h2>` renders exactly like `SplitHeading`; the canvas samples the browser's own layout of each word (`offsetTop` ignores the rise transform, and the baseline is placed from the font's ascent inside the line box), so the squares land on the real glyphs. The words turn transparent (`[data-particles='live']`) only after the canvas has drawn, and the canvas hides in forced-colours mode.

Every effect is static under `prefers-reduced-motion`, and content must still read correctly with every effect removed. Reveals hide content only after `main.tsx` adds `reveal-ready` to `<html>`.

**The initial render is split.** `App.tsx` renders the nav and hero immediately and mounts every other section in a React transition, which renders in small interruptible slices; that removed the largest long task on mobile. A URL that arrives with a hash renders everything at once and then scrolls to the section explicitly, because React's scheduled first render finishes after the browser's own anchor scroll has given up. The nav's scroll-spy waits for the sections via `useActiveSection(ids, enabled)`.

**Fonts are split by need.** Every page imports the weight-only `@fontsource-variable/archivo` (35 KB Latin). The width-axis file (88 KB) is registered in `globals.css` as its own family, `Archivo Pressure`, and applied to `.pressure-name` only inside a media query that mirrors the effect's gate: fine pointer, hover, at least 768px, motion allowed. Mobile and reduced-motion visitors never download it. Loading it for everyone pushed mobile LCP from 2.2s to 2.6s, because Lighthouse counts the fonts a text element needs toward its paint.

## Dossiers (Phase 5a)

- All six case studies are written. Each is a module in `src/dossiers/` and **its own lazy chunk** (`DossierBody.tsx`), so none of them is in the first download; moving them out took the main chunk from 31 KB to 17 KB gzipped.
- **Content comes only from the two resumes and Sanskar's own statements.** Code samples are labelled as simplified or written for the page, with names generalised; they show patterns, not transcripts. "AgentF1n" (a Runtime Solutions project name on the resume) is left out as a possible client name. The D365 dossier keeps the positioning rule: Tectura was functional training, X++ is self-study, the Copilot rollout was a real engagement.
- New diagrams use `src/diagrams/FlowDiagram.tsx`: boxes, links, notes and dashed groups as data, in the same house style as the hand-drawn Phase 2 diagrams, with a full-sentence `aria-label`. Give a box an `id` when two share a title.
- `CodeBlock` puts each margin note **under its line** whenever any line in the block is longer than 52 characters, because at the dossier's width a longer line beside a note needed its own sideways scrollbar.
- The GitHub profile README is drafted at `docs/github-profile/README.md`; it is published to `TheSansySasy/TheSansySasy` at launch, not before.
- **Worked extraction example** (`src/sims/ExtractionExample.tsx`, AI platform dossier): the free stand-in for the cancelled live demo. A made-up invoice, the JSON extracted from it, the checks, and the recorded cost, all fixed in the page; a second case misreads the total and is held for review. Its sample and its validation message match the `docflow-extract` repo, and its prices match the token calculator.

## Runbooks (Phase 5a)

Three PDF downloads, sanitised from documents Sanskar wrote and shared on 2026-10-01: Copilot enablement and PPAC provisioning with the Unified Developer Experience (D365 dossier), and App Service scale up and down (migration dossier). Sources are Markdown with a small front-matter block in `runbooks/`; `scripts/render-runbooks.mjs` typesets them to A4 through headless Chrome's print-to-PDF with the site's fonts embedded, into `public/runbooks/`. The PDFs are committed, so the Cloudflare build needs no Chrome. `src/content/data/runbooks.ts` lists them (update `pages` after a re-render) and `src/ui/RunbookList.tsx` draws the download cards.

- **The sources are public with the rest of this repo.** They must hold no client name, tenant, address, account, environment name, organisation or environment ID, capacity or licence count, local user path, or screenshot. His originals stay outside the repo. After editing a runbook, grep the working tree for the identifiers in the original before committing, and never write those identifiers into any file here, this one included.
- What was changed beyond removing identifiers, for him to confirm: the scale-down script's retry loop was rebuilt (the original described one and logged an attempt number, but the pasted code had no loop), and one SKU name's capitalisation was made consistent. The claim that Lifecycle Services is closed to new implementations from January 2026 is his, kept as written.
- His wizard-generated domain controller script became `scripts/New-AdForest.ps1` in the `azure-sql-ag-runbook` showcase repo, with the domain names as parameters.

## Showcase repositories (Phase 5a)

**Decided 2026-10-01:** the showcase repos are **clean-room reference implementations**, written from scratch with no EBT code, and Sanskar reviews each one before anything is made public. They live in `showcase/<repo>/`, which the portfolio's `.gitignore` excludes; each is its own git repo with the same no-reply identity, committed locally and **not pushed**. Creating the GitHub repos and pushing is an outward action that waits for his go; link them from the dossiers and footer only once they are public.

| Repo | State | Checks |
|---|---|---|
| `docflow-extract` | Built. FastAPI, pluggable Gemini and Claude providers plus a fake, validation before delivery, one documents table for pages, rows, tokens and cost, stubbed SharePoint, SFTP and Business Central connectors (BC payload mapping implemented) | `uv run pytest` (14 pass), `uv run ruff check`, smoke-tested end to end. Docker Compose written but not run: no Docker on this machine |
| `azure-sql-ag-runbook` | Built. Bicep (two zonal SQL 2022 VMs, internal LB with floating IP and probe 59999, cloud witness storage), build and failover docs, the Kerberos and CAU guide, monitoring notes, three PowerShell scripts | `bicep build` and `bicep lint` clean (Bicep CLI 0.47 installed via `az bicep install`); scripts parse and their decision logic passes in Windows PowerShell 5.1. The Pester 5 suite runs in its CI, since only Pester 3.4 is installed here. Never deployed |
| `d365-fo-extension-patterns` | **Optional, not scheduled.** Only if Sanskar wants to publish his own practice code; never written clean-room, since it would stand for his learning, and never built from his training book, which is someone else's material |

The downloadable runbooks come from **his own documents**, shared for sanitising on 2026-10-01 (see Runbooks above). There is no separate Always On runbook: that role is filled by the `azure-sql-ag-runbook` repo once it is public.

- `uv` creates each Python repo's `.venv` inside `showcase/`; use `uv run` from the repo folder, and `cd` back to `C:MyWebsite` afterwards (the Bash tool keeps the directory).
- In the Python repo, usage months are UTC calendar months; a smoke test on 1 October in Delhi was still September in UTC.

## Gotchas found the hard way

- **A `cd` in the Bash tool moves the working directory for every later call, PowerShell included.** On 2026-09-15 a `cd` into a package inside `node_modules` made the next `pnpm add` install into that package and register it in the project lockfile as a fake importer. Use absolute paths, or start PowerShell commands with `Set-Location C:\MyWebsite`, and check `package.json` after any install.
- **Repairing a tampered package under `node_modules/.pnpm`.** `pnpm install --force` does not overwrite a package directory that still exists, and plain `pnpm install` does not recreate one that was deleted: it answers "Already up to date" from its own state file. The working sequence is delete the directory with a literal path (the harness refuses a recursive delete whose target is a variable), then `pnpm install --force`. `pnpm remove` followed by `pnpm add` does not help, because pnpm keeps and reuses the virtual-store directory.
- **The Browser pane runs no animation frames and no IntersectionObserver callbacks while it is hidden.** Synchronous layout reads still work there, but anything driven by `requestAnimationFrame` (the pressure name, count-ups, the sphere) or by observers (reveals, lazy mounts) stalls, and screenshots time out. Verify effects in headless Chrome instead, over the DevTools protocol with Node's built-in `WebSocket`: no dependencies, real mouse input, reduced-motion and touch emulation, and screenshots saved to disk.
- **Lenis already honours `scroll-margin-top`.** Passing an `offset` as well doubles it: in-page links landed 192px down instead of 96px.
- **Below-the-fold sections use `content-visibility: auto`**, so their positions are estimates until they render. The smooth-scroll link handler re-checks the target on arrival and corrects, at most twice. Anything else that scrolls to a section programmatically needs the same care.
- **The built CSS is rewritten by Lightning CSS**, for example `min-width: 768px` becomes a range query, so check that a rule exists in the source, not by grepping `dist`.
- **Lighthouse mobile varies by several points between identical runs here** (total blocking time from 70ms to 320ms on the same build). Run it at least three times, never while another headless Chrome is busy, and quote the median. To compare against an earlier phase, build `main` in a git worktree and alternate runs between the two servers, so machine load hits both equally.
- **In DevTools-protocol tests, change emulation on `about:blank` before navigating.** Switching to reduced motion or a phone viewport and then navigating straight from a desktop page produced false positives, such as the 88 KB width font appearing to load on a phone. Clean loads, Lighthouse's included, never fetch it.
- **A git worktree under the Temp scratch folder cannot be fully removed afterwards.** `node_modules` exceeds Windows' path limit there, and native `.node` binaries stay locked. A short path fixes the length problem but not the lock: on 2026-09-30, `C:\wt\main` kept `rolldown-binding.win32-x64-msvc.node` locked after its preview server had stopped, and the harness refuses to delete a top-level folder such as `C:\wt`. `git worktree prune` still unregisters it; delete the leftover folder by hand after a reboot, or reuse it for the next measurement.
- **`gh pr merge` can half-succeed.** On 2026-09-16 GitHub returned a 502 during a squash merge: the commit landed on `main`, but the pull request stayed open and no push event fired, so neither CI nor Cloudflare built it and production kept the old site. After any merge error, check `git ls-remote origin refs/heads/main`, the PR state, and whether a build started. Do not retry the merge once `main` already holds the change; close the PR with a note, and any normal push to `main` triggers the deploy.
- **`backdrop-filter` creates a containing block for fixed positioning.** The nav uses `backdrop-blur`, so an overlay rendered inside it was clipped to the 64px nav height while every DOM assertion still passed. `Sheet` therefore portals into `document.body`. Check overlays visually, not only through the DOM.
- The Bash tool mangles long multi-line heredocs; write source files with the Write tool instead.
- **Backticks inside `node -e "..."` in the Bash tool are command substitution.** A scripted edit containing template literals silently wrote nothing on 2026-09-30. For scripted edits, feed Node a quoted heredoc (`node - <<'EOF'`), or use the Edit tool.
- **Headless Chrome's default WebGL is SwiftShader, a software renderer.** It drew the lanyard's physical material at about 5 frames a second, a screenshot took 20 seconds, and the time-step clamp turned the simulation into slow motion that never settled inside a test. With `--use-angle=d3d11` the integrated Intel GPU held 61 fps. `launchChrome({ gpu: true })` in `scripts/lib/cdp.mjs`; the verifier defaults to it.
- **MeshLine's `lineWidth` is in clip space, not world units.** At `sizeAttenuation` 1 the on-screen width is `lineWidth / distance` of the half-height, so the strap first rendered 12px wide. The world width divided by `tan(fov / 2)` gives the right value (`STRAP_LINE_WIDTH` in `Lanyard.tsx`).
- **`useInView` observes the element its ref holds at mount.** A ref attached to an element that only renders later is never observed, so the effect waits forever. Put the ref on a wrapper that always renders, as `LanyardBadge` does.
- **`Page.captureScreenshot` clips are in document coordinates**, not viewport ones. Add `scrollX` and `scrollY` to a `getBoundingClientRect()`, or the capture comes back blank.
- **oxlint's React rules fire on R3F idioms.** Assigning `scene.environment` from `useThree` counts as mutating a hook value (read it through `get()` inside the effect), a simulation object kept in `useState` and mutated counts too (keep it in a ref, touched only from callbacks and `useFrame`), and probing WebGL with `setState` in an effect counts as a cascading render (probe once into a module variable).
- **R3F pointer handlers on a group run once per intersection.** The card is double-sided, so a ray hits both faces and every handler ran twice: a click flipped the card and flipped it straight back. Call `event.stopPropagation()` in handlers that change state.
- React Three Fiber 9.8 logs a `THREE.Clock` deprecation warning with three r186. It is a warning from the library, not an error, and the verifier only collects errors.

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
