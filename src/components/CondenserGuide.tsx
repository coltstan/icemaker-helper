const STEPS: { title: string; body: string }[] = [
  {
    title: 'Cut power safely',
    body: 'Unplug the unit. If it is built in flush with no reachable plug, switch off the breaker for that circuit and confirm the unit goes dark. The on/off button does NOT cut power.',
  },
  {
    title: 'Find the condenser',
    body: 'It is the finned coil behind the top louvered grille.',
  },
  {
    title: 'Clean through the louvers',
    body: 'You often do not need to remove the grille. Vacuum and brush the coil through the louvers with a crevice tool and a flexible refrigerator coil brush. Brush gently along the fins so you do not bend them.',
  },
  {
    title: 'Only if full removal is needed',
    body: "This unit's flush built-in / top-vent install is non-standard and not covered by the generic manual. Confirm grille removal with KitchenAid (1-800-422-1230) before prying anything off.",
  },
  {
    title: 'Wait and recheck',
    body: 'Restore power and give it 24 hours, then check whether ice production has recovered.',
  },
]

export default function CondenserGuide() {
  return (
    <div className="card p-5">
      <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm font-medium text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
        A dirty condenser is the most common and cheapest cause — fixing it costs nothing. Try this
        before buying any parts or calling anyone.
      </div>

      <h3 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Clean the condenser
      </h3>

      <ol className="space-y-3">
        {STEPS.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span
              aria-hidden="true"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-600 text-xs font-bold text-white"
            >
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{step.title}</p>
              <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-300">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
