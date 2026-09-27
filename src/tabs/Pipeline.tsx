import { useState } from 'react'
import { Card, SectionTitle, Badge } from '../components'
import { PIPELINE_STEPS } from '../data'

export default function PipelineTab() {
  const [activeStep, setActiveStep] = useState<string | null>(null)

  const totalVramMB = PIPELINE_STEPS.reduce((sum, s) => sum + s.vramMB, 0)
  const totalDuration = '2-3 min per 8-min video'

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle icon="fa-diagram-project" color="text-violet-400">
          Visual Processing Pipeline
        </SectionTitle>
        <p className="text-gray-400 text-sm mb-4">
          Every step runs 100% locally on your hardware. Click a step for details.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Badge color="emerald">Total VRAM: {(totalVramMB / 1000).toFixed(1)}GB</Badge>
          <Badge color="amber">Est. Time: {totalDuration}</Badge>
          <Badge color="violet">{PIPELINE_STEPS.length} Steps</Badge>
          <Badge color="blue">All Local</Badge>
        </div>
      </Card>

      {/* Pipeline Visualization */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {PIPELINE_STEPS.map((step, i) => {
            const isActive = activeStep === step.id
            const colorClasses = {
              violet: { bg: 'bg-violet-900/20', border: 'border-violet-700/50', icon: 'text-violet-400', active: 'bg-violet-900/40 border-violet-600' },
              emerald: { bg: 'bg-emerald-900/20', border: 'border-emerald-700/50', icon: 'text-emerald-400', active: 'bg-emerald-900/40 border-emerald-600' },
              amber: { bg: 'bg-amber-900/20', border: 'border-amber-700/50', icon: 'text-amber-400', active: 'bg-amber-900/40 border-amber-600' },
              blue: { bg: 'bg-blue-900/20', border: 'border-blue-700/50', icon: 'text-blue-400', active: 'bg-blue-900/40 border-blue-600' },
              pink: { bg: 'bg-pink-900/20', border: 'border-pink-700/50', icon: 'text-pink-400', active: 'bg-pink-900/40 border-pink-600' },
            }
            const colors = colorClasses[step.color as keyof typeof colorClasses] || colorClasses.violet

            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(isActive ? null : step.id)}
                className={`relative p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                  isActive ? colors.active : `${colors.bg} ${colors.border}`
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-mono">#{i + 1}</span>
                  <i className={`fas ${step.icon} ${colors.icon} text-lg`} aria-hidden="true" />
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">{step.name}</h4>
                <p className="text-xs text-gray-500">{step.description}</p>
                <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-500">
                  <span><i className="fas fa-clock mr-1" aria-hidden="true" />{step.duration}</span>
                  {step.vramMB > 0 && <span><i className="fas fa-microchip mr-1" aria-hidden="true" />{(step.vramMB / 1000).toFixed(1)}GB</span>}
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Step Details */}
      {activeStep && (
        <Card className="animate-fade-in">
          {(() => {
            const step = PIPELINE_STEPS.find(s => s.id === activeStep)
            if (!step) return null
            return (
              <div>
                <SectionTitle icon={step.icon} color={
                  step.color === 'violet' ? 'text-violet-400' :
                  step.color === 'emerald' ? 'text-emerald-400' :
                  step.color === 'amber' ? 'text-amber-400' :
                  step.color === 'blue' ? 'text-blue-400' :
                  'text-pink-400'
                }>
                  {step.name} — Details
                </SectionTitle>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">What it does</h4>
                    <p className="text-sm text-gray-400">{step.description}</p>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">VRAM Usage:</span>
                        <span className="text-white font-mono">{step.vramMB > 0 ? `${(step.vramMB / 1000).toFixed(1)}GB` : 'None'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration:</span>
                        <span className="text-white font-mono">{step.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Runs Locally:</span>
                        <span className="text-emerald-400">{step.local ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Technology</h4>
                    <div className="space-y-2 text-sm">
                      {step.id === 'ingest' && (
                        <>
                          <p className="text-gray-400">Loads video from file or URL (yt-dlp for YouTube).</p>
                          <p className="text-gray-500 text-xs">Tools: FFmpeg, yt-dlp</p>
                        </>
                      )}
                      {step.id === 'transcribe' && (
                        <>
                          <p className="text-gray-400">GPU-accelerated speech-to-text with word-level timestamps.</p>
                          <p className="text-gray-500 text-xs">Tools: faster-whisper, Parakeet, CUDA</p>
                        </>
                      )}
                      {step.id === 'scenes' && (
                        <>
                          <p className="text-gray-400">Neural network detects scene boundaries for precise cutting.</p>
                          <p className="text-gray-500 text-xs">Tools: TransNetV2, PySceneDetect</p>
                        </>
                      )}
                      {step.id === 'analyze' && (
                        <>
                          <p className="text-gray-400">Local LLM scores transcript windows for viral potential.</p>
                          <p className="text-gray-500 text-xs">Tools: Ollama/vLLM, Qwen 2.5, Llama 3.1</p>
                        </>
                      )}
                      {step.id === 'extract' && (
                        <>
                          <p className="text-gray-400">FFmpeg extracts precise clips based on AI-selected moments.</p>
                          <p className="text-gray-500 text-xs">Tools: FFmpeg, scene timestamps</p>
                        </>
                      )}
                      {step.id === 'reframe' && (
                        <>
                          <p className="text-gray-400">AI tracks faces and reframes to 9:16 vertical format.</p>
                          <p className="text-gray-500 text-xs">Tools: YOLOv8, MediaPipe, OpenCV</p>
                        </>
                      )}
                      {step.id === 'subtitles' && (
                        <>
                          <p className="text-gray-400">Word-level animated subtitles burned into video.</p>
                          <p className="text-gray-500 text-xs">Tools: ASS format, FFmpeg, custom fonts</p>
                        </>
                      )}
                      {step.id === 'encode' && (
                        <>
                          <p className="text-gray-400">GPU-accelerated h264 encoding with NVENC.</p>
                          <p className="text-gray-500 text-xs">Tools: FFmpeg, h264_nvenc, CUDA</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </Card>
      )}

      {/* VRAM Timeline */}
      <Card>
        <SectionTitle icon="fa-chart-area" color="text-emerald-400">
          VRAM Usage Timeline
        </SectionTitle>
        <p className="text-sm text-gray-400 mb-4">
          VRAM usage during processing. Components are loaded/unloaded dynamically.
        </p>
        <div className="space-y-2">
          {PIPELINE_STEPS.map((step) => {
            const pct = (step.vramMB / 16000) * 100
            const colorClasses: Record<string, string> = {
              violet: 'bg-violet-500',
              emerald: 'bg-emerald-500',
              amber: 'bg-amber-500',
              blue: 'bg-blue-500',
              pink: 'bg-pink-500',
            }
            return (
              <div key={step.id} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-24 truncate">{step.name}</span>
                <div className="flex-1 h-6 bg-gray-800 rounded overflow-hidden">
                  <div
                    className={`h-full ${colorClasses[step.color] || 'bg-gray-500'} flex items-center px-2 transition-all duration-500`}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  >
                    {step.vramMB > 500 && (
                      <span className="text-[10px] text-white font-mono">
                        {(step.vramMB / 1000).toFixed(1)}GB
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
