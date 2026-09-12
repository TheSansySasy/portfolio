export type MonogramVariant = 'ligature' | 'grid' | 'roundel'

/** Modular 5x5 bitmaps for S and R, drawn on an 11x5 field. Used by the grid mark. */
const S_ROWS = ['11111', '10000', '11111', '00001', '11111']
const R_ROWS = ['11110', '10010', '11110', '10100', '10010']

function cellsFrom(rows: string[], offsetX: number) {
  const cells: { x: number; y: number }[] = []
  rows.forEach((row, y) => {
    row.split('').forEach((cell, x) => {
      if (cell === '1') cells.push({ x: x + offsetX, y })
    })
  })
  return cells
}

function GridMark() {
  const cells = [...cellsFrom(S_ROWS, 0), ...cellsFrom(R_ROWS, 6)]
  return (
    <svg viewBox="0 0 11 5" fill="currentColor" aria-hidden="true" className="h-full w-auto">
      {cells.map(({ x, y }) => (
        <rect key={`${x}-${y}`} x={x + 0.06} y={y + 0.06} width={0.88} height={0.88} />
      ))}
    </svg>
  )
}

function LigatureMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-full w-auto">
      <text
        x="32"
        y="48"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="var(--font-display)"
        fontSize="48"
        fontWeight="800"
        letterSpacing="-7"
      >
        SR
      </text>
    </svg>
  )
}

function RoundelMark() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className="h-full w-auto">
      <defs>
        <path
          id="sr-roundel-ring"
          d="M 60 60 m -46 0 a 46 46 0 1 1 92 0 a 46 46 0 1 1 -92 0"
          fill="none"
        />
      </defs>
      <circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text
        x="60"
        y="73"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="var(--font-display)"
        fontSize="34"
        fontWeight="800"
        letterSpacing="-2"
      >
        SR
      </text>
      <text fill="currentColor" fontFamily="var(--font-mono)" fontSize="8.5" letterSpacing="2.6">
        <textPath href="#sr-roundel-ring" startOffset="2%">
          SANSKAR RAI · SANSYSASY · SANSKAR RAI · SANSYSASY ·
        </textPath>
      </text>
    </svg>
  )
}

export function Monogram({
  variant = 'grid',
  className = '',
  title = 'Sanskar Rai',
}: {
  variant?: MonogramVariant
  className?: string
  title?: string
}) {
  return (
    <span role="img" aria-label={title} className={`inline-flex items-center ${className}`}>
      {variant === 'grid' ? <GridMark /> : null}
      {variant === 'ligature' ? <LigatureMark /> : null}
      {variant === 'roundel' ? <RoundelMark /> : null}
    </span>
  )
}
