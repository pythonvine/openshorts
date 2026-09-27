import { useState, useCallback, useRef, useEffect, memo, Component, type ReactNode } from 'react'

/* ─── Types ─── */
type Tab = 'overview' | 'ollama' | 'airllm' | 'unsloth' | 'config' | 'docker' | 'troubleshoot'

interface TabDef {
  id: Tab
  label: string
  icon: string
}

interface CopyToClipboardFn {
  (text: string, id: string): void
}

interface TabProps {
  copyToClipboard: CopyToClipboardFn
  copiedId: string | null
}

/* ─── Constants ─── */
const TABS: TabDef[] = [
  { id: 'overview', label: 'Overview', icon: 'fa-home' },
  { id: 'ollama', label: 'Ollama Setup', icon: 'fa-server' },
  { id: 'airllm', label: 'AirLLM Setup', icon: 'fa-cloud' },
  { id: 'unsloth', label: 'Unsloth Setup', icon: 'fa-bolt' },
  { id: 'config', label: '.env Config', icon: 'fa-cog' },
  { id: 'docker', label: 'Docker Setup', icon: 'fa-box' },
  { id: 'troubleshoot', label: 'Troubleshoot', icon: 'fa-wrench' },
]

const COPY_TIMEOUT_MS = 2000

/* ─── Utility: Safe clipboard copy with fallback ─── */
function safeCopyToClipboard(text: string): boolean {
  // Try modern API first
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    navigator.clipboard.writeText(text).catch(() => {
      // Silently fail — fallback already attempted below
    })
    return true
  }
  // Fallback for older browsers / non-HTTPS
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '-9999px'
    textarea.setAttribute('aria-hidden', 'true')
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

/* ─── Error Boundary ─── */
interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
          <div className="max-w-lg text-center">
            <div className="w-16 h-16 rounded-full bg-red-900/50 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-red-400 text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-4">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

/* ─── Toast Notification ─── */
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-lg bg-emerald-900/90 border border-emerald-700 text-emerald-200 text-sm font-medium shadow-xl backdrop-blur-sm transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <i className="fas fa-check-circle mr-2"></i>
      {message}
    </div>
  )
}

/* ─── Code Block Component ─── */
const CodeBlock = memo(function CodeBlock({
  code,
  id,
  copyToClipboard,
  copiedId,
  language = 'bash',
}: {
  code: string
  id: string
  copyToClipboard: CopyToClipboardFn
  copiedId: string | null
  language?: string
}) {
  const isCopied = copiedId === id

  return (
    <div className="relative group rounded-lg border border-gray-700 bg-gray-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono">{language}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded px-2 py-1"
          aria-label={isCopied ? 'Copied to clipboard' : `Copy ${language} code to clipboard`}
        >
          <i className={`fas ${isCopied ? 'fa-check text-emerald-400' : 'fa-copy'}`} aria-hidden="true"></i>
          <span>{isCopied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed" tabIndex={0} aria-label={`${language} code block`}>
        <code className="text-gray-300 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  )
})

/* ─── Section Card ─── */
function SectionCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-gray-800 bg-gray-900 p-6 ${className}`}>
      {children}
    </div>
  )
}

/* ─── Section Title ─── */
function SectionTitle({ icon, iconColor, children }: { icon: string; iconColor: string; children: ReactNode }) {
  return (
    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
      <i className={`fas ${icon} ${iconColor}`} aria-hidden="true"></i>
      {children}
    </h3>
  )
}

/* ─── Info Box ─── */
function InfoBox({ type, children }: { type: 'info' | 'warning' | 'success'; children: ReactNode }) {
  const styles = {
    info: 'bg-blue-900/20 border-blue-800 text-blue-400',
    warning: 'bg-amber-900/20 border-amber-800 text-amber-400',
    success: 'bg-emerald-900/20 border-emerald-800 text-emerald-400',
  }
  const icons = {
    info: 'fa-info-circle',
    warning: 'fa-exclamation-triangle',
    success: 'fa-star',
  }
  return (
    <div className={`mt-4 p-4 rounded-lg border ${styles[type]}`}>
      <p className="text-sm">
        <i className={`fas ${icons[type]} mr-1`} aria-hidden="true"></i>
        {children}
      </p>
    </div>
  )
}

/* ─── Step Item ─── */
function StepItem({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span
        className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold text-white"
        aria-hidden="true"
      >
        {number}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium mb-2">{title}</p>
        {children}
      </div>
    </div>
  )
}

/* ─── Overview Tab ─── */
const OverviewTab = memo(function OverviewTab({ copyToClipboard, copiedId }: TabProps) {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Run OpenShorts 100% Locally</h2>
            <p className="text-gray-400 text-base md:text-lg mb-4">
              Transform long videos into viral 9:16 shorts using <strong className="text-white">local AI models</strong> —
              no cloud APIs, no API keys, no data leaves your machine.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Privacy First', 'Free Forever', 'No Rate Limits', 'Offline Capable'].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-violet-900/50 text-violet-300 text-sm border border-violet-800">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="w-full md:w-auto">
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-300">Your Hardware</h3>
              <div className="space-y-2 text-sm">
                {[
                  { icon: 'fa-microchip', color: 'text-violet-400', label: 'GPU:', value: '16GB VRAM' },
                  { icon: 'fa-memory', color: 'text-blue-400', label: 'RAM:', value: '32GB DDR5' },
                  { icon: 'fa-desktop', color: 'text-amber-400', label: 'CPU:', value: 'Ryzen 7600X (6C/12T)' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <i className={`fas ${item.icon} ${item.color} w-5`} aria-hidden="true"></i>
                    <span className="text-gray-400">{item.label}</span>
                    <span className="text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <SectionCard>
          <div className="w-12 h-12 rounded-lg bg-violet-900/50 flex items-center justify-center mb-4">
            <i className="fas fa-brain text-violet-400 text-xl" aria-hidden="true"></i>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Local LLM</h3>
          <p className="text-gray-400 text-sm">Use Ollama, AirLLM, or Unsloth to run the moment picker locally. Replaces Google Gemini for transcript scoring and clip selection.</p>
        </SectionCard>
        <SectionCard>
          <div className="w-12 h-12 rounded-lg bg-emerald-900/50 flex items-center justify-center mb-4">
            <i className="fas fa-microphone text-emerald-400 text-xl" aria-hidden="true"></i>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Local Transcription</h3>
          <p className="text-gray-400 text-sm">faster-whisper runs on your GPU for speech-to-text. Parakeet backend available for faster processing.</p>
        </SectionCard>
        <SectionCard>
          <div className="w-12 h-12 rounded-lg bg-amber-900/50 flex items-center justify-center mb-4">
            <i className="fas fa-crop-alt text-amber-400 text-xl" aria-hidden="true"></i>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Local Processing</h3>
          <p className="text-gray-400 text-sm">FFmpeg, scene detection, face tracking, and reframing all run locally. NVENC encoding with your GPU for fast output.</p>
        </SectionCard>
      </div>

      {/* Model Recommendations */}
      <SectionCard>
        <h3 className="text-xl font-bold text-white mb-4">
          <i className="fas fa-star text-amber-400 mr-2" aria-hidden="true"></i>
          Recommended Models for 16GB VRAM
        </h3>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm min-w-[600px]">
            <caption className="sr-only">Recommended local AI models for OpenShorts with 16GB VRAM GPU</caption>
            <thead>
              <tr className="border-b border-gray-700">
                {['Model', 'Size', 'VRAM', 'Quality', 'Use Case'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-gray-400 font-medium" scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {[
                { model: 'qwen2.5:14b', size: '~9GB Q4', vram: '~10GB', quality: '★★★★★', qColor: 'text-emerald-400', use: 'Best overall for moment picking' },
                { model: 'qwen2.5:7b', size: '~4.5GB Q4', vram: '~6GB', quality: '★★★★☆', qColor: 'text-emerald-400', use: 'Fast + good quality' },
                { model: 'llama3.1:8b', size: '~4.7GB Q4', vram: '~6GB', quality: '★★★★☆', qColor: 'text-blue-400', use: 'Reliable JSON output' },
                { model: 'mistral:7b', size: '~4.1GB Q4', vram: '~5GB', quality: '★★★☆☆', qColor: 'text-blue-400', use: 'Fastest option' },
                { model: 'qwen2.5-coder:7b', size: '~4.5GB Q4', vram: '~6GB', quality: '★★★★☆', qColor: 'text-blue-400', use: 'Better structured output' },
                { model: 'gemma2:9b', size: '~5.5GB Q4', vram: '~7GB', quality: '★★★★☆', qColor: 'text-emerald-400', use: "Google's open model" },
              ].map((row) => (
                <tr key={row.model} className="hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-white">{row.model}</td>
                  <td className="py-3 px-4 text-gray-400">{row.size}</td>
                  <td className="py-3 px-4 text-emerald-400">{row.vram}</td>
                  <td className={`py-3 px-4 ${row.qColor}`} aria-label={`${row.quality.length - row.quality.split('☆').length + 1} out of 5 stars`}>{row.quality}</td>
                  <td className="py-3 px-4 text-gray-400">{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Quick Start */}
      <SectionCard>
        <h3 className="text-xl font-bold text-white mb-4">
          <i className="fas fa-rocket text-violet-400 mr-2" aria-hidden="true"></i>
          Quick Start (Ollama - Recommended)
        </h3>
        <div className="space-y-4">
          <StepItem number={1} title="Install Ollama">
            <CodeBlock code="curl -fsSL https://ollama.com/install.sh | sh" id="qs1" copyToClipboard={copyToClipboard} copiedId={copiedId} />
          </StepItem>
          <StepItem number={2} title="Pull recommended model">
            <CodeBlock code="ollama pull qwen2.5:14b" id="qs2" copyToClipboard={copyToClipboard} copiedId={copiedId} />
          </StepItem>
          <StepItem number={3} title="Set context length (critical!)">
            <CodeBlock code="ollama run qwen2.5:14b --num-ctx 16384" id="qs3" copyToClipboard={copyToClipboard} copiedId={copiedId} />
          </StepItem>
          <StepItem number={4} title="Clone and configure OpenShorts">
            <CodeBlock code={`git clone https://github.com/mutonby/openshorts.git\ncd openshorts\ncp .env.example .env`} id="qs4" copyToClipboard={copyToClipboard} copiedId={copiedId} />
          </StepItem>
          <StepItem number={5} title="Launch with GPU support">
            <CodeBlock code="docker compose up --build" id="qs5" copyToClipboard={copyToClipboard} copiedId={copiedId} />
          </StepItem>
        </div>
      </SectionCard>

      {/* Local vs Cloud */}
      <SectionCard>
        <h3 className="text-xl font-bold text-white mb-4">
          <i className="fas fa-shield-alt text-emerald-400 mr-2" aria-hidden="true"></i>
          What Runs Locally vs What's Optional
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
              <i className="fas fa-check-circle" aria-hidden="true"></i> Fully Local (No API Keys)
            </h4>
            <ul className="space-y-2 text-sm text-gray-300 list-none">
              {[
                'Moment detection / clip selection (LLM)',
                'Transcription (faster-whisper)',
                'Scene detection (TransNetV2)',
                'Face tracking (MediaPipe + YOLOv8)',
                'Video reframing & cropping',
                'Subtitle generation & burning',
                'Hook text overlays',
                'Video encoding (NVENC)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <i className="fas fa-check text-emerald-500 text-xs mt-1 flex-shrink-0" aria-hidden="true"></i>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
              <i className="fas fa-cloud" aria-hidden="true"></i> Optional Cloud Services
            </h4>
            <ul className="space-y-2 text-sm text-gray-300 list-none">
              {[
                'Layout picker (needs Gemini for vision)',
                'AI Shorts / UGC videos (fal.ai)',
                'Voice dubbing (ElevenLabs)',
                'Social publishing (Upload-Post)',
                'Silent video analysis (Gemini vision)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <i className="fas fa-minus text-amber-500 text-xs mt-1 flex-shrink-0" aria-hidden="true"></i>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-gray-500 italic">
              Note: The core clip generator works 100% locally.
              Only the layout picker for complex multi-speaker videos needs Gemini vision.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  )
})

/* ─── Ollama Tab ─── */
const OllamaTab = memo(function OllamaTab({ copyToClipboard, copiedId }: TabProps) {
  return (
    <div className="space-y-6">
      <SectionCard>
        <h2 className="text-2xl font-bold text-white mb-2">
          <i className="fas fa-server text-violet-400 mr-2" aria-hidden="true"></i>Ollama Setup
        </h2>
        <p className="text-gray-400">
          Ollama is the easiest way to run local LLMs. It provides an OpenAI-compatible API that OpenShorts can use directly.
        </p>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-download" iconColor="text-blue-400">Step 1: Install Ollama</SectionTitle>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">Linux (recommended for your setup):</p>
            <CodeBlock code="curl -fsSL https://ollama.com/install.sh | sh" id="ollama1" copyToClipboard={copyToClipboard} copiedId={copiedId} />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Windows (WSL2):</p>
            <CodeBlock code={`# Install Ollama from https://ollama.com/download\n# Then in WSL2, it's accessible at host.docker.internal:11434`} id="ollama2" copyToClipboard={copyToClipboard} copiedId={copiedId} />
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-boxes-stacked" iconColor="text-emerald-400">Step 2: Pull Models</SectionTitle>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-emerald-900/20 border border-emerald-800">
            <p className="text-emerald-400 text-sm font-medium mb-2">
              <i className="fas fa-star mr-1" aria-hidden="true"></i> Recommended for 16GB VRAM:
            </p>
            <CodeBlock code={`# Best quality - uses ~10GB VRAM (leaves room for whisper)\nollama pull qwen2.5:14b\n\n# Good balance - uses ~6GB VRAM\nollama pull qwen2.5:7b\n\n# Fast option - uses ~5GB VRAM\nollama pull llama3.1:8b`} id="ollama3" copyToClipboard={copyToClipboard} copiedId={copiedId} />
          </div>
          <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-800">
            <p className="text-amber-400 text-sm font-medium mb-2">
              <i className="fas fa-exclamation-triangle mr-1" aria-hidden="true"></i> Important: Context Length
            </p>
            <p className="text-gray-400 text-sm mb-2">
              Ollama defaults to 4096 tokens. OpenShorts needs 16384+ for scoring. Create a Modelfile:
            </p>
            <CodeBlock code={`# Create Modelfile.qwen\ncat > Modelfile.qwen << 'EOF'\nFROM qwen2.5:14b\nPARAMETER num_ctx 16384\nEOF\n\n# Create custom model with extended context\nollama create qwen2.5-16k -f Modelfile.qwen`} id="ollama4" copyToClipboard={copyToClipboard} copiedId={copiedId} />
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-sliders" iconColor="text-amber-400">Step 3: Configure Ollama for GPU</SectionTitle>
        <CodeBlock code={`# Create/edit ollama service override for systemd\nsudo mkdir -p /etc/systemd/system/ollama.service.d\nsudo tee /etc/systemd/system/ollama.service.d/override.conf << 'EOF'\n[Service]\nEnvironment="OLLAMA_NUM_PARALLEL=2"\nEnvironment="OLLAMA_MAX_LOADED_MODELS=1"\nEnvironment="OLLAMA_GPU_OVERHEAD=512"\nEnvironment="OLLAMA_KEEP_ALIVE=10m"\nEOF\n\nsudo systemctl daemon-reload\nsudo systemctl restart ollama`} id="ollama5" copyToClipboard={copyToClipboard} copiedId={copiedId} />
        <InfoBox type="info">
          <strong>OLLAMA_GPU_OVERHEAD=512</strong> reserves 512MB VRAM for other GPU tasks (whisper, scene detection).
          Adjust based on your needs.
        </InfoBox>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-vial" iconColor="text-blue-400">Step 4: Test the API</SectionTitle>
        <CodeBlock code={`# Verify Ollama is running and GPU is used\ncurl http://localhost:11434/api/tags\n\n# Test the OpenAI-compatible endpoint\ncurl http://localhost:11434/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "qwen2.5:14b",\n    "messages": [{"role": "user", "content": "Hello"}],\n    "stream": false\n  }'\n\n# Check GPU usage during inference\nwatch -n 1 nvidia-smi`} id="ollama6" copyToClipboard={copyToClipboard} copiedId={copiedId} />
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-chart-bar" iconColor="text-violet-400">VRAM Budget for 16GB GPU</SectionTitle>
        <div className="space-y-3">
          {[
            { label: 'Ollama (qwen2.5:14b Q4)', size: '~10 GB', pct: 62.5, color: 'bg-violet-500', textColor: 'text-violet-400' },
            { label: 'faster-whisper (large-v3-turbo)', size: '~3 GB', pct: 18.75, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
            { label: 'Scene detection + Face tracking', size: '~1.5 GB', pct: 9.375, color: 'bg-amber-500', textColor: 'text-amber-400' },
            { label: 'Available headroom', size: '~1.5 GB', pct: 9.375, color: 'bg-gray-600', textColor: 'text-gray-400' },
          ].map((item) => (
            <div key={item.label} className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">{item.label}</span>
                <span className={item.textColor}>{item.size}</span>
              </div>
              <div className="h-3 rounded-full bg-gray-800 overflow-hidden" role="progressbar" aria-valuenow={item.pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${item.label}: ${item.size}`}>
                <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.pct}%` }}></div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Tip: OpenShorts releases ASR models after transcription to free VRAM for the LLM.
          Use <code className="text-gray-400 bg-gray-800 px-1 rounded">qwen2.5:7b</code> if you need more headroom.
        </p>
      </SectionCard>
    </div>
  )
})

/* ─── AirLLM Tab ─── */
const AirLLMTab = memo(function AirLLMTab({ copyToClipboard, copiedId }: TabProps) {
  return (
    <div className="space-y-6">
      <SectionCard>
        <h2 className="text-2xl font-bold text-white mb-2">
          <i className="fas fa-cloud text-blue-400 mr-2" aria-hidden="true"></i>AirLLM Setup
        </h2>
        <p className="text-gray-400">
          AirLLM optimizes inference for single-GPU setups by splitting model layers between GPU and CPU RAM.
          Perfect for running larger models that don't fully fit in VRAM.
        </p>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-lightbulb" iconColor="text-blue-400">How AirLLM Works</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-800/50">
            <h4 className="text-blue-400 font-medium mb-2">Key Feature</h4>
            <p className="text-sm text-gray-300">
              Runs large models (up to 70B) on a single GPU by computing only one layer at a time on GPU,
              keeping the rest in system RAM. With 32GB RAM, you can run models up to ~30B parameters.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50">
            <h4 className="text-blue-400 font-medium mb-2">Trade-off</h4>
            <p className="text-sm text-gray-300">
              Slower than fully GPU-loaded models (~2-5x) but uses minimal VRAM (~2-4GB).
              Good for quality-focused use where speed isn't critical.
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-download" iconColor="text-emerald-400">Installation</SectionTitle>
        <CodeBlock code={`# Create a Python environment for AirLLM\npython -m venv airllm-env\nsource airllm-env/bin/activate\n\n# Install AirLLM\npip install airllm\n\n# Install dependencies\npip install transformers torch accelerate`} id="air1" copyToClipboard={copyToClipboard} copiedId={copiedId} />
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-code" iconColor="text-amber-400">Create OpenAI-Compatible Server</SectionTitle>
        <p className="text-sm text-gray-400 mb-4">
          AirLLM doesn't have a built-in server, so we wrap it with a lightweight FastAPI server:
        </p>
        <CodeBlock code={`# server_airllm.py - OpenAI-compatible wrapper for AirLLM\nfrom fastapi import FastAPI\nfrom pydantic import BaseModel\nfrom airllm import AutoModel\nimport uvicorn\n\napp = FastAPI()\nmodel = None\n\nclass Message(BaseModel):\n    role: str\n    content: str\n\nclass ChatRequest(BaseModel):\n    model: str\n    messages: list[Message]\n    temperature: float = 0.7\n    max_tokens: int = 4096\n    stream: bool = False\n\n@app.on_event("startup")\nasync def load_model():\n    global model\n    model = AutoModel.from_pretrained(\n        "Qwen/Qwen2.5-14B-Instruct",\n        device_map="auto"\n    )\n\n@app.post("/v1/chat/completions")\nasync def chat(request: ChatRequest):\n    prompt = "\\n".join([f"{m.role}: {m.content}" for m in request.messages])\n    output = model.generate(\n        prompt,\n        max_new_tokens=request.max_tokens,\n        temperature=request.temperature\n    )\n    return {\n        "model": request.model,\n        "choices": [{\n            "message": {"role": "assistant", "content": output},\n            "finish_reason": "stop"\n        }]\n    }\n\n@app.get("/v1/models")\nasync def models():\n    return {"data": [{"id": "qwen2.5-14b-airllm"}]}\n\nif __name__ == "__main__":\n    uvicorn.run(app, host="0.0.0.0", port=8080)`} id="air2" copyToClipboard={copyToClipboard} copiedId={copiedId} language="python" />
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-play" iconColor="text-emerald-400">Run the Server</SectionTitle>
        <CodeBlock code={`# Start the AirLLM server\npython server_airllm.py\n\n# Test it\ncurl http://localhost:8080/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "qwen2.5-14b-airllm",\n    "messages": [{"role": "user", "content": "Score this transcript for virality"}]\n  }'`} id="air3" copyToClipboard={copyToClipboard} copiedId={copiedId} />
        <InfoBox type="info">
          Then set in your .env: <code className="text-gray-300 bg-gray-800 px-1 rounded">LLM_BASE_URL=http://host.docker.internal:8080/v1</code>
        </InfoBox>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-list" iconColor="text-violet-400">Models You Can Run with AirLLM</SectionTitle>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm min-w-[500px]">
            <caption className="sr-only">AirLLM compatible models for your hardware</caption>
            <thead>
              <tr className="border-b border-gray-700">
                {['Model', 'Params', 'VRAM Used', 'RAM Used', 'Speed'].map((h) => (
                  <th key={h} className="text-left py-2 px-4 text-gray-400 font-medium" scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {[
                { model: 'Qwen2.5-14B-Instruct', params: '14B', vram: '~3GB', ram: '~12GB', speed: '~5 tok/s' },
                { model: 'Qwen2.5-32B-Instruct', params: '32B', vram: '~3GB', ram: '~20GB', speed: '~2 tok/s' },
                { model: 'Llama-3.1-8B-Instruct', params: '8B', vram: '~2GB', ram: '~8GB', speed: '~8 tok/s' },
              ].map((row) => (
                <tr key={row.model} className="hover:bg-gray-800/50 transition-colors">
                  <td className="py-2 px-4 text-white">{row.model}</td>
                  <td className="py-2 px-4 text-gray-400">{row.params}</td>
                  <td className="py-2 px-4 text-emerald-400">{row.vram}</td>
                  <td className="py-2 px-4 text-blue-400">{row.ram}</td>
                  <td className="py-2 px-4 text-amber-400">{row.speed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
})

/* ─── Unsloth Tab ─── */
const UnslothTab = memo(function UnslothTab({ copyToClipboard, copiedId }: TabProps) {
  return (
    <div className="space-y-6">
      <SectionCard>
        <h2 className="text-2xl font-bold text-white mb-2">
          <i className="fas fa-bolt text-amber-400 mr-2" aria-hidden="true"></i>Unsloth Setup
        </h2>
        <p className="text-gray-400">
          Unsloth provides 2x faster inference and 80% less VRAM usage through optimized kernels.
          It's the fastest way to run local models on consumer GPUs.
        </p>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-chart-line" iconColor="text-amber-400">Why Unsloth for Your Hardware</SectionTitle>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-800/50">
            <div className="text-2xl font-bold text-amber-400 mb-1">2x</div>
            <p className="text-sm text-gray-300">Faster inference vs standard transformers</p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-900/20 border border-emerald-800/50">
            <div className="text-2xl font-bold text-emerald-400 mb-1">80%</div>
            <p className="text-sm text-gray-300">Less VRAM usage with same quality</p>
          </div>
          <div className="p-4 rounded-lg bg-violet-900/20 border border-violet-800/50">
            <div className="text-2xl font-bold text-violet-400 mb-1">Free</div>
            <p className="text-sm text-gray-300">Open source, no API keys needed</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-download" iconColor="text-emerald-400">Installation</SectionTitle>
        <CodeBlock code={`# Create environment\npython -m venv unsloth-env\nsource unsloth-env/bin/activate\n\n# Install Unsloth (requires CUDA)\npip install unsloth\n\n# Install additional dependencies\npip install vllm  # For the OpenAI-compatible server`} id="uns1" copyToClipboard={copyToClipboard} copiedId={copiedId} />
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-server" iconColor="text-blue-400">Run with vLLM (Unsloth-optimized)</SectionTitle>
        <p className="text-sm text-gray-400 mb-4">
          vLLM provides a production-ready OpenAI-compatible server. Combined with Unsloth optimizations:
        </p>
        <CodeBlock code={`# Start vLLM server with optimized settings for 16GB VRAM\npython -m vllm.entrypoints.openai.api_server \\\n  --model unsloth/Qwen2.5-14B-Instruct \\\n  --max-model-len 16384 \\\n  --gpu-memory-utilization 0.75 \\\n  --quantization awq \\\n  --dtype float16 \\\n  --port 8080 \\\n  --host 0.0.0.0\n\n# Alternative: Use GGUF quantization for even less VRAM\npython -m vllm.entrypoints.openai.api_server \\\n  --model Qwen/Qwen2.5-14B-Instruct-AWQ \\\n  --max-model-len 16384 \\\n  --gpu-memory-utilization 0.70 \\\n  --quantization awq \\\n  --port 8080`} id="uns2" copyToClipboard={copyToClipboard} copiedId={copiedId} />
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-rocket" iconColor="text-amber-400">Direct Unsloth Inference (Fastest)</SectionTitle>
        <CodeBlock code={`# unsloth_server.py - Maximum performance server\nfrom unsloth import FastLanguageModel\nfrom fastapi import FastAPI\nfrom pydantic import BaseModel\nimport uvicorn\n\napp = FastAPI()\n\n# Load model with Unsloth optimizations\nmodel, tokenizer = FastLanguageModel.from_pretrained(\n    model_name="unsloth/Qwen2.5-14B-Instruct",\n    max_seq_length=16384,\n    dtype=None,\n    load_in_4bit=True,\n)\n\nclass ChatRequest(BaseModel):\n    model: str\n    messages: list[dict]\n    temperature: float = 0.7\n    max_tokens: int = 4096\n\n@app.post("/v1/chat/completions")\nasync def chat(request: ChatRequest):\n    prompt = tokenizer.apply_chat_template(\n        request.messages, tokenize=False, add_generation_prompt=True\n    )\n    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")\n\n    outputs = model.generate(\n        **inputs,\n        max_new_tokens=request.max_tokens,\n        temperature=request.temperature,\n        use_cache=True,\n    )\n    response = tokenizer.decode(\n        outputs[0][inputs.input_ids.shape[1]:],\n        skip_special_tokens=True\n    )\n\n    return {\n        "model": request.model,\n        "choices": [{"message": {"role": "assistant", "content": response}}]\n    }\n\nif __name__ == "__main__":\n    uvicorn.run(app, host="0.0.0.0", port=8080)`} id="uns3" copyToClipboard={copyToClipboard} copiedId={copiedId} language="python" />
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-balance-scale" iconColor="text-violet-400">Performance Comparison (16GB VRAM)</SectionTitle>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm min-w-[600px]">
            <caption className="sr-only">Performance comparison of local LLM backends for 16GB VRAM</caption>
            <thead>
              <tr className="border-b border-gray-700">
                {['Backend', 'Model', 'VRAM', 'Speed', 'Setup'].map((h) => (
                  <th key={h} className="text-left py-2 px-4 text-gray-400 font-medium" scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr className="bg-emerald-900/10">
                <td className="py-2 px-4 text-emerald-400 font-medium">Ollama ★</td>
                <td className="py-2 px-4 text-white">qwen2.5:14b</td>
                <td className="py-2 px-4 text-gray-300">~10GB</td>
                <td className="py-2 px-4 text-gray-300">~25 tok/s</td>
                <td className="py-2 px-4 text-emerald-400">Easiest</td>
              </tr>
              <tr className="hover:bg-gray-800/50 transition-colors">
                <td className="py-2 px-4 text-amber-400 font-medium">Unsloth + vLLM</td>
                <td className="py-2 px-4 text-white">Qwen2.5-14B-AWQ</td>
                <td className="py-2 px-4 text-gray-300">~8GB</td>
                <td className="py-2 px-4 text-gray-300">~40 tok/s</td>
                <td className="py-2 px-4 text-amber-400">Medium</td>
              </tr>
              <tr className="hover:bg-gray-800/50 transition-colors">
                <td className="py-2 px-4 text-amber-400 font-medium">Unsloth Direct</td>
                <td className="py-2 px-4 text-white">Qwen2.5-14B 4bit</td>
                <td className="py-2 px-4 text-gray-300">~7GB</td>
                <td className="py-2 px-4 text-gray-300">~35 tok/s</td>
                <td className="py-2 px-4 text-amber-400">Medium</td>
              </tr>
              <tr className="hover:bg-gray-800/50 transition-colors">
                <td className="py-2 px-4 text-blue-400 font-medium">AirLLM</td>
                <td className="py-2 px-4 text-white">Qwen2.5-14B</td>
                <td className="py-2 px-4 text-gray-300">~3GB</td>
                <td className="py-2 px-4 text-gray-300">~5 tok/s</td>
                <td className="py-2 px-4 text-blue-400">Complex</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          ★ Ollama recommended for simplicity. Unsloth for maximum speed. AirLLM when VRAM is very limited.
        </p>
      </SectionCard>
    </div>
  )
})

/* ─── Config Tab ─── */
const ConfigTab = memo(function ConfigTab({ copyToClipboard, copiedId }: TabProps) {
  return (
    <div className="space-y-6">
      <SectionCard>
        <h2 className="text-2xl font-bold text-white mb-2">
          <i className="fas fa-cog text-gray-400 mr-2" aria-hidden="true"></i>.env Configuration
        </h2>
        <p className="text-gray-400">
          Complete .env file for running OpenShorts 100% locally on your hardware (16GB VRAM, 32GB RAM, Ryzen 7600X).
        </p>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-file-code" iconColor="text-emerald-400">Complete .env for Local Setup</SectionTitle>
        <CodeBlock code={`# ═══════════════════════════════════════════════════════\n# OpenShorts - 100% Local Configuration\n# Hardware: 16GB VRAM GPU | 32GB RAM | Ryzen 7600X\n# ═══════════════════════════════════════════════════════\n\n# ─── Local LLM (replaces Google Gemini for moment picking) ───\nLLM_BASE_URL=http://host.docker.internal:11434/v1\nLLM_MODEL=qwen2.5:14b\n# LLM_API_KEY=  # Not needed for local Ollama\nLLM_SCORE_BATCH=3  # Reduced from 8 for local (context limits)\n\n# ─── Whisper / Transcription (runs on GPU) ───\nWHISPER_MODEL=large-v3-turbo\nWHISPER_DEVICE=cuda\nWHISPER_COMPUTE=float16\nTRANSCRIBE_BACKEND=parakeet  # Faster than whisper, 25 EU languages\nASR_GPU_CONCURRENCY=1\n\n# ─── FFmpeg / Encoding ───\nFFMPEG_ENCODER=auto  # Probes h264_nvenc, falls back to x264\n\n# ─── Scene Detection ───\nSCENE_ENGINE=transnetv2  # Neural scene detection (runs on GPU)\n\n# ─── Layout (optional - needs Gemini for vision) ───\n# AUTO_LAYOUT=0  # Disable if no Gemini key\n# GEMINI_API_KEY=  # Optional, only for layout picker\n\n# ─── Performance Tuning for 16GB VRAM ───\nMAX_CONCURRENT_JOBS=1  # Only 1 job at a time with limited VRAM\nCLIP_WORKERS=3  # Reduced from 6 for 16GB VRAM\nGPU_MIN_FREE_MB=2048  # Minimum free VRAM before starting a job\nASR_HOST_SLOTS=1  # Only 1 transcription at a time\n\n# ─── Storage ───\n# OUTPUT_DIR=./output  # Default\n# UPLOAD_DIR=./uploads  # Default\n\n# ─── AI Shorts (optional - needs fal.ai + ElevenLabs) ───\n# FAL_KEY=  # Only for AI Shorts feature\n# ELEVENLABS_API_KEY=  # Only for voice dubbing\n\n# ─── Social Publishing (optional) ───\n# UPLOAD_POST_API_KEY=  # Only for auto-publishing\n\n# ─── Billing (disable for self-hosted) ───\nBILLING_ENABLED=0`} id="env1" copyToClipboard={copyToClipboard} copiedId={copiedId} language="env" />
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-file-alt" iconColor="text-blue-400">Minimal .env (Clip Generator Only)</SectionTitle>
        <p className="text-sm text-gray-400 mb-4">
          If you only want the clip generator (no AI Shorts, no dubbing, no publishing):
        </p>
        <CodeBlock code={`# Minimal config - just the clip generator, fully local\nLLM_BASE_URL=http://host.docker.internal:11434/v1\nLLM_MODEL=qwen2.5:14b\nLLM_SCORE_BATCH=3\n\nWHISPER_MODEL=large-v3-turbo\nWHISPER_DEVICE=cuda\nWHISPER_COMPUTE=float16\n\nFFMPEG_ENCODER=auto\nMAX_CONCURRENT_JOBS=1\nCLIP_WORKERS=3\nGPU_MIN_FREE_MB=2048\n\nBILLING_ENABLED=0`} id="env2" copyToClipboard={copyToClipboard} copiedId={copiedId} language="env" />
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-file-import" iconColor="text-amber-400">Ollama Modelfile (Extended Context)</SectionTitle>
        <CodeBlock code={`# Modelfile for OpenShorts - extended context for transcript scoring\nFROM qwen2.5:14b\n\n# Critical: OpenShorts needs 16k+ context for scoring\nPARAMETER num_ctx 16384\n\n# Temperature for consistent JSON output\nPARAMETER temperature 0.3\n\n# System prompt hint\nSYSTEM """You are a video content analyzer. You score transcript windows\nfor viral potential and select the best moments for short-form clips.\nAlways respond with valid JSON."""`} id="env3" copyToClipboard={copyToClipboard} copiedId={copiedId} language="dockerfile" />
        <div className="mt-4">
          <p className="text-sm text-gray-400 mb-2">Build and use:</p>
          <CodeBlock code={`ollama create openshorts-llm -f Modelfile\n# Then set in .env: LLM_MODEL=openshorts-llm`} id="env4" copyToClipboard={copyToClipboard} copiedId={copiedId} />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-box" iconColor="text-blue-400">docker-compose.override.yml (GPU)</SectionTitle>
        <CodeBlock code={`# docker-compose.override.yml - GPU acceleration for your 16GB card\nservices:\n  backend:\n    build:\n      context: .\n      args:\n        GPU: "1"  # Adds cuBLAS/cuDNN + onnxruntime-gpu\n    deploy:\n      resources:\n        reservations:\n          devices:\n            - driver: nvidia\n              count: all\n              capabilities: [gpu, video]  # video = NVENC\n    extra_hosts:\n      - "host.docker.internal:host-gateway"  # Access Ollama on host\n    environment:\n      - NVIDIA_VISIBLE_DEVICES=all\n      - NVIDIA_DRIVER_CAPABILITIES=compute,utility,video`} id="env5" copyToClipboard={copyToClipboard} copiedId={copiedId} language="yaml" />
      </SectionCard>
    </div>
  )
})

/* ─── Docker Tab ─── */
const DockerTab = memo(function DockerTab({ copyToClipboard, copiedId }: TabProps) {
  return (
    <div className="space-y-6">
      <SectionCard>
        <h2 className="text-2xl font-bold text-white mb-2">
          <i className="fas fa-box text-blue-400 mr-2" aria-hidden="true"></i>Complete Docker Setup
        </h2>
        <p className="text-gray-400">
          Full step-by-step Docker setup for running OpenShorts with local models on your 16GB VRAM system.
        </p>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-check-double" iconColor="text-emerald-400">Prerequisites</SectionTitle>
        <CodeBlock code={`# 1. Verify NVIDIA driver\nnvidia-smi\n\n# 2. Install Docker (if not installed)\ncurl -fsSL https://get.docker.com | sh\nsudo usermod -aG docker $USER\n\n# 3. Install NVIDIA Container Toolkit\ncurl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \\\n  sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg\ncurl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \\\n  sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \\\n  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list\nsudo apt-get update\nsudo apt-get install -y nvidia-container-toolkit\nsudo nvidia-ctk runtime configure --runtime=docker\nsudo systemctl restart docker\n\n# 4. Verify GPU access in Docker\ndocker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi`} id="dock1" copyToClipboard={copyToClipboard} copiedId={copiedId} />
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-terminal" iconColor="text-violet-400">Full Setup (Copy-Paste Ready)</SectionTitle>
        <CodeBlock code={`# ═══════════════════════════════════════════════════════\n# Complete Local OpenShorts Setup\n# ═══════════════════════════════════════════════════════\n\n# Step 1: Clone the repository\ngit clone https://github.com/mutonby/openshorts.git\ncd openshorts\n\n# Step 2: Install and configure Ollama\ncurl -fsSL https://ollama.com/install.sh | sh\nollama pull qwen2.5:14b\n\n# Step 3: Create Modelfile with extended context\ncat > Modelfile << 'EOF'\nFROM qwen2.5:14b\nPARAMETER num_ctx 16384\nPARAMETER temperature 0.3\nEOF\nollama create openshorts-llm -f Modelfile\n\n# Step 4: Create .env\ncat > .env << 'EOF'\nLLM_BASE_URL=http://host.docker.internal:11434/v1\nLLM_MODEL=openshorts-llm\nLLM_SCORE_BATCH=3\nWHISPER_MODEL=large-v3-turbo\nWHISPER_DEVICE=cuda\nWHISPER_COMPUTE=float16\nTRANSCRIBE_BACKEND=parakeet\nFFMPEG_ENCODER=auto\nMAX_CONCURRENT_JOBS=1\nCLIP_WORKERS=3\nGPU_MIN_FREE_MB=2048\nASR_HOST_SLOTS=1\nBILLING_ENABLED=0\nEOF\n\n# Step 5: Create docker-compose.override.yml for GPU\ncat > docker-compose.override.yml << 'EOF'\nservices:\n  backend:\n    build:\n      context: .\n      args:\n        GPU: "1"\n    deploy:\n      resources:\n        reservations:\n          devices:\n            - driver: nvidia\n              count: all\n              capabilities: [gpu, video]\n    extra_hosts:\n      - "host.docker.internal:host-gateway"\nEOF\n\n# Step 6: Launch!\ndocker compose up --build -d\n\n# Step 7: Open dashboard\necho "OpenShorts is running at http://localhost:5175"\necho "Ollama API at http://localhost:11434"`} id="dock2" copyToClipboard={copyToClipboard} copiedId={copiedId} />
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-vial" iconColor="text-emerald-400">Verify Everything Works</SectionTitle>
        <CodeBlock code={`# Check Ollama is accessible from Docker\ndocker exec openshorts-backend curl -s http://host.docker.internal:11434/api/tags\n\n# Check GPU is visible in container\ndocker exec openshorts-backend nvidia-smi -L\n\n# Check NVENC encoder is available\ndocker exec openshorts-backend ffmpeg -hide_banner -f lavfi \\\n  -i testsrc=size=256x256:rate=1 -frames:v 1 \\\n  -c:v h264_nvenc -f null -\n\n# Check the backend logs\ndocker compose logs -f backend\n\n# Test the API\ncurl http://localhost:8000/api/config`} id="dock3" copyToClipboard={copyToClipboard} copiedId={copiedId} />
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="fa-sync-alt" iconColor="text-blue-400">Update & Maintenance</SectionTitle>
        <CodeBlock code={`# Update OpenShorts\ncd openshorts\ngit pull\ndocker compose up --build -d\n\n# Update Ollama model\nollama pull qwen2.5:14b\nollama create openshorts-llm -f Modelfile\n\n# View resource usage\ndocker stats\nnvidia-smi\n\n# Clean up old images\ndocker system prune -f`} id="dock4" copyToClipboard={copyToClipboard} copiedId={copiedId} />
      </SectionCard>
    </div>
  )
})

/* ─── Troubleshoot Tab ─── */
const TroubleshootTab = memo(function TroubleshootTab() {
  const issues = [
    {
      title: 'CUDA Out of Memory (OOM)',
      symptoms: "Job fails with 'CUDA out of memory' error",
      solutions: [
        'Reduce CLIP_WORKERS from 6 to 3',
        'Set MAX_CONCURRENT_JOBS=1',
        'Use qwen2.5:7b instead of 14b',
        'Set WHISPER_MODEL=medium instead of large-v3-turbo',
        'Increase GPU_MIN_FREE_MB to 4096',
      ],
    },
    {
      title: 'Ollama Context Truncation',
      symptoms: 'Model returns garbage or incomplete JSON',
      solutions: [
        'Ensure Modelfile has PARAMETER num_ctx 16384',
        'Verify with: ollama show openshorts-llm --modelfile',
        'Set LLM_SCORE_BATCH=3 (not higher)',
        'Check Ollama logs: journalctl -u ollama -f',
      ],
    },
    {
      title: "Docker Can't Reach Ollama",
      symptoms: 'Connection refused to host.docker.internal:11434',
      solutions: [
        'Ensure extra_hosts is in docker-compose.override.yml',
        'On Linux, Ollama must listen on 0.0.0.0: export OLLAMA_HOST=0.0.0.0',
        'Check firewall: sudo ufw allow 11434',
        'Test from host: curl http://localhost:11434/api/tags',
      ],
    },
    {
      title: 'NVENC Not Available',
      symptoms: 'FFmpeg falls back to x264 (slow CPU encoding)',
      solutions: [
        "Ensure capabilities include 'video' in compose override",
        'Verify: docker exec openshorts-backend ffmpeg -encoders | grep nvenc',
        'Check GPU: docker exec openshorts-backend nvidia-smi',
        'NVIDIA driver must be installed on HOST (not in container)',
      ],
    },
    {
      title: 'Slow Transcription',
      symptoms: 'Transcription takes too long',
      solutions: [
        'Use TRANSCRIBE_BACKEND=parakeet (2x faster than whisper)',
        'Ensure WHISPER_DEVICE=cuda (not cpu)',
        'Check: docker exec openshorts-backend nvidia-smi during transcription',
        'Set ASR_GPU_CONCURRENCY=1 to avoid VRAM contention',
      ],
    },
    {
      title: 'Model Returns Invalid JSON',
      symptoms: 'Pipeline fails with JSON parse error',
      solutions: [
        'Use qwen2.5:14b or llama3.1:8b (better JSON compliance)',
        'Set temperature to 0.3 in Modelfile',
        'Avoid models smaller than 7B parameters',
        "Check: ollama run qwen2.5:14b 'Return {\"test\": true}' for JSON test",
      ],
    },
    {
      title: 'Layout Picker Not Working (No Gemini)',
      symptoms: 'All clips use basic face-tracking crop',
      solutions: [
        'This is expected without a Gemini key',
        "Layout picker needs vision (can't run locally easily)",
        "Force a layout via dashboard: 'Single crop only'",
        'Or add a free Gemini key for layout picking only',
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <SectionCard>
        <h2 className="text-2xl font-bold text-white mb-2">
          <i className="fas fa-wrench text-amber-400 mr-2" aria-hidden="true"></i>Troubleshooting
        </h2>
        <p className="text-gray-400">
          Common issues and solutions when running OpenShorts locally with 16GB VRAM.
        </p>
      </SectionCard>

      {issues.map((issue, i) => (
        <SectionCard key={issue.title}>
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <i className="fas fa-exclamation-circle text-amber-400" aria-hidden="true"></i>
            {issue.title}
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            <strong className="text-gray-300">Symptoms:</strong> {issue.symptoms}
          </p>
          <div className="space-y-2">
            <p className="text-sm text-emerald-400 font-medium">Solutions:</p>
            <ul className="space-y-1 list-none">
              {issue.solutions.map((sol, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                  <i className="fas fa-check text-emerald-500 text-xs mt-1 flex-shrink-0" aria-hidden="true"></i>
                  <span>{sol}</span>
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>
      ))}

      <SectionCard>
        <SectionTitle icon="fa-terminal" iconColor="text-violet-400">Useful Debug Commands</SectionTitle>
        <div className="space-y-3 text-sm">
          {[
            { cmd: 'nvidia-smi', desc: 'Check GPU usage and VRAM allocation' },
            { cmd: 'docker compose logs -f backend', desc: 'Follow backend logs in real-time' },
            { cmd: 'ollama ps', desc: 'Check which models are loaded in Ollama' },
            { cmd: 'docker exec openshorts-backend du -sh /output/*', desc: 'Check output directory size' },
            { cmd: 'curl http://localhost:8000/api/config', desc: 'Check OpenShorts configuration' },
          ].map((item) => (
            <div key={item.cmd} className="p-3 rounded bg-gray-800/50">
              <code className="text-gray-300 font-mono text-xs">{item.cmd}</code>
              <p className="text-gray-500 text-xs mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
})

/* ─── Main App Component ─── */
function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mainRef = useRef<HTMLElement>(null)
  const tabListRef = useRef<HTMLDivElement>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Copy to clipboard with error handling and toast
  const copyToClipboard = useCallback((text: string, id: string) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const success = safeCopyToClipboard(text)

    if (success) {
      setCopiedId(id)
      setToastMessage('Copied to clipboard!')
      setToastVisible(true)
    } else {
      setToastMessage('Failed to copy — please select and copy manually')
      setToastVisible(true)
    }

    timeoutRef.current = setTimeout(() => {
      setCopiedId(null)
      setToastVisible(false)
    }, COPY_TIMEOUT_MS)
  }, [])

  // Keyboard navigation for tabs
  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = TABS.findIndex((t) => t.id === activeTab)
      let newIndex = currentIndex

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        newIndex = (currentIndex + 1) % TABS.length
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        newIndex = (currentIndex - 1 + TABS.length) % TABS.length
      } else if (e.key === 'Home') {
        e.preventDefault()
        newIndex = 0
      } else if (e.key === 'End') {
        e.preventDefault()
        newIndex = TABS.length - 1
      }

      if (newIndex !== currentIndex) {
        setActiveTab(TABS[newIndex].id)
        // Focus the new tab button
        const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
        buttons?.[newIndex]?.focus()
      }
    },
    [activeTab]
  )

  // Scroll to top on tab change
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeTab])

  const renderTabContent = () => {
    const props = { copyToClipboard, copiedId }
    switch (activeTab) {
      case 'overview': return <OverviewTab {...props} />
      case 'ollama': return <OllamaTab {...props} />
      case 'airllm': return <AirLLMTab {...props} />
      case 'unsloth': return <UnslothTab {...props} />
      case 'config': return <ConfigTab {...props} />
      case 'docker': return <DockerTab {...props} />
      case 'troubleshoot': return <TroubleshootTab />
      default: return null
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        {/* Skip to content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-lg focus:outline-none"
        >
          Skip to main content
        </a>

        {/* Header */}
        <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-film text-white text-lg" aria-hidden="true"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">OpenShorts Local</h1>
                <p className="text-xs text-gray-400">100% Local AI Video Clips • No Cloud APIs</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="px-2 py-1 rounded bg-emerald-900/50 text-emerald-400 border border-emerald-800">
                <i className="fas fa-microchip mr-1" aria-hidden="true"></i> 16GB VRAM
              </span>
              <span className="px-2 py-1 rounded bg-blue-900/50 text-blue-400 border border-blue-800">
                <i className="fas fa-memory mr-1" aria-hidden="true"></i> 32GB RAM
              </span>
              <span className="px-2 py-1 rounded bg-amber-900/50 text-amber-400 border border-amber-800">
                <i className="fas fa-desktop mr-1" aria-hidden="true"></i> Ryzen 7600X
              </span>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav aria-label="Main navigation" className="border-b border-gray-800 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4">
            <div
              ref={tabListRef}
              role="tablist"
              aria-label="Setup guide sections"
              className="flex overflow-x-auto gap-1 py-2 scrollbar-hide"
              onKeyDown={handleTabKeyDown}
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                    activeTab === tab.id
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <i className={`fas ${tab.icon} text-xs`} aria-hidden="true"></i>
                  {tab.label}
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
          className="max-w-7xl mx-auto px-4 py-8"
        >
          {renderTabContent()}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
          <p>
            OpenShorts Local Setup Guide • Based on{' '}
            <a
              href="https://github.com/mutonby/openshorts"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 underline-offset-2 hover:underline"
            >
              mutonby/openshorts
            </a>{' '}
            (MIT License)
          </p>
          <p className="mt-1">Optimized for: AMD Ryzen 7600X • 32GB RAM • 16GB VRAM GPU</p>
        </footer>

        {/* Toast notification */}
        <Toast message={toastMessage} visible={toastVisible} />
      </div>
    </ErrorBoundary>
  )
}

export default App
