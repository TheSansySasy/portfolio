import { useState } from 'react'
import { NumberField, SelectField } from './fields'

/**
 * The billing portal's central idea, runnable: a month is priced by the slab
 * that was in force during that month, never by today's rates, and a closed
 * month is locked. Volume pricing, as in the dossier's SQL: the whole quantity
 * is charged at the rate of the tier it lands in. The rates are illustrative
 * and in credits, so no real client pricing appears.
 */

type Tier = { upTo: number | null; rate: number }
type Slab = { id: string; from: string; label: string; tiers: Tier[] }

const SLABS: Slab[] = [
  {
    id: 'A',
    from: '2026-03-01',
    label: 'slab A, in force from 1 March',
    tiers: [
      { upTo: 2_000, rate: 1.2 },
      { upTo: 10_000, rate: 0.95 },
      { upTo: null, rate: 0.8 },
    ],
  },
  {
    id: 'B',
    from: '2026-06-01',
    label: 'slab B, in force from 1 June',
    tiers: [
      { upTo: 2_000, rate: 1.1 },
      { upTo: 10_000, rate: 0.85 },
      { upTo: null, rate: 0.7 },
    ],
  },
]

const MONTHS = [
  { value: '2026-03', label: 'March 2026' },
  { value: '2026-04', label: 'April 2026' },
  { value: '2026-05', label: 'May 2026' },
  { value: '2026-06', label: 'June 2026' },
  { value: '2026-07', label: 'July 2026' },
  { value: '2026-08', label: 'August 2026' },
  { value: '2026-09', label: 'September 2026' },
] as const

type Month = (typeof MONTHS)[number]['value']

/** The month still open for usage; every month before it is locked. */
const OPEN_MONTH: Month = '2026-09'

const count = new Intl.NumberFormat('en-US')
const credits = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

function slabFor(month: Month): Slab {
  const start = `${month}-01`
  return [...SLABS].reverse().find((slab) => slab.from <= start) ?? SLABS[0]
}

function tierFor(slab: Slab, pages: number): Tier {
  return slab.tiers.find((tier) => tier.upTo === null || pages <= tier.upTo) ?? slab.tiers[0]
}

function tierRange(slab: Slab, tier: Tier): string {
  const index = slab.tiers.indexOf(tier)
  const lower = index === 0 ? 0 : (slab.tiers[index - 1].upTo ?? 0) + 1
  return tier.upTo === null
    ? `${count.format(lower)} pages and up`
    : `${count.format(lower)} to ${count.format(tier.upTo)} pages`
}

export function SlabPricingCalc() {
  const [month, setMonth] = useState<Month>('2026-04')
  const [pages, setPages] = useState(4_500)

  const slab = slabFor(month)
  const tier = tierFor(slab, pages)
  const total = pages * tier.rate
  const latest = SLABS[SLABS.length - 1]
  const atTodaysRates = pages * tierFor(latest, pages).rate
  const monthLabel = MONTHS.find((m) => m.value === month)?.label ?? month
  const locked = month < OPEN_MONTH

  return (
    <div className="rounded-lg border border-line p-5">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <SelectField id="slab-month" label="Usage month" value={month} options={MONTHS} onChange={setMonth} />
        <NumberField
          id="slab-pages"
          label="Pages processed"
          value={pages}
          onChange={setPages}
          max={60_000}
          step={100}
          suffix="pages"
        />
      </div>

      <output htmlFor="slab-month slab-pages" aria-live="polite" className="mt-6 block border-t border-line pt-5">
        <span className="mono-label block text-muted">Invoice for {monthLabel}</span>
        <span className="mt-2 block font-display text-4xl leading-none font-extrabold tabular-nums">
          {credits.format(total)} credits
        </span>
        <span className="mt-3 block text-sm text-muted">
          {count.format(pages)} pages at {tier.rate.toFixed(2)} each, because {count.format(pages)} falls in{' '}
          {tierRange(slab, tier)} under {slab.label}.
        </span>
        <span className="mt-3 block text-sm">
          {locked
            ? `${monthLabel} is locked, so this number can never change, even when prices do.`
            : `${monthLabel} is the open month, so it can still change until month end.`}
        </span>
        {slab.id === latest.id ? null : (
          <span className="mt-3 block text-sm text-muted">
            Priced at today&apos;s rates instead, it would come to {credits.format(atTodaysRates)} credits. That was the
            flaw in the vendor code: reprinting an old invoice could produce a different number from the one the
            client had already paid.
          </span>
        )}
      </output>

      <p className="mono-label mt-5 text-muted">Illustrative rates in credits per page. No client pricing is shown.</p>
    </div>
  )
}
