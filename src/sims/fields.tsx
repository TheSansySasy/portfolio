/** Small form controls shared by the dossier calculators. */

export function NumberField({
  id,
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  suffix,
}: {
  id: string
  label: string
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="mono-label text-muted">
        {label}
      </label>
      <div className="flex items-baseline gap-2 border-b border-line pb-1 transition-colors focus-within:border-accent">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => {
            const next = event.target.valueAsNumber
            onChange(Number.isFinite(next) ? Math.min(max ?? Infinity, Math.max(min, next)) : min)
          }}
          className="w-full min-w-0 bg-transparent font-display text-2xl font-extrabold tabular-nums"
        />
        {suffix ? <span className="mono-label shrink-0 text-muted">{suffix}</span> : null}
      </div>
    </div>
  )
}

export function SelectField<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (next: T) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="mono-label text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="border-b border-line bg-transparent pb-1 font-display text-2xl font-extrabold transition-colors focus:border-accent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-bg text-text">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
