import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  boundingbox: [string, string, string, string]
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

const debounce = <T extends (...args: any[]) => void>(func: T, wait: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const GeocodingSearch = () => {
  const map = useMap()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const searchLocations = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      // First try with NRW region preference, but allow global search
      const params = new URLSearchParams({
        q: searchQuery,
        format: 'json',
        limit: '5',
        addressdetails: '1',
        'accept-language': 'en',
        // Prefer NRW region but don't restrict to it
        viewbox: '6.5,50.8,7.5,51.8', // NRW region bounds for preference
        bounded: '0', // Set to 0 to allow results outside viewbox
      })

      const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
        headers: {
          'User-Agent': 'Flowbit-AOI-Workspace/1.0',
        },
      })

      if (!response.ok) throw new Error('Geocoding request failed')

      const data: NominatimResult[] = await response.json()
      
      // Validate results have valid coordinates
      const validResults = data.filter(
        (result) =>
          result.lat &&
          result.lon &&
          !isNaN(parseFloat(result.lat)) &&
          !isNaN(parseFloat(result.lon))
      )
      
      setResults(validResults)
    } catch (error) {
      console.error('Geocoding error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const debouncedSearch = useRef(
    debounce((searchQuery: string) => {
      searchLocations(searchQuery)
    }, 300)
  ).current

  useEffect(() => {
    if (query) {
      debouncedSearch(query)
    } else {
      setResults([])
    }
  }, [query, debouncedSearch])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectResult = (result: NominatimResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)

    // Validate coordinates before using them
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.error('Invalid coordinates:', { lat, lng })
      return
    }

    // Leaflet uses [lat, lng] format - this is correct
    map.setView([lat, lng], 13, { animate: true, duration: 0.5 })

    // Add a marker at the selected location with popup showing coordinates
    const marker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'geocoding-marker',
        html: `<div class="w-4 h-4 rounded-full bg-primary border-2 border-white shadow-lg"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
    })

    // Add popup with location details for verification
    marker.bindPopup(
      `<div class="text-sm">
        <p class="font-semibold">${result.display_name}</p>
        <p class="text-xs text-slate-500 mt-1">
          Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}
        </p>
      </div>`,
      { closeButton: true }
    )

    // Remove previous marker if exists
    const existingMarker = (map as any)._geocodingMarker
    if (existingMarker) {
      map.removeLayer(existingMarker)
    }

    marker.addTo(map)
    ;(map as any)._geocodingMarker = marker

    // Remove marker after 5 seconds
    setTimeout(() => {
      if (marker && map.hasLayer(marker)) {
        map.removeLayer(marker)
        delete (map as any)._geocodingMarker
      }
    }, 5000)

    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search location (e.g., Düsseldorf, Essen)"
          className="w-full rounded-2xl bg-slate-900/80 px-10 py-2.5 text-sm text-white placeholder:text-slate-500 ring-1 ring-white/5 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Search location using geocoding"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
        )}
      </div>

      {isOpen && (results.length > 0 || (query.length >= 3 && !isLoading)) && (
        <div
          role="listbox"
          className="absolute z-[1000] mt-2 w-full rounded-2xl bg-slate-900/95 shadow-xl ring-1 ring-white/10 backdrop-blur-sm"
        >
          {results.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto py-2">
              {results.map((result) => (
                <li key={result.place_id}>
                  <button
                    type="button"
                    role="option"
                    onClick={() => handleSelectResult(result)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-800/50 focus:bg-slate-800/50 focus:outline-none"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{result.display_name}</p>
                      <p className="text-xs text-slate-400">
                        {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.length >= 3 && !isLoading ? (
            <div className="px-4 py-6 text-center text-sm text-slate-400">
              No locations found. Try a different search term.
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

