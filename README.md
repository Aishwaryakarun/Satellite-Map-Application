# AOI Creation Workspace – Frontend Engineer Assignment

This project implements the **AOI Creation Workspace** for Flowbit's Frontend Engineer Internship assignment.

It is a **single-page React application** that recreates the provided Figma design and displays satellite/drone imagery over **NRW** with interactive mapping features, AOI management, and basic analysis panels.

---

## 1. Project Overview

The AOI Creation Workspace is an interactive map-based application for managing Areas of Interest (AOIs) with satellite and drone imagery integration. Users can:

- View and interact with a map centered on the NRW region
- Toggle between base map layers and WMS satellite imagery
- Select and focus on different AOIs from a sidebar list
- Draw custom polygons to define new Areas of Interest
- View real-time metrics and insights for each AOI
- Persist drawn features across browser sessions

---

## 2. Tech Stack

- **Framework:** React 19 + TypeScript
- **Bundler/Dev Server:** Vite 7
- **Styling:** Tailwind CSS 3.4
- **Map Library:** Leaflet 1.9 (via `react-leaflet` 5.0)
- **Drawing Tools:** Leaflet.draw
- **State Management:** Zustand 5.0
- **Testing:** Playwright 1.57 (E2E tests)
- **Build tooling:** ESLint, TypeScript 5.9

---

## 3. Setup & Run Instructions

### Prerequisites

- **Node.js 18+** (recommended LTS version)
- **npm 9+**

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview production build

```bash
npm run preview
```

### Run E2E tests

```bash
npm run test:e2e
```

Runs Playwright tests in headless mode. Make sure the dev server is running or tests will start it automatically.

### Run unit tests

```bash
npm run test:unit
```

Runs Vitest unit tests for store actions and utility functions.

### Format code

```bash
npm run format
```

Formats all source files using Prettier.

### Lint code

```bash
npm run lint
```

---

## 4. Map Library Choice

### Why Leaflet?

**Leaflet** was chosen as the map library for this project for several key reasons:

1. **Excellent WMS Support**: Leaflet has first-class support for WMS tile layers, which was a core requirement for integrating the NRW DOP imagery endpoint (`https://www.wms.nrw.de/geobasis/wms_nw_dop`).

2. **Mature Ecosystem**: Leaflet has a rich plugin ecosystem, including `leaflet-draw` for polygon drawing tools, which allowed rapid implementation of the AOI creation feature.

3. **React Integration**: `react-leaflet` provides clean React bindings with hooks and declarative components that fit naturally into React's component model.

4. **Lightweight**: At ~42KB minified, Leaflet is significantly smaller than alternatives like OpenLayers (~250KB), keeping bundle size manageable.

5. **Documentation & Community**: Extensive documentation, large community, and proven track record in production applications.

### Alternatives Considered

| Library | Pros | Cons | Why Not Chosen |
|---------|------|------|----------------|
| **MapLibre GL** | Modern vector rendering, smooth animations, 3D support | Steeper learning curve, WMS requires custom tile source | Overkill for 2D WMS use case |
| **OpenLayers** | Powerful GIS features, excellent projection support | Large bundle size (~250KB), complex API | Too heavyweight for requirements |
| **react-map-gl** (Mapbox) | Beautiful default styling, great DX | Requires Mapbox token, vendor lock-in | Licensing concerns, unnecessary dependency |
| **Google Maps API** | Familiar UX, street view integration | Expensive for production, limited customization | Cost and vendor lock-in |

### Tradeoffs

- **Leaflet's raster-first approach** means less smooth zooming compared to vector-based libraries like MapLibre, but this is acceptable for satellite imagery use cases.
- **Limited 3D capabilities**, but not required for this project.
- **Plugin quality varies**, but `leaflet-draw` is mature and well-maintained.

---

## 5. Architecture & State Management

### Project Structure

```
src/
├── components/
│   ├── layout/
│   │   └── TopBar.tsx              # Header with branding and user info
│   ├── map/
│   │   ├── AoiMap.tsx              # Main map container with layers
│   │   └── DrawingControls.tsx    # Polygon drawing UI
│   └── panels/
│       ├── AoiList.tsx             # Sidebar list of AOIs
│       ├── ProjectSummary.tsx      # Mission overview card
│       ├── InsightPanel.tsx        # Real-time metrics
│       ├── TimelinePanel.tsx       # Activity timeline
│       └── LayerManagerPanel.tsx   # Layer visibility toggles
├── store/
│   └── useAoiStore.ts              # Zustand store for app state
├── data/
│   └── aoi.ts                      # Mock AOI dataset
├── utils/
│   └── geo.ts                      # GeoJSON utilities
├── App.tsx                         # Root component
└── main.tsx                        # Entry point
```

### State Management Strategy

**Zustand** was chosen for state management because:

1. **Minimal boilerplate**: No providers, actions, or reducers required
2. **TypeScript-first**: Excellent type inference out of the box
3. **Performance**: Selective subscriptions prevent unnecessary re-renders
4. **Small bundle size**: ~1KB gzipped
5. **Simple API**: Easy to understand and maintain

The `useAoiStore` centralizes:
- AOI list and selection state
- Layer visibility toggles (base map, WMS, drawn features)
- Drawn polygon features with localStorage persistence
- Hover state for map interactions

### Component Architecture

- **Separation of concerns**: Layout, map, and panel components are isolated
- **Composition over inheritance**: Small, focused components composed together
- **Memoization**: `useMemo` prevents expensive GeoJSON re-processing
- **Selective subscriptions**: Components only subscribe to the Zustand state slices they need

Example:
```typescript
// Only re-renders when selectedId changes
const selectedId = useAoiStore((state) => state.selectedId)
```

---

## 6. Performance Considerations

### Current Optimizations

The application is architected to handle **1000+ points/polygons** efficiently:

1. **Memoized GeoJSON Data**
   ```typescript
   const polygons = useMemo(
     () => aois.map((aoi) => ({ id: aoi.id, geometry: aoi.geometry })),
     [aois]
   )
   ```
   Prevents Leaflet from re-rendering layers when unrelated UI state changes.

2. **Selective Re-renders**
   - Zustand's selector pattern ensures components only re-render when their specific data changes
   - Map state is isolated from UI chrome state

3. **Canvas Rendering**
   - `preferCanvas` prop on MapContainer uses Canvas renderer instead of SVG for better performance with many features

4. **Lazy Loading**
   - Components are code-split at the route level (though this is a single-page app)

### Future Optimizations for Production Scale

For handling **10,000+ features**:

1. **Clustering**: Use `react-leaflet-markercluster` to group nearby points at lower zoom levels

2. **Virtualization**: Only render features in the current viewport using `leaflet-virtual-grid`

3. **Server-side Tiling**: Pre-process large polygon datasets into vector tiles (MVT format) served via a tile server

4. **WebWorkers**: Move GeoJSON processing and spatial calculations to background threads

5. **Progressive Loading**: Implement pagination or spatial indexing (R-tree) to load features on-demand

6. **Debouncing**: Throttle map move/zoom events to reduce render frequency
   ```typescript
   const debouncedUpdate = useMemo(
     () => debounce((bounds) => updateVisibleFeatures(bounds), 300),
     []
   )
   ```

7. **Feature Simplification**: Use Turf.js to simplify polygon geometries at lower zoom levels

---

## 7. Testing Strategy

### What We Test (Playwright E2E)

Three strategic test suites cover the critical user flows:

#### 1. **Layout Rendering** (`tests/e2e/layout.spec.ts`)
- Verifies all major UI sections are visible on page load
- Tests: header, AOI panel, map container, summary panel, insights panel
- **Why**: Catches catastrophic rendering failures and ensures the Figma layout is preserved

#### 2. **AOI Selection** (`tests/e2e/aoi-selection.spec.ts`)
- Tests clicking an AOI card updates the focused AOI name on the map overlay
- **Why**: Validates the core interaction pattern and Zustand state synchronization

#### 3. **Layer Toggles** (`tests/e2e/layers.spec.ts`)
- Tests toggling base map, WMS, and drawn layers on/off
- Verifies `aria-checked` attributes update correctly
- **Why**: Ensures layer management UI works and is accessible

### What We Would Test With More Time

#### Unit Tests (Vitest + React Testing Library) ✅ **IMPLEMENTED**
- **Store logic**: ✅ `useAoiStore` actions tested (selectAoi, upsertDrawn, localStorage persistence, layer toggles)
- **Utility functions**: ✅ `featureToBounds` tested with various polygon configurations
- **Component logic**: StatusBadge color mapping, date formatting (can be added if needed)

#### Integration Tests
- **Drawing workflow**: Draw polygon → appears in store → persists to localStorage → reloads on refresh
- **Map interactions**: Click polygon on map → selects corresponding AOI card
- **Search/filter**: If search is implemented, test filtering AOI list

#### Visual Regression Tests
- Playwright screenshots to catch unintended CSS changes
- Compare against Figma design at multiple breakpoints

#### Accessibility Tests
- Automated a11y audits with `axe-playwright`
- Keyboard navigation flows (Tab through controls, Enter to activate)
- Screen reader compatibility

#### Performance Tests
- Lighthouse CI scores (target: 90+ on all metrics)
- Bundle size tracking (prevent regressions)
- Render time with 1000+ features

---

## 8. Tradeoffs Made

### 1. **Mock Data vs. Real API**
- **Decision**: Used hardcoded AOI data in `src/data/aoi.ts`
- **Why**: No backend was provided; this demonstrates the frontend architecture
- **Production**: Replace with REST/GraphQL API calls

### 2. **Simple Drawing Tools**
- **Decision**: Basic polygon drawing only (no editing, deletion, or advanced shapes)
- **Why**: Time-boxed implementation to meet deadline
- **Production**: Add edit mode, undo/redo, shape library (circles, rectangles)

### 3. **localStorage for Persistence**
- **Decision**: Store drawn features in browser localStorage
- **Why**: Simple, no backend required, meets "persist between reloads" requirement
- **Production**: Sync to database, handle conflicts, add user authentication

### 4. **Limited Error Handling**
- **Decision**: Minimal try/catch blocks, no retry logic
- **Why**: Focused on happy path for demo
- **Production**: Add error boundaries, toast notifications, retry with exponential backoff

### 5. **Geocoding/Search** ✅ **IMPLEMENTED**
- **Decision**: Implemented using Nominatim OpenStreetMap API
- **Why**: Enhances usability by allowing quick location navigation
- **Implementation**: Search bar in map overlay with debounced API calls, result dropdown, and marker placement
- **Production**: Consider rate limiting, caching, and fallback providers

### 6. **Single Breakpoint Optimization**
- **Decision**: Responsive but not exhaustively tested on all devices
- **Why**: Figma showed desktop layout primarily
- **Production**: Mobile-first approach, test on real devices

### 7. **TypeScript Strictness**
- **Decision**: Used `@ts-ignore` for `whenReady` prop type mismatch
- **Why**: react-leaflet v5 types are incomplete; pragmatic workaround
- **Production**: Contribute fix to DefinitelyTyped or use type assertion

---

## 9. Production Readiness

### What's Missing for Production

#### Authentication & Authorization
- User login/logout (OAuth2, JWT)
- Role-based access control (admin vs. viewer)
- AOI ownership and sharing permissions

#### Backend Integration
- REST or GraphQL API for AOI CRUD operations
- Real-time updates via WebSockets or Server-Sent Events
- File upload for importing GeoJSON/KML

#### Error Handling & Resilience
- Global error boundary with user-friendly messages
- Retry logic for failed API calls
- Offline mode with service workers

#### Monitoring & Observability
- Error tracking (Sentry, Rollbar)
- Analytics (Google Analytics, Mixpanel)
- Performance monitoring (Web Vitals, Lighthouse CI)
- Logging (structured logs sent to ELK/Datadog)

#### Security
- Content Security Policy (CSP) headers
- HTTPS enforcement
- Input sanitization (prevent XSS)
- Rate limiting on API endpoints

#### Accessibility (A11Y)
- Full WCAG 2.1 AA compliance
- Keyboard navigation for all map controls
- Screen reader announcements for state changes
- High contrast mode support

#### Performance
- Code splitting by route
- Image optimization (WebP, lazy loading)
- CDN for static assets
- Server-side rendering (SSR) or static generation (SSG)

#### DevOps
- CI/CD pipeline (GitHub Actions, GitLab CI)
- Automated testing in pipeline
- Staging environment
- Blue-green deployments
- Database migrations

#### UX Enhancements
- Loading skeletons instead of blank screens
- Optimistic UI updates
- Undo/redo for drawing actions
- Keyboard shortcuts (e.g., `Ctrl+Z` to undo)
- Tooltips and onboarding tour

#### Documentation
- API documentation (OpenAPI/Swagger)
- Component Storybook
- Architecture decision records (ADRs)
- Runbook for ops team

---

## 10. Time Spent

Approximate breakdown of development time:

| Task | Time |
|------|------|
| **Project Setup** | 1 hour |
| - Vite + React + TypeScript scaffold | 15 min |
| - Tailwind configuration | 15 min |
| - Dependency installation (Leaflet, Zustand, etc.) | 30 min |
| **Layout & Styling** | 3 hours |
| - TopBar component | 30 min |
| - Sidebar panels (AOI list, summary, insights, timeline) | 1.5 hours |
| - Responsive layout with Tailwind | 45 min |
| - Color palette and design tokens | 15 min |
| **Map Integration** | 3 hours |
| - Leaflet setup with react-leaflet | 45 min |
| - WMS layer integration | 30 min |
| - GeoJSON polygon rendering | 45 min |
| - Custom zoom controls | 30 min |
| - Focus/selection logic | 30 min |
| **State Management** | 1.5 hours |
| - Zustand store setup | 30 min |
| - AOI selection/hover state | 30 min |
| - Layer visibility toggles | 30 min |
| **Drawing Tools & Persistence** | 2.5 hours |
| - Leaflet.draw integration | 1 hour |
| - Drawing controls UI | 45 min |
| - localStorage persistence | 45 min |
| **Testing** | 2 hours |
| - Playwright setup | 30 min |
| - Writing 3 E2E tests | 1 hour |
| - Debugging test failures | 30 min |
| **Documentation** | 2.5 hours |
| - README sections | 1.5 hours |
| - Code comments | 30 min |
| - Updating README for new features | 30 min |
| **Debugging & Polish** | 2 hours |
| - TypeScript errors | 45 min |
| - Build issues | 30 min |
| - Accessibility attributes | 30 min |
| - Final QA | 15 min |

| **Bonus Features** | 3 hours |
| - Geocoding search implementation | 1.5 hours |
| - Prettier configuration | 15 min |
| - Unit tests setup and writing | 1.5 hours |

**Total: ~20 hours**

---

## 11. API & Schema Overview

### Hypothetical API Design

If this were a full-stack application, the backend would expose these endpoints:

#### **GET /api/missions**
Fetch all missions.

**Response:**
```json
[
  {
    "id": "mission-001",
    "name": "NRW Surveillance Q4 2024",
    "status": "active",
    "window": {
      "start": "2024-10-01T00:00:00Z",
      "end": "2024-12-31T23:59:59Z"
    },
    "regions": ["Düsseldorf", "Essen", "Dortmund"],
    "aoiCount": 12
  }
]
```

#### **GET /api/missions/:missionId/aois**
Fetch all AOIs for a mission.

**Response:**
```json
[
  {
    "id": "aoi-001",
    "missionId": "mission-001",
    "name": "Essen Industrial Belt",
    "type": "Urban",
    "status": "Monitoring",
    "areaHa": 245.8,
    "geometry": {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[6.95, 51.45], [6.96, 51.45], ...]]
          },
          "properties": {}
        }
      ]
    },
    "metrics": [
      { "label": "NDVI", "value": "0.72", "delta": "+0.03" },
      { "label": "Change", "value": "12%", "delta": "-2%" }
    ],
    "createdAt": "2024-10-15T10:30:00Z",
    "updatedAt": "2024-11-20T14:22:00Z"
  }
]
```

#### **POST /api/missions/:missionId/aois**
Create a new AOI.

**Request:**
```json
{
  "name": "New Industrial Zone",
  "type": "Urban",
  "geometry": {
    "type": "FeatureCollection",
    "features": [...]
  }
}
```

**Response:**
```json
{
  "id": "aoi-013",
  "missionId": "mission-001",
  "name": "New Industrial Zone",
  "status": "Pending",
  ...
}
```

#### **PATCH /api/aois/:aoiId**
Update an AOI (name, status, geometry, etc.).

#### **DELETE /api/aois/:aoiId**
Delete an AOI.

#### **GET /api/aois/:aoiId/timeline**
Fetch activity timeline for an AOI.

**Response:**
```json
[
  {
    "id": "event-001",
    "type": "capture",
    "timestamp": "2024-11-28T08:15:00Z",
    "description": "Drone capture completed",
    "metadata": { "resolution": "5cm/px", "cloudCover": "2%" }
  }
]
```

### Entity-Relationship Diagram

```
┌─────────────────┐
│     Mission     │
├─────────────────┤
│ id (PK)         │
│ name            │
│ status          │
│ window_start    │
│ window_end      │
│ regions[]       │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│       AOI       │
├─────────────────┤
│ id (PK)         │
│ mission_id (FK) │
│ name            │
│ type            │
│ status          │
│ area_ha         │
│ geometry (JSON) │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│  TimelineEvent  │
├─────────────────┤
│ id (PK)         │
│ aoi_id (FK)     │
│ type            │
│ timestamp       │
│ description     │
│ metadata (JSON) │
└─────────────────┘

┌─────────────────┐
│      User       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ name            │
│ role            │
│ created_at      │
└────────┬────────┘
         │
         │ N:M (via permissions table)
         │
         ▼
┌─────────────────┐
│   Permission    │
├─────────────────┤
│ user_id (FK)    │
│ aoi_id (FK)     │
│ access_level    │ (read, write, admin)
└─────────────────┘
```

### Key Relationships

- **1 Mission → Many AOIs**: A mission contains multiple areas of interest
- **1 AOI → Many Timeline Events**: Each AOI has a history of captures, analyses, and changes
- **Many Users ↔ Many AOIs**: Users can have different permission levels on different AOIs

---

## 12. Known Issues & Limitations

1. **TypeScript Type Workaround**: `@ts-ignore` used for `whenReady` prop due to incomplete react-leaflet v5 types
2. **No Mobile Optimization**: Layout works on mobile but not exhaustively tested
3. **Drawing UX**: No visual feedback while drawing (could add ghost polygon preview)
4. **No Undo/Redo**: Drawn polygons cannot be edited or deleted via UI
5. **Hardcoded Data**: AOI list is static; no API integration
6. **Limited Accessibility**: Basic ARIA labels added but not fully WCAG compliant
7. **Geocoding Rate Limits**: Nominatim API has usage policies; production should implement caching and rate limiting

---

## 13. Future Enhancements

- **Advanced Drawing**: Edit vertices, delete shapes, draw circles/rectangles
- **Search & Filter**: Search AOIs by name, filter by status/type
- **Export**: Download AOIs as GeoJSON/KML
- **Collaboration**: Real-time cursor positions for multi-user editing
- **3D Visualization**: Integrate Cesium for 3D terrain and building models
- **Time Series**: Animate changes over time with a timeline scrubber
- **AI Integration**: Automatic change detection, anomaly alerts

---

## License

This project is for educational/interview purposes. Not licensed for commercial use.

---

## Contact

**Candidate:** Aishwarya K A  
**Assignment:** Frontend Engineer Internship – Flowbit Private Limited  
**Submission Date:** November 30, 2025
