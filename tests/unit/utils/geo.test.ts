import { describe, it, expect } from 'vitest'
import { featureToBounds } from '../../../src/utils/geo'
import type { FeatureCollection, Polygon } from 'geojson'

describe('featureToBounds', () => {
  it('should calculate bounds for a single polygon feature', () => {
    const collection: FeatureCollection<Polygon> = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [6.7, 50.9], // [lng, lat]
                [7.2, 50.9],
                [7.2, 51.6],
                [6.7, 51.6],
                [6.7, 50.9],
              ],
            ],
          },
          properties: {},
        },
      ],
    }

    const bounds = featureToBounds(collection)
    expect(bounds).toEqual([
      [50.9, 6.7], // [minLat, minLng]
      [51.6, 7.2], // [maxLat, maxLng]
    ])
  })

  it('should calculate bounds for multiple polygon features', () => {
    const collection: FeatureCollection<Polygon> = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
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
        },
        {
          type: 'Feature',
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
          properties: {},
        },
      ],
    }

    const bounds = featureToBounds(collection)
    expect(bounds[0][0]).toBe(51.0) // minLat
    expect(bounds[0][1]).toBe(6.8) // minLng
    expect(bounds[1][0]).toBe(51.3) // maxLat
    expect(bounds[1][1]).toBe(7.1) // maxLng
  })

  it('should return default NRW bounds for empty collection', () => {
    const collection: FeatureCollection<Polygon> = {
      type: 'FeatureCollection',
      features: [],
    }

    const bounds = featureToBounds(collection)
    expect(bounds).toEqual([
      [50.9, 6.7],
      [51.6, 7.2],
    ])
  })

  it('should handle polygon with single coordinate point', () => {
    const collection: FeatureCollection<Polygon> = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [6.95, 51.25], // Single point (degenerate polygon)
                [6.95, 51.25],
              ],
            ],
          },
          properties: {},
        },
      ],
    }

    const bounds = featureToBounds(collection)
    expect(bounds).toEqual([
      [51.25, 6.95],
      [51.25, 6.95],
    ])
  })
})

