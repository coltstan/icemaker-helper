import { useState } from 'react'
import { partById, partsInRegion, partUrl } from '../data/parts'
import { SYSTEMS } from '../data/systems'
import { useModel } from '../data/modelContext'
import type { Part } from '../data/types'

interface PartPanelProps {
  selectedId: string | null
  onSelect: (id: string | null) => void
}

/**
 * Detail panel for the selected part. On desktop it sits in the right column;
 * on mobile it slides up as a bottom sheet when a part is selected.
 */
export default function PartPanel({ selectedId, onSelect }: PartPanelProps) {
  const part = selectedId ? partById(selectedId) : undefined

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 max-h-[75vh] overflow-y-auto rounded-t-2xl border-t border-zinc-200 bg-white p-5 shadow-2xl transition-transform duration-300 dark:border-zinc-700 dark:bg-zinc-900 lg:static lg:max-h-none lg:rounded-2xl lg:border-0 lg:p-5 lg:shadow-none lg:ring-1 lg:ring-zinc-200/70 lg:elev lg:dark:ring-zinc-700/60 ${
        part ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'
      }`}
      role="region"
      aria-label="Part details"
    >
      {part ? (
        <PartDetail key={part.id} part={part} onSelect={onSelect} />
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="hidden text-sm text-zinc-500 dark:text-zinc-400 lg:block">
      <h2 className="mb-1 text-base font-semibold text-zinc-800 dark:text-zinc-100">
        Part details
      </h2>
      <p>
        Tap a part in the 3D model or pick one from the list to see what it does, where it sits, and
        where to buy it.
      </p>
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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className={`mb-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${system.chip}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${system.dot}`} />
            {system.label}
          </span>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{part.name}</h2>
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
        <button
          type="button"
          onClick={() => onSelect(null)}
          aria-label="Close part details"
          className="shrink-0 cursor-pointer rounded-md p-1.5 text-zinc-400 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          ✕
        </button>
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
          className="block cursor-pointer rounded-lg bg-accent-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
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
      <p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-200">{children}</p>
    </div>
  )
}
