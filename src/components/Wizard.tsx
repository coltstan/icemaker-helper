import { useState } from 'react'
import { STEPS, START_ID } from '../data/troubleshooting'
import type { ConclusionStep, QuestionStep } from '../data/types'
import { partById, partUrl } from '../data/parts'
import CondenserGuide from './CondenserGuide'

interface Crumb {
  id: string
  /** The answer chosen at this step (undefined for the current/last step). */
  answer?: string
}

export default function Wizard() {
  // Progress trail: the visited step ids, current = last. `answers` records the
  // chosen option label at each answered step. State only — no localStorage.
  const [trail, setTrail] = useState<string[]>([START_ID])
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const currentId = trail[trail.length - 1]
  const current = STEPS[currentId]

  function choose(label: string, next: string) {
    setAnswers((a) => ({ ...a, [currentId]: label }))
    setTrail((t) => [...t, next])
  }

  function goBackTo(index: number) {
    // Truncate the trail so `index` becomes the current step again.
    setTrail((t) => t.slice(0, index + 1))
    setAnswers((a) => {
      const next = { ...a }
      trail.slice(index).forEach((id) => delete next[id])
      return next
    })
  }

  function restart() {
    setTrail([START_ID])
    setAnswers({})
  }

  const crumbs: Crumb[] = trail
    .slice(0, -1)
    .map((id) => ({ id, answer: answers[id] }))

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Progress trail */}
      {crumbs.length > 0 && (
        <nav aria-label="Your answers so far" className="flex flex-wrap items-center gap-1.5 text-xs">
          {crumbs.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => goBackTo(i)}
              className="cursor-pointer rounded-full border border-zinc-300 px-2.5 py-1 text-zinc-600 transition-colors duration-200 hover:border-accent-500 hover:text-accent-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-zinc-600 dark:text-zinc-300 dark:hover:text-accent-400"
            >
              {c.answer ?? 'Start'}
            </button>
          ))}
        </nav>
      )}

      {current.kind === 'question' ? (
        <Question step={current} onChoose={choose} />
      ) : (
        <Conclusion step={current} />
      )}

      {/* Step controls */}
      <div className="flex items-center gap-3 pt-1">
        {trail.length > 1 && (
          <button
            type="button"
            onClick={() => goBackTo(trail.length - 2)}
            className="cursor-pointer rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            ← Back
          </button>
        )}
        {trail.length > 1 && (
          <button
            type="button"
            onClick={restart}
            className="cursor-pointer text-sm font-medium text-zinc-500 underline transition-colors duration-200 hover:text-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Start over
          </button>
        )}
      </div>
    </div>
  )
}

function Question({
  step,
  onChoose,
}: {
  step: QuestionStep
  onChoose: (label: string, next: string) => void
}) {
  return (
    <div className="elev rounded-2xl bg-white p-5 ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-700/60">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{step.question}</h2>
      {step.help && (
        <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-300">{step.help}</p>
      )}
      <div className="mt-4 grid gap-2">
        {step.options.map((opt) => (
          <button
            key={opt.next + opt.label}
            type="button"
            onClick={() => onChoose(opt.label, opt.next)}
            className="cursor-pointer rounded-lg border border-zinc-300 px-4 py-3 text-left text-sm font-medium text-zinc-800 transition-colors duration-200 hover:border-accent-500 hover:bg-accent-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-zinc-600 dark:text-zinc-100 dark:hover:border-accent-500 dark:hover:bg-accent-950/40"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const TONE: Record<ConclusionStep['tone'], { ring: string; chip: string; label: string }> = {
  good: {
    ring: 'border-emerald-300 dark:border-emerald-700',
    chip: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
    label: 'Likely an easy fix',
  },
  warn: {
    ring: 'border-amber-300 dark:border-amber-700',
    chip: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
    label: 'Worth a closer look',
  },
  bad: {
    ring: 'border-rose-300 dark:border-rose-700',
    chip: 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300',
    label: 'Call a professional',
  },
}

function Conclusion({ step }: { step: ConclusionStep }) {
  const tone = TONE[step.tone]
  const part = step.partId ? partById(step.partId) : undefined

  return (
    <div className="space-y-4">
      <div className={`elev rounded-2xl border bg-white p-5 dark:bg-zinc-900 ${tone.ring}`}>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone.chip}`}>
            {tone.label}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              step.diy === 'diy'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200'
            }`}
          >
            {step.diy === 'diy' ? 'DIY' : 'Technician only'}
          </span>
        </div>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{step.title}</h2>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">{step.cause}</p>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Next action
          </p>
          <p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-200">{step.nextAction}</p>
        </div>

        {part && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                {part.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {part.partNumber ? `Part #${part.partNumber}` : 'See model page'}
                {part.price != null && ` · $${part.price.toFixed(2)}`}
              </p>
            </div>
            {!part.infoOnly && (
              <a
                href={partUrl(part)}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer rounded-lg bg-accent-600 px-3 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
              >
                View part
              </a>
            )}
          </div>
        )}
      </div>

      {step.guide === 'condenser' && <CondenserGuide />}
    </div>
  )
}
