import { useState } from 'react'

export default function WarrantyCard() {
  const [open, setOpen] = useState(false)

  return (
    <section className="elev rounded-2xl bg-white ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-700/60">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      >
        <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Warranty & service helper
        </span>
        <span aria-hidden="true" className="text-zinc-400">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-zinc-200 px-5 py-4 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
          <div>
            <p className="font-semibold text-zinc-800 dark:text-zinc-100">Coverage</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>3-year parts &amp; labor.</li>
              <li>
                Years 4–5: sealed-system parts only (compressor, evaporator, condenser,
                dryer/strainer, tubing) — labor NOT included.
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-zinc-800 dark:text-zinc-100">KitchenAid service</p>
            <p className="mt-1">
              Call{' '}
              <a
                href="tel:18004221230"
                className="cursor-pointer font-medium text-accent-700 underline hover:text-accent-700 dark:text-accent-400"
              >
                1-800-422-1230
              </a>
              . Have your model (KUIX505ESS2) and serial number ready.
            </p>
          </div>

          <div>
            <p className="font-semibold text-zinc-800 dark:text-zinc-100">
              Find local repair / get quotes
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Get the diagnosis and an itemized price before any work begins.</li>
              <li>Get 2–3 quotes for anything beyond a cleaning.</li>
              <li>
                Be wary of a major-repair quote given before the condenser has even been checked.
              </li>
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
