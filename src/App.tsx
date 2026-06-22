import { useState } from 'react'
import Viewer3D from './components/Viewer3D'
import PartsList from './components/PartsList'
import PartPanel from './components/PartPanel'
import Wizard from './components/Wizard'
import WarrantyCard from './components/WarrantyCard'
import { MODEL_NUMBER, partsInRegion, partById, PARTS } from './data/parts'

type Tab = 'explore' | 'solve'

export default function App() {
  const [tab, setTab] = useState<Tab>('explore')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedRegion = selectedId ? partById(selectedId)?.region ?? null : null
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
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === 'explore' ? (
          <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
            <div className="space-y-4">
              <Viewer3D selectedRegion={selectedRegion} onSelect={selectRegion} />
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
        ) : (
          <Wizard />
        )}

        <div className="mt-6">
          <WarrantyCard />
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-2 text-xs text-zinc-400 dark:text-zinc-500">
        Stylised reference model — not to exact scale. Confirm fitment with your model number before
        ordering any part.
      </footer>
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
        active
          ? 'bg-white text-zinc-900 shadow-sm'
          : 'text-zinc-300 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
