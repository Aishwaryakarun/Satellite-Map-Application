import { useEffect } from 'react'
import { TopBar } from './components/layout/TopBar'
import { ProjectSummary } from './components/panels/ProjectSummary'
import { AoiList } from './components/panels/AoiList'
import { InsightPanel } from './components/panels/InsightPanel'
import { TimelinePanel } from './components/panels/TimelinePanel'
import { LayerManagerPanel } from './components/panels/LayerManagerPanel'
import { AoiMap } from './components/map/AoiMap'
import { useAoiStore } from './store/useAoiStore'

const App = () => {
  const hydrate = useAoiStore((state) => state.hydrateFromStorage)

  useEffect(() => {
    try {
      hydrate()
    } catch (error) {
      console.error('Failed to hydrate AOI store', error)
    }
  }, [hydrate])

  try {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 p-6">
          <TopBar />
          <div className="flex flex-1 flex-col gap-6 lg:flex-row">
            <div className="flex flex-col gap-5 lg:w-[320px] xl:w-[360px]">
              <ProjectSummary />
              <AoiList />
            </div>

            <div className="flex-1">
              <AoiMap />
            </div>

            <div className="flex flex-col gap-5 lg:w-[320px] xl:w-[360px]">
              <LayerManagerPanel />
              <InsightPanel />
              <TimelinePanel />
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Root layout failed to render', error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-center text-slate-200">
        <div>
          <h1 className="text-2xl font-semibold text-white">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-400">
            Check console output for details while rendering the mission workspace.
          </p>
        </div>
      </div>
    )
  }
}

export default App
