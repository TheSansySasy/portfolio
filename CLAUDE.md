# CLAUDE.md

Working notes for this repo: conventions, environment quirks, and deployment facts that are easy to get wrong. The full spec is [PLAN.md](PLAN.md); this file is the short operational companion. Keep it updated as small decisions land.

## What this is

Single-page portfolio for **Sanskar Rai** (handle **SansySasy**), covering three pillars: Dynamics 365 F&O, Python and AI pipelines, Azure and operations. Live domain will be **sansysasy.com**. Currently at `https://portfolio.rai-sanskar304.workers.dev` with `noindex` set until launch.

**Phase status:** Phase 0 complete (scaffold, repo, deploy). Phase 1 (foundation) built on branch `phase-1-foundation`: tokens for both themes, fonts, theme toggle, layout shell, sheet overlay with hash deep links, three monogram drafts, styleguide, CI. Awaiting Sanskar's monogram and display-font picks.

## Commands

```bash
pnpm dev                          # dev server on :5173
pnpm build                        # tsc -b && vite build -> dist/
pnpm lint                         # oxlint
pnpm typecheck                    # tsc -b
pnpm exec wrangler deploy --dry-run   # validate wrangler.jsonc against dist/
```

Two pages: `/` is the site, `/styleguide.html` is the unlinked design review page (tokens, type scale, monogram options, headline candidates, components). Both are Vite entries declared in `vite.config.ts`.

## Design system facts

- Tokens live in `src/styles/globals.css`. Every hex is declared **once** in a light set (`--l-*`) and a dark set (`--d-*`); the theme rules only remap which set is active, so the two themes cannot drift. Tailwind sees them through `@theme inline`, which is what makes `bg-bg`, `text-muted`, `border-line` and `font-display` work.
- **The accent is per-theme, deliberately.** The brand orange `#ff6f37` fails WCAG AA on the light paper background (2.52:1), so light uses `#ea5f18` for graphics and `#bd3e0c` for accent text. Measured ratios: dark 17.65 body / 7.12 muted / 8.52 accent text; light 17.16 / 5.83 / 4.95, graphics 3.10, near-black on a solid accent button 5.79. Re-measure if any of these change.
- Theme state: `data-theme` on `<html>`, `system` removes the attribute so the media query applies. The inline script in `index.html` and `styleguide.html` applies the stored choice before first paint and must stay in sync with `applyTheme()` in `src/lib/theme.ts`.
- Fonts come from `@fontsource-variable/*` imported in the entry files. Roboto Flex is imported **only** by the styleguide, for the display-font comparison; drop the package once the font is chosen.

## Gotchas found the hard way

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
