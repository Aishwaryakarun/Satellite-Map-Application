# Geocoding Search Verification Guide

## How to Verify Location Accuracy

The geocoding search feature uses the **Nominatim OpenStreetMap API** to find locations. Here's how to verify it provides correct locations:

### Testing Steps

1. **Open the application** at `http://localhost:5173`
2. **Locate the search bar** in the top-left corner of the map
3. **Search for a location** (e.g., "Düsseldorf", "Essen", "Cologne")
4. **Select a result** from the dropdown
5. **Verify the location**:
   - The map should smoothly animate to the selected location
   - A blue marker should appear at the location
   - Click the marker to see a popup with:
     - Location name
     - Exact coordinates (latitude, longitude)

### Coordinate Verification

The coordinates are displayed in the format: `latitude, longitude`

- **Latitude** ranges from -90 to 90 (North/South)
- **Longitude** ranges from -180 to 180 (East/West)
- For NRW region, expect:
  - Latitude: ~50.8 to 51.8
  - Longitude: ~6.5 to 7.5

### Example Test Cases

| Search Query | Expected Location | Expected Coordinates (approx) |
|-------------|-------------------|-------------------------------|
| "Düsseldorf" | Düsseldorf, NRW, Germany | 51.2277, 6.7735 |
| "Essen" | Essen, NRW, Germany | 51.4556, 7.0116 |
| "Cologne" or "Köln" | Cologne, NRW, Germany | 50.9375, 6.9603 |
| "Dortmund" | Dortmund, NRW, Germany | 51.5136, 7.4653 |

### How It Works

1. **API Call**: When you type (minimum 3 characters), the app calls Nominatim API
2. **Debouncing**: Search is debounced by 300ms to reduce API calls
3. **Coordinate Parsing**: Results are validated to ensure coordinates are valid numbers
4. **Map Navigation**: Leaflet uses `[latitude, longitude]` format (correctly implemented)
5. **Marker Placement**: A temporary marker is placed for 5 seconds to show the location

### Improvements Made

✅ **Coordinate Validation**: Invalid coordinates are filtered out
✅ **Global Search**: Can now search for locations outside NRW (not restricted)
✅ **Visual Feedback**: Marker with popup shows exact coordinates for verification
✅ **Error Handling**: Invalid coordinates are caught and logged

### Troubleshooting

**Issue**: No results appear
- **Solution**: Try a different search term or check internet connection

**Issue**: Marker appears in wrong location
- **Solution**: Check the coordinates in the popup - they should match the expected location

**Issue**: Map doesn't navigate
- **Solution**: Check browser console for errors, verify coordinates are valid

### Technical Details

- **API**: Nominatim OpenStreetMap (free, no API key required)
- **Rate Limits**: Nominatim has usage policies - be respectful with requests
- **Coordinate Format**: Leaflet expects `[lat, lng]` - correctly implemented
- **Validation**: Coordinates are validated before use to prevent errors

