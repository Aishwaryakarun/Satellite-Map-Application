import { Maximize2, Minus, Plus } from 'lucide-react'
import { MapContainer, TileLayer, WMSTileLayer, GeoJSON, useMap } from 'react-leaflet'
import type { FeatureCollection, Polygon, GeoJsonObject } from 'geojson'
import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { useAoiStore } from '../../store/useAoiStore'
import { featureToBounds } from '../../utils/geo'
import { DrawingControls } from './DrawingControls'
import { GeocodingSearch } from './GeocodingSearch'

const NRW_DOP_WMS = 'https://www.wms.nrw.de/geobasis/wms_nw_dop'

const MapFocus = ({ geometry }: { geometry: FeatureCollection<Polygon> }) => {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(featureToBounds(geometry), { padding: [32, 32] })
  }, [geometry, map])
  return null
}

const ZoomControl = () => {
  const map = useMap()
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-slate-900/80 p-2 text-white shadow-card">
      <button
        type="button"
        aria-label="Zoom in"
        onClick={() => map.zoomIn()}
        className="rounded-xl bg-slate-800/70 p-2"
      >
        <Plus className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Zoom out"
        onClick={() => map.zoomOut()}
        className="rounded-xl bg-slate-800/70 p-2"
      >
        <Minus className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Reset extent"
        onClick={() => map.fitBounds([[50.9, 6.7], [51.6, 7.2]])}
        className="rounded-xl bg-slate-800/70 p-2"
      >
        <Maximize2 className="h-4 w-4" />
      </button>
    </div>
  )
}

const styleForAoi = (id: string, selectedId: string, hoveredId: string | null) => {
  const isActive = id === selectedId
  const isHover = id === hoveredId
  return {
    color: isActive ? '#2E5BFF' : isHover ? '#93C5FD' : '#38BDF8',
    weight: isActive ? 3 : 2,
    fillColor: isActive ? '#2E5BFF' : '#0F172A',
    fillOpacity: isActive ? 0.25 : 0.12,
  }
}

const drawnStyle: L.PathOptions = {
  color: '#FF7139',
  weight: 2,
  fillColor: '#FF7139',
  fillOpacity: 0.15,
}

export const AoiMap = () => {
  const {
    aois,
    selectedId,
    hoveredId,
    showBaseLayer,
    showWmsLayer,
    showDrawnLayer,
    drawn,
  } = useAoiStore()
  const selected = aois.find((aoi) => aoi.id === selectedId) ?? aois[0]
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [leafletMap, setLeafletMap] = useState<L.Map | null>(null)

  // Memoize geojson payloads so re-rendering UI chrome does not force Leaflet layer churn.
  const polygons = useMemo(
    () =>
      aois.map((aoi) => ({
        id: aoi.id,
        geometry: aoi.geometry,
      })),
    [aois],
  )

  return (
    <div
      data-testid="map-panel"
      className="relative h-full min-h-[480px] overflow-hidden rounded-3xl bg-slate-900/60"
    >
      <MapContainer
        center={[51.2277, 6.7735]}
        zoom={10}
        scrollWheelZoom
        preferCanvas
        // @ts-ignore react-leaflet v4 types expect zero-arg handler but we need the map instance.
        whenReady={(map: any) => setLeafletMap(map)}
        className={isFullScreen ? 'h-[calc(100vh-200px)]' : 'h-full min-h-[480px]'}
      >
        {showBaseLayer && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}

        {showWmsLayer && (
          <WMSTileLayer
            url={NRW_DOP_WMS}
            params={{
              layers: 'nw_dop_rgb',
              format: 'image/png',
              transparent: true,
            }}
            opacity={0.8}
          />
        )}

        {polygons.map((polygon) => (
          <GeoJSON
            key={polygon.id}
            data={polygon.geometry as GeoJsonObject}
            style={() => styleForAoi(polygon.id, selectedId, hoveredId)}
          />
        ))}

        {showDrawnLayer &&
          drawn.map((feature) => (
            <GeoJSON key={feature.id} data={feature as GeoJsonObject} style={() => drawnStyle} />
          ))}

        {selected && <MapFocus geometry={selected.geometry} />}

        <div className="absolute right-4 top-4 z-[1000]">
          <ZoomControl />
        </div>

        <div className="absolute left-4 top-4 z-[1000]">
          <GeocodingSearch />
        </div>
      </MapContainer>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-4">
        <div className="pointer-events-auto rounded-3xl bg-slate-900/80 p-4 shadow-card">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Focus</p>
          <p data-testid="selected-aoi-name" className="text-lg font-semibold text-white">
            {selected?.name}
          </p>
          <p className="text-sm text-slate-400">{selected?.areaHa.toFixed(1)} ha • {selected?.status}</p>
        </div>

        <div className="pointer-events-auto flex gap-2">
          <button
            type="button"
            onClick={() => setIsFullScreen((prev) => !prev)}
            className="rounded-2xl bg-slate-900/70 px-4 py-2 text-sm text-slate-300 shadow-card"
          >
            {isFullScreen ? 'Exit full view' : 'Full view'}
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-end px-4">
        <div className="pointer-events-auto">
          <DrawingControls map={leafletMap} />
        </div>
      </div>
    </div>
  )
}

