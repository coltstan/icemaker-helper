// ---------------------------------------------------------------------------
// Shared types for the IceMaker Helper data module.
// Everything the app shows comes from data/ — no backend. Edit those files.
// ---------------------------------------------------------------------------

/** Which section of the legend / parts list a part belongs to. */
export type PartGroup = 'unit' | 'water' | 'controls' | 'interior'

/**
 * A part (or, when `infoOnly`, a structural interior component that is not
 * sold separately). `region` is the id of the 3D mesh group this part maps to
 * in `IceMakerModel` — clicking that mesh selects this part, and selecting the
 * part highlights that mesh.
 */
export interface Part {
  id: string
  name: string
  group: PartGroup
  /** id of the clickable 3D mesh group this part lives in (see IceMakerModel). */
  region: string
  whatItDoes: string
  /** Where it physically sits in the unit. */
  location: string
  /** PartSelect "PS…" number, or manufacturer number (e.g. WP2313624). */
  partNumber?: string
  /** OEM / manufacturer part number, shown for cross-referencing. */
  oemNumber?: string
  price?: number
  /** Optional secondary purchase form, e.g. a kit. */
  alsoSoldAs?: string
  /** Which PartSelect model-page section to look under if buying by model. */
  modelSection: string
  /** Caution / context shown prominently in the detail panel. */
  note?: string
  /** false → show a "fitment not confirmed" warning. */
  fitmentConfirmed: boolean
  /** true → structural component, not a purchasable part (no price / buy link). */
  infoOnly?: boolean
}

// --- Troubleshooting wizard (decision tree) --------------------------------

export type Diy = 'diy' | 'tech'

export interface WizardOption {
  label: string
  /** id of the next step (question or conclusion). */
  next: string
}

export interface QuestionStep {
  kind: 'question'
  id: string
  question: string
  /** Optional supporting detail shown under the question. */
  help?: string
  options: WizardOption[]
}

export interface ConclusionStep {
  kind: 'conclusion'
  id: string
  title: string
  /** Overall feel of the outcome — drives the accent colour. */
  tone: 'good' | 'warn' | 'bad'
  cause: string
  diy: Diy
  /** id of a related part to link to, if any. */
  partId?: string
  nextAction: string
  /** When set, render the prominent step-by-step guide. */
  guide?: 'condenser'
}

export type WizardStep = QuestionStep | ConclusionStep
