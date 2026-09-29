import { useState } from 'react'
import { NumberField } from './fields'

/**
 * The arithmetic behind per-document token accounting. Every document writes
 * its pages, rows and input and output tokens to its MySQL row; this is the
 * same sum one level up, for a month of documents. The prices are editable
 * examples, not a quote for any model, because list prices change.
 */

type Inputs = {
  documents: number
  pagesPerDocument: number
  tokensPerPage: number
  promptTokens: number
  outputTokens: number
  inputPrice: number
  outputPrice: number
}

const DEFAULTS: Inputs = {
  documents: 4_000,
  pagesPerDocument: 3,
  tokensPerPage: 300,
  promptTokens: 900,
  outputTokens: 600,
  inputPrice: 0.1,
  outputPrice: 0.4,
}

const count = new Intl.NumberFormat('en-US')
const dollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function smallDollars(value: number): string {
  if (value >= 0.01) return dollars.format(value)
  return `$${value.toPrecision(2)}`
}

export function TokenCostCalc() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const set = (key: keyof Inputs) => (next: number) => setInputs((current) => ({ ...current, [key]: next }))

  const inputTokens =
    inputs.documents * (inputs.pagesPerDocument * inputs.tokensPerPage + inputs.promptTokens)
  const outputTokens = inputs.documents * inputs.outputTokens
  const monthly = (inputTokens / 1e6) * inputs.inputPrice + (outputTokens / 1e6) * inputs.outputPrice
  const perDocument = inputs.documents > 0 ? monthly / inputs.documents : 0
  const pages = inputs.documents * inputs.pagesPerDocument
  const perPage = pages > 0 ? monthly / pages : 0

  return (
    <div className="rounded-lg border border-line p-5">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <NumberField id="tok-docs" label="Documents a month" value={inputs.documents} onChange={set('documents')} step={100} />
        <NumberField id="tok-pages" label="Pages per document" value={inputs.pagesPerDocument} onChange={set('pagesPerDocument')} min={1} />
        <NumberField id="tok-per-page" label="Input tokens per page" value={inputs.tokensPerPage} onChange={set('tokensPerPage')} step={10} />
        <NumberField id="tok-prompt" label="Prompt and schema tokens" value={inputs.promptTokens} onChange={set('promptTokens')} step={50} suffix="per doc" />
        <NumberField id="tok-out" label="Output tokens" value={inputs.outputTokens} onChange={set('outputTokens')} step={50} suffix="per doc" />
        <div className="grid grid-cols-2 gap-4">
          <NumberField id="tok-in-price" label="Input price" value={inputs.inputPrice} onChange={set('inputPrice')} step={0.01} suffix="$ / 1M" />
          <NumberField id="tok-out-price" label="Output price" value={inputs.outputPrice} onChange={set('outputPrice')} step={0.01} suffix="$ / 1M" />
        </div>
      </div>

      <output
        htmlFor="tok-docs tok-pages tok-per-page tok-prompt tok-out tok-in-price tok-out-price"
        aria-live="polite"
        className="mt-6 grid grid-cols-1 gap-5 border-t border-line pt-5 sm:grid-cols-3"
      >
        <span className="block">
          <span className="mono-label block text-muted">A month</span>
          <span className="mt-2 block font-display text-3xl leading-none font-extrabold tabular-nums">
            {dollars.format(monthly)}
          </span>
        </span>
        <span className="block">
          <span className="mono-label block text-muted">Per document</span>
          <span className="mt-2 block font-display text-3xl leading-none font-extrabold tabular-nums">
            {smallDollars(perDocument)}
          </span>
        </span>
        <span className="block">
          <span className="mono-label block text-muted">Per page</span>
          <span className="mt-2 block font-display text-3xl leading-none font-extrabold tabular-nums">
            {smallDollars(perPage)}
          </span>
        </span>
        <span className="block text-sm text-muted sm:col-span-3">
          {count.format(inputTokens)} input and {count.format(outputTokens)} output tokens across{' '}
          {count.format(pages)} pages.
        </span>
      </output>

      <p className="mono-label mt-5 text-muted">
        Example prices, not a quote. Set them to your model&apos;s current price list.
      </p>
    </div>
  )
}
