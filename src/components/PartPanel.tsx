import { useState } from 'react'
import { partById, partsInRegion, partUrl } from '../data/parts'
import { SYSTEMS } from '../data/systems'
import { useModel } from '../data/modelContext'
import type { Part } from '../data/types'

interface PartPanelProps {
  selectedId: string | null
  onSelect: (id: string | null) => void
}

/** Inline detail view for the selected part. Rendered in the right column / below
 *  the viewer; App shows the parts list when nothing is selected. */
export default function PartPanel({ selectedId, onSelect }: PartPanelProps) {
  const part = selectedId ? partById(selectedId) : undefined
  if (!part) return null

  return (
    <div className="flex h-full flex-col overflow-y-auto p-5" role="region" aria-label="Part details">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className="mb-4 inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        All parts
      </button>
      <PartDetail key={part.id} part={part} onSelect={onSelect} />
    </div>
  )
}

function PartDetail({ part, onSelect }: { part: Part; onSelect: (id: string | null) => void }) {
  const siblings = partsInRegion(part.region).filter((p) => p.id !== part.id)
  const system = SYSTEMS[part.group]
  const { url: modelPageUrl } = useModel()
  const [copied, setCopied] = useState(false)

  function copyNumber() {
    if (!part.partNumber) return
    navigator.clipboard?.writeText(part.partNumber).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      },
      () => {},
    )
  }

  return (
    <div className="space-y-4">
      <div className="min-w-0">
        <span
          className={`mb-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${system.chip}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${system.dot}`} />
          {system.label}
        </span>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {part.name}
        </h2>
        {part.partNumber && (
          <button
            type="button"
            onClick={copyNumber}
            title="Copy part number"
            className="group mt-0.5 inline-flex cursor-pointer items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-accent-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:text-zinc-400 dark:hover:text-accent-400"
          >
            <span>Part #{part.partNumber}</span>
            <span className="text-xs text-zinc-400 group-hover:text-accent-700 dark:group-hover:text-accent-400">
              {copied ? '✓ copied' : 'copy'}
            </span>
          </button>
        )}
        {part.oemNumber && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">OEM / mfr #{part.oemNumber}</p>
        )}
      </div>

      {!part.infoOnly && (
        <div className="flex flex-wrap items-center gap-2">
          {part.price != null && (
            <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-sm font-semibold tabular-nums text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
              ${part.price.toFixed(2)}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Typically in stock
          </span>
        </div>
      )}

      <Field label="What it does">{part.whatItDoes}</Field>
      <Field label="Where it sits">{part.location}</Field>
      {part.alsoSoldAs && <Field label="Also sold as">{part.alsoSoldAs}</Field>}

      {part.note && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
          {part.note}
        </div>
      )}

      {!part.fitmentConfirmed && (
        <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm font-medium text-rose-800 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
          Fitment NOT confirmed for this model. Verify before ordering.
        </div>
      )}

      {!part.infoOnly && (
        <a
          href={partUrl(part, modelPageUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary block cursor-pointer rounded-xl px-4 py-2.5 text-center text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
        >
          View / buy part on PartSelect
        </a>
      )}

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        On PartSelect look under the “{part.modelSection}” section.{' '}
        <a
          href={modelPageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer text-accent-700 underline hover:text-accent-800 dark:text-accent-400"
        >
          Open the model page
        </a>
        . Confirm fitment with your model number before ordering.
      </p>

      {siblings.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Other parts in this area
          </p>
          <div className="flex flex-wrap gap-1.5">
            {siblings.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s.id)}
                className="cursor-pointer rounded-full border border-zinc-300 px-2.5 py-1 text-xs text-zinc-700 transition-colors duration-200 hover:border-accent-500 hover:text-accent-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-zinc-600 dark:text-zinc-300 dark:hover:text-accent-400"
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">{children}</p>
    </div>
  )
}
