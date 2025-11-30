import clsx from 'clsx'
import { Layers, Map, PenTool } from 'lucide-react'
import { useAoiStore } from '../../store/useAoiStore'

const layerConfig = [
  {
    key: 'base' as const,
    label: 'Base map',
    description: 'OpenStreetMap tiles',
    icon: Map,
  },
  {
    key: 'wms' as const,
    label: 'NRW Imagery',
    description: 'wms_nw_dop RGB overlay',
    icon: Layers,
  },
  {
    key: 'drawn' as const,
    label: 'AOI drawings',
    description: 'Analyst-defined polygons',
    icon: PenTool,
  },
]

export const LayerManagerPanel = () => {
  const {
    showBaseLayer,
    showWmsLayer,
    showDrawnLayer,
    toggleBaseLayer,
    toggleWmsLayer,
    toggleDrawnLayer,
    clearDrawn,
    drawn,
  } = useAoiStore()

  const toggleMap: Record<typeof layerConfig[number]['key'], () => void> = {
    base: toggleBaseLayer,
    wms: toggleWmsLayer,
    drawn: toggleDrawnLayer,
  }

  const activeMap: Record<typeof layerConfig[number]['key'], boolean> = {
    base: showBaseLayer,
    wms: showWmsLayer,
    drawn: showDrawnLayer,
  }

  return (
    <section
      data-testid="layer-panel"
      className="rounded-3xl bg-surface-muted/70 p-5 shadow-card ring-1 ring-white/5"
    >
      <header className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Layers</p>
        <h3 className="text-lg font-semibold text-white">Map visibility</h3>
        <p className="text-xs text-slate-500">Toggle rendering independently.</p>
      </header>

      <div className="space-y-3">
        {layerConfig.map(({ key, label, description, icon: Icon }) => {
          const isActive = activeMap[key]
          return (
            <button
              key={key}
              type="button"
              data-testid={`toggle-${key}`}
              role="switch"
              aria-checked={isActive}
              onClick={toggleMap[key]}
              className={clsx(
                'flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition focus-visible:ring-2 focus-visible:ring-primary',
                isActive ? 'border-primary/40 bg-slate-900/80' : 'border-white/5 bg-slate-900/40',
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={clsx(
                    'rounded-2xl p-2',
                    isActive ? 'bg-primary/20 text-primary' : 'bg-slate-800/70 text-slate-400',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-slate-400">{description}</p>
                </div>
              </div>

              <span
                className={clsx(
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  isActive ? 'bg-primary text-white' : 'bg-slate-800/70 text-slate-400',
                )}
              >
                {isActive ? 'ON' : 'OFF'}
              </span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={clearDrawn}
        disabled={drawn.length === 0}
        className="mt-4 w-full rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-white/40 disabled:cursor-not-allowed disabled:border-white/5 disabled:text-slate-500"
      >
        Clear stored drawings ({drawn.length})
      </button>
    </section>
  )
}

