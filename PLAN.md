# Sanskar Rai — Portfolio Website Plan

Status: **PLAN v1.2, 2026-09-11.** Single-page revision plus the deployment route (section 10.1). **Phase 0 complete 2026-09-11**: Vite + React + TypeScript scaffold, repo at github.com/TheSansySasy/portfolio. Next: Phase 1.
Remaining open items are in section 15.

---

## 1. Decisions log

| # | Question | Decision |
|---|---|---|
| 1 | Primary audience | Undecided; shared equally with everyone. Site stays balanced across D365, Python/AI, and Azure/DevOps |
| 2 | Direction | Option A: Swiss structure on a neo-futurist canvas. **Both dark and light themes** |
| 3 | Confidentiality | No client names, no screenshots. Numbers are fine. Employers (EBT, Runtime Solutions, Tectura) may be named |
| 4 | Showcase repos | Yes, three sanitized public repos |
| 5 | Badge image | No photo. **Monogram** |
| 6 | Domain / hosting | **sansysasy.com**, registrar **GoDaddy**. Canonical URL `https://sansysasy.com`. Hosting confirmed at launch |
| 7 | Particle text | **Custom canvas build.** Nothing purchased |
| 8 | Evil Eye | **Dropped.** Was only an idea. Operations section uses a failover simulation instead |
| 9 | Blog | **Not now.** A blog later would live on a subdomain |
| 10 | Node.js | Claude installs it at Phase 0 start, on go |
| 11 | Name | **Sanskar Rai** primary; **SansySasy** as handle (former gamer tag) |
| 12 | Voice | **First person, personal** |
| 13 | Site shape | **Single page** with anchor navigation. Case studies are overlays, not routes |
| 14 | Framework | **Vite + React 19 + TypeScript strict + Tailwind v4**, static output. No server-side rendering |
| 15 | Case studies | **Overlay dossier**, hash deep-linked |
| 16 | Extra showcase methods | **Live sanitized demo, recorded X++ walkthroughs, on-page simulations, annotated code walkthroughs.** Plus the defaults: write-ups, repos, downloadable runbooks, a recommendations slot |
| 17 | Headline | Undecided. Shortlist kept in section 2; decided in Phase 2 with real copy around it |
| 18 | Repo name | `portfolio`, at github.com/TheSansySasy/portfolio, public |
| 19 | LinkedIn URL, Credly link | Given later, non-blocking |
| 20 | Monogram | Claude drafts three SVG directions in Phase 1; Sanskar refines in chat or in Inkscape / Figma |

---

## 2. Brand and positioning

**Name system.**
- *Sanskar Rai*: the name everywhere a human reads it (hero, title tag, JSON-LD, resume PDFs).
- *SansySasy*: the handle. Mono, `@SansySasy`. Nav right corner, footer, badge back, lanyard strap print, 404 page, console easter egg, social links. About tells the one-line origin story: a gamer tag that stuck.
- *SR monogram*: the mark. Favicon, nav logo, badge front, Open Graph image, repo READMEs. Three directions drafted as SVG in Phase 1, pick one:
  1. Typographic SR ligature in Archivo.
  2. Modular SR on a 5x5 grid, reads "systems".
  3. Roundel: SR centered, `SANSKAR RAI · SANSYSASY` around the ring (doubles as the badge back).
  If Sanskar wants to hand-tweak: Inkscape (free, best for SVG on Windows), Figma or Penpot (free, browser), Canva, Affinity Designer (paid). Fastest coherent route: start from Archivo letterforms, then customize.

**Positioning (balanced, one identity).**
- Three pillars, always shown together in this order: **Dynamics 365** (F&O, X++, Business Central integration) · **Python & AI pipelines** (FastAPI, LLM extraction, billing systems) · **Azure & operations** (SQL Server Always On, CI/CD, Linux).
- No site-wide mode. A lightweight **lens filter** on the Work and Stack sections: `All · D365 · Engineering · Cloud`. Default All.

**Headline shortlist (decide in Phase 2; all five previewable in the styleguide entry).**
1. "I build and run the systems behind the ERP."
2. "Dynamics 365 on top. Python and Azure underneath."
3. "I make ERPs talk to AI, and keep the servers up."
4. "From X++ to FastAPI to failover."
5. "ERP consultant who also runs the servers."
Rule: under ten words, says what you do; the decrypting role line beneath carries the three titles.

**Voice rules.** First person. Short sentences. Specific over generic: name the error code, the count, the tool. War stories welcome. No buzzwords. Light humor fine. Every section answers "what did I actually do" before "what do I know".

---

## 3. Design system

### 3.1 Direction
Swiss / International Typographic Style for structure; neo-futurism for atmosphere. Glassmorphism only for the nav and cards floating over graphics. Holographic foil only on the badge and hover states. Thermal heat-map colors as the data language.

### 3.2 Two themes
| Token | Dark (neo-futurist canvas) | Light (Swiss paper) |
|---|---|---|
| `--bg` | `#0A0A0B` | `#F5F4F0` |
| `--surface` | `#121214` | `#FFFFFF` |
| `--line` | `#262629` | `#D9D7D0` |
| `--text` | `#F2F2F0` | `#111111` |
| `--muted` | `#9B9B9B` | `#5F5F5A` |
| `--accent` (graphics) | `#FF6F37` | `#FF6F37` |
| `--accent-text` (AA on bg) | `#FF8A5B` | `#C9450F` |
| `--thermal` ramp | `#1B1F8A` `#7A1FA2` `#C2189A` `#FF6F37` `#FFD166` | same |
| `--holo` | conic gradient, cyan / magenta / lime / violet | same, slightly lower saturation |
| Noise overlay | 6% opacity | 3% opacity |

- Theme mechanics: a small theme hook (about 30 lines) plus a no-flash inline script in `index.html`; `data-theme` on `<html>`; default follows system preference; manual toggle in the nav persisted in local storage. Tailwind v4 `@theme` tokens as CSS variables; effects read colors through `useThemeTokens()` so canvases and WebGL repaint on toggle.
- The Open Graph image is a single designed dark-theme PNG.
- Both themes pass WCAG AA for text; the raw orange is only for large graphics.

### 3.3 Typography
- **Display:** *Archivo* variable (width 62-125, weight 100-900, italic) for the hero and headings. Swiss grotesque character, and it has the axes Text Pressure needs. Alternative for a more extreme squeeze: *Roboto Flex*. Decided in Phase 1 with a side-by-side test.
- **Body:** *Inter* variable. **Mono:** *JetBrains Mono*.
- Self-hosted via `@fontsource-variable/archivo`, `@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono`; Latin subset; display font preloaded in `index.html`.
- Scale: fluid via `clamp()`; hero name up to 14vw; headings 40-72px; body 17-18px; mono labels 12-13px, uppercase, wide tracking.

### 3.4 Grid and layout
12 columns, max width 1440px, 24px gutters, 80-160px section spacing. Every section opens with a mono index and label (`02 / ABOUT`), a 1px rule, an Archivo heading, optional one-line lede. Asymmetric two-column compositions on desktop; single column under 768px.

### 3.5 Motion system
- GSAP + ScrollTrigger for scroll reveals and pinning; Motion for component micro-interactions; Lenis smooth scroll at low strength, also used for anchor scrolling.
- `prefers-reduced-motion`: Lenis off, reveals instant, anchors jump, every effect renders its static fallback.
- **One signature effect per section.** Each section has exactly one attention-grabbing animated element; everything else in it is quiet (opacity plus 12px reveals only). Reasons: one focal point for the eye; each WebGL or canvas effect costs frames and two at once stutter on a laptop; the page reads as designed, not as a demo reel.

---

## 4. Effects: final list, placement, theme behavior, fallback

| # | Effect | Source | Placement | Theme behavior | Fallback |
|---|---|---|---|---|---|
| 1 | **Text Pressure** | React Bits, no deps | Hero: `SANSKAR RAI` | `textColor` from tokens | Static heavy weight |
| 2 | **Decrypted Text** | React Bits, motion | Hero role line cycling `D365 F&O CONSULTANT` / `PYTHON ENGINEER` / `AZURE & DEVOPS`; lens filter transitions; 404 | Token colors | Plain text |
| 3 | **Magnet Lines** | React Bits, no deps | Background of "By the numbers" | Line color from tokens | Static lines |
| 4 | **Infinite Menu** | React Bits, gl-matrix | Stack: draggable sphere of tech logo tiles, each with a one-line note and link | Logos drawn onto a runtime canvas atlas in the theme tile color; `backgroundColor` from tokens | Grouped chip grid; a screen-reader list always in the DOM |
| 5 | **Lanyard** | React Bits: three, R3F, drei, rapier, meshline | About: swinging badge. Front: monogram, name, title, `MB-310`. Back: roundel + QR to LinkedIn. Strap printed `SANSYSASY · SANSKAR RAI ·` | Two texture sets swapped on toggle; transparent canvas | Tilted Card with the badge image. Desktop and pointer-fine only |
| 6 | **Particle Text** | **Custom**, canvas, zero deps | Contact: `LET'S TALK` assembles from particles, scatters from the cursor, reforms | Particle color from tokens | Static text |

Supporting pieces, all free or custom: **Glass Surface** nav · **Spotlight Card** and **Tilted Card** for work cards · **Split Text** (GSAP) for headings entering · **Noise** grain overlay, opacity per theme · **Counter** for numbers · **Letter Glitch** behind the 404 · **Always On failover simulation** (custom SVG + Motion) in the Operations section: two SQL nodes, a listener, a witness, heartbeat pulses, click the primary to fail it and watch the listener move · **Heat-map calendar** (custom SVG, 52 x 7, thermal ramp) · **Slab-pricing calculator** and **LLM token-cost calculator** inside dossiers · **Architecture diagrams** (custom SVG, theme-aware).

Vendoring rule: React Bits components are copy-paste sources. They live under `src/effects/` with a header comment (origin URL, MIT, date vendored) and get patched locally: devicePixelRatio cap at 2, pause when off-screen, theme token support, `aria-hidden`. The Lanyard's `card.glb` and textures load through Vite `?url` imports.

Hero background: no WebGL. A faint Swiss crosshair grid at low opacity in both themes. The hero must paint instantly.

---

## 5. Framework and stack (final)

**Vite · React 19 · TypeScript strict · Tailwind CSS v4 · vendored React Bits (TS-Tailwind variants) · GSAP + ScrollTrigger · Motion · Lenis · gl-matrix (Infinite Menu) · three, React Three Fiber, drei, rapier, meshline (Lanyard only) · Shiki for annotated code · zod for content metadata · Playwright + axe for tests.**

Why Vite for a single page: with one page and no blog, the reasons for Next.js (static generation per route, per-route metadata, MDX routing) no longer apply. Vite outputs a static folder that any host serves, including Nginx on Sanskar's VPS with no Node process. React Bits' own site is built on Vite. No hydration edge cases for six canvases. Trade-offs accepted: client rendering with full static meta tags (optional prerender later); a blog later means a separate site on a subdomain.

Rendering rules: every WebGL or canvas component is lazy-imported, mounted when its section is within one viewport, paused or unmounted when it leaves.

Tooling: pnpm · ESLint + Prettier · Husky + lint-staged · GitHub Actions (typecheck, lint, build, Playwright smoke + axe, Lighthouse CI; a separate job deploys `api/` over SSH) · conventional commits.

### Project structure
```
C:\MyWebsite
  index.html                 meta + OG tags, JSON-LD Person, theme no-flash script, font preload
  styleguide.html            second Vite entry, unlinked, noindex: tokens, type, components, headlines, both themes
  src/
    main.tsx  App.tsx
    ui/                      Container, Section, SectionLabel, Rule, Button, Chip, ThemeToggle, LensFilter, Sheet
    sections/                Nav, Hero, About, Experience, Work, Stack, Ops, Numbers, Certifications, Contact, Footer
    effects/                 vendored React Bits + custom ParticleText, origin header in each file
    diagrams/                DocPipeline, AlwaysOnTopology, BillingFlow, MigrationMap, ExtensionLayers
    sims/                    FailoverSim, SlabPricingCalc, TokenCostCalc
    viz/                     HeatMapCalendar, Counter, ThermalRamp
    dossiers/                one module per case study, Dossier layout, hash router
    content/data/            experience.ts, stack.ts, numbers.ts, certifications.ts, links.ts, headlines.ts
    lib/                     theme.ts, motion.ts, hooks (useInView, useReducedMotion, useThemeTokens, useHashRoute)
    styles/globals.css       @theme tokens for both themes, reset
  public/                    models/card.glb, textures/, logos/*.svg, resume/*.pdf, media/*.webm|mp4 + posters, og.png, monogram.svg, 404.html
  api/                       FastAPI service: contact + demo extraction, Dockerfile, systemd unit, rate limiting, Turnstile
  tests/                     Playwright smoke + axe + visual snapshots (2 themes x 3 breakpoints)
  .github/workflows/ci.yml
  PLAN.md
```

---

## 6. Single-page structure

### 6.1 Behavior
- Section ids: `hero about experience work stack ops numbers certs contact`. Nav = anchor links with scroll-spy. Lenis handles smooth anchor scrolling; reduced motion jumps.
- Section hashes (`#about`) and dossier hashes (`#work/<slug>`) coexist. A dossier hash on load opens the overlay after first paint.
- **Resume**: a split "Download resume" button (D365 track / Python track) in the Hero and in Contact. The Experience section is the on-page resume. No resume page.
- **404**: static `404.html` served by the host for unknown paths. Letter Glitch background, Decrypted Text `PAGE NOT FOUND`, line: *"SansySasy hasn't built this one yet."*
- **Styleguide**: `styleguide.html`, unlinked, noindex, for review in Phase 1 and maintenance after.

### 6.2 Sections in order

| # | Section | Signature | Spec |
|---|---|---|---|
| 00 | **Nav** | Glass Surface | Left: SR monogram. Center: About · Work · Stack · Ops · Contact. Right: `@SansySasy`, theme toggle, Resume button. Sheet menu under 768px |
| 01 | **Hero** | Text Pressure + Decrypted Text | `SANSKAR RAI` at up to 14vw. Role line decrypting through the three roles. Headline (section 2 shortlist). CTAs: *See the work*, *Download resume*. Three mono numbers: 26,000+ documents · 99.9% uptime · MB-310. Crosshair grid background. Scroll cue |
| 02 | **About** | Lanyard | 120-180 words, first person: JUIT (cloud specialization, ACM chapter), Tectura and MB-310, Runtime Solutions and the GCP-to-Azure migration, EBT and the AI document platform plus SQL Server HA. One line on SansySasy. One line on daily agentic tooling. Badge on the right. Delhi · remote · UTC+5:30 |
| 03 | **Experience** | Split Text | Timeline on a 1px rule. Per role: employer, title, dates, 3-4 impact bullets from the resumes, mono tags. Employers named; clients anonymized |
| 04 | **Selected work** | Spotlight / Tilted cards, lens filter | Six dossier cards: index, title, one-line outcome with a number, tags, theme-aware SVG thumbnail. Click opens the dossier overlay |
| 05 | **Stack** | Infinite Menu, lens filter | Sphere of logo tiles; centered tile shows name + one-line note. Mobile: grouped chips. Groups: Dynamics 365 · Languages · Backend · AI & agents · Cloud · Data · Ops |
| 06 | **Operations** | Failover simulation | Heading: *I keep production up.* Interactive Always On topology. Beside it: the Kerberos `KRB_AP_ERR_MODIFIED` story in four sentences, monitoring line (Grafana, Prometheus, Zabbix), alerting and failover design bullets |
| 07 | **By the numbers** | Magnet Lines + heat map + Counter | 26,000+ documents · 5 products · 99.9% uptime · 60% faster deploys · 80% less downtime · 13 vendor defects found · 13 F&O modules. Heat-map calendar labeled *"shape illustrative, totals real"* |
| 08 | **Certifications** | fade | MB-310 with Credly link, MB-500 in progress with target date, planned Azure certs |
| 09 | **Contact** | Particle Text + form | `LET'S TALK` in particles. Form: name, email, message, honeypot, Turnstile. Email + copy button, LinkedIn, GitHub, resume downloads, availability line |
| — | **Footer** | — | Colophon: "Built with Vite, React and React Bits. Set in Archivo, Inter and JetBrains Mono." `@SansySasy` · view-source link · © 2026 |

### 6.3 Dossier overlay (case studies)
A card click opens a full-screen sheet with its own scroll and a shared-element transition from the card. The hash becomes `#work/<slug>` for sharing. Escape, the close button, and the browser back button close it. Focus is trapped, body scroll is locked, and the page behind is inert. Structure inside: context (anonymized) · problem · constraints · architecture diagram · what I built · annotated code · simulation or recording where relevant · outcome numbers · stack · what I'd do differently · repo link if one exists.

| Slug | Title | Lens | Diagram | Embedded proof | Key numbers |
|---|---|---|---|---|---|
| `ai-document-platform` | AI document digitization platform | Engineering, D365 | SharePoint, FastAPI, Gemini Flash, Business Central (OAuth2 / NTLM) + SFTP, MySQL | **Live demo** + token-cost calculator + annotated extraction schema | 26,000+ docs, 5 products, per-client isolation |
| `billing-portal` | Rebuilding a billing and consumption portal | Engineering | Roles, slab pricing engine, invoice lock, Claude bot-training module | Slab-pricing calculator + annotated code | 13 defects found incl. SQL injection |
| `sql-always-on-azure` | SQL Server Always On on Azure, and a Kerberos failure | Cloud | Two nodes, WSFC, listener, CAU group | Failover simulation link + runbook download | 2-node AG, root cause, CPU-triggered failover |
| `retail-erp-deployment` | Deploying a retail ERP on a locked-down VPS | Cloud | Nginx, Node and Python services, PostgreSQL + Redis, systemd | Annotated systemd / Nginx config | SSH over 443, Certbot TLS |
| `gcp-to-azure-migration` | GCP to Azure migration and CI/CD | Cloud | GCP sources, Managed SQL + Cosmos DB, GitHub Actions, PM2 | Annotated workflow YAML | 60% faster deploys, 99.9% uptime, 80% less downtime |
| `d365-fo-extensions` | 13 modules of F&O extensions, plus a Copilot rollout | D365 | Extension layers: table/form ext, CoC, handlers, entities | **Recorded X++ walkthroughs** + annotated CoC sample + Copilot runbook download | 13 modules, Copilot enabled via PPAC |

Phase 2 ships the first two dossiers; Phase 5a ships the rest.

---

## 7. Content model
- `src/content/data/*.ts` typed objects for experience, stack, numbers, certifications, links, headlines. Single source for the page, the styleguide, and the resume PDFs' text.
- `src/dossiers/*.tsx`: one module per case study exporting a `CaseStudy` object (metadata validated by zod: `title, slug, summary, lens[], stack[], numbers[], order, repo?`) and a JSX body rendered by the shared `Dossier` layout.
- Anonymization rule enforced in review: no client names, no screenshots, no internal hostnames. Numbers already on the public resume are fine.

---

## 8. Showcasing work: the full set

| Method | What it proves | Where | Phase |
|---|---|---|---|
| Written dossier with SVG architecture diagram | Judgment, scope, outcomes | Every dossier | 2, 5a |
| Sanitized public repos (three) | Code quality | Linked from dossiers and footer | 5a |
| **Live sanitized demo**: sample invoice in, structured extraction and token cost out | The AI pipeline works, for real | AI platform dossier | 5b |
| **Recorded X++ walkthroughs** on Contoso demo data in an F&O dev VM | Real D365 work with zero client data | D365 dossier; 30-60 s muted loops, WebM + MP4 with posters; longer pieces as unlisted YouTube embeds | 5b |
| **On-page simulations**: failover topology, slab-pricing calculator, token-cost calculator | Understanding of the domain logic | Ops section; billing and AI dossiers | 4 |
| **Annotated code walkthroughs**: Shiki snippets with margin notes | How you think in code | Every dossier. X++ has no Shiki grammar: use the C# grammar as an approximation or a minimal custom TextMate grammar | 2, 5a |
| Downloadable runbooks: Copilot rollout, Always On | Consulting deliverables | D365 and SQL dossiers | 5a |
| Recommendations slot | Third-party credibility | About or Contact, once obtained | 6 |
| Public status page of your own infrastructure | Live ops discipline | Later | 7 |
| Upstream React Bits patches (pause-on-hide, DPR cap) | Community proof | Later | 7 |

### 8.1 Showcase repos
| Repo | Pillar | Contents |
|---|---|---|
| `docflow-extract` | Python / AI | FastAPI skeleton: pluggable LLM providers (Gemini, Claude), schema-driven extraction, per-document status and token-cost tracking to MySQL, connector interfaces for SharePoint, SFTP and Business Central with stubbed implementations, Docker Compose, tests |
| `d365-fo-extension-patterns` | D365 | X++ samples: table and form extensions, Chain of Command with next-chaining, pre/post event handlers, validateField, data entities, `insert_recordset`, `delete_from`, `RecordInsertList`, dual entry-point classes via `Args.parm()`; README explains when to use each |
| `azure-sql-ag-runbook` | Azure / ops | Always On AG on Azure runbook: topology, Bicep or Terraform for the two VMs and load balancer, PowerShell for disk-threshold alerting and CPU-triggered failover, the Kerberos / CAU troubleshooting guide |
| `portfolio` | Frontend, tooling | This site plus the `api/` service |

Each repo carries the monogram, an SVG diagram, badges, and a link back to the site. The GitHub profile README and bio are updated at launch. Sanitization: no client data, no secrets, generic sample documents only.

### 8.2 The `api/` service (FastAPI on the VPS)
- `POST /contact`: validates, checks Turnstile, sends via Resend or SMTP, rate-limited per IP.
- `POST /demo/extract`: runs extraction on bundled sample documents, or on a size-limited upload (PDF or image, a few MB), using Gemini Flash or Claude. Per-IP rate limit, a daily spend cap, precomputed results returned as fallback when the cap is hit, nothing persisted beyond a short TTL, no logging of document contents.
- Deployed with Docker or a systemd unit behind the existing Nginx, TLS via Certbot, CORS locked to the site's origin. Deployed by a GitHub Actions job over SSH.
- Interim before 5b: contact via Web3Forms; the demo card shows precomputed results only.

---

## 9. Performance, accessibility, SEO, testing

**Budgets.** Initial JS under 200 KB gzipped before lazy effects · LCP under 2.5 s on mobile · CLS under 0.1 · Lighthouse mobile: performance at least 90, accessibility, SEO and best practices at least 95, in both themes.

**Effects discipline.** Lazy import; mount on intersection; pause off-screen; DPR cap 2; Lanyard desktop and pointer-fine only; reduced motion switches every effect to its static fallback; fonts subset and preloaded; media clips lazy-loaded with posters.

**Accessibility.** Skip link, landmarks, visible focus, keyboard-operable toggle, filter and dossier sheet, focus trap in the sheet, effects `aria-hidden`, sphere content mirrored in a list, AA contrast in both themes, axe checks in CI.

**SEO.** Static title, description, canonical and Open Graph tags in `index.html`; one dark-theme `og.png`; JSON-LD `Person` with `sameAs` LinkedIn and GitHub and `knowsAbout`; `robots.txt`; `sitemap.xml` with the single URL; `styleguide.html` noindexed; optional prerender later.

**Testing.** Playwright smoke (page renders, theme toggle, reduced-motion path, dossier open and close via hash, contact validation), axe, visual snapshots for 2 themes x 3 breakpoints, Lighthouse CI thresholds.

---

## 10. Hosting, domain, services (decision at Phase 6)

| Option | Cost | Pros | Cons |
|---|---|---|---|
| **Cloudflare Pages** | Free | Static hosting on the edge, generous limits, same place as DNS if DNS moves there | Nothing significant for a static site |
| **Vercel Hobby** | Free | Zero ops, preview URL per PR | Hobby plan is for non-commercial use; fine for a personal portfolio |
| **Nginx on the Ubuntu VPS** | Existing | Full control, on-brand, the `api/` service lives there anyway | You own uptime and patching; deploys via GitHub Actions over SSH |

Recommendation: **Cloudflare Pages for the site, the VPS behind the Cloudflare proxy for the API**, registrar staying at GoDaddy. Vercel is the alternative if the nameservers must stay at GoDaddy. Confirmed at Phase 6; static output means the choice is reversible in minutes.

- **Domain.** `sansysasy.com`, registrar GoDaddy. The domain is the handle, so the URL itself carries SansySasy; the title tag and JSON-LD still lead with "Sanskar Rai". Hostnames: `sansysasy.com` (site), `www.sansysasy.com` (redirects to apex), `api.sansysasy.com` (API). Needed at launch: GoDaddy access to change nameservers or add records. No DNS change before Phase 6.
- **Email on the domain.** `hello@sansysasy.com` via Cloudflare Email Routing, forwarding to the existing mailbox, free. Used in the Contact section and as the Resend sending domain (its DNS records are added at launch).
- **Contact form.** Phase 2: Web3Forms. Phase 5b onward: the `api/` service with Turnstile.
- **Analytics.** Privacy-friendly, no cookie banner: Cloudflare Web Analytics, Vercel Analytics, or self-hosted Umami on the VPS. Decide at Phase 6.

### 10.1 Deployment route (recommended, confirmed at Phase 6)

**Two deployables.**
| Deployable | Built by | Hosted on | URL |
|---|---|---|---|
| Site: `dist/` from `vite build` | Cloudflare Pages build on each commit, mirrored by CI | Cloudflare Pages | apex and `www` |
| API: `api/` FastAPI | GitHub Actions builds a Docker image, pushes to GHCR | Ubuntu VPS, Nginx reverse proxy, fronted by the Cloudflare proxy | `api.<domain>` |

**Environments.**
- Local: `pnpm dev` on `localhost:5173`; `uvicorn` on `localhost:8000`; the Vite dev proxy maps `/api` to 8000.
- Preview: every branch and pull request gets `<branch>.<project>.pages.dev`, from Phase 1 onward.
- Production: merges to `main` deploy to `<project>.pages.dev`, aliased to the custom domain at Phase 6.

**Flow on every push.**
1. CI: typecheck, lint, Playwright smoke + axe, `vite build`, Lighthouse CI against `dist/`.
2. Cloudflare Pages builds the same commit and publishes a preview (branch) or production (`main`).
3. If files under `api/**` changed on `main`: build the image, push to GHCR, SSH to the VPS, `docker compose pull && docker compose up -d`, then `GET /health` must pass.

**DNS at Phase 6.**
- Registrar stays GoDaddy. Nameservers switch to Cloudflare's free plan; the zone lives on Cloudflare.
- Records: `sansysasy.com` CNAME (flattened) to `<project>.pages.dev`; `www.sansysasy.com` CNAME to the same, with a redirect rule from `www` to the apex; `api.sansysasy.com` A record to the VPS IP, proxied; MX and TXT records for Email Routing; TXT and CNAME records for Resend.
- TLS: Cloudflare at the edge; on the VPS, Certbot or a Cloudflare origin certificate. A rate-limiting rule on `api.sansysasy.com/demo/*`; Turnstile from the same dashboard.
- Alternative without touching nameservers: Vercel for the site with A and CNAME records at GoDaddy; Nginx `limit_req` for API rate limiting.

**Before Phase 6.** The API runs during Phase 5b under an existing VPS hostname or the raw IP with Certbot; the site lives on `pages.dev`. No DNS change until launch.

**Secrets.** LLM API key with a spend cap, Resend key, Turnstile secret: an env file on the VPS, never in the repo. Turnstile site key and the API base URL: public Vite build-time env.

**Rollback.** Pages keeps every deployment; one click restores the previous one. API: redeploy the previous image tag.

**Monitoring.** Cloudflare Web Analytics for the site; an uptime check on `/health` from Sanskar's own Zabbix or a free external monitor; a spend alert on the LLM key.

**Launch checklist.** Remove the pre-launch `noindex` meta from `index.html`; DNS propagated; HTTPS on apex, `www` and `api`; `www` redirect; 404 served for unknown paths; robots and sitemap live; Open Graph preview verified with the LinkedIn Post Inspector; Lighthouse on production in both themes; contact form end to end; demo answers within the cap; resume PDFs download; GitHub profile and LinkedIn updated with the URL.

---

## 11. Phased build plan

| Phase | Scope | Done when | Needed from Sanskar |
|---|---|---|---|
| **0. Environment** | Claude installs Node LTS via winget and pnpm via corepack; `git init`; create `TheSansySasy/portfolio`; Vite React TS hello-world | `pnpm dev` serves hello-world; repo pushed | GitHub CLI login |
| **1. Foundation** | Tokens for both themes; fonts; theme hook and no-flash script; layout shell (nav, footer, section primitives); Sheet overlay + hash router; three monogram SVGs; `styleguide.html` with the headline shortlist; CI; preview deploy | Empty shell scores 100 / 100 / 100 / 100 in both themes | Pick monogram and display font |
| **2. Content first, effects off** | Every section static with real first-person copy from the resumes; download buttons; dossiers 1 and 2 with diagrams and annotated code; static meta, `og.png`, JSON-LD; Web3Forms contact | Launch-worthy with zero animation, both themes, Lighthouse at least 95, axe clean | Copy review; headline choice; LinkedIn URL; Credly link; MB-500 target date |
| **3. Light effects** | Text Pressure, Decrypted Text, Magnet Lines, Infinite Menu, Split Text, Noise, Glass nav, Spotlight and Tilted cards, Counter; GSAP scroll system; Lenis; reduced motion; theme-aware effect tokens | Budgets hold with effects on | Approve the logo list for the sphere |
| **4. Heavy and custom** | Lanyard with badge textures for both themes, strap print, holographic foil, desktop gate and fallback; custom Particle Text; heat-map calendar; FailoverSim; SlabPricingCalc; TokenCostCalc | Desktop and mobile both pass budgets; snapshots approved | Approve the badge design |
| **5a. Repos and dossiers** | Sanitize and publish the three showcase repos with READMEs and diagrams; dossiers 3-6; runbook downloads; GitHub profile README | Repos public and linked from the site | Access to source to sanitize, or pair on extraction |
| **5b. Demo and recordings** | `api/` service (contact + demo extraction, caps, Turnstile) deployed on the VPS; contact switched over; recorded X++ clips edited and embedded | Demo returns extraction for sample documents within the cap; clips play in the D365 dossier | VPS access, an LLM API key with a spend limit, an F&O dev VM to record in |
| **6. Launch** | Hosting choice; GoDaddy DNS; analytics; 404; QA on Windows, Android, iOS Safari; accessibility audit; LinkedIn and resume PDFs updated with the URL | Live on the domain, indexed, shared | Hosting choice, GoDaddy access |
| **7. Later** | Blog on a subdomain (Astro); public status page; upstream React Bits patches; Konami-code easter egg for SansySasy; MB-500 update | — | — |

| Effort | Working sessions |
|---|---|
| Phases 0-1 | 1-2 |
| Phase 2 | 2-3 |
| Phase 3 | 2 |
| Phase 4 | 2 |
| Phase 5a | 2-3, mostly sanitization |
| Phase 5b | 1-2, plus recording time |
| Phase 6 | 1 |

Phase 0 commands Claude will run on go, for reference:
```
winget install --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
corepack enable
corepack prepare pnpm@latest --activate
```

---

## 12. Difficulty, honestly
Layout and copy are moderate work. Each React Bits effect is copy-paste plus a few hours of theming and gating. The hard parts: the Lanyard (3D assets, textures per theme, physics tuning, mobile gate); keeping six canvases from stuttering together (lazy mount, pause off-screen); the custom particle text (about 200 lines); the dossier sheet's focus and scroll handling; and cross-device QA. Not hard to build; hard to make feel effortless. QA is where the time goes.

---

## 13. Risks and mitigations
- **Demo-reel feel.** One effect per section; Phase 2 before Phase 3; the site must be excellent with effects off.
- **Two themes doubles visual QA.** Token-only styling, the styleguide entry, snapshot tests in both themes from Phase 1.
- **Lanyard weight on mobile.** Desktop and pointer-fine only; Tilted Card fallback.
- **Infinite Menu on light theme.** Runtime atlas in the theme tile color; verified in Phase 3.
- **Live demo cost and abuse.** Per-IP rate limit, daily spend cap on the LLM key, precomputed fallback, size limits, no persistence.
- **Recording access.** Needs an F&O dev VM with Contoso data; if unavailable, the D365 dossier ships with annotated code and the runbook only.
- **Confidentiality slip.** Anonymization rule in the review checklist; no screenshots anywhere; numbers limited to the public resume.
- **Sparse GitHub.** Phase 5a repos plus profile README; the site links dossiers first, repos second.
- **Vendored React Bits drift.** Origin header with date; local patches documented in each file.
- **Node not installed.** Phase 0 blocker, five-minute fix, Claude runs it on go.

---

## 14. Removed across revisions
Evil Eye · blog and `/writing` · site-wide Consultant/Engineer mode (lens filter chips instead) · photo on the badge (monogram) · React Bits Pro purchase (custom build) · Next.js and all separate routes (`/work/[slug]`, `/resume`, `/styleguide`) in favor of one page with overlays.

---

## 15. Open items, non-blocking
1. GoDaddy access to change nameservers or add records. Needed at Phase 6. Domain is known: `sansysasy.com`.
2. LinkedIn URL, Credly badge link, MB-500 target date. Needed in Phase 2.
3. Headline: pick from the section 2 shortlist in Phase 2.
4. Monogram and display font: pick from drafts in Phase 1.
5. Hosting and analytics: decide at Phase 6.
6. Whether an F&O dev VM is available to record in. Needed before Phase 5b.
