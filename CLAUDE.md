# CLAUDE.md

Working notes for this repo: conventions, environment quirks, and deployment facts that are easy to get wrong. The full spec is [PLAN.md](PLAN.md); this file is the short operational companion. Keep it updated as small decisions land.

## What this is

Single-page portfolio for **Sanskar Rai** (handle **SansySasy**), covering three pillars: Dynamics 365 F&O, Python and AI pipelines, Azure and operations. Live domain will be **sansysasy.com**. Currently at `https://portfolio.rai-sanskar304.workers.dev` with `noindex` set until launch.

**Phase status:** Phase 0 complete (scaffold, repo, deploy). Phase 1 (foundation) not started.

## Commands

```bash
pnpm dev                          # dev server on :5173
pnpm build                        # tsc -b && vite build -> dist/
pnpm lint                         # oxlint
pnpm typecheck                    # tsc -b
pnpm exec wrangler deploy --dry-run   # validate wrangler.jsonc against dist/
```

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
