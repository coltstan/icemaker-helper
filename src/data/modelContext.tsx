import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

// The KUIX505ESS family (…ESS0/ESS1/ESS2) is the same 15" cabinet and shares
// the same verified parts catalogue — so one dataset serves all three. Add new
// models here; give each its own data module later if parts diverge.
export interface IceMakerModelInfo {
  id: string
  name: string
  /** Marketing name shown in the picker subtitle. */
  blurb: string
}

export const MODELS: IceMakerModelInfo[] = [
  { id: 'KUIX505ESS2', name: 'KUIX505ESS2', blurb: '15" automatic ice maker · PrintShield' },
  { id: 'KUIX505ESS1', name: 'KUIX505ESS1', blurb: '15" automatic ice maker (rev 1)' },
  { id: 'KUIX505ESS0', name: 'KUIX505ESS0', blurb: '15" automatic ice maker (rev 0)' },
]

export function modelUrl(id: string): string {
  return `https://www.partselect.com/Models/${id}/`
}

interface ModelContextValue {
  model: IceMakerModelInfo
  setModelId: (id: string) => void
  url: string
}

const ModelContext = createContext<ModelContextValue | null>(null)

export function ModelProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState(MODELS[0].id)
  const value = useMemo<ModelContextValue>(() => {
    const model = MODELS.find((m) => m.id === id) ?? MODELS[0]
    return { model, setModelId: setId, url: modelUrl(model.id) }
  }, [id])
  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>
}

export function useModel(): ModelContextValue {
  const ctx = useContext(ModelContext)
  if (!ctx) throw new Error('useModel must be used within ModelProvider')
  return ctx
}
