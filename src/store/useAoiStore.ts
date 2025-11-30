import { create } from 'zustand'
import type { Feature, FeatureCollection, Polygon } from 'geojson'
import { AOI_SETS, type Aoi } from '../data/aoi'

type DrawnFeature = Feature<Polygon>
type ActivePanel = 'overview' | 'alerts'

interface AoiState {
  aois: Aoi[]
  selectedId: string
  hoveredId: string | null
  showBaseLayer: boolean
  showWmsLayer: boolean
  showDrawnLayer: boolean
  ui: {
    activePanel: ActivePanel
  }
  drawn: DrawnFeature[]
  selectAoi: (id: string) => void
  setHovered: (id: string | null) => void
  toggleBaseLayer: () => void
  toggleWmsLayer: () => void
  toggleDrawnLayer: () => void
  setActivePanel: (panel: ActivePanel) => void
  upsertDrawn: (feature: DrawnFeature) => void
  clearDrawn: () => void
  hydrateFromStorage: () => void
}

const DRAWN_STORAGE_KEY = 'flowbit:aoi-drawings'

const parseStoredFeatures = (): DrawnFeature[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(DRAWN_STORAGE_KEY)
    if (!raw) return []
    const parsed: FeatureCollection<Polygon> = JSON.parse(raw)
    return parsed.features as DrawnFeature[]
  } catch {
    return []
  }
}

export const useAoiStore = create<AoiState>((set, _get) => ({
  aois: AOI_SETS,
  selectedId: AOI_SETS[0].id,
  hoveredId: null,
  showBaseLayer: true,
  showWmsLayer: true,
  showDrawnLayer: true,
  ui: {
    activePanel: 'overview',
  },
  drawn: [],
  selectAoi: (id) => set({ selectedId: id }),
  setHovered: (id) => set({ hoveredId: id }),
  toggleBaseLayer: () => set((state) => ({ showBaseLayer: !state.showBaseLayer })),
  toggleWmsLayer: () => set((state) => ({ showWmsLayer: !state.showWmsLayer })),
  toggleDrawnLayer: () => set((state) => ({ showDrawnLayer: !state.showDrawnLayer })),
  setActivePanel: (panel) => set((state) => ({ ui: { ...state.ui, activePanel: panel } })),
  upsertDrawn: (feature) =>
    set((state) => {
      const next = state.drawn.filter((f) => f.id !== feature.id).concat(feature)
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          DRAWN_STORAGE_KEY,
          JSON.stringify({ type: 'FeatureCollection', features: next }),
        )
      }
      return { drawn: next }
    }),
  clearDrawn: () =>
    set(() => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DRAWN_STORAGE_KEY)
      }
      return { drawn: [] }
    }),
  hydrateFromStorage: () => {
    if (typeof window === 'undefined') return
    const loaded = parseStoredFeatures()
    set({ drawn: loaded })
  },
}))

