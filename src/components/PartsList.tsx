import { PARTS, GROUP_LABELS, GROUP_ORDER } from '../data/parts'
import type { Part } from '../data/types'

interface PartsListProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function PartsList({ selectedId, onSelect }: PartsListProps) {
  return (
    <div className="space-y-4">
      {GROUP_ORDER.map((group) => {
        const parts = PARTS.filter((p) => p.group === group)
        if (parts.length === 0) return null
        return (
          <section key={group}>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
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
      className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
        selected
          ? 'border-accent-500 bg-accent-50 dark:bg-accent-950/40'
          : 'border-transparent hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800'
      }`}
    >
      <span className="font-medium text-zinc-800 dark:text-zinc-100">
        {part.name}
        {!part.fitmentConfirmed && (
          <span className="ml-1.5 align-middle text-amber-600 dark:text-amber-400" title="Fitment not confirmed">
            ⚠
          </span>
        )}
      </span>
      <span className="shrink-0 tabular-nums text-zinc-500 dark:text-zinc-400">
        {part.infoOnly ? 'info' : part.price != null ? `$${part.price.toFixed(2)}` : '—'}
      </span>
    </button>
  )
}
