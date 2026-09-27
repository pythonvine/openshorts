import { useState, useCallback, useRef, useEffect, Component, type ReactNode } from 'react'
import { TABS } from './data'
import { useClipboard, useToast } from './hooks'
import { ToastContainer } from './components'
import type { TabId } from './types'

import DashboardTab from './tabs/Dashboard'
import ModelsTab from './tabs/Models'
import LiveTestTab from './tabs/LiveTest'
import ConfigTab from './tabs/Config'
import ServerTab from './tabs/Server'
import PipelineTab from './tabs/Pipeline'
import GuideTab from './tabs/Guide'

/* ═══ Error Boundary ═══ */
interface EBProps { children: ReactNode }
interface EBState { hasError: boolean; error: Error | null }

class ErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
          <div className="max-w-lg text-center">
            <div className="w-16 h-16 rounded-full bg-red-900/50 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-red-400 text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-4">{this.state.error?.message}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors">
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

/* ═══ Main App ═══ */
function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const { copiedId, copy } = useClipboard()
  const { toasts, addToast } = useToast()
  const tabListRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLElement>(null)

  // Wrap copy to show toast
  const copyWithToast = useCallback((text: string, id: string) => {
    const ok = copy(text, id)
    addToast(ok ? 'Copied to clipboard!' : 'Copy failed', ok ? 'success' : 'error')
    return ok
  }, [copy, addToast])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const idx = TABS.findIndex(t => t.id === activeTab)
    let next = idx
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); next = (idx + 1) % TABS.length }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); next = (idx - 1 + TABS.length) % TABS.length }
    else if (e.key === 'Home') { e.preventDefault(); next = 0 }
    else if (e.key === 'End') { e.preventDefault(); next = TABS.length - 1 }
    if (next !== idx) {
      setActiveTab(TABS[next].id)
      tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
    }
  }, [activeTab])

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeTab])

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />
      case 'models': return <ModelsTab />
      case 'livetest': return <LiveTestTab copy={copyWithToast} copiedId={copiedId} />
      case 'config': return <ConfigTab copy={copyWithToast} copiedId={copiedId} />
      case 'server': return <ServerTab copy={copyWithToast} copiedId={copiedId} />
      case 'pipeline': return <PipelineTab />
      case 'guide': return <GuideTab copy={copyWithToast} copiedId={copiedId} />
      default: return null
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        {/* Skip link */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-lg">
          Skip to content
        </a>

        {/* Header */}
        <header className="border-b border-gray-800/80 bg-gray-950/90 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-film text-white text-sm" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">OpenShorts Local</h1>
                <p className="text-[11px] text-gray-500">100% Local AI Video Clips • No Cloud APIs</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-emerald-900/40 text-emerald-400 border border-emerald-800/50">
                <i className="fas fa-microchip mr-1" aria-hidden="true" /> 16GB VRAM
              </span>
              <span className="px-2 py-1 rounded bg-blue-900/40 text-blue-400 border border-blue-800/50">
                <i className="fas fa-memory mr-1" aria-hidden="true" /> 32GB RAM
              </span>
              <span className="px-2 py-1 rounded bg-amber-900/40 text-amber-400 border border-amber-800/50">
                <i className="fas fa-desktop mr-1" aria-hidden="true" /> Ryzen 7600X
              </span>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav aria-label="Main navigation" className="border-b border-gray-800/60 bg-gray-900/30">
          <div className="max-w-7xl mx-auto px-4">
            <div
              ref={tabListRef}
              role="tablist"
              aria-label="Setup sections"
              className="flex overflow-x-auto gap-1 py-2 scrollbar-hide"
              onKeyDown={handleKeyDown}
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                    activeTab === tab.id
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                  }`}
                >
                  <i className={`fas ${tab.icon} text-xs`} aria-hidden="true" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Content */}
        <main
          id="main-content"
          ref={mainRef}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="max-w-7xl mx-auto px-4 py-6"
        >
          {renderTab()}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800/60 py-6 text-center text-xs text-gray-600">
          <p>
            OpenShorts Local Setup • Based on{' '}
            <a href="https://github.com/mutonby/openshorts" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline-offset-2 hover:underline">
              mutonby/openshorts
            </a>{' '}
            (MIT License)
          </p>
          <p className="mt-1">Optimized for: AMD Ryzen 7600X • 32GB RAM • 16GB VRAM GPU</p>
        </footer>

        {/* Toasts */}
        <ToastContainer toasts={toasts} />
      </div>
    </ErrorBoundary>
  )
}

export default App
