import type { FeatureCollection, Polygon } from 'geojson'

export type AoiStatus = 'Monitoring' | 'Pending' | 'Flagged'

export interface AoiMetric {
  label: string
  value: string
  delta?: string
}

export interface Aoi {
  id: string
  name: string
  type: 'AOI' | 'Inspection'
  status: AoiStatus
  updatedAt: string
  areaHa: number
  metrics: AoiMetric[]
  geometry: FeatureCollection<Polygon>
}

const basePolygon = (
  coords: [number, number][],
): FeatureCollection<Polygon> => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[...coords, coords[0]]],
      },
    },
  ],
})

export const AOI_SETS: Aoi[] = [
  {
    id: 'aoi-essen',
    name: 'Essen Industrial Belt',
    type: 'AOI',
    status: 'Monitoring',
    updatedAt: '2025-11-22T10:30:00Z',
    areaHa: 124.6,
    metrics: [
      { label: 'NDVI', value: '0.68', delta: '+3.2%' },
      { label: 'Cloud cover', value: '4%', delta: '-1.1%' },
      { label: 'Detections', value: '12', delta: '+2' },
    ],
    geometry: basePolygon([
      [6.949, 51.463],
      [6.977, 51.465],
      [6.99, 51.45],
      [6.958, 51.444],
      [6.94, 51.452],
    ]),
  },
  {
    id: 'aoi-dusseldorf',
    name: 'Düsseldorf Riverfront',
    type: 'AOI',
    status: 'Pending',
    updatedAt: '2025-11-25T08:10:00Z',
    areaHa: 98.4,
    metrics: [
      { label: 'NDMI', value: '0.38', delta: '-1.4%' },
      { label: 'Cloud cover', value: '7%', delta: '+0.3%' },
      { label: 'Alerts', value: '3', delta: '0' },
    ],
    geometry: basePolygon([
      [6.764, 51.241],
      [6.797, 51.245],
      [6.805, 51.229],
      [6.777, 51.217],
      [6.751, 51.23],
    ]),
  },
  {
    id: 'aoi-cologne',
    name: 'Cologne Perimeter',
    type: 'Inspection',
    status: 'Flagged',
    updatedAt: '2025-11-19T13:05:00Z',
    areaHa: 210.1,
    metrics: [
      { label: 'Surface temp', value: '42°C', delta: '+5°C' },
      { label: 'Cloud cover', value: '2%', delta: '-3%' },
      { label: 'Incidents', value: '5', delta: '+1' },
    ],
    geometry: basePolygon([
      [6.908, 50.982],
      [6.948, 50.991],
      [6.965, 50.967],
      [6.932, 50.952],
      [6.9, 50.963],
    ]),
  },
]

