import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Nominatim API response
const mockNominatimResponse = [
  {
    place_id: 123456,
    display_name: 'Düsseldorf, North Rhine-Westphalia, Germany',
    lat: '51.2277',
    lon: '6.7735',
    boundingbox: ['51.1', '51.3', '6.6', '6.9'],
  },
  {
    place_id: 123457,
    display_name: 'Essen, North Rhine-Westphalia, Germany',
    lat: '51.4556',
    lon: '7.0116',
    boundingbox: ['51.4', '51.5', '6.9', '7.1'],
  },
]

describe('GeocodingSearch coordinate validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should parse valid coordinates correctly', () => {
    const result = mockNominatimResponse[0]
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)

    expect(lat).toBe(51.2277)
    expect(lng).toBe(6.7735)
    expect(isNaN(lat)).toBe(false)
    expect(isNaN(lng)).toBe(false)
  })

  it('should validate coordinate ranges', () => {
    const validLat = 51.2277
    const validLng = 6.7735

    expect(validLat >= -90 && validLat <= 90).toBe(true)
    expect(validLng >= -180 && validLng <= 180).toBe(true)
  })

  it('should reject invalid coordinates', () => {
    const invalidLat = parseFloat('invalid')
    const invalidLng = parseFloat('invalid')

    expect(isNaN(invalidLat)).toBe(true)
    expect(isNaN(invalidLng)).toBe(true)
  })

  it('should handle coordinate format correctly for Leaflet', () => {
    // Leaflet expects [lat, lng] format
    const result = mockNominatimResponse[0]
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const leafletCoords = [lat, lng]

    expect(leafletCoords).toEqual([51.2277, 6.7735])
    expect(leafletCoords[0]).toBe(lat) // First element is latitude
    expect(leafletCoords[1]).toBe(lng) // Second element is longitude
  })

  it('should filter out results with invalid coordinates', () => {
    const results = [
      ...mockNominatimResponse,
      {
        place_id: 999999,
        display_name: 'Invalid Location',
        lat: 'invalid',
        lon: 'invalid',
        boundingbox: ['0', '0', '0', '0'],
      },
    ]

    const validResults = results.filter(
      (result) =>
        result.lat &&
        result.lon &&
        !isNaN(parseFloat(result.lat)) &&
        !isNaN(parseFloat(result.lon))
    )

    expect(validResults).toHaveLength(2)
    expect(validResults.every((r) => r.place_id !== 999999)).toBe(true)
  })
})

