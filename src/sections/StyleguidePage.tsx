import { useState, type ReactNode } from 'react'
import { HEADLINES, SITE } from '../content/data/site'
import { Button, ButtonLink } from '../ui/Button'
import { Chip } from '../ui/Chip'
import { Container } from '../ui/Container'
import { Monogram, type MonogramVariant } from '../ui/Monogram'
import { SectionLabel } from '../ui/SectionLabel'
import { Sheet } from '../ui/Sheet'
import { ThemeToggle } from '../ui/ThemeToggle'

function Block({ index, title, children }: { index: string; title: string; children: ReactNode }) {
  return (
    <section className="py-16">
      <SectionLabel index={index} label={title} />
      <div className="mt-8">{children}</div>
    </section>
  )
}

const TOKENS: { name: string; varName: string; note: string }[] = [
  { name: 'bg', varName: '--bg', note: 'page ground' },
  { name: 'surface', varName: '--surface', note: 'cards, raised areas' },
  { name: 'line', varName: '--line', note: 'hairlines, borders' },
  { name: 'text', varName: '--text', note: 'body copy' },
  { name: 'muted', varName: '--muted', note: 'secondary copy' },
  { name: 'accent', varName: '--accent', note: 'graphics only' },
  { name: 'accent-text', varName: '--accent-text', note: 'accent for text, AA' },
]

const THERMAL = ['--thermal-1', '--thermal-2', '--thermal-3', '--thermal-4', '--thermal-5']

/** Chosen 2026-09-13: the modular grid mark, with the roundel kept for the badge back. */
const MONOGRAMS: { variant: MonogramVariant; label: string; note: string }[] = [
  { variant: 'grid', label: 'Modular grid · chosen', note: 'Reads as systems, holds up at nav size' },
  { variant: 'roundel', label: 'Roundel · kept', note: 'Reserved for the back of the lanyard badge' },
  { variant: 'ligature', label: 'Ligature · not used', note: 'Muddy once it shrinks into the nav' },
]

export function StyleguidePage() {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-glass backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between">
          <p className="mono-label text-muted">Styleguide · not indexed</p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ButtonLink href="/">Back to site</ButtonLink>
          </div>
        </Container>
      </header>

      <Container>
        <Block index="01" title="Monogram">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {MONOGRAMS.map(({ variant, label, note }) => (
              <figure key={variant} className="flex flex-col gap-4">
                <div className="flex h-32 items-center justify-center rounded-lg border border-line bg-surface p-6">
                  <Monogram variant={variant} className="h-20 text-text" />
                </div>
                <figcaption>
                  <p className="mono-label text-accent-text">{label}</p>
                  <p className="mt-1 text-sm text-muted">{note}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-8 text-muted">
            The same three marks at nav size, which is where they will mostly be seen.
          </p>
          <div className="mt-4 flex items-center gap-10 rounded-lg border border-line p-6">
            {MONOGRAMS.map(({ variant }) => (
              <Monogram key={variant} variant={variant} className="h-4 text-text" />
            ))}
          </div>
        </Block>

        <Block index="02" title="Display font">
          <div className="rounded-lg border border-line p-6">
            <p className="mono-label text-accent-text">Archivo · chosen</p>
            <p className="mt-4 font-display text-[clamp(2rem,6vw,4rem)] leading-[0.95] font-extrabold tracking-[-0.03em] uppercase">
              Sanskar Rai
            </p>
            <p className="mt-4 font-display text-2xl font-semibold">
              I keep production up. 26,000 documents, 99.9% uptime.
            </p>
            <p className="mt-6 text-muted">
              Variable, with the width and weight axes the hero effect needs in Phase 3. Roboto Flex
              was the alternative and has been dropped.
            </p>
          </div>
        </Block>

        <Block index="03" title="Type scale">
          <div className="flex flex-col gap-8">
            <div>
              <p className="mono-label text-muted">type-hero, display 800</p>
              <p className="type-hero font-display">Sanskar Rai</p>
            </div>
            <div>
              <p className="mono-label text-muted">type-section, display 800</p>
              <h2 className="type-section">I keep production up.</h2>
            </div>
            <div>
              <p className="mono-label text-muted">type-lede</p>
              <p className="type-lede max-w-2xl">
                I build and run the systems behind the ERP: Dynamics 365 on top, Python pipelines in
                the middle, Azure and SQL Server underneath.
              </p>
            </div>
            <div>
              <p className="mono-label text-muted">body, Inter 17px</p>
              <p className="max-w-2xl">
                I rebuilt a billing portal after auditing the vendor code and documenting thirteen
                defects, including SQL injection and unwired middleware. Slab-based pricing, invoice
                locking, margin reporting.
              </p>
            </div>
            <div>
              <p className="mono-label text-muted">mono-label, JetBrains Mono</p>
              <p className="mono-label">04 / Selected work · D365 · Engineering</p>
            </div>
          </div>
        </Block>

        <Block index="04" title="Color tokens">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {TOKENS.map(({ name, varName, note }) => (
              <div key={name} className="flex flex-col gap-2">
                <div
                  className="h-20 rounded-md border border-line"
                  style={{ background: `var(${varName})` }}
                />
                <p className="mono-label">{name}</p>
                <p className="text-xs text-muted">{note}</p>
              </div>
            ))}
          </div>
          <p className="mono-label mt-10 text-muted">Thermal ramp, for data only</p>
          <div className="mt-3 flex h-12 overflow-hidden rounded-md border border-line">
            {THERMAL.map((varName) => (
              <div key={varName} className="flex-1" style={{ background: `var(${varName})` }} />
            ))}
          </div>
        </Block>

        <Block index="05" title="Headline candidates">
          <ol className="flex flex-col gap-6">
            {HEADLINES.map((headline, i) => (
              <li key={headline} className="border-b border-line pb-6">
                <p className="mono-label text-accent-text">{String(i + 1).padStart(2, '0')}</p>
                <p className="mt-2 font-display text-[clamp(1.5rem,3.2vw,2.5rem)] leading-tight font-extrabold">
                  {headline}
                </p>
              </li>
            ))}
          </ol>
        </Block>

        <Block index="06" title="Components">
          <div className="flex flex-wrap items-center gap-3">
            <ButtonLink href="#" variant="solid">
              Solid
            </ButtonLink>
            <ButtonLink href="#">Outline</ButtonLink>
            <ButtonLink href="#" variant="ghost">
              Ghost
            </ButtonLink>
            <Button disabled>Disabled</Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <Chip>Azure</Chip>
            <Chip>X++</Chip>
            <Chip>FastAPI</Chip>
            <Chip>SQL Server</Chip>
          </div>
          <div className="mt-10">
            <Button variant="outline" onClick={() => setSheetOpen(true)}>
              Open the sheet overlay
            </Button>
            <p className="mt-3 text-sm text-muted">
              Escape closes it, focus is trapped inside, and the page behind cannot scroll.
            </p>
          </div>
        </Block>

        <Block index="07" title="Section header pattern">
          <SectionLabel index="06" label="Operations" />
          <h2 className="type-section mt-8">I keep production up.</h2>
          <p className="type-lede mt-6 max-w-2xl text-muted">
            A two-node Always On cluster, a Kerberos failure traced to an offline cluster resource,
            and the alerting designed after it.
          </p>
        </Block>

        <footer className="border-t border-line py-10">
          <p className="mono-label text-muted">
            {SITE.name} · @{SITE.handle} · styleguide
          </p>
        </footer>
      </Container>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Sheet demo">
        <div className="mx-auto w-full max-w-3xl px-gutter py-12">
          <h2 className="type-section">Sheet overlay</h2>
          <p className="type-lede mt-6 text-muted">
            This is the same component the case-study dossiers use. Tab through the links below:
            focus stays inside until you close it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="#">First link</ButtonLink>
            <ButtonLink href="#">Second link</ButtonLink>
            <ButtonLink href="#">Third link</ButtonLink>
          </div>
        </div>
      </Sheet>
    </>
  )
}
