import { useState } from 'react'
import { Card, SectionTitle, Badge } from '../components'
import { MODELS } from '../data'
import type { ModelDef } from '../types'

export default function ModelsTab() {
  const [filter, setFilter] = useState<'all' | 'ollama' | 'vllm' | 'unsloth' | 'airllm'>('all')
  const [sortBy, setSortBy] = useState<'quality' | 'speed' | 'vram'>('quality')

  const filtered = MODELS
    .filter((m) => filter === 'all' || m.backend === filter)
    .sort((a, b) => {
      if (sortBy === 'quality') return b.quality - a.quality
      if (sortBy === 'speed') return b.speedTokS - a.speedTokS
      return a.vramGB - b.vramGB
    })

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle icon="fa-brain" color="text-violet-400">
          Local LLM Model Database
        </SectionTitle>
        <p className="text-gray-400 text-sm mb-4">
          Compare models optimized for OpenShorts moment picking on your 16GB VRAM hardware.
          All models run 100% locally — no cloud APIs needed.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            {(['all', 'ollama', 'vllm', 'unsloth', 'airllm'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setFilter(b)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === b ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {b === 'all' ? 'All' : b.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            {(['quality', 'speed', 'vram'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  sortBy === s ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Sort: {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Model Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      </Card>

      {/* Comparison Table */}
      <Card>
        <SectionTitle icon="fa-table" color="text-blue-400">
          Detailed Comparison
        </SectionTitle>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm min-w-[700px]">
            <caption className="sr-only">Comparison of local LLM models for OpenShorts</caption>
            <thead>
              <tr className="border-b border-gray-700">
                {['Model', 'Backend', 'Params', 'VRAM', 'Speed', 'Quality', 'JSON', 'Context'].map((h) => (
                  <th key={h} className="text-left py-3 px-3 text-gray-400 font-medium text-xs uppercase tracking-wider" scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {MODELS.map((m) => (
                <tr key={m.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      {m.recommended && <i className="fas fa-star text-amber-400 text-xs" aria-hidden="true" />}
                      <span className="text-white font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <Badge color={m.backend === 'ollama' ? 'violet' : m.backend === 'vllm' ? 'emerald' : m.backend === 'unsloth' ? 'amber' : 'blue'}>
                      {m.backend.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-gray-400">{m.params}</td>
                  <td className="py-3 px-3 text-emerald-400 font-mono">{m.vramGB}GB</td>
                  <td className="py-3 px-3 text-gray-300 font-mono">{m.speedTokS} t/s</td>
                  <td className="py-3 px-3">
                    <span className="text-amber-400">{'★'.repeat(m.quality)}{'☆'.repeat(5 - m.quality)}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={
                      m.jsonQuality === 'excellent' ? 'text-emerald-400' :
                      m.jsonQuality === 'good' ? 'text-blue-400' :
                      m.jsonQuality === 'fair' ? 'text-amber-400' : 'text-red-400'
                    }>{m.jsonQuality}</span>
                  </td>
                  <td className="py-3 px-3 text-gray-400 font-mono text-xs">{(m.contextMax / 1024).toFixed(0)}k</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function ModelCard({ model }: { model: ModelDef }) {
  const backendColors = {
    ollama: 'violet',
    vllm: 'emerald',
    unsloth: 'amber',
    airllm: 'blue',
  } as const

  return (
    <div className={`p-4 rounded-xl border transition-all hover:scale-[1.01] ${
      model.recommended
        ? 'border-violet-700/50 bg-violet-950/20'
        : 'border-gray-700/50 bg-gray-800/30'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-white font-semibold">{model.name}</h4>
            {model.recommended && <Badge color="amber">★ Recommended</Badge>}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{model.provider}</p>
        </div>
        <Badge color={backendColors[model.backend]}>{model.backend.toUpperCase()}</Badge>
      </div>

      <p className="text-sm text-gray-400 mb-3">{model.bestFor}</p>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2 rounded bg-gray-800/50">
          <div className="text-sm font-bold text-emerald-400">{model.vramGB}GB</div>
          <div className="text-[10px] text-gray-500">VRAM</div>
        </div>
        <div className="p-2 rounded bg-gray-800/50">
          <div className="text-sm font-bold text-blue-400">{model.speedTokS}</div>
          <div className="text-[10px] text-gray-500">tok/s</div>
        </div>
        <div className="p-2 rounded bg-gray-800/50">
          <div className="text-sm font-bold text-amber-400">{'★'.repeat(model.quality)}</div>
          <div className="text-[10px] text-gray-500">Quality</div>
        </div>
        <div className="p-2 rounded bg-gray-800/50">
          <div className={`text-sm font-bold ${
            model.jsonQuality === 'excellent' ? 'text-emerald-400' :
            model.jsonQuality === 'good' ? 'text-blue-400' : 'text-amber-400'
          }`}>{model.jsonQuality.slice(0, 4)}</div>
          <div className="text-[10px] text-gray-500">JSON</div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs text-gray-500">
        <span className="font-mono">{model.quantization}</span> • {(model.contextMax / 1024).toFixed(0)}k context • {model.ramGB}GB RAM
      </div>
    </div>
  )
}
