import { useState, useMemo } from 'react'
import { Card, SectionTitle, ProgressBar, StatCard, Badge } from '../components'
import { DEFAULT_HARDWARE, VRAM_COMPONENTS, PIPELINE_STEPS, MODELS, WHISPER_MODELS } from '../data'
import type { HardwareConfig } from '../types'

export default function DashboardTab() {
  const [hw, setHw] = useState<HardwareConfig>(DEFAULT_HARDWARE)
  const [selectedModel, setSelectedModel] = useState(MODELS[0])
  const [selectedWhisper, setSelectedWhisper] = useState(WHISPER_MODELS[0])

  const vramUsage = useMemo(() => {
    const llmMB = selectedModel.vramGB * 1000
    const whisperMB = selectedWhisper.vramMB
    const sceneMB = 800
    const faceMB = 700
    const nvencMB = 500
    const headroomMB = 1000
    const totalMB = llmMB + whisperMB + sceneMB + faceMB + nvencMB + headroomMB
    return { llmMB, whisperMB, sceneMB, faceMB, nvencMB, headroomMB, totalMB }
  }, [selectedModel, selectedWhisper])

  const vramTotalMB = hw.vramGB * 1024
  const vramFree = vramTotalMB - vramUsage.totalMB
  const fitsInVRAM = vramFree >= 0

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-900 to-violet-950/30 p-6 md:p-8">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge color="emerald">100% Local</Badge>
              <Badge color="violet">No Cloud APIs</Badge>
              <Badge color="amber">MIT License</Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              OpenShorts — Fully Local AI Video Clips
            </h2>
            <p className="text-gray-400 text-base mb-4 max-w-2xl">
              Turn long videos into viral 9:16 shorts using <strong className="text-white">local AI models</strong>.
              No data leaves your machine. No API keys required. Works offline.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <i className="fas fa-check-circle" aria-hidden="true" /> Moment Detection
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <i className="fas fa-check-circle" aria-hidden="true" /> Transcription
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <i className="fas fa-check-circle" aria-hidden="true" /> Face Tracking
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <i className="fas fa-check-circle" aria-hidden="true" /> Subtitles
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <i className="fas fa-check-circle" aria-hidden="true" /> NVENC Encoding
              </span>
            </div>
          </div>
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="rounded-xl border border-gray-700 bg-gray-900/80 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <i className="fas fa-server text-violet-400" aria-hidden="true" /> Your Hardware
              </h3>
              {[
                { icon: 'fa-microchip', color: 'text-violet-400', label: 'GPU', value: `${hw.vramGB}GB VRAM` },
                { icon: 'fa-memory', color: 'text-blue-400', label: 'RAM', value: `${hw.ramGB}GB` },
                { icon: 'fa-desktop', color: 'text-amber-400', label: 'CPU', value: hw.cpuName },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  <i className={`fas ${item.icon} ${item.color} w-5`} aria-hidden="true" />
                  <span className="text-gray-500 w-8">{item.label}</span>
                  <span className="text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard value="0" label="Cloud API Cost" color="emerald" icon="fa-dollar-sign" />
        <StatCard value="100%" label="Data Privacy" color="violet" icon="fa-shield-halved" />
        <StatCard value="~2min" label="Per 8-min Video" color="amber" icon="fa-clock" />
        <StatCard value="8" label="Pipeline Steps" color="blue" icon="fa-diagram-project" />
      </div>

      {/* VRAM Calculator */}
      <Card>
        <SectionTitle icon="fa-calculator" color="text-violet-400">
          Interactive VRAM Budget Calculator
        </SectionTitle>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Total GPU VRAM</label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={4} max={24} step={1} value={hw.vramGB}
                  onChange={(e) => setHw((h) => ({ ...h, vramGB: +e.target.value }))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <span className="text-white font-mono text-sm w-14 text-right">{hw.vramGB} GB</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">LLM Model</label>
              <select
                value={selectedModel.id}
                onChange={(e) => {
                  const m = MODELS.find((m) => m.id === e.target.value)
                  if (m) setSelectedModel(m)
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.vramGB}GB VRAM)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Whisper Model</label>
              <select
                value={selectedWhisper.id}
                onChange={(e) => {
                  const w = WHISPER_MODELS.find((w) => w.id === e.target.value)
                  if (w) setSelectedWhisper(w)
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {WHISPER_MODELS.map((w) => (
                  <option key={w.id} value={w.id}>{w.name} ({w.vramMB}MB VRAM)</option>
                ))}
              </select>
            </div>

            {/* Fit indicator */}
            <div className={`p-4 rounded-lg border ${fitsInVRAM ? 'bg-emerald-900/20 border-emerald-800' : 'bg-red-900/20 border-red-800'}`}>
              <div className="flex items-center gap-2">
                <i className={`fas ${fitsInVRAM ? 'fa-check-circle text-emerald-400' : 'fa-times-circle text-red-400'}`} aria-hidden="true" />
                <span className={`font-medium ${fitsInVRAM ? 'text-emerald-400' : 'text-red-400'}`}>
                  {fitsInVRAM ? 'Fits in VRAM!' : 'Exceeds VRAM!'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {fitsInVRAM
                  ? `${vramFree}MB free after all components loaded`
                  : `Need ${Math.abs(vramFree)}MB more VRAM. Try a smaller model.`}
              </p>
            </div>
          </div>

          {/* VRAM Bars */}
          <div className="space-y-3">
            <ProgressBar
              value={vramUsage.llmMB} max={vramTotalMB}
              color="bg-violet-500" label="LLM Model"
              sublabel={`${(vramUsage.llmMB / 1024).toFixed(1)} GB`}
            />
            <ProgressBar
              value={vramUsage.whisperMB} max={vramTotalMB}
              color="bg-emerald-500" label="Whisper ASR"
              sublabel={`${(vramUsage.whisperMB / 1024).toFixed(1)} GB`}
            />
            <ProgressBar
              value={vramUsage.sceneMB} max={vramTotalMB}
              color="bg-amber-500" label="Scene Detection"
              sublabel={`${(vramUsage.sceneMB / 1024).toFixed(1)} GB`}
            />
            <ProgressBar
              value={vramUsage.faceMB} max={vramTotalMB}
              color="bg-blue-500" label="Face Tracking (YOLO)"
              sublabel={`${(vramUsage.faceMB / 1024).toFixed(1)} GB`}
            />
            <ProgressBar
              value={vramUsage.nvencMB} max={vramTotalMB}
              color="bg-pink-500" label="NVENC Encoder"
              sublabel={`${(vramUsage.nvencMB / 1024).toFixed(1)} GB`}
            />
            <ProgressBar
              value={vramUsage.headroomMB} max={vramTotalMB}
              color="bg-gray-500" label="Safety Headroom"
              sublabel={`${(vramUsage.headroomMB / 1024).toFixed(1)} GB`}
            />
            <div className="pt-2 border-t border-gray-800">
              <ProgressBar
                value={vramUsage.totalMB} max={vramTotalMB}
                color={fitsInVRAM ? 'bg-gradient-to-r from-violet-500 to-emerald-500' : 'bg-red-500'}
                label="Total Usage"
                sublabel={`${(vramUsage.totalMB / 1024).toFixed(1)} / ${hw.vramGB} GB`}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Pipeline Overview */}
      <Card>
        <SectionTitle icon="fa-diagram-project" color="text-emerald-400">
          Processing Pipeline (All Local)
        </SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.id} className="relative p-3 rounded-lg bg-gray-800/40 border border-gray-700/50 hover:border-gray-600 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <i className={`fas ${step.icon} ${
                  step.color === 'violet' ? 'text-violet-400' :
                  step.color === 'emerald' ? 'text-emerald-400' :
                  step.color === 'amber' ? 'text-amber-400' :
                  step.color === 'blue' ? 'text-blue-400' :
                  'text-pink-400'
                } text-sm`} aria-hidden="true" />
                <span className="text-xs text-gray-500 font-mono">#{i + 1}</span>
              </div>
              <h4 className="text-sm font-medium text-white">{step.name}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
              <div className="flex items-center gap-2 mt-2 text-[10px]">
                <span className="text-gray-500">{step.duration}</span>
                {step.vramMB > 0 && (
                  <span className="text-gray-600">• {(step.vramMB / 1000).toFixed(1)}GB</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
