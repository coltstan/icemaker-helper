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
    <div className="relative min-h-full text-zinc-900 dark:text-zinc-100">
      <div className="backdrop" aria-hidden="true" />
      <div className="grid-overlay" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <header className="glass-bar sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <div className="leading-tight">
              <h1 className="text-[15px] font-bold tracking-tight text-zinc-900 dark:text-white">
                IceMaker Helper
              </h1>
              <ModelPicker />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <nav
              className="hidden rounded-full border border-zinc-200/70 bg-white/60 p-1 backdrop-blur sm:flex dark:border-zinc-700/60 dark:bg-zinc-900/50"
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
        {/* mobile nav */}
        <nav
          className="flex gap-1 border-t border-zinc-200/70 px-4 py-2 sm:hidden dark:border-zinc-800/70"
          aria-label="Sections"
        >
          <TabButton active={tab === 'explore'} onClick={() => setTab('explore')} grow>
            Explore
          </TabButton>
          <TabButton active={tab === 'solve'} onClick={() => setTab('solve')} grow>
            Diagnose
          </TabButton>
          <TabButton active={tab === 'ai'} onClick={() => setTab('ai')} grow>
            Ask AI
          </TabButton>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div key={tab} className="animate-up">
          {tab === 'explore' ? (
            <div className="space-y-8">
              <Hero
                purchasable={purchasable}
                onSolve={() => setTab('solve')}
                onAsk={() => setTab('ai')}
              />

              {/* ── Bento: hero viewer + parts panel ── */}
              <div className="grid items-stretch gap-5 lg:grid-cols-[1.65fr_1fr]">
                <div className="reveal" style={{ ['--d' as string]: '60ms' }}>
                  <Viewer3D
                    selectedRegion={selectedRegion}
                    selectedName={selectedName}
                    onSelect={selectRegion}
                  />
                </div>
                <aside className="reveal lg:sticky lg:top-24" style={{ ['--d' as string]: '120ms' }}>
                  <div className="card flex h-[58vh] flex-col overflow-hidden lg:h-[72vh]">
                    {selectedId ? (
                      <PartPanel selectedId={selectedId} onSelect={setSelectedId} />
                    ) : (
                      <div className="flex h-full flex-col p-5">
                        <div className="mb-4 flex items-baseline justify-between">
                          <span className="eyebrow">Parts catalog</span>
                          <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                            {purchasable} replaceable
                          </span>
                        </div>
                        <div className="-mr-2 flex-1 overflow-y-auto pr-2">
                          <PartsList selectedId={selectedId} onSelect={setSelectedId} />
                        </div>
                      </div>
                    )}
                  </div>
                </aside>
              </div>

              {/* ── Feature rail (also entry points to the other tabs) ── */}
              <div className="grid gap-5 sm:grid-cols-3">
                <FeatureTile
                  delay={160}
                  onClick={() => setTab('solve')}
                  icon={
                    <path d="M9.5 3 4 9l6 1 1 6 6-5.5M14.5 3 20 9M3 21l5-5" />
                  }
                  title="Cheapest fix first"
                  body="A guided decision tree that always points you at the simplest correct repair before the expensive one."
                  cta="Diagnose a problem"
                />
                <FeatureTile
                  delay={220}
                  onClick={() => setTab('ai')}
                  icon={
                    <>
                      <path d="M12 3a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4 4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z" />
                      <path d="M5 21a7 7 0 0 1 14 0" />
                    </>
                  }
                  title="AI diagnostician"
                  body="Describe the symptom in plain words. The assistant reasons over this exact model and walks you through it."
                  cta="Ask the AI"
                />
                <FeatureTile
                  delay={280}
                  onClick={() => setTab('explore')}
                  icon={
                    <>
                      <path d="M12 3 4 7v10l8 4 8-4V7z" />
                      <path d="M4 7l8 4 8-4M12 11v10" />
                    </>
                  }
                  title="True-to-unit 3D"
                  body="Spin a brushed-stainless model of the KUIX505ESS2, open the door, and tap any component to buy the right part."
                  cta="Explore the model"
                />
              </div>
            </div>
          ) : tab === 'solve' ? (
            <Wizard />
          ) : (
            <Assistant />
          )}
        </div>

        <div className="mt-10">
          <WarrantyCard />
        </div>
      </main>

      <footer className="relative z-10 mt-6 border-t border-zinc-200/70 dark:border-zinc-800/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-7 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-zinc-400">
          <p className="max-w-xl">
            Stylised reference model — not to exact scale. Confirm fitment with your model number
            before ordering any part.
          </p>
          <div className="flex shrink-0 items-center gap-4">
            <a
              href="tel:18004221230"
              className="cursor-pointer font-medium text-zinc-600 transition-colors hover:text-accent-700 dark:text-zinc-300 dark:hover:text-accent-400"
            >
              KitchenAid 1-800-422-1230
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer font-medium text-zinc-600 transition-colors hover:text-accent-700 dark:text-zinc-300 dark:hover:text-accent-400"
            >
              Source on GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Hero({
  purchasable,
  onSolve,
  onAsk,
}: {
  purchasable: number
  onSolve: () => void
  onAsk: () => void
}) {
  return (
    <section className="relative pt-1">
      <span className="eyebrow">KitchenAid 15&quot; Built-in Ice Maker</span>
      <h2 className="display mt-4 text-[2.6rem] text-zinc-900 sm:text-6xl lg:text-[4.25rem] dark:text-white">
        Your ice maker,
        <br className="hidden sm:block" /> <span className="text-gradient">inside out.</span>
      </h2>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-[17px] dark:text-zinc-300">
        Spin a true-to-unit 3D model, tap any part to see what it does and where to buy it, then fix
        the most common problems yourself — always guided to the cheapest correct solution first.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSolve}
          className="btn-primary cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
        >
          Diagnose a problem
        </button>
        <button
          type="button"
          onClick={onAsk}
          className="btn-ghost cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          Ask the AI assistant
        </button>
      </div>

      {/* technical spec strip */}
      <dl className="mt-9 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-zinc-200/70 bg-zinc-200/40 sm:grid-cols-4 dark:border-zinc-800/70 dark:bg-zinc-800/40">
        <Spec label="Width" value={'14.9"'} />
        <Spec label="Height" value={'34.4"'} />
        <Spec label="Depth" value={'25.6"'} />
        <Spec label="Parts mapped" value={`${purchasable}`} />
      </dl>
    </section>
  )
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/70 px-4 py-3 backdrop-blur dark:bg-zinc-900/60">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-lg font-bold tracking-tight text-zinc-900 tabular-nums dark:text-white">
        {value}
      </dd>
    </div>
  )
}

function FeatureTile({
  icon,
  title,
  body,
  cta,
  onClick,
  delay,
}: {
  icon: React.ReactNode
  title: string
  body: string
  cta: string
  onClick: () => void
  delay: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ['--d' as string]: `${delay}ms` }}
      className="tile reveal group cursor-pointer p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-600 ring-1 ring-accent-200/70 transition-colors group-hover:bg-accent-600 group-hover:text-white dark:bg-accent-950/40 dark:text-accent-300 dark:ring-accent-900/60">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </span>
      <h3 className="mt-4 text-base font-bold tracking-tight text-zinc-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{body}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600 dark:text-accent-400">
        {cta}
        <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </button>
  )
}

function ModelPicker() {
  const { model, setModelId } = useModel()
  return (
    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
      <span>KitchenAid</span>
      <select
        value={model.id}
        onChange={(e) => setModelId(e.target.value)}
        aria-label="Select model"
        className="cursor-pointer rounded-md bg-zinc-100 px-1.5 py-0.5 font-semibold tracking-normal text-zinc-700 ring-1 ring-zinc-200 transition-colors hover:ring-accent-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700"
      >
        {MODELS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
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
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white/70 text-zinc-600 backdrop-blur transition-colors hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:text-white"
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
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 text-white shadow-lg shadow-accent-600/40 ring-1 ring-white/20"
    >
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18M3.2 7.5l17.6 9M20.8 7.5l-17.6 9" />
        <path d="M12 3 9.7 5.3M12 3l2.3 2.3M12 21l-2.3-2.3M12 21l2.3-2.3" />
        <path d="M3.2 7.5l3.1.1M3.2 7.5l-.1-3.1M20.8 16.5l-3.1-.1M20.8 16.5l.1 3.1" />
        <path d="M20.8 7.5l-3.1.1M20.8 7.5l.1-3.1M3.2 16.5l3.1-.1M3.2 16.5l-.1 3.1" />
      </svg>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
  grow,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  grow?: boolean
}) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
        grow ? 'flex-1' : ''
      } ${
        active
          ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900'
          : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
