import { Bell, Search, Shield, UserRound } from 'lucide-react'

export const TopBar = () => {
  return (
    <header
      data-testid="header"
      className="flex flex-col gap-4 rounded-3xl bg-surface-muted/70 p-6 shadow-card sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Flowbit Missions
        </p>
        <div className="mt-2 flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold text-white">AOI Creation Workspace</h1>
            <p className="text-sm text-slate-400">Satellite + drone fusion • NRW</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 rounded-2xl bg-slate-900/80 px-4 py-2 text-sm text-slate-300 ring-1 ring-white/5">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            aria-label="Search workspace"
            className="bg-transparent focus:outline-none"
            placeholder="Search AOIs, missions, alerts"
            type="text"
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="rounded-2xl bg-slate-900/80 p-3 text-slate-300 ring-1 ring-white/5 transition hover:text-white"
          >
            <Bell className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 rounded-2xl bg-slate-900/80 px-4 py-2 ring-1 ring-white/5">
            <div>
              <p className="text-sm font-medium text-white">Aishwarya K A</p>
              <p className="text-xs text-slate-400">Frontend Intern Candidate</p>
            </div>
            <div className="rounded-full bg-primary/20 p-2 text-primary">
              <UserRound className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

