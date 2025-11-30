import type { FeatureCollection, Polygon } from 'geojson'
import type { LatLngBoundsLiteral } from 'leaflet'

export const featureToBounds = (
  collection: FeatureCollection<Polygon>,
): LatLngBoundsLiteral => {
  const latitudes: number[] = []
  const longitudes: number[] = []

  collection.features.forEach((feature) => {
    if (feature.geometry?.type !== 'Polygon') return
    feature.geometry.coordinates[0].forEach(([lng, lat]) => {
      latitudes.push(lat)
      longitudes.push(lng)
    })
  })

  if (!latitudes.length || !longitudes.length) {
    return [
      [50.9, 6.7],
      [51.6, 7.2],
    ]
  }

  const minLat = Math.min(...latitudes)
  const maxLat = Math.max(...latitudes)
  const minLng = Math.min(...longitudes)
  const maxLng = Math.max(...longitudes)

  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ]
}

