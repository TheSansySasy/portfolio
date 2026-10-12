# Sanskar Rai — Portfolio Website Plan

Status: **PLAN v1.7, 2026-10-12. Launched: live at https://sansysasy.com since 2026-10-12 (PR #10, decision 26).** Single-page site on Cloudflare Workers (section 10). Phases 0, 1 and 2 are merged, together with the positioning correction of 2026-09-14 (decision 22). Phase 3 (effects) merged 2026-09-16 (PR #4). Phase 4 (heavy and custom) merged 2026-09-30 (PR #5) after Sanskar approved the badge design; section 4 records what was built, decision 24 the choices, and section 9 the measured budgets. **Phase 5a is complete (2026-10-01):** dossiers 3 to 6 (PR #6), a worked extraction example and three sanitised runbooks (PR #7), and two clean-room showcase repositories, public on GitHub and linked from their dossiers. **Phase 5b is cancelled (decision 25):** nothing that needs a server, a paid API key or a development VM will be built. **Phase 6 (launch) went live on 2026-10-12**; the launch checklist in section 10.1 records what is done and what is left.
Remaining open items are in section 15; future tasks agreed after launch are in section 16.

---

## 1. Decisions log

| # | Question | Decision |
|---|---|---|
| 1 | Primary audience | Undecided; shared equally with everyone. Site stays balanced across D365, Python/AI, and Azure/DevOps |
| 2 | Direction | Option A: Swiss structure on a neo-futurist canvas. **Both dark and light themes** |
| 3 | Confidentiality | No client names, no screenshots. Numbers are fine. Employers (EBT, Runtime Solutions, Tectura) may be named |
| 4 | Showcase repos | Yes, three sanitized public repos |
| 5 | Badge image | No photo. **Monogram** |
| 6 | Domain / hosting | **sansysasy.com**, registrar **GoDaddy**. Canonical URL `https://sansysasy.com`. Hosting: **Cloudflare Workers** (static assets), live 2026-09-12 |
| 7 | Particle text | **Custom canvas build.** Nothing purchased |
| 8 | Evil Eye | **Dropped.** Was only an idea. Operations section uses a failover simulation instead |
| 9 | Blog | **Not now.** A blog later would live on a subdomain |
| 10 | Node.js | Claude installs it at Phase 0 start, on go |
| 11 | Name | **Sanskar Rai** primary; **SansySasy** as handle (former gamer tag) |
| 12 | Voice | **First person, personal** |
| 13 | Site shape | **Single page** with anchor navigation. Case studies are overlays, not routes |
| 14 | Framework | **Vite + React 19 + TypeScript strict + Tailwind v4**, static output. No server-side rendering |
| 15 | Case studies | **Overlay dossier**, hash deep-linked |
| 16 | Extra showcase methods | ~~Live sanitized demo, recorded X++ walkthroughs,~~ (both cancelled, decision 25) **on-page simulations, annotated code walkthroughs.** Plus the defaults: write-ups, repos, downloadable runbooks, a recommendations slot |
| 17 | Headline | "I build and run the systems behind the ERP." is live as the default. The final pick waits on Sanskar's proofread; the shortlist stays in section 2 |
| 18 | Repo name | `portfolio`, at github.com/TheSansySasy/portfolio, public |
| 19 | LinkedIn URL, credential link, MB-500 date | Supplied 2026-09-14: LinkedIn `thesanskarrai`, MB-310 verified through its Microsoft Learn credential page, MB-500 targeted for November 2026 |
| 20 | Monogram | **Modular grid mark**, chosen 2026-09-13. The roundel is reserved for the back of the lanyard badge; the ligature is unused |
| 21 | Display font | **Archivo** variable, chosen 2026-09-13. Roboto Flex was the alternative and has been removed |
| 22 | Positioning | **Corrected 2026-09-14: not a D365 F&O consultant.** Python engineer in cloud and DevOps, with Business Central integration in production. Tectura was functional training (MB-310); X++ and the thirteen extension modules are self-study; the Copilot rollout was a real engagement. Role line: Python Engineer · Cloud & DevOps · Dynamics 365 Integration |
| 23 | Phase 3 implementation | **Decided 2026-09-15.** No GSAP and no Motion: reveals and word rises are CSS, grain is a static SVG tile, figures use a small count-up. The only new dependencies are `lenis` and `gl-matrix`. React Bits sources are MIT + Commons Clause and were adapted with their bugs fixed (section 4) |
| 24 | Phase 4 implementation | **Decided 2026-09-30.** The lanyard keeps React Bits' model and topology but runs on a small Verlet rope instead of Rapier (whose inlined WASM took the chunk to 1.1 MB gzipped) and loads without drei; its chunk is 260 KB gzipped and is fetched only after the visitor's first interaction, on fine-pointer screens at least 1024px wide. Badge art, foil and strap print are drawn at runtime from the theme tokens; the back carries the roundel and a QR code to LinkedIn. The fallback is the static badge, not Tilted Card. The heat map's daily shape is illustrative and labelled so; only its total is a real figure. The calculators use illustrative credit rates and editable example prices. The Open Graph card is rendered from HTML by a script |
| 25 | Running costs | **Decided 2026-10-01: nothing that costs money to keep running.** Sanskar will not maintain a VPS, a paid AI API key or an F&O development VM for a portfolio. Phase 5b is cancelled: no `api/` service, no live extraction demo, no contact form backend, no recorded X++ walkthroughs, no status page. The site stays fully static on Cloudflare's free plan. In their place: a precomputed worked example in the AI platform dossier, and runbooks sanitised from his own documents as downloads. The showcase repositories run without keys or servers |
| 26 | Launch | **Live 2026-10-12.** Sanskar moved the nameservers to Cloudflare himself (GoDaddy stays the registrar) and PR #10 attached the apex to the Worker as a custom domain. `www` redirects to the apex through a Redirect Rule; Always Use HTTPS is on. **Analytics: yes**, Cloudflare Web Analytics, left on Cloudflare's automatic injection for now; loading the beacon after the page is a future task (section 16). **GitHub profile README: yes.** **Email on the domain: undecided**, kept in the plan, nothing set up |

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

**Positioning (one identity, corrected 2026-09-14).**
- Three pillars, in this order: **Python & AI pipelines** (FastAPI, LLM extraction, billing systems) · **Azure & operations** (SQL Server Always On, CI/CD, Linux) · **Dynamics 365 integration** (Business Central connectors in production; F&O certified on the functional side through MB-310, developer track in progress).
- Never present him as an F&O consultant. His production Dynamics work is Business Central integration, and X++ is self-study.
- No site-wide mode. A lightweight **lens filter** on the Work and Stack sections: `All · D365 · Engineering · Cloud`. Default All.

**Headline shortlist (all five previewable in the styleguide entry; the first is live).**
1. "I build and run the systems behind the ERP." *(live)*
2. "Python and Azure underneath Dynamics 365."
3. "I make ERPs talk to AI, and keep the servers up."
4. "From FastAPI to failover."
5. "The engineer behind the ERP integration."
Revised 2026-09-14: the earlier "ERP consultant who also runs the servers" and the X++-first line overstated the F&O experience.
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
- **As built in Phase 3:** CSS transitions triggered by IntersectionObserver for section reveals and word-by-word heading rises; requestAnimationFrame loops for the pointer effects, which stop once idle; Lenis at low strength for wheel scrolling and in-page links. GSAP and Motion were planned and dropped as unnecessary weight.
- `prefers-reduced-motion`: Lenis off, reveals instant, anchors jump, every effect renders its static fallback.
- **One signature effect per section.** Each section has exactly one attention-grabbing animated element; everything else in it is quiet (opacity plus 12px reveals only). Reasons: one focal point for the eye; each WebGL or canvas effect costs frames and two at once stutter on a laptop; the page reads as designed, not as a demo reel.

---

## 4. Effects: final list, placement, theme behavior, fallback

| # | Effect | Source | Placement | Theme behavior | Fallback |
|---|---|---|---|---|---|
| 1 | **Text Pressure** (built, Phase 3) | React Bits, adapted | Hero: `SANSKAR RAI`, driving Archivo's weight and width axes for a fine pointer near the hero | Inherits the text colour | Static weight 800, including on touch screens |
| 2 | **Decrypted Text** (built, Phase 3) | React Bits, rewritten | Hero role line, revealed once on load and replayed on hover. It does not cycle, so all three roles stay readable | Inherits the accent text colour | Plain text |
| 3 | **Magnet Lines** (built, Phase 3) | React Bits, adapted | Its own band above "By the numbers", never behind the figures | `currentColor` | Static needles |
| 4 | **Infinite Menu** (built, Phase 3) | React Bits, adapted, gl-matrix | Stack: draggable sphere of typographic tiles, one per tool, with the facing tool's note in an overlay. Zoomed out on 2026-09-30 so four or five tools show at once. Desktop fine pointers only, lazy-loaded | Atlas redrawn from theme tokens on toggle | The full grouped list, which always renders below the sphere |
| 5 | **Lanyard** (built, Phase 4) | React Bits, adapted: three, React Three Fiber, meshline, and its own Verlet rope in place of Rapier | About: the badge hangs from a strap printed `SANSYSASY ■ SANSKAR RAI`, swings in, can be dragged, flicked, and clicked to flip it over (it stays flipped, so the QR can be scanned), and bounces off the edges of its canvas. Front: grid monogram, name, handle, role, `MB-310`, a holographic foil stripe. Back: foil roundel and a QR code to LinkedIn | Textures redrawn from the theme tokens on toggle; transparent canvas | The static badge. Fine pointers, at least 1024px, motion allowed, WebGL 2, and only after the visitor's first interaction |
| 6 | **Particle Text** (built, Phase 4) | **Custom**, 2D canvas, zero deps | Contact: "Let's talk." sampled from the heading's own layout into small squares that rise in, scatter from the cursor in the accent colour and spring home | Particle colours from tokens | The ordinary heading, with its word rise |

Supporting pieces as built in Phase 3: the nav keeps its CSS backdrop blur as the glass layer, so the Glass Surface component was not needed · **Spotlight** on work cards, as a CSS pseudo-element · word-by-word **heading rise** on every section, in CSS · **fade and 12px reveal** on every section body · **count-up** figures in "By the numbers" · static SVG **film grain**. Built in Phase 4: the **Always On failover simulation** in the Operations section, replacing the static topology (fail the primary, watch the heartbeat time out, the witness hold quorum and the listener move; bring the node back to watch it catch up; or run a planned failover), the **heat-map calendar** under the figures, the **slab-pricing** calculator in the billing dossier and the **token-cost** calculator in the AI platform dossier, a **letter glitch** behind the 404, and the dark-theme **Open Graph card**. Dropped in Phase 3: **Tilted Card**, because text-bearing cards read worse when they tilt, and the animated **Noise** canvas, which redraws a million random pixels every other frame.

Vendoring rule: React Bits components are copy-paste sources licensed **MIT + Commons Clause**: usable inside this site, not redistributable as components (full text in `src/effects/LICENSE-react-bits.md`). They live under `src/effects/` with a header comment naming the origin, the licence, the date vendored and every local change, and are patched for a devicePixelRatio cap of 2, pausing off screen, theme tokens, `aria-hidden` and reduced motion. The bugs fixed in the originals are listed in CLAUDE.md. The Lanyard's `card.glb` loads through a Vite `?url` import; its textures are drawn at runtime.

Hero background: no WebGL. A faint Swiss crosshair grid at low opacity in both themes. The hero must paint instantly.

---

## 5. Framework and stack (final)

**Vite · React 19 · TypeScript strict · Tailwind CSS v4 · adapted React Bits sources · Lenis · gl-matrix (stack sphere) · three, React Three Fiber, meshline and uqr (Lanyard chunk only, Phase 4; drei and Rapier were tried and removed) · Playwright + axe for tests.** GSAP and Motion were removed in Phase 3. Shiki and zod were never needed: annotated code is unhighlighted by design, and content is typed TypeScript.

Why Vite for a single page: with one page and no blog, the reasons for Next.js (static generation per route, per-route metadata, MDX routing) no longer apply. Vite outputs a static folder that any static host serves. React Bits' own site is built on Vite. No hydration edge cases for six canvases. Trade-offs accepted: client rendering with full static meta tags (optional prerender later); a blog later means a separate site on a subdomain.

Rendering rules: every WebGL or canvas component is lazy-imported, mounted when its section is within one viewport, paused or unmounted when it leaves.

Tooling: pnpm · ESLint + Prettier · Husky + lint-staged · GitHub Actions (typecheck, lint, build) · conventional commits.

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
| 01 | **Hero** | Text Pressure + Decrypted Text | `SANSKAR RAI` sized at 14.5cqi, capped at 13rem. The role line decrypts once: Python Engineer · Cloud & DevOps · Dynamics 365 Integration. Live headline from section 2. CTAs: *See the work* and both resume tracks. Three figures: 26,000+ documents · 99.9% uptime · MB-310 |
| 02 | **About** | Lanyard | 120-180 words, first person: JUIT (cloud specialization, ACM chapter), Tectura and MB-310, Runtime Solutions and the GCP-to-Azure migration, EBT and the AI document platform plus SQL Server HA. One line on SansySasy. One line on daily agentic tooling. Badge on the right. Delhi · remote · UTC+5:30 |
| 03 | **Experience** | Word-rise heading, body reveal | Timeline on a 1px rule. Per role: employer, title, dates, 3-4 impact bullets from the resumes, mono tags. Employers named; clients anonymized |
| 04 | **Selected work** | Spotlight cards (lens filter not yet built) | Six dossier cards: index, title, one-line outcome with a number, tags, theme-aware SVG thumbnail. Click opens the dossier overlay |
| 05 | **Stack** | Infinite Menu sphere | Desktop: draggable sphere of typographic tiles, the facing tile named with its note. The grouped list always renders below it, and is the whole section on touch screens, under reduced motion and without WebGL 2. Groups: Dynamics 365 · Languages · Backend and APIs · AI and agents · Cloud · Data · Operations |
| 06 | **Operations** | Failover simulation | Heading: *I keep production up.* Interactive Always On topology. Beside it: the Kerberos `KRB_AP_ERR_MODIFIED` story in four sentences, monitoring line (Grafana, Prometheus, Zabbix), alerting and failover design bullets |
| 07 | **By the numbers** | Magnet Lines band + count-up (heat map in Phase 4) | 26,000+ documents · 5 products · 99.9% uptime · 60% faster deploys · 80% less downtime · 13 vendor defects found · 13 F&O modules. Heat-map calendar labeled *"shape illustrative, totals real"* |
| 08 | **Certifications** | fade | MB-310 with Credly link, MB-500 in progress with target date, planned Azure certs |
| 09 | **Contact** | Particle Text | "Let's talk." in particles. Email link with a copy button, LinkedIn, GitHub, resume downloads, availability line. No form: a form needs a backend, and the site has none (decision 25) |
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
| **Worked extraction example**: a made-up invoice, the structured data extracted from it, the validation result and the token cost, all precomputed and built into the page | How the pipeline behaves, with nothing sent anywhere | AI platform dossier | 5a |
| **On-page simulations**: failover topology, slab-pricing calculator, token-cost calculator | Understanding of the domain logic | Ops section; billing and AI dossiers | 4 |
| **Annotated code walkthroughs**: Shiki snippets with margin notes | How you think in code | Every dossier. X++ has no Shiki grammar: use the C# grammar as an approximation or a minimal custom TextMate grammar | 2, 5a |
| Downloadable runbooks, sanitised from Sanskar's own documents: Copilot enablement, PPAC provisioning with the Unified Developer Experience, App Service scale up and down | Consulting deliverables | D365 and migration dossiers | 5a |
| Recommendations slot | Third-party credibility | About or Contact, once obtained | 6 |
| Upstream React Bits patches (pause-on-hide, DPR cap) | Community proof | Later | 7 |

### 8.1 Showcase repos
| Repo | Pillar | Contents |
|---|---|---|
| `docflow-extract` | Python / AI | FastAPI skeleton: pluggable LLM providers (Gemini, Claude), schema-driven extraction, per-document status and token-cost tracking to MySQL, connector interfaces for SharePoint, SFTP and Business Central with stubbed implementations, Docker Compose, tests |
| `d365-fo-extension-patterns` (optional, not scheduled) | D365 | Only if Sanskar wants to publish his own practice code; the D365 dossier already shows the patterns. X++ samples: table and form extensions, Chain of Command with next-chaining, pre/post event handlers, validateField, data entities, `insert_recordset`, `delete_from`, `RecordInsertList`, dual entry-point classes via `Args.parm()`; README explains when to use each |
| `azure-sql-ag-runbook` | Azure / ops | Always On AG on Azure runbook: topology, Bicep or Terraform for the two VMs and load balancer, PowerShell for disk-threshold alerting and CPU-triggered failover, the Kerberos / CAU troubleshooting guide |
| `portfolio` | Frontend, tooling | This site |

Each repo carries the monogram, an SVG diagram, badges, and a link back to the site. **Decided 2026-10-01: the repos are clean-room reference implementations, reviewed by Sanskar before they are made public**; the X++ repo uses his own code. The GitHub profile README and bio are updated at launch; the README is drafted at `docs/github-profile/README.md`. Sanitization: no client data, no secrets, generic sample documents only.

---

## 9. Performance, accessibility, SEO, testing

**Budgets.** Initial JS under 200 KB gzipped before lazy effects · LCP under 2.5 s on mobile · CLS under 0.1 · Lighthouse mobile: performance at least 90, accessibility, SEO and best practices at least 95, in both themes.

**Measured after Phase 3 (2026-09-15)**, as the median of five mobile Lighthouse runs alternated with a same-day build of `main`: performance 93 against Phase 2's 90, LCP 2.4 s against 2.2 s, TBT 182 ms against 274 ms, CLS 0.001 against 0.051, accessibility and best practices 100; desktop 100. Initial JavaScript is about 95 KB gzipped. SEO stays at 66 until the pre-launch `noindex` comes off in Phase 6. The effects first cost mobile about 15 points; three measured changes recovered it: `content-visibility` on below-the-fold sections, loading the 88 KB width-axis font only where the name animates, and mounting sections after the hero in a React transition.

**Measured after Phase 4 (2026-09-30)**, same method against a same-day build of Phase 3: mobile performance 94 against 94, LCP 2.43 s against 2.43 s, TBT 109 ms against 112 ms, CLS 0 for both, accessibility and best practices 100; desktop 100 with LCP 0.62 s. Initial JavaScript rose to about 105 KB gzipped. The lanyard's 260 KB chunk and 139 KB model load only after a visitor interacts, so no lab run fetches them. The budgets hold.

**Measured on production after launch (2026-10-12), in both themes.** SEO is 100 now that the `noindex` is gone; accessibility and best practices 100 in dark and light; desktop 99 in both, LCP 0.84 s. Mobile performance on `sansysasy.com` came out at 83 to 88 over eight runs (seven dark, one light at 87), LCP 3.1 to 3.3 s, CLS 0. **The cause is Cloudflare's Web Analytics beacon**, which the zone injects into every HTML response for browsers: three mobile runs alternated with the same build on `workers.dev`, which has no beacon, gave medians of 85 against 93 for performance and 3.24 s against 2.74 s for LCP. The beacon is a 10 KB high-priority script from a second origin that competes with the CSS, fonts and code on Lighthouse's throttled connection. Real visitors barely see it: the first day's field data put LCP at 193 ms median and 753 ms at the 75th percentile. So the build still meets the mobile budgets, and the beacon pushes the lab score on the domain below them. Sanskar chose to leave it as it is for now; moving it is future task 1 (section 16).

**Effects discipline.** Lazy import; mount on intersection; pause off-screen; DPR cap 2; Lanyard desktop and pointer-fine only; reduced motion switches every effect to its static fallback; fonts subset and preloaded; media clips lazy-loaded with posters.

**Accessibility.** Skip link, landmarks, visible focus, keyboard-operable toggle, filter and dossier sheet, focus trap in the sheet, effects `aria-hidden`, sphere content mirrored in a list, AA contrast in both themes, axe checks in CI.

**SEO.** Static title, description, canonical and Open Graph tags in `index.html`; one dark-theme `og.png`; JSON-LD `Person` with `sameAs` LinkedIn and GitHub and `knowsAbout`; `robots.txt`; `sitemap.xml` with the single URL; `styleguide.html` noindexed; optional prerender later.

**Testing.** Playwright smoke (page renders, theme toggle, reduced-motion path, dossier open and close via hash, contact validation), axe, visual snapshots for 2 themes x 3 breakpoints, Lighthouse CI thresholds.

---

## 10. Hosting, domain, services

**Decided 2026-09-12: Cloudflare Workers with static assets.** The Cloudflare dashboard now offers only the Workers flow when creating an application, so the site is a static-only Worker rather than a Pages project. Live since 2026-09-12 at `https://portfolio.rai-sanskar304.workers.dev`, and **at `https://sansysasy.com` since 2026-10-12**; the `workers.dev` address stays on as a fallback.

| Option | Status | Notes |
|---|---|---|
| **Cloudflare Workers (static assets)** | **In use** | Free, edge-served, git-connected builds, preview URL per version and branch, same account as DNS and Email Routing |
| Cloudflare Pages | Not available | The create-application flow no longer exposes it; Pages still runs for existing projects |
| Vercel Hobby | Fallback | Only needed if the nameservers must stay at GoDaddy; Hobby terms are non-commercial |

- **Domain.** `sansysasy.com`, registrar GoDaddy. The domain is the handle, so the URL itself carries SansySasy; the title tag and JSON-LD still lead with "Sanskar Rai". Hostnames: `sansysasy.com` (site) and `www.sansysasy.com` (redirects to apex). The nameservers moved to Cloudflare on 2026-10-12.
- **Nameservers (confirmed 2026-09-13).** At Phase 6 the nameservers move to Cloudflare and the apex is attached to the Worker as a custom domain. **GoDaddy stays the registrar**: ownership, billing and renewal do not move, and this is not a domain transfer; only the dashboard holding the DNS records changes. This is required, not preferred: Cloudflare's docs state a custom domain needs an active Cloudflare zone and cannot be created on a zone you do not manage, and Pages supports external DNS for subdomains only, never an apex. Alternatives considered and rejected: GitHub Pages or the VPS with DNS left at GoDaddy; Vercel, whose free plan is documented as non-commercial only.
- **Email on the domain.** **Undecided (2026-10-12):** Sanskar has not decided whether he wants it, and asked to keep it in the plan. The free option would be `hello@sansysasy.com` through Cloudflare Email Routing, forwarding to the existing mailbox; it would also change the Contact section's address. Nothing is set up (future task 2, section 16).
- **Contact.** An email link with a copy button. No form and no backend (decision 25).
- **Analytics.** Privacy-friendly, no cookie banner: Cloudflare Web Analytics, **on since launch**. The zone turned it on and injects the beacon itself; Sanskar left it that way for now (future task 1, section 16). Worker logs via the `observability` block already enabled in `wrangler.jsonc`.

### 10.1 Deployment route (in use)

**One deployable.**
| Deployable | Built by | Hosted on | URL |
|---|---|---|---|
| Site: `dist/` from `vite build` | Workers Builds, on every push | Cloudflare Workers, static assets from `wrangler.jsonc` | `sansysasy.com` (custom domain), `portfolio.rai-sanskar304.workers.dev` (fallback); `www` redirects to the apex |

**Cloudflare project settings (as configured).**
| Setting | Value |
|---|---|
| Project / Worker name | `portfolio` (must match `name` in `wrangler.jsonc`) |
| Production branch | `main` |
| Build command | `pnpm run build` |
| Deploy command | `npx wrangler deploy` |
| Non-production branch deploy command | `npx wrangler versions upload` |
| Builds for non-production branches | enabled |
| `PNPM_VERSION` | `12.4.1` — required; the build image ships pnpm 10.11.1, which cannot read a pnpm 12 lockfile |
| Node version | from `.node-version` (`24`); the build image default is already 24.18 |

**Repo requirements for the remote build.** `wrangler.jsonc` (assets from `./dist`, `not_found_handling: "404-page"`, observability on) · `wrangler` as a devDependency so `npx` resolves it · `allowBuilds` for `esbuild` and `workerd` in `pnpm-workspace.yaml`, without which pnpm 12 fails the install with `ERR_PNPM_IGNORED_BUILDS` · `public/404.html`.

**Environments.**
- Local: `pnpm dev` on `localhost:5173`.
- Preview: non-production branches upload a version and return a preview URL, `<version-or-alias>-portfolio.rai-sanskar304.workers.dev`. Available from Phase 1 onward.
- Production: merges to `main` deploy the Worker, which serves the custom domain `sansysasy.com`.

**Flow on every push.**
1. CI: typecheck, lint, `vite build`.
2. Workers Builds builds the same commit, then deploys (`main`) or uploads a preview version (any other branch).

**DNS (done 2026-10-12).**
- Registrar stays GoDaddy. The nameservers point at Cloudflare's free plan (two `*.ns.cloudflare.com` servers), and the zone lives on Cloudflare. GoDaddy's own DNS page still lists its old records, but nothing reads them any more. DNSSEC was off at GoDaddy and has not been turned on in Cloudflare.
- The apex is the Worker's only custom domain, declared in `wrangler.jsonc` (`routes` with `custom_domain: true`); Cloudflare created its DNS record and certificate on the first deploy.
- `www` is a proxied CNAME to the apex, with a Redirect Rule in the dashboard: hostname `www.sansysasy.com`, a dynamic 301 to `concat("https://sansysasy.com", http.request.uri.path)`, query string kept. Always Use HTTPS is on, so `http://` on either host ends at `https://sansysasy.com` in one redirect.
- Onboarding imported GoDaddy's records; the two parking `A` records were deleted. The `_dmarc` TXT (it stops others from sending mail as the domain) and GoDaddy's `_domainconnect` CNAME were kept. No MX records, because there is no mail.
- TLS: Cloudflare at the edge.

**Secrets.** None. The site is static and calls no API.

**Rollback.** Workers keeps every version: `wrangler rollback`, or promote an earlier version from the dashboard.

**Monitoring.** Cloudflare Web Analytics for the site; Worker observability logs; optionally a free external uptime monitor.

**Launch checklist (status 2026-10-12).**
- Done and checked on production:
  - The pre-launch `noindex` meta removed from `index.html`.
  - Nameservers moved and propagated.
  - Custom domain attached to the Worker.
  - HTTPS on the apex and `www`, and the `www` redirect.
  - The 404 page served for unknown paths.
  - robots, the sitemap and the Open Graph image live.
  - Lighthouse on production in both themes (section 9).
  - The full effects verifier passes against the domain.
  - The email link and copy button work: the address reaches the clipboard and "Copied" is announced.
  - Both resume PDFs and all three runbooks download.
  - The two showcase repositories' READMEs and GitHub homepage fields switched to `sansysasy.com`.
- Left:
  - Publish the GitHub profile README from `docs/github-profile/README.md` and set the profile's website field (Claude, on Sanskar's go).
  - Verify the Open Graph preview with the LinkedIn Post Inspector, which needs his LinkedIn login (Sanskar).
  - Add the URL to LinkedIn and to his resume PDFs (Sanskar).
  - QA on a real Android phone and on iOS Safari (Sanskar).
  - Optionally, submit the sitemap in Google Search Console (Sanskar; free).

---

## 11. Phased build plan

| Phase | Scope | Done when | Needed from Sanskar |
|---|---|---|---|
| **0. Environment** | Claude installs Node LTS via winget and pnpm via corepack; `git init`; create `TheSansySasy/portfolio`; Vite React TS hello-world | `pnpm dev` serves hello-world; repo pushed | GitHub CLI login |
| **1. Foundation** | Tokens for both themes; fonts; theme hook and no-flash script; layout shell (nav, footer, section primitives); Sheet overlay + hash router; three monogram SVGs; `styleguide.html` with the headline shortlist; CI; preview deploy | Empty shell scores 100 / 100 / 100 / 100 in both themes | Pick monogram and display font |
| **2. Content first, effects off** | Every section static with real first-person copy from the resumes; download buttons; dossiers 1 and 2 with diagrams and annotated code; static meta, `og.png`, JSON-LD; Web3Forms contact | Launch-worthy with zero animation, both themes, Lighthouse at least 95, axe clean | Copy review; headline choice; LinkedIn URL; Credly link; MB-500 target date |
| **3. Light effects** | Text Pressure, Decrypted Text, Magnet Lines, Infinite Menu sphere, word-rise headings, section reveals, spotlight cards, count-up figures, static grain; Lenis; reduced motion; theme-aware effect tokens. GSAP, Motion, Tilted Card and the animated Noise canvas dropped (section 4) | Budgets hold with effects on, in both themes, with reduced motion verified | Nothing: sphere tiles are typographic, so there is no logo list to approve |
| **4. Heavy and custom** (merged 2026-09-30, PR #5) | Lanyard with badge textures for both themes, strap print, holographic foil, desktop gate and fallback; custom Particle Text; heat-map calendar; FailoverSim; SlabPricingCalc; TokenCostCalc; 404 letter glitch; Open Graph card | Desktop and mobile both pass budgets; snapshots approved | Approve the badge design |
| **5a. Repos, dossiers and downloads** (complete 2026-10-01: dossiers PR #6; worked example and runbooks PR #7; both repositories public and linked) | Dossiers 3-6 (merged 2026-10-01, PR #6); a precomputed worked example in the AI platform dossier; runbooks sanitised from Sanskar's own documents as PDF downloads; two clean-room showcase repositories (`docflow-extract`, `azure-sql-ag-runbook`), published after his review; GitHub profile README drafted for launch | Repos public and linked from the site; runbooks linked | Review the repositories and the sanitised runbooks |
| **6. Launch** (live 2026-10-12, PR #10) | Hosting choice; GoDaddy DNS; analytics; 404; QA on Windows, Android, iOS Safari; accessibility audit; LinkedIn and resume PDFs updated with the URL | Live on the domain, indexed, shared | Hosting choice, GoDaddy access |
| **7. Later** | Blog on a subdomain (Astro); upstream React Bits patches; Konami-code easter egg for SansySasy; MB-500 update | — | — |

| Effort | Working sessions |
|---|---|
| Phases 0-1 | 1-2 |
| Phase 2 | 2-3 |
| Phase 3 | 2 |
| Phase 4 | 2 |
| Phase 5a | 2-3, mostly sanitization |
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
- **Lanyard weight.** Fine pointers at least 1024px wide only, fetched after the first interaction so lab runs never load it; the static badge everywhere else. Rapier's WASM was replaced by a Verlet rope to take the chunk from 1.1 MB to 260 KB gzipped.
- **Infinite Menu on light theme.** Runtime atlas in the theme tile color; verified in Phase 3.
- **Running costs.** None beyond the domain: static hosting on Cloudflare's free plan, free CI on GitHub, no server, no API key, no VM (decision 25). Anything proposed later has to fit that.
- **Confidentiality slip.** Anonymization rule in the review checklist; no screenshots anywhere; numbers limited to the public resume.
- **Sparse GitHub.** Phase 5a repos plus profile README; the site links dossiers first, repos second.
- **Vendored React Bits drift.** Origin header with date; local patches documented in each file.
- **Node not installed.** Phase 0 blocker, five-minute fix, Claude runs it on go.

---

## 14. Removed across revisions
Evil Eye · blog and `/writing` · site-wide Consultant/Engineer mode (lens filter chips instead) · photo on the badge (monogram) · React Bits Pro purchase (custom build) · Next.js and all separate routes (`/work/[slug]`, `/resume`, `/styleguide`) in favor of one page with overlays · the D365 F&O consultant framing (2026-09-14) · GSAP, Motion, Tilted Card, the Glass Surface component and the animated Noise canvas (Phase 3) · a cycling role line, replaced by one line showing all three roles · Rapier and drei for the lanyard, and Tilted Card as its fallback (Phase 4) · all of Phase 5b: the `api/` service, the live extraction demo, the contact form and its backend, the recorded X++ walkthroughs, and the public status page (2026-10-01, decision 25).

---

## 15. Open items, non-blocking
1. ~~GoDaddy access to change nameservers or add records.~~ Sanskar moved the nameservers himself on 2026-10-12.
2. ~~LinkedIn URL, credential link, MB-500 target date.~~ Supplied 2026-09-14.
3. Sanskar's proofread of the Phase 2 copy, deferred by him on 2026-09-15. The final headline pick comes with it.
4. ~~Monogram and display font.~~ Chosen 2026-09-13.
5. ~~Hosting and analytics.~~ Cloudflare Workers and Cloudflare Web Analytics (decision 26).
6. ~~Whether an F&O dev VM is available to record in.~~ Recordings cancelled (decision 25).
7. ~~Sanskar's review of the two clean-room repositories and the sanitised runbooks.~~ Published on his say, 2026-10-01; he will skim them later, so corrections may still arrive.

---

## 16. Future tasks (agreed after launch)

Recorded on Sanskar's say, 2026-10-12. None is scheduled, and each starts only on his go. All of them fit decision 25: nothing here costs money to run.

1. **Load the Web Analytics beacon after the page has loaded.**
   - Why: Cloudflare injects `beacon.min.js` into every HTML response for browsers, as a high-priority script from a second origin. On Lighthouse's throttled mobile connection it competes with the page's CSS, fonts and code, which costs about 8 points (section 9: median 85 on the domain against 93 for the same build on `workers.dev`). Real visitors barely notice it, but PageSpeed Insights shows the lab score to anyone who runs it.
   - How:
     1. Sanskar switches the site in Web Analytics from automatic injection to the manual JS snippet, which turns injection off.
     2. Claude adds the snippet to the site, loaded after the `load` event.
     3. Re-measure, alternating runs against `workers.dev`.
   - Both steps go together: a snippet added while injection is still on loads the beacon twice.
   - The site token is not a secret, since it is already in the served HTML.
   - Late loading keeps Core Web Vitals, because the browser holds those readings for scripts that load afterwards.
   - Left as it is on 2026-10-12 by Sanskar's choice.
2. **Email on the domain.** Undecided. If wanted:
   - Cloudflare Email Routing (free) forwards `hello@sansysasy.com` to the existing mailbox. It needs the MX and TXT records Cloudflare adds.
   - `SITE.email` and the Contact section then change.
   - Receiving needs nothing more. Sending as that address needs SPF and DKIM for whatever sends it, because the existing `_dmarc` record (`p=quarantine`, reports to a GoDaddy-run address) quarantines mail that fails them.
3. **Content-Security-Policy.** Not set yet:
   - The theme script and the JSON-LD block are inline, so the policy needs their hashes.
   - It must also allow the Web Analytics beacon: script from `static.cloudflareinsights.com`, and its reports to `/cdn-cgi/rum`. Its form depends on task 1.
4. **Watch INP in real visitor data.** On launch day Web Analytics showed one interaction at 496 ms on `body`, probably from the automated checks. If real visitors show it too, profile the first interaction: it also starts the lanyard's chunk on desktop.
