import type { PartGroup } from './types'

// ---------------------------------------------------------------------------
// System colour coding. The same four "systems" drive the dots in the parts
// list, the chip in the detail panel, the key in the 3D viewer, and (in spirit)
// the materials in the 3D model — so the whole app reads as one language.
// ---------------------------------------------------------------------------

export interface SystemMeta {
  label: string
  short: string
  /** Tailwind background for a small colour dot. */
  dot: string
  /** Tailwind classes for a chip/badge. */
  chip: string
}

export const SYSTEMS: Record<PartGroup, SystemMeta> = {
  unit: {
    label: 'Sealed / cooling system',
    short: 'Cooling',
    dot: 'bg-slate-500',
    chip: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  water: {
    label: 'Water system',
    short: 'Water',
    dot: 'bg-blue-500',
    chip: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  },
  controls: {
    label: 'Controls',
    short: 'Controls',
    dot: 'bg-emerald-500',
    chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
  interior: {
    label: 'Interior / structure',
    short: 'Structure',
    dot: 'bg-zinc-400',
    chip: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  },
}

/** Order used for the small colour key in the 3D viewer. */
export const SYSTEM_KEY: PartGroup[] = ['unit', 'water', 'controls', 'interior']
