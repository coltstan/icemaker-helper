import type { Part, PartGroup } from './types'

// ---------------------------------------------------------------------------
// Parts catalogue for the KitchenAid KUIX505ESS2 15" built-in ice maker.
// Prices/part numbers verified for this model unless a `note`/flag says
// otherwise. To edit: change the values below — the 3D viewer, legend, and
// wizard all read from this list. `region` must match a mesh group id in
// components/IceMakerModel.tsx.
// ---------------------------------------------------------------------------

export const MODEL_NUMBER = 'KUIX505ESS2'
export const MODEL_URL = `https://www.partselect.com/Models/${MODEL_NUMBER}/`

/** PartSelect search by part/model number resolves reliably to the part page.
 *  Pass the currently-selected model's URL so model-page fallbacks track the picker. */
export function partUrl(part: Part, fallbackModelUrl: string = MODEL_URL): string {
  if (part.partNumber) {
    return `https://www.partselect.com/Search/?SearchTerm=${encodeURIComponent(part.partNumber)}`
  }
  return fallbackModelUrl
}

export const GROUP_LABELS: Record<PartGroup, string> = {
  unit: 'Unit / sealed-system parts',
  water: 'Water system parts',
  controls: 'Controls',
  interior: 'Interior components (not sold separately)',
}

export const GROUP_ORDER: PartGroup[] = ['unit', 'water', 'controls', 'interior']

export const PARTS: Part[] = [
  // --- Unit / sealed-system (behind the TOP louvered grille) ---------------
  {
    id: 'condenser-coil',
    name: 'Condenser coil',
    group: 'unit',
    region: 'condenser',
    whatItDoes:
      'Releases heat from the refrigerant so it can condense. Airflow over its fins is what lets the system freeze water.',
    location: 'Behind the top louvered grille.',
    partNumber: 'WP2313624',
    price: 195.32,
    modelSection: 'Unit Parts',
    fitmentConfirmed: false,
    note:
      'Sealed-system part — requires EPA-certified refrigerant work, NOT a DIY swap. A dirty condenser does NOT need replacing; it needs cleaning. Clean it first (it is free).',
  },
  {
    id: 'condenser-fan-motor',
    name: 'Condenser fan motor',
    group: 'unit',
    region: 'condenser-fan',
    whatItDoes: 'Spins the fan blade to pull air across the condenser coil.',
    location: 'Top compartment, mounted to the fan bracket behind the grille.',
    partNumber: 'PS16744942',
    price: 68.86,
    alsoSoldAs: 'Also sold as a "Condenser Fan Motor Kit" (~$82.05).',
    modelSection: 'Unit Parts',
    fitmentConfirmed: true,
  },
  {
    id: 'condenser-fan-blade',
    name: 'Condenser fan blade',
    group: 'unit',
    region: 'condenser-fan',
    whatItDoes: 'Moves air across the condenser coil to carry heat away.',
    location: 'On the condenser fan motor shaft, behind the grille.',
    partNumber: 'PS11739145',
    price: 51.61,
    modelSection: 'Unit Parts',
    fitmentConfirmed: true,
  },
  {
    id: 'fan-mounting-bracket',
    name: 'Fan mounting bracket',
    group: 'unit',
    region: 'condenser-fan',
    whatItDoes: 'Holds the condenser fan motor in position.',
    location: 'Top compartment, behind the grille.',
    partNumber: 'PS11739067',
    price: 51.61,
    modelSection: 'Unit Parts',
    fitmentConfirmed: true,
  },
  {
    id: 'fan-wiring-harness',
    name: 'Condenser fan wiring harness',
    group: 'unit',
    region: 'condenser-fan',
    whatItDoes: 'Carries power to the condenser fan motor.',
    location: 'Top compartment, behind the grille.',
    partNumber: 'PS11739100',
    price: 55.29,
    modelSection: 'Unit Parts',
    fitmentConfirmed: true,
  },
  {
    id: 'compressor-service-kit',
    name: 'Compressor service kit',
    group: 'unit',
    region: 'compressor',
    whatItDoes: 'Pressurises refrigerant to drive the cooling cycle.',
    location: 'Sealed system, in the lower mechanical area.',
    partNumber: 'PS17917444',
    price: 369.1,
    modelSection: 'Unit Parts',
    fitmentConfirmed: true,
    note: 'Sealed-system part — certified tech only.',
  },
  {
    id: 'compressor-overload',
    name: 'Compressor overload',
    group: 'unit',
    region: 'compressor',
    whatItDoes: 'Protects the compressor by cutting power if it overheats or stalls.',
    location: 'On the compressor body.',
    partNumber: 'PS16745137',
    price: 43.18,
    modelSection: 'Unit Parts',
    fitmentConfirmed: true,
  },

  // --- Water system --------------------------------------------------------
  {
    id: 'water-inlet-valve',
    name: 'Water inlet valve',
    group: 'water',
    region: 'water-inlet-valve',
    whatItDoes: 'Opens to let household water into the ice maker; closes to stop the fill.',
    location: 'Rear of the unit, where the water line connects.',
    price: 148.64,
    modelSection: 'Unit Parts',
    fitmentConfirmed: true,
  },
  {
    id: 'distributor-tube',
    name: 'Ice maker water distributor tube',
    group: 'water',
    region: 'distributor-tube',
    whatItDoes: 'Spreads water evenly across the evaporator plate so cubes form uniformly.',
    location: 'Above the evaporator plate, inside the cabinet.',
    partNumber: 'PS11738017',
    oemNumber: 'W10863947',
    price: 51.61,
    modelSection: 'Evaporator / Grid / Water',
    fitmentConfirmed: true,
  },
  {
    id: 'water-pump',
    name: 'Water pump',
    group: 'water',
    region: 'water-pump',
    whatItDoes: 'Circulates water from the pan over the evaporator plate during freezing.',
    location: 'Lower water-system area, near the water pan.',
    price: 75.58,
    modelSection: 'Evaporator / Grid / Water',
    fitmentConfirmed: true,
  },
  {
    id: 'water-filter',
    name: 'Water filter (ICE2 / F2WC9I1)',
    group: 'water',
    region: 'water-filter',
    whatItDoes:
      'Filters incoming water for cleaner, better-tasting ice. If it is not installed and locked, the unit will not make ice.',
    location: 'Behind the front control-panel door.',
    partNumber: 'PS8759230',
    oemNumber: 'F2WC9I1',
    price: 78.26,
    modelSection: 'Control Panel',
    fitmentConfirmed: true,
    note: 'Behind the front control-panel door. Must be seated and locked or the unit will not produce ice.',
  },

  // --- Controls ------------------------------------------------------------
  {
    id: 'bin-temp-sensor',
    name: 'Ice maker bin temperature sensor',
    group: 'controls',
    region: 'bin-temp-sensor',
    whatItDoes: 'Reports storage-bin temperature so the control knows when to make more ice.',
    location: 'In the storage-bin area.',
    partNumber: 'PS11755842',
    oemNumber: 'WPW10511923',
    price: 54.24,
    modelSection: 'Control Panel',
    fitmentConfirmed: true,
  },
  {
    id: 'door-light-switch',
    name: 'Door light switch',
    group: 'controls',
    region: 'control-board',
    whatItDoes: 'Turns the interior light on and off as the door opens and closes.',
    location: 'On the door frame / front opening.',
    partNumber: 'W11291138',
    oemNumber: 'W11291138',
    modelSection: 'Control Panel',
    fitmentConfirmed: true,
  },
  {
    id: 'electric-control-board',
    name: 'Electric control board',
    group: 'controls',
    region: 'control-board',
    whatItDoes: 'Drives power to the ice maker components.',
    location: 'Behind the control panel / upper cabinet.',
    price: 235.03,
    modelSection: 'Control Panel',
    fitmentConfirmed: true,
  },
  {
    id: 'electronic-control-board',
    name: 'Electronic control board',
    group: 'controls',
    region: 'control-board',
    whatItDoes: 'Runs the ice-making logic, timers, and clean-cycle program.',
    location: 'Behind the control panel / upper cabinet.',
    price: 276.09,
    modelSection: 'Control Panel',
    fitmentConfirmed: true,
  },

  // --- Interior components (shown for orientation, not sold separately) -----
  {
    id: 'storage-bin',
    name: 'Storage bin',
    group: 'interior',
    region: 'storage-bin',
    whatItDoes: 'Holds finished ice. This is a storage unit — ice is made above, not frozen here.',
    location: 'Lower interior, behind the door.',
    modelSection: 'Evaporator / Grid / Water',
    fitmentConfirmed: true,
    infoOnly: true,
  },
  {
    id: 'water-pan',
    name: 'Water pan',
    group: 'interior',
    region: 'water-pan',
    whatItDoes:
      'Holds the water that is pumped over the evaporator plate. Its drain cap must be tight or you get thin / no ice.',
    location: 'Interior, below the cutter grid.',
    modelSection: 'Evaporator / Grid / Water',
    fitmentConfirmed: true,
    infoOnly: true,
  },
  {
    id: 'cutter-grid',
    name: 'Cutter grid',
    group: 'interior',
    region: 'cutter-grid',
    whatItDoes: 'Heated wires that slice the frozen ice sheet into individual cubes.',
    location: 'Interior, between the evaporator plate and the bin.',
    modelSection: 'Evaporator / Grid / Water',
    fitmentConfirmed: true,
    infoOnly: true,
  },
  {
    id: 'evaporator-plate',
    name: 'Evaporator plate',
    group: 'interior',
    region: 'evaporator-plate',
    whatItDoes: 'The cold plate where water freezes into an ice sheet. Part of the sealed system.',
    location: 'Upper-rear interior.',
    modelSection: 'Evaporator / Grid / Water',
    fitmentConfirmed: true,
    infoOnly: true,
  },
]

export function partById(id: string): Part | undefined {
  return PARTS.find((p) => p.id === id)
}

export function partsInRegion(region: string): Part[] {
  return PARTS.filter((p) => p.region === region)
}
