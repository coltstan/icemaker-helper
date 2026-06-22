import { useEffect, useState } from 'react'
import Viewer3D from './components/Viewer3D'
import PartsList from './components/PartsList'
import PartPanel from './components/PartPanel'
import Wizard from './components/Wizard'
import WarrantyCard from './components/WarrantyCard'
import { MODEL_NUMBER, partsInRegion, partById, PARTS } from './data/parts'

type Tab = 'explore' | 'solve'

const REPO_URL = 'https://github.com/coltstan/icemaker-helper'

export default function App() {
  const [tab, setTab] = useState<Tab>('explore')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = selectedId ? partById(selectedId) : undefined
  const selectedRegion = selected?.region ?? null
  const selectedName = selected?.name ?? null
  const purchasable = PARTS.filter((p) => !p.infoOnly).length

  function selectRegion(region: string | null) {
    if (!region) {
      setSelectedId(null)
      return
    }
    const first = partsInRegion(region)[0]
    if (first) setSelectedId(first.id)
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-50 to-zinc-100 text-zinc-900 dark:from-zinc-950 dark:to-zinc-900 dark:text-zinc-100">
      <header className="sticky top-0 z-30 border-b-2 border-accent-600 bg-zinc-950/95 text-white backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <h1 className="text-[15px] font-semibold uppercase leading-tight tracking-[0.18em]">
                IceMaker Helper
              </h1>
              <p className="text-xs text-zinc-400">
                KitchenAid {MODEL_NUMBER} · 15" built-in ice maker
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <nav
              className="flex gap-1 rounded-xl bg-zinc-900 p-1 ring-1 ring-zinc-800"
              aria-label="Sections"
            >
              <TabButton active={tab === 'explore'} onClick={() => setTab('explore')}>
                Parts explorer
              </TabButton>
              <TabButton active={tab === 'solve'} onClick={() => setTab('solve')}>
                Problem solver
              </TabButton>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === 'explore' ? (
          <div className="space-y-4">
            <TipBanner onSolve={() => setTab('solve')} />
            <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
              <div className="space-y-4">
                <Viewer3D
                  selectedRegion={selectedRegion}
                  selectedName={selectedName}
                  onSelect={selectRegion}
                />
                <div className="elev rounded-2xl bg-white p-4 ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-700/60">
                  <div className="mb-3 flex items-baseline justify-between">
                    <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                      Parts list
                    </h2>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {purchasable} replaceable parts
                    </span>
                  </div>
                  <PartsList selectedId={selectedId} onSelect={setSelectedId} />
                </div>
              </div>
              {/* Right column on desktop; bottom sheet on mobile. */}
              <PartPanel selectedId={selectedId} onSelect={setSelectedId} />
            </div>
          </div>
        ) : (
          <Wizard />
        )}

        <div className="mt-6">
          <WarrantyCard />
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-zinc-500 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl">
            Stylised reference model — not to exact scale. Confirm fitment with your model number
            before ordering any part.
          </p>
          <div className="flex shrink-0 items-center gap-4">
            <a
              href="tel:18004221230"
              className="cursor-pointer font-medium text-zinc-600 hover:text-accent-700 dark:text-zinc-300 dark:hover:text-accent-400"
            >
              KitchenAid 1-800-422-1230
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer font-medium text-zinc-600 hover:text-accent-700 dark:text-zinc-300 dark:hover:text-accent-400"
            >
              Source on GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

/** Class-based light/dark theme toggle. Initial value comes from the no-flash
 *  script in index.html (system preference or saved choice). */
function ThemeToggle() {
  const [dark, setDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  )
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light')
    } catch {}
  }, [dark])

  return (
    <button
      type="button"
      onClick={() => setDark((v) => !v)}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-zinc-900 text-zinc-200 ring-1 ring-zinc-800 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
    >
      {dark ? (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  )
}

function TipBanner({ onSolve }: { onSolve: () => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm dark:border-accent-900 dark:bg-accent-950/30 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-zinc-700 dark:text-zinc-200">
        <span className="font-semibold text-accent-700 dark:text-accent-300">Not making ice?</span>{' '}
        The most common cause is a dirty condenser — and cleaning it is free. Start with the guided
        problem solver before buying parts.
      </p>
      <button
        type="button"
        onClick={onSolve}
        className="shrink-0 cursor-pointer self-start rounded-lg bg-accent-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 sm:self-auto"
      >
        Open problem solver
      </button>
    </div>
  )
}

/** KitchenAid-style red brand mark — no external asset needed. */
function Logo() {
  return (
    <div
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-600 text-white shadow-sm ring-1 ring-white/15"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l2.2 4.5L19 8l-3.5 3.3.8 4.7L12 13.8 7.7 16l.8-4.7L5 8l4.8-.5z" />
      </svg>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
        active ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-300 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
