import { Activity, AlertTriangle, Cpu } from 'lucide-react'

const insights = [
  {
    title: 'Thermal excursion',
    description: 'Cologne perimeter recorded +5°C delta over baseline during last pass.',
    icon: Activity,
    tone: 'warning',
  },
  {
    title: 'AOI coverage',
    description: '98% of requested tiles ingested in the last 72 hours.',
    icon: Cpu,
    tone: 'ok',
  },
  {
    title: 'Manual review needed',
    description: 'Drone stack flagged 3 detections near Essen industrial belt.',
    icon: AlertTriangle,
    tone: 'alert',
  },
]

const toneStyles: Record<string, string> = {
  ok: 'bg-emerald-500/10 text-emerald-300',
  warning: 'bg-amber-500/10 text-amber-300',
  alert: 'bg-rose-500/10 text-rose-300',
}

export const InsightPanel = () => {
  return (
    <section
      data-testid="insights-panel"
      className="rounded-3xl bg-surface-muted/70 p-5 shadow-card ring-1 ring-white/5"
    >
      <header className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Insights</p>
        <h3 className="text-lg font-semibold text-white">Automated findings</h3>
      </header>

      <div className="space-y-3">
        {insights.map(({ title, description, icon: Icon, tone }) => (
          <article
            key={title}
            className="rounded-3xl border border-white/5 bg-slate-900/60 p-4 text-sm text-slate-300"
          >
            <div className="mb-2 flex items-center gap-3">
              <span className={`rounded-2xl px-2 py-1 text-xs ${toneStyles[tone]}`}>{tone}</span>
              <Icon className="h-4 w-4 text-white/60" />
            </div>
            <p className="font-medium text-white">{title}</p>
            <p className="text-slate-400">{description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

