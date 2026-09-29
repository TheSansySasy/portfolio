import { DiagramFrame } from '../diagrams/DiagramFrame'

/**
 * Documents processed per day, March to September 2026. The daily shape is
 * illustrative, generated from a fixed seed: weekdays far heavier than
 * weekends, and volume climbing as the five products came online. It exists to
 * show the rhythm of the work; the only real number is the total, which the
 * caption states. No per-day counts are shown, because none are real.
 */

const START_UTC = Date.UTC(2026, 2, 2) // Monday 2 March 2026, the month EBT began
const WEEKS = 30
const DAY_MS = 86_400_000
const CELL = 12
const PITCH = 15
const LEFT = 30
const TOP = 18

// Full class names, so Tailwind can see them in the source.
const LEVEL_CLASSES = [
  'fill-thermal-1',
  'fill-thermal-2',
  'fill-thermal-3',
  'fill-thermal-4',
  'fill-thermal-5',
] as const

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAY_WEIGHT = [1, 1.05, 1.1, 1.05, 0.95, 0.28, 0.12] // Monday first
const MONTH_RAMP: Record<number, number> = { 2: 0.35, 3: 0.6, 4: 0.8, 5: 1, 6: 1.05, 7: 1.1, 8: 1.15 }

function mulberry32(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
}

type Day = { key: string; week: number; weekday: number; level: number }

function buildCalendar(): { days: Day[]; monthLabels: { week: number; label: string }[] } {
  const random = mulberry32(26_000)
  const raw: { week: number; weekday: number; weight: number; month: number; date: number }[] = []

  for (let week = 0; week < WEEKS; week++) {
    for (let weekday = 0; weekday < 7; weekday++) {
      const date = new Date(START_UTC + (week * 7 + weekday) * DAY_MS)
      const month = date.getUTCMonth()
      const weight = WEEKDAY_WEIGHT[weekday] * (MONTH_RAMP[month] ?? 1) * (0.6 + random() * 0.8)
      raw.push({ week, weekday, weight, month, date: date.getUTCDate() })
    }
  }

  // Five levels by quintile, so the colour spread is even whatever the scale.
  const sorted = raw.map((d) => d.weight).sort((a, b) => a - b)
  const cut = (p: number) => sorted[Math.floor(p * (sorted.length - 1))]
  const cuts = [cut(0.2), cut(0.4), cut(0.6), cut(0.8)]

  const days = raw.map((d) => ({
    key: `${d.week}-${d.weekday}`,
    week: d.week,
    weekday: d.weekday,
    level: cuts.filter((c) => d.weight > c).length,
  }))

  const monthLabels = raw
    .filter((d) => d.date === 1 || (d.week === 0 && d.weekday === 0))
    .map((d) => ({ week: d.week, label: MONTHS[d.month] }))

  return { days, monthLabels }
}

const CALENDAR = buildCalendar()
const WIDTH = LEFT + WEEKS * PITCH
const HEIGHT = TOP + 7 * PITCH

export function HeatMapCalendar() {
  return (
    <DiagramFrame
      label="Processing heat map"
      minWidth={WIDTH + 40}
      caption="The daily shape is illustrative, drawn to show the weekday rhythm and the ramp as products came online. The total, more than 26,000 documents in 2026, is the real figure."
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Heat map of documents processed per day from March to September 2026. Weekdays run far heavier than weekends, and volume climbs as each of the five products came online. The daily shape is illustrative; the total of more than 26,000 documents is real."
        className="h-auto w-full max-w-3xl"
      >
        {CALENDAR.monthLabels.map(({ week, label }) => (
          <text
            key={`${label}-${week}`}
            x={LEFT + week * PITCH}
            y={11}
            className="fill-current font-mono text-[9px] tracking-[0.1em] uppercase opacity-60"
          >
            {label}
          </text>
        ))}
        {(['Mon', 'Wed', 'Fri'] as const).map((label, index) => (
          <text
            key={label}
            x={0}
            y={TOP + index * 2 * PITCH + 9}
            className="fill-current font-mono text-[9px] tracking-[0.1em] uppercase opacity-60"
          >
            {label}
          </text>
        ))}
        {CALENDAR.days.map((day) => (
          <rect
            key={day.key}
            x={LEFT + day.week * PITCH}
            y={TOP + day.weekday * PITCH}
            width={CELL}
            height={CELL}
            rx={2}
            className={LEVEL_CLASSES[day.level]}
          />
        ))}
      </svg>
      <div aria-hidden="true" className="mono-label mt-3 flex max-w-3xl items-center justify-end gap-1.5 text-muted">
        <span className="mr-1">Fewer</span>
        {LEVEL_CLASSES.map((cls) => (
          <svg key={cls} width={12} height={12} viewBox="0 0 12 12">
            <rect width={12} height={12} rx={2} className={cls} />
          </svg>
        ))}
        <span className="ml-1">More</span>
      </div>
    </DiagramFrame>
  )
}
