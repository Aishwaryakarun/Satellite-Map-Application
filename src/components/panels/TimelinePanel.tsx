import { Camera, Download, PenSquare } from 'lucide-react'

const steps = [
  {
    id: 'step-1',
    time: '08:20',
    action: 'Satellite scene ingested',
    details: 'Sentinel-2 pass 412 processed for Essen AOI.',
    icon: Camera,
  },
  {
    id: 'step-2',
    time: '09:05',
    action: 'Drone batch uploaded',
    details: '6 drone runs stitched. Coverage gap < 2%.',
    icon: Download,
  },
  {
    id: 'step-3',
    time: '09:40',
    action: 'Analyst annotations',
    details: '2 anomalies marked for manual validation.',
    icon: PenSquare,
  },
]

export const TimelinePanel = () => {
  return (
    <section
      data-testid="timeline-panel"
      className="rounded-3xl bg-surface-muted/70 p-5 shadow-card ring-1 ring-white/5"
    >
      <header className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Pipeline</p>
        <h3 className="text-lg font-semibold text-white">Latest activity</h3>
      </header>

      <ol className="space-y-4">
        {steps.map(({ id, time, action, details, icon: Icon }) => (
          <li key={id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="text-sm text-slate-500">{time}</span>
              <span className="my-1 h-full w-px bg-slate-700" />
            </div>
            <div className="flex-1 rounded-2xl border border-white/5 bg-slate-900/40 p-3">
              <div className="mb-1 flex items-center gap-2 text-sm text-white">
                <Icon className="h-4 w-4 text-primary" />
                {action}
              </div>
              <p className="text-sm text-slate-400">{details}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

