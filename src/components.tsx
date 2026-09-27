import { memo, type ReactNode } from 'react'

/* ═══ CodeBlock ═══ */
export const CodeBlock = memo(function CodeBlock({
  code, id, copy, copiedId, language = 'bash',
}: {
  code: string; id: string
  copy: (text: string, id: string) => boolean
  copiedId: string | null; language?: string
}) {
  const isCopied = copiedId === id
  return (
    <div className="rounded-lg border border-gray-700/60 bg-gray-900/80 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/40 border-b border-gray-700/40">
        <span className="text-[11px] text-gray-500 font-mono uppercase tracking-wider">{language}</span>
        <button
          onClick={() => copy(code, id)}
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors px-2 py-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          aria-label={isCopied ? 'Copied' : 'Copy code'}
        >
          <i className={`fas ${isCopied ? 'fa-check text-emerald-400' : 'fa-copy'}`} aria-hidden="true" />
          <span>{isCopied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed" tabIndex={0}>
        <code className="text-gray-300 whitespace-pre">{code}</code>
      </pre>
    </div>
  )
})

/* ═══ Card ═══ */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-gray-800 bg-gray-900/60 p-6 ${className}`}>
      {children}
    </div>
  )
}

/* ═══ SectionTitle ═══ */
export function SectionTitle({ icon, color, children }: { icon: string; color: string; children: ReactNode }) {
  return (
    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2.5">
      <i className={`fas ${icon} ${color}`} aria-hidden="true" />
      {children}
    </h3>
  )
}

/* ═══ Badge ═══ */
export function Badge({ children, color = 'violet' }: { children: ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    violet: 'bg-violet-900/50 text-violet-300 border-violet-800',
    emerald: 'bg-emerald-900/50 text-emerald-300 border-emerald-800',
    amber: 'bg-amber-900/50 text-amber-300 border-amber-800',
    blue: 'bg-blue-900/50 text-blue-300 border-blue-800',
    red: 'bg-red-900/50 text-red-300 border-red-800',
    gray: 'bg-gray-800/50 text-gray-300 border-gray-700',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color] || colors.violet}`}>
      {children}
    </span>
  )
}

/* ═══ ProgressBar ═══ */
export function ProgressBar({ value, max, color, label, sublabel }: {
  value: number; max: number; color: string; label: string; sublabel?: string
}) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-400 font-mono text-xs">{sublabel || `${value} / ${max}`}</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-800 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full ${color} rounded-full transition-all duration-700 ease-out`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/* ═══ StatusDot ═══ */
export function StatusDot({ status }: { status: 'connected' | 'error' | 'connecting' | 'idle' }) {
  const styles = {
    connected: 'bg-emerald-400 shadow-emerald-400/50',
    error: 'bg-red-400 shadow-red-400/50',
    connecting: 'bg-amber-400 shadow-amber-400/50 animate-pulse',
    idle: 'bg-gray-500',
  }
  return (
    <span className={`inline-block w-2.5 h-2.5 rounded-full shadow-lg ${styles[status]}`} aria-hidden="true" />
  )
}

/* ═══ Toast Container ═══ */
export function ToastContainer({ toasts }: { toasts: Array<{ id: string; text: string; type: string }> }) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2" aria-live="polite">
      {toasts.map((t) => {
        const colors = {
          success: 'bg-emerald-900/90 border-emerald-700 text-emerald-200',
          error: 'bg-red-900/90 border-red-700 text-red-200',
          info: 'bg-blue-900/90 border-blue-700 text-blue-200',
        }
        const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' }
        return (
          <div key={t.id} className={`px-4 py-3 rounded-lg border text-sm font-medium shadow-xl backdrop-blur-sm animate-slide-up ${colors[t.type as keyof typeof colors] || colors.info}`}>
            <i className={`fas ${icons[t.type as keyof typeof icons] || icons.info} mr-2`} aria-hidden="true" />
            {t.text}
          </div>
        )
      })}
    </div>
  )
}

/* ═══ Stat Card ═══ */
export function StatCard({ value, label, color, icon }: { value: string; label: string; color: string; icon: string }) {
  return (
    <div className={`p-4 rounded-xl border bg-opacity-20 ${
      color === 'violet' ? 'bg-violet-900/20 border-violet-800/50' :
      color === 'emerald' ? 'bg-emerald-900/20 border-emerald-800/50' :
      color === 'amber' ? 'bg-amber-900/20 border-amber-800/50' :
      'bg-blue-900/20 border-blue-800/50'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <i className={`fas ${icon} ${
          color === 'violet' ? 'text-violet-400' :
          color === 'emerald' ? 'text-emerald-400' :
          color === 'amber' ? 'text-amber-400' :
          'text-blue-400'
        } text-sm`} aria-hidden="true" />
        <span className={`text-2xl font-bold ${
          color === 'violet' ? 'text-violet-400' :
          color === 'emerald' ? 'text-emerald-400' :
          color === 'amber' ? 'text-amber-400' :
          'text-blue-400'
        }`}>{value}</span>
      </div>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  )
}
