import type { WizardStep } from './types'

// ---------------------------------------------------------------------------
// Guided problem solver — decision tree for the KUIX505ESS2.
// Logic follows the official manual + diagnosis order, and always steers
// toward the cheapest correct fix (clean the condenser before buying parts).
//
// To edit: add/adjust steps below. Every `next` and `partId` must match an
// existing step id / part id. `START_ID` is the entry point.
// ---------------------------------------------------------------------------

export const START_ID = 'start'

export const STEPS: Record<string, WizardStep> = {
  // --- Entry --------------------------------------------------------------
  start: {
    kind: 'question',
    id: 'start',
    question: "What's happening with the ice maker?",
    options: [
      { label: 'Runs but makes no / little ice & it melts', next: 'q-power' },
      { label: "Won't power on at all", next: 'c-power-off' },
      { label: 'Bad-tasting / cloudy / thin ice', next: 'c-water-quality' },
      { label: 'Noisy', next: 'c-noisy' },
      { label: 'Water / leak issue', next: 'c-leak' },
    ],
  },

  // --- Main path: runs but no/little ice ----------------------------------
  'q-power': {
    kind: 'question',
    id: 'q-power',
    question: 'Is the unit turned on and the water supply connected and open?',
    help: 'The on/off button must show the unit is on, and the household water shutoff feeding it must be open.',
    options: [
      { label: 'Yes — both on', next: 'q-filter' },
      { label: 'No / not sure', next: 'c-fix-power-water' },
    ],
  },
  'q-filter': {
    kind: 'question',
    id: 'q-filter',
    question: 'Is the water filter installed and locked in place?',
    help: 'Filter ICE2 / F2WC9I1 lives behind the front control-panel door. If it is not seated and locked, the unit will not make ice.',
    options: [
      { label: 'Yes — seated and locked', next: 'q-drain-cap' },
      { label: 'No / not locked', next: 'c-fix-filter' },
    ],
  },
  'q-drain-cap': {
    kind: 'question',
    id: 'q-drain-cap',
    question: 'Is the drain cap on the water pan tight?',
    help: 'A loose drain cap lets water escape during freezing, giving thin or no ice.',
    options: [
      { label: 'Yes — tight', next: 'q-room-temp' },
      { label: 'No / not sure', next: 'c-fix-drain-cap' },
    ],
  },
  'q-room-temp': {
    kind: 'question',
    id: 'q-room-temp',
    question: 'Is the room temperature above 90°F (32°C)?',
    help: 'High ambient temperature kills ice production — the condenser cannot shed enough heat.',
    options: [
      { label: 'Yes — it is hot in there', next: 'c-room-temp' },
      { label: 'No — normal room temp', next: 'q-descale' },
    ],
  },
  'q-descale': {
    kind: 'question',
    id: 'q-descale',
    question: 'Have you run the descale / clean cycle (Affresh, ~70 min)?',
    help: 'Important: the clean cycle only cleans the WATER system. It does NOT clean the condenser.',
    options: [
      { label: 'Yes — already descaled', next: 'q-condenser-heat' },
      { label: 'No — not yet', next: 'c-run-descale' },
    ],
  },
  'q-condenser-heat': {
    kind: 'question',
    id: 'q-condenser-heat',
    question: 'Does the top grille radiate a lot of heat AND is the unit running continuously?',
    help: 'A dirt/lint-blocked condenser raises operating temperature so the unit runs non-stop but cannot freeze. This is the most common cause.',
    options: [
      { label: 'Yes — hot grille, runs constantly', next: 'c-dirty-condenser' },
      { label: 'No — not unusually hot', next: 'q-fan' },
    ],
  },
  'q-fan': {
    kind: 'question',
    id: 'q-fan',
    question: 'Can you feel air being pushed out of the top grille (is the condenser fan running)?',
    help: 'Stand near the top grille while the unit runs. Moving air means the condenser fan is working.',
    options: [
      { label: 'No air — fan seems dead', next: 'c-fan-motor' },
      { label: 'Yes — air is moving', next: 'c-sealed-system' },
    ],
  },

  // --- Conclusions: main path --------------------------------------------
  'c-fix-power-water': {
    kind: 'conclusion',
    id: 'c-fix-power-water',
    title: 'Turn it on and open the water supply',
    tone: 'good',
    cause: 'The unit may simply be off or starved of water.',
    diy: 'diy',
    nextAction:
      'Turn the unit on, open the household water shutoff feeding it, then give it ~24 hours to start producing. If it still will not make ice, come back and continue.',
  },
  'c-fix-filter': {
    kind: 'conclusion',
    id: 'c-fix-filter',
    title: 'Seat and lock the water filter',
    tone: 'good',
    cause: 'An unlocked or missing filter (ICE2 / F2WC9I1) stops ice production by design.',
    diy: 'diy',
    partId: 'water-filter',
    nextAction:
      'Open the front control-panel door, push the filter fully in, and turn it to lock. Then wait ~24 hours and check again.',
  },
  'c-fix-drain-cap': {
    kind: 'conclusion',
    id: 'c-fix-drain-cap',
    title: 'Tighten the water-pan drain cap',
    tone: 'good',
    cause: 'A loose drain cap lets water drain away during the freeze cycle, causing thin or no ice.',
    diy: 'diy',
    partId: 'water-pan',
    nextAction: 'Hand-tighten the drain cap on the water pan, then give it ~24 hours and recheck.',
  },
  'c-room-temp': {
    kind: 'conclusion',
    id: 'c-room-temp',
    title: 'Cool the room down',
    tone: 'good',
    cause: 'Ambient above 90°F (32°C) prevents the condenser from rejecting enough heat to freeze water.',
    diy: 'diy',
    nextAction:
      'Lower the room temperature (or improve ventilation around the unit) below 90°F and recheck. Also confirm the condenser is clean — heat builds up faster when it is dirty.',
  },
  'c-run-descale': {
    kind: 'conclusion',
    id: 'c-run-descale',
    title: 'Run the clean / descale cycle',
    tone: 'good',
    cause: 'Scale build-up in the water system can choke production.',
    diy: 'diy',
    nextAction:
      'Run the Affresh clean cycle (~70 min). Remember this cleans only the WATER system, not the condenser — if ice does not recover, continue the diagnosis (the condenser is the next suspect).',
  },
  'c-dirty-condenser': {
    kind: 'conclusion',
    id: 'c-dirty-condenser',
    title: 'Most likely a dirty condenser',
    tone: 'warn',
    cause:
      'Dirt and lint blocking the condenser fins choke airflow, the operating temperature climbs, and the unit runs continuously without freezing.',
    diy: 'diy',
    nextAction:
      'Clean the condenser before buying any parts or calling anyone — it is the most common cause and costs nothing. Follow the guide below.',
    guide: 'condenser',
  },
  'c-fan-motor': {
    kind: 'conclusion',
    id: 'c-fan-motor',
    title: 'Possible failed condenser fan motor',
    tone: 'warn',
    cause:
      'No airflow at the grille while running points to a dead condenser fan motor — without it the coil overheats and ice production stops.',
    diy: 'tech',
    partId: 'condenser-fan-motor',
    nextAction:
      'First confirm the condenser is clean and the fan blade spins freely. If the motor is truly dead, replace it (see the part below). This involves mains wiring — use a qualified person if unsure.',
  },
  'c-sealed-system': {
    kind: 'conclusion',
    id: 'c-sealed-system',
    title: 'Likely a sealed-system fault',
    tone: 'bad',
    cause:
      'Condenser clean, fan working, airflow good, room temp normal — but it still will not freeze. That points to a refrigerant leak or a failing compressor.',
    diy: 'tech',
    nextAction:
      'This is NOT a DIY fix. Call a certified appliance/refrigeration tech. Check your warranty first — sealed-system parts may still be covered.',
  },

  // --- Other top-level branches ------------------------------------------
  'c-power-off': {
    kind: 'conclusion',
    id: 'c-power-off',
    title: 'No power — check the supply first',
    tone: 'warn',
    cause: 'The on/off button does not cut mains power, so a dead unit usually means no power is reaching it.',
    diy: 'diy',
    partId: 'electronic-control-board',
    nextAction:
      'Confirm it is plugged in (or the breaker for its circuit is on) and the outlet has power. If power is present but the unit stays completely dark, the control board or wiring may have failed — that is a tech repair.',
  },
  'c-water-quality': {
    kind: 'conclusion',
    id: 'c-water-quality',
    title: 'Water-quality fixes first',
    tone: 'good',
    cause:
      'Bad taste or cloudiness is usually the filter or scale; thin ice points at the drain cap or a struggling (often dirty) condenser.',
    diy: 'diy',
    partId: 'water-filter',
    nextAction:
      'Replace and lock the water filter, run the clean cycle, and discard the first few batches (early cloudiness is trapped air and is normal). For thin ice, also check the water-pan drain cap and clean the condenser.',
  },
  'c-noisy': {
    kind: 'conclusion',
    id: 'c-noisy',
    title: 'Pin down the noise',
    tone: 'warn',
    cause:
      'Some fan and water noise is normal. Rattling often means the fan blade or its bracket; loud buzzing on fill can be the water inlet valve.',
    diy: 'diy',
    partId: 'condenser-fan-blade',
    nextAction:
      'Listen for where the noise comes from. Rattling near the top grille → inspect the fan blade / bracket. Buzzing while filling with water → inspect the water inlet valve.',
  },
  'c-leak': {
    kind: 'conclusion',
    id: 'c-leak',
    title: 'Stop the water, then find the source',
    tone: 'warn',
    cause: 'Leaks usually come from the supply-line fittings, the water inlet valve, or a blocked drain.',
    diy: 'diy',
    partId: 'water-inlet-valve',
    nextAction:
      'Turn off the water supply to the unit. Check the line fittings and the inlet valve for drips, and make sure the drain is clear. Replace the inlet valve if it leaks or will not shut off.',
  },
}
