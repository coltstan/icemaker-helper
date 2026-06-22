import { useMemo, useState } from 'react'
import { PARTS, GROUP_LABELS, GROUP_ORDER } from '../data/parts'
import { SYSTEMS } from '../data/systems'
import type { Part } from '../data/types'

interface PartsListProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function PartsList({ selectedId, onSelect }: PartsListProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return PARTS
    return PARTS.filter((p) =>
      [p.name, p.partNumber, p.oemNumber, p.whatItDoes]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    )
  }, [query])

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search parts or part number…"
          aria-label="Search parts"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 pl-8 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-accent-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="9" cy="9" r="6" />
          <path d="m18 18-4-4" strokeLinecap="round" />
        </svg>
      </div>

      {filtered.length === 0 && (
        <p className="px-1 text-sm text-zinc-500 dark:text-zinc-400">
          No parts match “{query}”.
        </p>
      )}

      {GROUP_ORDER.map((group) => {
        const parts = filtered.filter((p) => p.group === group)
        if (parts.length === 0) return null
        return (
          <section key={group}>
            <h3 className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              <span className={`h-2 w-2 rounded-full ${SYSTEMS[group].dot}`} />
              {GROUP_LABELS[group]}
            </h3>
            <ul className="space-y-1">
              {parts.map((part) => (
                <li key={part.id}>
                  <PartRow
                    part={part}
                    selected={part.id === selectedId}
                    onSelect={onSelect}
                  />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

function PartRow({
  part,
  selected,
  onSelect,
}: {
  part: Part
  selected: boolean
  onSelect: (id: string) => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(part.id)}
      className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
        selected
          ? 'border-accent-500 bg-accent-50 dark:bg-accent-950/40'
          : 'border-transparent hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800'
      }`}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${SYSTEMS[part.group].dot}`} />
        <span className="min-w-0">
          <span className="block truncate font-medium text-zinc-800 dark:text-zinc-100">
            {part.name}
            {!part.fitmentConfirmed && (
              <span
                className="ml-1.5 align-middle text-amber-600 dark:text-amber-400"
                title="Fitment not confirmed"
              >
                ⚠
              </span>
            )}
          </span>
          {part.partNumber && (
            <span className="block truncate text-xs text-zinc-400 dark:text-zinc-500">
              {part.partNumber}
            </span>
          )}
        </span>
      </span>
      <span className="shrink-0 tabular-nums text-zinc-500 dark:text-zinc-400">
        {part.infoOnly ? 'info' : part.price != null ? `$${part.price.toFixed(2)}` : '—'}
      </span>
    </button>
  )
}
