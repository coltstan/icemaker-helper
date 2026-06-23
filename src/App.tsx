import { useEffect, useState } from 'react'
import Viewer3D from './components/Viewer3D'
import PartsList from './components/PartsList'
import PartPanel from './components/PartPanel'
import Wizard from './components/Wizard'
import WarrantyCard from './components/WarrantyCard'
import Assistant from './components/Assistant'
import { partsInRegion, partById, PARTS } from './data/parts'
import { MODELS, useModel } from './data/modelContext'

type Tab = 'explore' | 'solve' | 'ai'

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
    <div className="relative min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="aurora" aria-hidden="true" />

      <header className="glass-bar sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
                IceMaker Helper
              </h1>
              <ModelPicker />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <nav
              className="flex gap-1 rounded-full bg-zinc-100/80 p-1 ring-1 ring-zinc-200/70 backdrop-blur dark:bg-zinc-800/60 dark:ring-zinc-700/60"
              aria-label="Sections"
            >
              <TabButton active={tab === 'explore'} onClick={() => setTab('explore')}>
                Explore
              </TabButton>
              <TabButton active={tab === 'solve'} onClick={() => setTab('solve')}>
                Diagnose
              </TabButton>
              <TabButton active={tab === 'ai'} onClick={() => setTab('ai')}>
                Ask AI
              </TabButton>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        <div key={tab} className="animate-up">
          {tab === 'explore' ? (
            <div className="space-y-6">
              <Hero onSolve={() => setTab('solve')} onAsk={() => setTab('ai')} />
              <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
                <div className="space-y-5">
                  <Viewer3D
                    selectedRegion={selectedRegion}
                    selectedName={selectedName}
                    onSelect={selectRegion}
                  />
                  <div className="card p-5">
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
          ) : tab === 'solve' ? (
            <Wizard />
          ) : (
            <Assistant />
          )}
        </div>

        <div className="mt-8">
          <WarrantyCard />
        </div>
      </main>

      <footer className="relative z-10 mt-4 border-t border-zinc-200/70 dark:border-zinc-800/70">
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

function Hero({ onSolve, onAsk }: { onSolve: () => void; onAsk: () => void }) {
  return (
    <section className="pt-2">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700 ring-1 ring-accent-200/70 dark:bg-accent-950/40 dark:text-accent-300 dark:ring-accent-900/60">
        <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
        KitchenAid 15" ice maker
      </span>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-[2.6rem] sm:leading-[1.1]">
        Your ice maker, <span className="text-gradient">inside out</span>.
      </h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300">
        Spin the 3D model, tap any part to see what it does and where to buy it, then fix the most
        common problems yourself — guided to the cheapest correct solution first.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSolve}
          className="btn-primary cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
        >
          Diagnose a problem
        </button>
        <button
          type="button"
          onClick={onAsk}
          className="cursor-pointer rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-zinc-800 ring-1 ring-zinc-200/80 backdrop-blur transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:bg-zinc-800/70 dark:text-zinc-100 dark:ring-zinc-700/70 dark:hover:bg-zinc-800"
        >
          Ask the AI assistant
        </button>
      </div>
    </section>
  )
}

function ModelPicker() {
  const { model, setModelId } = useModel()
  return (
    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
      <span>KitchenAid</span>
      <select
        value={model.id}
        onChange={(e) => setModelId(e.target.value)}
        aria-label="Select model"
        className="cursor-pointer rounded-md bg-zinc-100 px-1.5 py-0.5 font-medium text-zinc-700 ring-1 ring-zinc-200 transition-colors hover:ring-accent-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700"
      >
        {MODELS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
      <span className="hidden sm:inline">· 15" built-in</span>
    </p>
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
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200 transition-colors hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:text-white"
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

/** KitchenAid-style gradient brand mark — no external asset needed. */
function Logo() {
  return (
    <div
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 text-white shadow-sm shadow-accent-600/30 ring-1 ring-white/15"
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
      className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
        active
          ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-white'
          : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
