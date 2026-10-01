import { useState } from 'react'
import { Button } from '../ui/Button'

/**
 * One invoice, start to finish, with nothing sent anywhere: the document, the
 * structured data extracted from it, the checks that run before delivery, and
 * what the call cost. Everything is fixed and precomputed (the site has no
 * backend, by decision), and the invoice is made up.
 *
 * The second case is the one that matters: the model misreads one digit of the
 * total, the arithmetic catches it, and the document is held for review while
 * still being costed, because the tokens were spent either way.
 */

const LINES = [
  { description: 'Paper, A4, 80gsm', quantity: 50, unitPrice: 4.5, amount: 225 },
  { description: 'Toner cartridge', quantity: 5, unitPrice: 125, amount: 625 },
  { description: 'Service visit', quantity: 1, unitPrice: 400, amount: 400 },
]
const PRINTED_TOTAL = 1250
const USAGE = { pages: 1, rows: LINES.length, inputTokens: 1_800, outputTokens: 600 }
// The same example prices as the calculator below: $0.10 and $0.40 per million tokens.
const COST = (USAGE.inputTokens * 0.1 + USAGE.outputTokens * 0.4) / 1_000_000

type Case = 'clean' | 'misread'

const money = (value: number) => value.toFixed(2)
const count = new Intl.NumberFormat('en-US')

function extractedJson(total: number): string {
  return JSON.stringify(
    {
      invoice_number: 'INV-1042',
      invoice_date: '2026-09-14',
      supplier_name: 'Example Supplies Ltd',
      currency: 'USD',
      total: money(total),
      lines: LINES.map((line) => ({
        description: line.description,
        quantity: String(line.quantity),
        unit_price: money(line.unitPrice),
        amount: money(line.amount),
      })),
    },
    null,
    2,
  )
}

function Check({ ok, children }: { ok: boolean; children: string }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden="true" className={`mono-label mt-0.5 w-10 shrink-0 ${ok ? 'text-muted' : 'text-accent-text'}`}>
        {ok ? 'pass' : 'fail'}
      </span>
      <span>
        <span className="sr-only">{ok ? 'Passed: ' : 'Failed: '}</span>
        {children}
      </span>
    </li>
  )
}

export function ExtractionExample() {
  const [which, setWhich] = useState<Case>('clean')
  const extractedTotal = which === 'clean' ? PRINTED_TOTAL : 1300
  const linesTotal = LINES.reduce((sum, line) => sum + line.amount, 0)
  const totalsAgree = linesTotal === extractedTotal

  return (
    <div className="rounded-lg border border-line p-5">
      <div className="flex flex-wrap gap-3">
        <Button
          variant={which === 'clean' ? 'solid' : 'outline'}
          aria-pressed={which === 'clean'}
          onClick={() => setWhich('clean')}
        >
          Read correctly
        </Button>
        <Button
          variant={which === 'misread' ? 'solid' : 'outline'}
          aria-pressed={which === 'misread'}
          onClick={() => setWhich('misread')}
        >
          One digit misread
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className="mono-label text-muted">1 · The document</p>
          <div className="mt-3 rounded-md border border-line bg-surface p-4 text-sm">
            <p className="font-display text-lg font-extrabold">Example Supplies Ltd</p>
            <p className="mt-1 text-muted">Invoice INV-1042 · 14 September 2026</p>
            <table className="mt-4 w-full text-left text-[13px]">
              <thead>
                <tr className="mono-label text-muted">
                  <th scope="col" className="pb-2 font-normal">
                    Item
                  </th>
                  <th scope="col" className="pb-2 text-right font-normal">
                    Qty
                  </th>
                  <th scope="col" className="pb-2 text-right font-normal">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {LINES.map((line) => (
                  <tr key={line.description} className="border-t border-line">
                    <td className="py-1.5">{line.description}</td>
                    <td className="py-1.5 text-right tabular-nums">{line.quantity}</td>
                    <td className="py-1.5 text-right tabular-nums">{money(line.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-line font-semibold">
                  <th scope="row" colSpan={2} className="pt-2 text-left">
                    Total, USD
                  </th>
                  <td className="pt-2 text-right tabular-nums">{money(PRINTED_TOTAL)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div>
          <p className="mono-label text-muted">2 · What extraction returns</p>
          <pre
            tabIndex={0}
            aria-label="Extracted data as JSON"
            className="mt-3 max-h-72 overflow-auto rounded-md border border-line p-4 font-mono text-[12px] leading-relaxed"
          >
            <code>{extractedJson(extractedTotal)}</code>
          </pre>
        </div>
      </div>

      <div aria-live="polite" className="mt-6 grid grid-cols-1 gap-6 border-t border-line pt-5 md:grid-cols-2">
        <div>
          <p className="mono-label text-muted">3 · Checks before delivery</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <Check ok>Every line multiplies out: quantity times unit price is the amount.</Check>
            <Check ok={totalsAgree}>
              {totalsAgree
                ? `The lines add up to the total, ${money(extractedTotal)}.`
                : `The lines add up to ${money(linesTotal)}, but the total says ${money(extractedTotal)}.`}
            </Check>
          </ul>
          <p className="mt-4 border-l-2 border-accent pl-4 text-sm">
            {totalsAgree
              ? 'Delivered to the client system.'
              : 'Held for review, not delivered. A person looks at it before the ERP ever sees it.'}
          </p>
        </div>

        <div>
          <p className="mono-label text-muted">4 · What gets recorded</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted">Pages</dt>
            <dd className="text-right tabular-nums">{USAGE.pages}</dd>
            <dt className="text-muted">Rows</dt>
            <dd className="text-right tabular-nums">{USAGE.rows}</dd>
            <dt className="text-muted">Input tokens</dt>
            <dd className="text-right tabular-nums">{count.format(USAGE.inputTokens)}</dd>
            <dt className="text-muted">Output tokens</dt>
            <dd className="text-right tabular-nums">{count.format(USAGE.outputTokens)}</dd>
            <dt className="text-muted">Cost</dt>
            <dd className="text-right tabular-nums">${COST.toFixed(5)}</dd>
          </dl>
          <p className="mt-4 text-sm text-muted">
            {totalsAgree
              ? 'Written in the same transaction as the result, before delivery.'
              : 'Recorded all the same: the tokens were spent, so the document is still costed.'}
          </p>
        </div>
      </div>

      <p className="mono-label mt-5 text-muted">
        A fixed, precomputed example. The invoice is made up and nothing is sent anywhere.
      </p>
    </div>
  )
}
