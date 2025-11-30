import clsx from 'clsx'
import { ChevronRight } from 'lucide-react'
import { useAoiStore } from '../../store/useAoiStore'

const StatusBadge = ({ status }: { status: string }) => {
  const colorMap: Record<string, string> = {
    Monitoring: 'bg-primary/15 text-primary',
    Pending: 'bg-amber-400/15 text-amber-300',
    Flagged: 'bg-rose-500/15 text-rose-300',
  }

  return (
    <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-medium', colorMap[status])}>
      {status}
    </span>
  )
}

export const AoiList = () => {
  const { aois, selectedId, selectAoi, hoveredId, setHovered, ui, setActivePanel } =
    useAoiStore()

  const filteredAois =
    ui.activePanel === 'alerts' ? aois.filter((aoi) => aoi.status === 'Flagged') : aois

  return (
    <section
      data-testid="aoi-panel"
      className="rounded-3xl bg-surface-muted/70 p-5 shadow-card ring-1 ring-white/5"
    >
      <header className="mb-4 flex flex-col gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Active AOIs ({filteredAois.length})
          </p>
          <h3 className="text-lg font-semibold text-white">Scene queue</h3>
        </div>
        <div className="flex gap-2">
          {(['overview', 'alerts'] as const).map((key) => {
            const isActive = ui.activePanel === key
            const label = key === 'overview' ? 'All regions' : 'Alerts only'
            return (
              <button
                key={key}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActivePanel(key)}
                className={clsx(
                  'rounded-2xl px-3 py-1 text-xs font-medium ring-1 transition',
                  isActive ? 'bg-primary text-white ring-primary/40' : 'bg-slate-900/60 text-slate-400 ring-white/10',
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </header>

      <div className="space-y-3">
        {filteredAois.length === 0 && (
          <p className="rounded-2xl bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
            No AOIs match this filter.
          </p>
        )}
        {filteredAois.map((aoi) => {
          const isSelected = aoi.id === selectedId
          const isHovered = aoi.id === hoveredId
          return (
            <button
              key={aoi.id}
              type="button"
              data-testid="aoi-card"
              onClick={() => selectAoi(aoi.id)}
              onMouseEnter={() => setHovered(aoi.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(aoi.id)}
              onBlur={() => setHovered(null)}
              aria-pressed={isSelected}
              aria-label={`Select ${aoi.name}`}
              className={clsx(
                'w-full rounded-3xl border px-4 py-3 text-left transition focus-visible:ring-2 focus-visible:ring-primary',
                isSelected
                  ? 'border-primary/40 bg-slate-900/80'
                  : 'border-white/5 bg-slate-900/40 hover:border-white/20',
                isHovered && !isSelected && 'border-white/40',
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">{aoi.type}</p>
                  <p className="text-base font-semibold text-white">{aoi.name}</p>
                </div>
                <StatusBadge status={aoi.status} />
              </div>

              <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                <span>{aoi.areaHa.toFixed(1)} ha</span>
                <span>Updated {new Date(aoi.updatedAt).toLocaleDateString()}</span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                {aoi.metrics.slice(0, 3).map((metric) => (
                  <div key={metric.label} className="rounded-2xl bg-slate-800/60 p-2">
                    <p className="text-slate-400">{metric.label}</p>
                    <p className="font-semibold text-white">{metric.value}</p>
                    {metric.delta && (
                      <p className="text-[10px] text-slate-500">{metric.delta} vs prev</p>
                    )}
                  </div>
                ))}
              </div>

              <footer className="mt-3 flex items-center justify-between text-sm text-primary">
                <span>Review changes</span>
                <ChevronRight className="h-4 w-4" />
              </footer>
            </button>
          )
        })}
      </div>
    </section>
  )
}

