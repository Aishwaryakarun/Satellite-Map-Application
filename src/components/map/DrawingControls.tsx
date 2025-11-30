import { useState } from 'react'
import { PenSquare } from 'lucide-react'
import L from 'leaflet'
import 'leaflet-draw'
import type { Feature, Polygon } from 'geojson'
import { useAoiStore } from '../../store/useAoiStore'

const nextId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `drawn-${Date.now()}`
}

type DrawingControlsProps = {
  map: L.Map | null
}

export const DrawingControls = ({ map }: DrawingControlsProps) => {
  const [lastError, setLastError] = useState<Error | null>(null)
  const upsertDrawn = useAoiStore((state) => state.upsertDrawn)
  const [isDrawing, setIsDrawing] = useState(false)

  if (!map) {
    return (
      <button
        type="button"
        disabled
        className="flex items-center gap-2 rounded-2xl bg-slate-800/50 px-4 py-2 text-sm text-slate-400"
      >
        <PenSquare className="h-4 w-4" />
        Loading map…
      </button>
    )
  }

  const startDrawing = () => {
    try {
      const drawMap = map as unknown as L.DrawMap
      const drawer = new L.Draw.Polygon(drawMap, {
      allowIntersection: false,
      showArea: true,
      shapeOptions: {
        color: '#FF7139',
        weight: 2,
        fillOpacity: 0.2,
      },
    })

      drawer.enable()
      setIsDrawing(true)
      setLastError(null)

      const handleCreated: L.LeafletEventHandlerFn = (event) => {
        const createdEvent = event as L.DrawEvents.Created
        const layer = createdEvent.layer
        const geojson = layer.toGeoJSON() as Feature<Polygon>
        geojson.id = geojson.id ?? `drawn-${nextId()}`
        upsertDrawn(geojson)
        cleanup()
      }

      const cleanup = () => {
        setIsDrawing(false)
        map.off(L.Draw.Event.CREATED, handleCreated)
        map.off(L.Draw.Event.DRAWSTOP, cleanup)
      }

      map.on(L.Draw.Event.CREATED, handleCreated)
      map.on(L.Draw.Event.DRAWSTOP, cleanup)
    } catch (error) {
      console.error('Drawing controls failed to initialize', error)
      setLastError(error as Error)
      setIsDrawing(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        aria-pressed={isDrawing}
        aria-label={isDrawing ? 'Drawing AOI polygon in progress' : 'Draw AOI polygon'}
        disabled={isDrawing}
        onClick={startDrawing}
        className="flex items-center gap-2 rounded-2xl bg-accent/20 px-4 py-2 text-sm font-medium text-accent shadow-card transition disabled:cursor-progress disabled:opacity-70"
      >
        <PenSquare className="h-4 w-4" />
        {isDrawing ? 'Click to finish shape' : 'Draw AOI'}
      </button>
      {lastError && (
        <p className="rounded-2xl bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          Failed to start drawing. See console for details.
        </p>
      )}
    </div>
  )
}

