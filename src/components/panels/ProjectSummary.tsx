import { CalendarDays, MapPin, Orbit, Radar } from 'lucide-react'

const summary = [
  { label: 'Tasking window', value: 'Nov 20 — Dec 04', icon: CalendarDays },
  { label: 'Constellation', value: 'Sentinel-2 + DroneStack', icon: Orbit },
  { label: 'Delivery cadence', value: 'Every 48h', icon: Radar },
  { label: 'AOIs in scope', value: '3 active regions', icon: MapPin },
]

export const ProjectSummary = () => {
  return (
    <section
      data-testid="summary-panel"
      className="rounded-3xl bg-surface-muted/70 p-5 shadow-card ring-1 ring-white/5"
    >
      <header className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Mission</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Renewable Grid — NRW</h2>
        <p className="text-sm text-slate-400">
          Monitoring critical substations with satellite & drone revisits.
        </p>
      </header>

      <div className="space-y-3">
        {summary.map(({ label, value, icon: Icon }) => (
          <article
            key={label}
            className="flex items-center gap-3 rounded-2xl bg-slate-900/70 px-3 py-2"
          >
            <div className="rounded-2xl bg-slate-800/50 p-2 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <p className="text-slate-400">{label}</p>
              <p className="font-medium text-white">{value}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

