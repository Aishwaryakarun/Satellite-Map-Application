import { describe, it, expect, beforeEach } from 'vitest'
import { useAoiStore } from '../../../src/store/useAoiStore'
import type { Feature, Polygon } from 'geojson'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useAoiStore', () => {
  beforeEach(() => {
    localStorage.clear()
    // Reset store to initial state
    useAoiStore.setState({
      selectedId: useAoiStore.getState().aois[0].id,
      hoveredId: null,
      showBaseLayer: true,
      showWmsLayer: true,
      showDrawnLayer: true,
      drawn: [],
      ui: { activePanel: 'overview' },
    })
  })

  describe('selectAoi', () => {
    it('should update selectedId when selecting an AOI', () => {
      const store = useAoiStore.getState()
      const secondAoiId = store.aois[1]?.id

      if (secondAoiId) {
        useAoiStore.getState().selectAoi(secondAoiId)
        expect(useAoiStore.getState().selectedId).toBe(secondAoiId)
      }
    })
  })

  describe('setHovered', () => {
    it('should set hoveredId when hovering over an AOI', () => {
      const store = useAoiStore.getState()
      const aoiId = store.aois[0]?.id

      if (aoiId) {
        useAoiStore.getState().setHovered(aoiId)
        expect(useAoiStore.getState().hoveredId).toBe(aoiId)
      }
    })

    it('should clear hoveredId when set to null', () => {
      const store = useAoiStore.getState()
      const aoiId = store.aois[0]?.id

      if (aoiId) {
        useAoiStore.getState().setHovered(aoiId)
        useAoiStore.getState().setHovered(null)
        expect(useAoiStore.getState().hoveredId).toBeNull()
      }
    })
  })

  describe('layer toggles', () => {
    it('should toggle base layer visibility', () => {
      const initialState = useAoiStore.getState().showBaseLayer
      useAoiStore.getState().toggleBaseLayer()
      expect(useAoiStore.getState().showBaseLayer).toBe(!initialState)
    })

    it('should toggle WMS layer visibility', () => {
      const initialState = useAoiStore.getState().showWmsLayer
      useAoiStore.getState().toggleWmsLayer()
      expect(useAoiStore.getState().showWmsLayer).toBe(!initialState)
    })

    it('should toggle drawn layer visibility', () => {
      const initialState = useAoiStore.getState().showDrawnLayer
      useAoiStore.getState().toggleDrawnLayer()
      expect(useAoiStore.getState().showDrawnLayer).toBe(!initialState)
    })
  })

  describe('upsertDrawn', () => {
    it('should add a new drawn feature', () => {
      const feature: Feature<Polygon> = {
        type: 'Feature',
        id: 'test-feature-1',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [6.8, 51.0],
              [6.9, 51.0],
              [6.9, 51.1],
              [6.8, 51.1],
              [6.8, 51.0],
            ],
          ],
        },
        properties: {},
      }

      useAoiStore.getState().upsertDrawn(feature)
      const drawn = useAoiStore.getState().drawn
      expect(drawn).toHaveLength(1)
      expect(drawn[0].id).toBe('test-feature-1')
    })

    it('should update existing feature if id matches', () => {
      const feature1: Feature<Polygon> = {
        type: 'Feature',
        id: 'test-feature-1',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [6.8, 51.0],
              [6.9, 51.0],
              [6.9, 51.1],
              [6.8, 51.1],
              [6.8, 51.0],
            ],
          ],
        },
        properties: { name: 'Original' },
      }

      const feature2: Feature<Polygon> = {
        type: 'Feature',
        id: 'test-feature-1',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [7.0, 51.2],
              [7.1, 51.2],
              [7.1, 51.3],
              [7.0, 51.3],
              [7.0, 51.2],
            ],
          ],
        },
        properties: { name: 'Updated' },
      }

      useAoiStore.getState().upsertDrawn(feature1)
      useAoiStore.getState().upsertDrawn(feature2)

      const drawn = useAoiStore.getState().drawn
      expect(drawn).toHaveLength(1)
      expect(drawn[0].properties?.name).toBe('Updated')
    })

    it('should persist to localStorage', () => {
      const feature: Feature<Polygon> = {
        type: 'Feature',
        id: 'test-feature-1',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [6.8, 51.0],
              [6.9, 51.0],
              [6.9, 51.1],
              [6.8, 51.1],
              [6.8, 51.0],
            ],
          ],
        },
        properties: {},
      }

      useAoiStore.getState().upsertDrawn(feature)

      const stored = localStorage.getItem('flowbit:aoi-drawings')
      expect(stored).toBeTruthy()
      if (stored) {
        const parsed = JSON.parse(stored)
        expect(parsed.type).toBe('FeatureCollection')
        expect(parsed.features).toHaveLength(1)
      }
    })
  })

  describe('clearDrawn', () => {
    it('should remove all drawn features', () => {
      const feature: Feature<Polygon> = {
        type: 'Feature',
        id: 'test-feature-1',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [6.8, 51.0],
              [6.9, 51.0],
              [6.9, 51.1],
              [6.8, 51.1],
              [6.8, 51.0],
            ],
          ],
        },
        properties: {},
      }

      useAoiStore.getState().upsertDrawn(feature)
      expect(useAoiStore.getState().drawn).toHaveLength(1)

      useAoiStore.getState().clearDrawn()
      expect(useAoiStore.getState().drawn).toHaveLength(0)
      expect(localStorage.getItem('flowbit:aoi-drawings')).toBeNull()
    })
  })

  describe('hydrateFromStorage', () => {
    it('should load features from localStorage', () => {
      const feature: Feature<Polygon> = {
        type: 'Feature',
        id: 'stored-feature-1',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [6.8, 51.0],
              [6.9, 51.0],
              [6.9, 51.1],
              [6.8, 51.1],
              [6.8, 51.0],
            ],
          ],
        },
        properties: {},
      }

      const featureCollection = {
        type: 'FeatureCollection',
        features: [feature],
      }

      localStorage.setItem('flowbit:aoi-drawings', JSON.stringify(featureCollection))

      useAoiStore.getState().hydrateFromStorage()
      const drawn = useAoiStore.getState().drawn
      expect(drawn).toHaveLength(1)
      expect(drawn[0].id).toBe('stored-feature-1')
    })

    it('should handle invalid localStorage data gracefully', () => {
      localStorage.setItem('flowbit:aoi-drawings', 'invalid json')
      useAoiStore.getState().hydrateFromStorage()
      // Should not throw and should have empty drawn array
      expect(useAoiStore.getState().drawn).toHaveLength(0)
    })
  })
})

