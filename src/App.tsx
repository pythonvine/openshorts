import { useState } from 'react'

type Tab = 'overview' | 'ollama' | 'airllm' | 'unsloth' | 'config' | 'docker' | 'troubleshoot'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'fa-home' },
    { id: 'ollama', label: 'Ollama Setup', icon: 'fa-server' },
    { id: 'airllm', label: 'AirLLM Setup', icon: 'fa-cloud' },
    { id: 'unsloth', label: 'Unsloth Setup', icon: 'fa-bolt' },
    { id: 'config', label: '.env Config', icon: 'fa-cog' },
    { id: 'docker', label: 'Docker Setup', icon: 'fa-box' },
    { id: 'troubleshoot', label: 'Troubleshoot', icon: 'fa-wrench' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center">
              <i className="fas fa-film text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">OpenShorts Local</h1>
              <p className="text-xs text-gray-400">100% Local AI Video Clips • No Cloud APIs</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="px-2 py-1 rounded bg-emerald-900/50 text-emerald-400 border border-emerald-800">
              <i className="fas fa-microchip mr-1"></i> 16GB VRAM
            </span>
            <span className="px-2 py-1 rounded bg-blue-900/50 text-blue-400 border border-blue-800">
              <i className="fas fa-memory mr-1"></i> 32GB RAM
            </span>
            <span className="px-2 py-1 rounded bg-amber-900/50 text-amber-400 border border-amber-800">
              <i className="fas fa-desktop mr-1"></i> Ryzen 7600X
            </span>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-1 py-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <i className={`fas ${tab.icon} text-xs`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && <OverviewTab copyToClipboard={copyToClipboard} copiedId={copiedId} />}
        {activeTab === 'ollama' && <OllamaTab copyToClipboard={copyToClipboard} copiedId={copiedId} />}
        {activeTab === 'airllm' && <AirLLMTab copyToClipboard={copyToClipboard} copiedId={copiedId} />}
        {activeTab === 'unsloth' && <UnslothTab copyToClipboard={copyToClipboard} copiedId={copiedId} />}
        {activeTab === 'config' && <ConfigTab copyToClipboard={copyToClipboard} copiedId={copiedId} />}
        {activeTab === 'docker' && <DockerTab copyToClipboard={copyToClipboard} copiedId={copiedId} />}
        {activeTab === 'troubleshoot' && <TroubleshootTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
        <p>OpenShorts Local Setup Guide • Based on <a href="https://github.com/mutonby/openshorts" className="text-violet-400 hover:text-violet-300">mutonby/openshorts</a> (MIT License)</p>
        <p className="mt-1">Optimized for: AMD Ryzen 7600X • 32GB RAM • 16GB VRAM GPU</p>
      </footer>
    </div>
  )
}

/* ─── Code Block Component ─── */
function CodeBlock({ code, id, copyToClipboard, copiedId, language = 'bash' }: {
  code: string; id: string; copyToClipboard: (text: string, id: string) => void;
  copiedId: string | null; language?: string
}) {
  return (
    <div className="relative group rounded-lg border border-gray-700 bg-gray-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono">{language}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <i className={`fas ${copiedId === id ? 'fa-check text-emerald-400' : 'fa-copy'}`}></i>
          {copiedId === id ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="text-gray-300 font-mono">{code}</code>
      </pre>
    </div>
  )
}

/* ─── Overview Tab ─── */
function OverviewTab({ copyToClipboard, copiedId }: { copyToClipboard: (t: string, i: string) => void; copiedId: string | null }) {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-3">Run OpenShorts 100% Locally</h2>
            <p className="text-gray-400 text-lg mb-4">
              Transform long videos into viral 9:16 shorts using <strong className="text-white">local AI models</strong> — 
              no cloud APIs, no API keys, no data leaves your machine.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-violet-900/50 text-violet-300 text-sm border border-violet-800">Privacy First</span>
              <span className="px-3 py-1 rounded-full bg-emerald-900/50 text-emerald-300 text-sm border border-emerald-800">Free Forever</span>
              <span className="px-3 py-1 rounded-full bg-amber-900/50 text-amber-300 text-sm border border-amber-800">No Rate Limits</span>
              <span className="px-3 py-1 rounded-full bg-blue-900/50 text-blue-300 text-sm border border-blue-800">Offline Capable</span>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-300">Your Hardware</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <i className="fas fa-microchip text-violet-400 w-5"></i>
                  <span className="text-gray-400">GPU:</span>
                  <span className="text-white font-medium">16GB VRAM</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-memory text-blue-400 w-5"></i>
                  <span className="text-gray-400">RAM:</span>
                  <span className="text-white font-medium">32GB DDR5</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-desktop text-amber-400 w-5"></i>
                  <span className="text-gray-400">CPU:</span>
                  <span className="text-white font-medium">Ryzen 7600X (6C/12T)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="w-12 h-12 rounded-lg bg-violet-900/50 flex items-center justify-center mb-4">
            <i className="fas fa-brain text-violet-400 text-xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Local LLM</h3>
          <p className="text-gray-400 text-sm">
            Use Ollama, AirLLM, or Unsloth to run the moment picker locally. 
            Replaces Google Gemini for transcript scoring and clip selection.
          </p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="w-12 h-12 rounded-lg bg-emerald-900/50 flex items-center justify-center mb-4">
            <i className="fas fa-microphone text-emerald-400 text-xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Local Transcription</h3>
          <p className="text-gray-400 text-sm">
            faster-whisper runs on your GPU for speech-to-text. 
            Parakeet backend available for faster processing.
          </p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="w-12 h-12 rounded-lg bg-amber-900/50 flex items-center justify-center mb-4">
            <i className="fas fa-crop-alt text-amber-400 text-xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Local Processing</h3>
          <p className="text-gray-400 text-sm">
            FFmpeg, scene detection, face tracking, and reframing all run locally. 
            NVENC encoding with your GPU for fast output.
          </p>
        </div>
      </div>

      {/* Model Recommendations */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          <i className="fas fa-star text-amber-400 mr-2"></i>
          Recommended Models for 16GB VRAM
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Model</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Size</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">VRAM</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Quality</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Use Case</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr className="hover:bg-gray-800/50">
                <td className="py-3 px-4 font-medium text-white">qwen2.5:14b</td>
                <td className="py-3 px-4 text-gray-400">~9GB Q4</td>
                <td className="py-3 px-4 text-emerald-400">~10GB</td>
                <td className="py-3 px-4"><span className="text-emerald-400">★★★★★</span></td>
                <td className="py-3 px-4 text-gray-400">Best overall for moment picking</td>
              </tr>
              <tr className="hover:bg-gray-800/50">
                <td className="py-3 px-4 font-medium text-white">qwen2.5:7b</td>
                <td className="py-3 px-4 text-gray-400">~4.5GB Q4</td>
                <td className="py-3 px-4 text-emerald-400">~6GB</td>
                <td className="py-3 px-4"><span className="text-emerald-400">★★★★☆</span></td>
                <td className="py-3 px-4 text-gray-400">Fast + good quality</td>
              </tr>
              <tr className="hover:bg-gray-800/50">
                <td className="py-3 px-4 font-medium text-white">llama3.1:8b</td>
                <td className="py-3 px-4 text-gray-400">~4.7GB Q4</td>
                <td className="py-3 px-4 text-emerald-400">~6GB</td>
                <td className="py-3 px-4"><span className="text-blue-400">★★★★☆</span></td>
                <td className="py-3 px-4 text-gray-400">Reliable JSON output</td>
              </tr>
              <tr className="hover:bg-gray-800/50">
                <td className="py-3 px-4 font-medium text-white">mistral:7b</td>
                <td className="py-3 px-4 text-gray-400">~4.1GB Q4</td>
                <td className="py-3 px-4 text-emerald-400">~5GB</td>
                <td className="py-3 px-4"><span className="text-blue-400">★★★☆☆</span></td>
                <td className="py-3 px-4 text-gray-400">Fastest option</td>
              </tr>
              <tr className="hover:bg-gray-800/50">
                <td className="py-3 px-4 font-medium text-white">qwen2.5-coder:7b</td>
                <td className="py-3 px-4 text-gray-400">~4.5GB Q4</td>
                <td className="py-3 px-4 text-emerald-400">~6GB</td>
                <td className="py-3 px-4"><span className="text-blue-400">★★★★☆</span></td>
                <td className="py-3 px-4 text-gray-400">Better structured output</td>
              </tr>
              <tr className="hover:bg-gray-800/50">
                <td className="py-3 px-4 font-medium text-white">gemma2:9b</td>
                <td className="py-3 px-4 text-gray-400">~5.5GB Q4</td>
                <td className="py-3 px-4 text-emerald-400">~7GB</td>
                <td className="py-3 px-4"><span className="text-emerald-400">★★★★☆</span></td>
                <td className="py-3 px-4 text-gray-400">Google's open model</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Start */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          <i className="fas fa-rocket text-violet-400 mr-2"></i>
          Quick Start (Ollama - Recommended)
        </h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold">1</span>
            <div>
              <p className="text-white font-medium">Install Ollama</p>
              <CodeBlock code={`curl -fsSL https://ollama.com/install.sh | sh`} id="qs1" copyToClipboard={copyToClipboard} copiedId={copiedId} />
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold">2</span>
            <div>
              <p className="text-white font-medium">Pull recommended model</p>
              <CodeBlock code={`ollama pull qwen2.5:14b`} id="qs2" copyToClipboard={copyToClipboard} copiedId={copiedId} />
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold">3</span>
            <div>
              <p className="text-white font-medium">Set context length (critical!)</p>
              <CodeBlock code={`ollama run qwen2.5:14b --num-ctx 16384`} id="qs3" copyToClipboard={copyToClipboard} copiedId={copiedId} />
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold">4</span>
            <div>
              <p className="text-white font-medium">Clone and configure OpenShorts</p>
              <CodeBlock code={`git clone https://github.com/mutonby/openshorts.git
cd openshorts
cp .env.example .env`} id="qs4" copyToClipboard={copyToClipboard} copiedId={copiedId} />
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold">5</span>
            <div>
              <p className="text-white font-medium">Launch with GPU support</p>
              <CodeBlock code={`docker compose up --build`} id="qs5" copyToClipboard={copyToClipboard} copiedId={copiedId} />
            </div>
          </div>
        </div>
      </div>

      {/* What's Local vs What Needs Cloud */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          <i className="fas fa-shield-alt text-emerald-400 mr-2"></i>
          What Runs Locally vs What's Optional
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
              <i className="fas fa-check-circle"></i> Fully Local (No API Keys)
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2"><i className="fas fa-check text-emerald-500 text-xs"></i> Moment detection / clip selection (LLM)</li>
              <li className="flex items-center gap-2"><i className="fas fa-check text-emerald-500 text-xs"></i> Transcription (faster-whisper)</li>
              <li className="flex items-center gap-2"><i className="fas fa-check text-emerald-500 text-xs"></i> Scene detection (TransNetV2)</li>
              <li className="flex items-center gap-2"><i className="fas fa-check text-emerald-500 text-xs"></i> Face tracking (MediaPipe + YOLOv8)</li>
              <li className="flex items-center gap-2"><i className="fas fa-check text-emerald-500 text-xs"></i> Video reframing & cropping</li>
              <li className="flex items-center gap-2"><i className="fas fa-check text-emerald-500 text-xs"></i> Subtitle generation & burning</li>
              <li className="flex items-center gap-2"><i className="fas fa-check text-emerald-500 text-xs"></i> Hook text overlays</li>
              <li className="flex items-center gap-2"><i className="fas fa-check text-emerald-500 text-xs"></i> Video encoding (NVENC)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
              <i className="fas fa-cloud"></i> Optional Cloud Services
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2"><i className="fas fa-minus text-amber-500 text-xs"></i> Layout picker (needs Gemini for vision)</li>
              <li className="flex items-center gap-2"><i className="fas fa-minus text-amber-500 text-xs"></i> AI Shorts / UGC videos (fal.ai)</li>
              <li className="flex items-center gap-2"><i className="fas fa-minus text-amber-500 text-xs"></i> Voice dubbing (ElevenLabs)</li>
              <li className="flex items-center gap-2"><i className="fas fa-minus text-amber-500 text-xs"></i> Social publishing (Upload-Post)</li>
              <li className="flex items-center gap-2"><i className="fas fa-minus text-amber-500 text-xs"></i> Silent video analysis (Gemini vision)</li>
            </ul>
            <p className="mt-4 text-xs text-gray-500 italic">
              Note: The core clip generator works 100% locally. 
              Only the layout picker for complex multi-speaker videos needs Gemini vision.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Ollama Tab ─── */
function OllamaTab({ copyToClipboard, copiedId }: { copyToClipboard: (t: string, i: string) => void; copiedId: string | null }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          <i className="fas fa-server text-violet-400 mr-2"></i>Ollama Setup
        </h2>
        <p className="text-gray-400">
          Ollama is the easiest way to run local LLMs. It provides an OpenAI-compatible API that OpenShorts can use directly.
        </p>
      </div>

      {/* Installation */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Step 1: Install Ollama</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">Linux (recommended for your setup):</p>
            <CodeBlock code={`curl -fsSL https://ollama.com/install.sh | sh`} id="ollama1" copyToClipboard={copyToClipboard} copiedId={copiedId} />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Windows (WSL2):</p>
            <CodeBlock code={`# Install Ollama from https://ollama.com/download
# Then in WSL2, it's accessible at host.docker.internal:11434`} id="ollama2" copyToClipboard={copyToClipboard} copiedId={copiedId} />
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Step 2: Pull Models</h3>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-emerald-900/20 border border-emerald-800">
            <p className="text-emerald-400 text-sm font-medium mb-2">
              <i className="fas fa-star mr-1"></i> Recommended for 16GB VRAM:
            </p>
            <CodeBlock code={`# Best quality - uses ~10GB VRAM (leaves room for whisper)
ollama pull qwen2.5:14b

# Good balance - uses ~6GB VRAM
ollama pull qwen2.5:7b

# Fast option - uses ~5GB VRAM
ollama pull llama3.1:8b`} id="ollama3" copyToClipboard={copyToClipboard} copiedId={copiedId} />
          </div>
          <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-800">
            <p className="text-amber-400 text-sm font-medium mb-2">
              <i className="fas fa-exclamation-triangle mr-1"></i> Important: Context Length
            </p>
            <p className="text-gray-400 text-sm mb-2">
              Ollama defaults to 4096 tokens. OpenShorts needs 16384+ for scoring. Create a Modelfile:
            </p>
            <CodeBlock code={`# Create Modelfile.qwen
cat > Modelfile.qwen << 'EOF'
FROM qwen2.5:14b
PARAMETER num_ctx 16384
EOF

# Create custom model with extended context
ollama create qwen2.5-16k -f Modelfile.qwen`} id="ollama4" copyToClipboard={copyToClipboard} copiedId={copiedId} />
          </div>
        </div>
      </div>

      {/* Configure Ollama for GPU */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Step 3: Configure Ollama for GPU</h3>
        <CodeBlock code={`# Create/edit ollama service override for systemd
sudo mkdir -p /etc/systemd/system/ollama.service.d
sudo tee /etc/systemd/system/ollama.service.d/override.conf << 'EOF'
[Service]
Environment="OLLAMA_NUM_PARALLEL=2"
Environment="OLLAMA_MAX_LOADED_MODELS=1"
Environment="OLLAMA_GPU_OVERHEAD=512"
Environment="OLLAMA_KEEP_ALIVE=10m"
EOF

sudo systemctl daemon-reload
sudo systemctl restart ollama`} id="ollama5" copyToClipboard={copyToClipboard} copiedId={copiedId} />
        <div className="mt-4 p-4 rounded-lg bg-blue-900/20 border border-blue-800">
          <p className="text-blue-400 text-sm">
            <i className="fas fa-info-circle mr-1"></i>
            <strong>OLLAMA_GPU_OVERHEAD=512</strong> reserves 512MB VRAM for other GPU tasks (whisper, scene detection). 
            Adjust based on your needs.
          </p>
        </div>
      </div>

      {/* Test */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Step 4: Test the API</h3>
        <CodeBlock code={`# Verify Ollama is running and GPU is used
curl http://localhost:11434/api/tags

# Test the OpenAI-compatible endpoint
curl http://localhost:11434/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "qwen2.5:14b",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": false
  }'

# Check GPU usage during inference
watch -n 1 nvidia-smi`} id="ollama6" copyToClipboard={copyToClipboard} copiedId={copiedId} />
      </div>

      {/* VRAM Budget */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">VRAM Budget for 16GB GPU</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Ollama (qwen2.5:14b Q4)</span>
                <span className="text-violet-400">~10 GB</span>
              </div>
              <div className="h-3 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{width: '62.5%'}}></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">faster-whisper (large-v3-turbo)</span>
                <span className="text-emerald-400">~3 GB</span>
              </div>
              <div className="h-3 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{width: '18.75%'}}></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Scene detection + Face tracking</span>
                <span className="text-amber-400">~1.5 GB</span>
              </div>
              <div className="h-3 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{width: '9.375%'}}></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Available headroom</span>
                <span className="text-gray-400">~1.5 GB</span>
              </div>
              <div className="h-3 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full bg-gray-600 rounded-full" style={{width: '9.375%'}}></div>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Tip: OpenShorts releases ASR models after transcription to free VRAM for the LLM. 
          Use <code className="text-gray-400">qwen2.5:7b</code> if you need more headroom.
        </p>
      </div>
    </div>
  )
}

/* ─── AirLLM Tab ─── */
function AirLLMTab({ copyToClipboard, copiedId }: { copyToClipboard: (t: string, i: string) => void; copiedId: string | null }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          <i className="fas fa-cloud text-blue-400 mr-2"></i>AirLLM Setup
        </h2>
        <p className="text-gray-400">
          AirLLM optimizes inference for single-GPU setups by splitting model layers between GPU and CPU RAM. 
          Perfect for running larger models that don't fully fit in VRAM.
        </p>
      </div>

      {/* What is AirLLM */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">How AirLLM Works</h3>
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
      </div>

      {/* Installation */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Installation</h3>
        <CodeBlock code={`# Create a Python environment for AirLLM
python -m venv airllm-env
source airllm-env/bin/activate

# Install AirLLM
pip install airllm

# Install dependencies
pip install transformers torch accelerate`} id="air1" copyToClipboard={copyToClipboard} copiedId={copiedId} />
      </div>

      {/* Create OpenAI-compatible server */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Create OpenAI-Compatible Server</h3>
        <p className="text-sm text-gray-400 mb-4">
          AirLLM doesn't have a built-in server, so we wrap it with a lightweight FastAPI server:
        </p>
        <CodeBlock code={`# server_airllm.py - OpenAI-compatible wrapper for AirLLM
from fastapi import FastAPI
from pydantic import BaseModel
from airllm import AutoModel
import uvicorn

app = FastAPI()
model = None

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model: str
    messages: list[Message]
    temperature: float = 0.7
    max_tokens: int = 4096
    stream: bool = False

@app.on_event("startup")
async def load_model():
    global model
    model = AutoModel.from_pretrained(
        "Qwen/Qwen2.5-14B-Instruct",
        device_map="auto"  # Uses GPU + RAM efficiently
    )

@app.post("/v1/chat/completions")
async def chat(request: ChatRequest):
    prompt = "\\n".join([f"{m.role}: {m.content}" for m in request.messages])
    output = model.generate(
        prompt,
        max_new_tokens=request.max_tokens,
        temperature=request.temperature
    )
    return {
        "model": request.model,
        "choices": [{
            "message": {"role": "assistant", "content": output},
            "finish_reason": "stop"
        }]
    }

@app.get("/v1/models")
async def models():
    return {"data": [{"id": "qwen2.5-14b-airllm"}]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)`} id="air2" copyToClipboard={copyToClipboard} copiedId={copiedId} language="python" />
      </div>

      {/* Run */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Run the Server</h3>
        <CodeBlock code={`# Start the AirLLM server
python server_airllm.py

# Test it
curl http://localhost:8080/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "qwen2.5-14b-airllm",
    "messages": [{"role": "user", "content": "Score this transcript for virality"}]
  }'`} id="air3" copyToClipboard={copyToClipboard} copiedId={copiedId} />
        <div className="mt-4 p-4 rounded-lg bg-blue-900/20 border border-blue-800">
          <p className="text-blue-400 text-sm">
            <i className="fas fa-info-circle mr-1"></i>
            Then set in your .env: <code className="text-gray-300">LLM_BASE_URL=http://host.docker.internal:8080/v1</code>
          </p>
        </div>
      </div>

      {/* Models for AirLLM */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Models You Can Run with AirLLM</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-4 text-gray-400">Model</th>
                <th className="text-left py-2 px-4 text-gray-400">Params</th>
                <th className="text-left py-2 px-4 text-gray-400">VRAM Used</th>
                <th className="text-left py-2 px-4 text-gray-400">RAM Used</th>
                <th className="text-left py-2 px-4 text-gray-400">Speed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr>
                <td className="py-2 px-4 text-white">Qwen2.5-14B-Instruct</td>
                <td className="py-2 px-4 text-gray-400">14B</td>
                <td className="py-2 px-4 text-emerald-400">~3GB</td>
                <td className="py-2 px-4 text-blue-400">~12GB</td>
                <td className="py-2 px-4 text-amber-400">~5 tok/s</td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-white">Qwen2.5-32B-Instruct</td>
                <td className="py-2 px-4 text-gray-400">32B</td>
                <td className="py-2 px-4 text-emerald-400">~3GB</td>
                <td className="py-2 px-4 text-blue-400">~20GB</td>
                <td className="py-2 px-4 text-amber-400">~2 tok/s</td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-white">Llama-3.1-8B-Instruct</td>
                <td className="py-2 px-4 text-gray-400">8B</td>
                <td className="py-2 px-4 text-emerald-400">~2GB</td>
                <td className="py-2 px-4 text-blue-400">~8GB</td>
                <td className="py-2 px-4 text-amber-400">~8 tok/s</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ─── Unsloth Tab ─── */
function UnslothTab({ copyToClipboard, copiedId }: { copyToClipboard: (t: string, i: string) => void; copiedId: string | null }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          <i className="fas fa-bolt text-amber-400 mr-2"></i>Unsloth Setup
        </h2>
        <p className="text-gray-400">
          Unsloth provides 2x faster inference and 80% less VRAM usage through optimized kernels. 
          It's the fastest way to run local models on consumer GPUs.
        </p>
      </div>

      {/* Why Unsloth */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Why Unsloth for Your Hardware</h3>
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
      </div>

      {/* Installation */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Installation</h3>
        <CodeBlock code={`# Create environment
python -m venv unsloth-env
source unsloth-env/bin/activate

# Install Unsloth (requires CUDA)
pip install unsloth

# Install additional dependencies
pip install vllm  # For the OpenAI-compatible server`} id="uns1" copyToClipboard={copyToClipboard} copiedId={copiedId} />
      </div>

      {/* vLLM with Unsloth optimization */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Run with vLLM (Unsloth-optimized)</h3>
        <p className="text-sm text-gray-400 mb-4">
          vLLM provides a production-ready OpenAI-compatible server. Combined with Unsloth optimizations:
        </p>
        <CodeBlock code={`# Start vLLM server with optimized settings for 16GB VRAM
python -m vllm.entrypoints.openai.api_server \\
  --model unsloth/Qwen2.5-14B-Instruct \\
  --max-model-len 16384 \\
  --gpu-memory-utilization 0.75 \\
  --quantization awq \\
  --dtype float16 \\
  --port 8080 \\
  --host 0.0.0.0

# Alternative: Use GGUF quantization for even less VRAM
python -m vllm.entrypoints.openai.api_server \\
  --model Qwen/Qwen2.5-14B-Instruct-AWQ \\
  --max-model-len 16384 \\
  --gpu-memory-utilization 0.70 \\
  --quantization awq \\
  --port 8080`} id="uns2" copyToClipboard={copyToClipboard} copiedId={copiedId} />
      </div>

      {/* Unsloth direct inference */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Direct Unsloth Inference (Fastest)</h3>
        <CodeBlock code={`# unsloth_server.py - Maximum performance server
from unsloth import FastLanguageModel
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

app = FastAPI()

# Load model with Unsloth optimizations
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Qwen2.5-14B-Instruct",
    max_seq_length=16384,
    dtype=None,  # Auto-detect
    load_in_4bit=True,  # 4-bit quantization = ~7GB VRAM
)

class ChatRequest(BaseModel):
    model: str
    messages: list[dict]
    temperature: float = 0.7
    max_tokens: int = 4096

@app.post("/v1/chat/completions")
async def chat(request: ChatRequest):
    # Apply chat template
    prompt = tokenizer.apply_chat_template(
        request.messages, tokenize=False, add_generation_prompt=True
    )
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
    
    outputs = model.generate(
        **inputs,
        max_new_tokens=request.max_tokens,
        temperature=request.temperature,
        use_cache=True,
    )
    response = tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
    
    return {
        "model": request.model,
        "choices": [{"message": {"role": "assistant", "content": response}}]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)`} id="uns3" copyToClipboard={copyToClipboard} copiedId={copiedId} language="python" />
      </div>

      {/* Comparison */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Comparison (16GB VRAM)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-4 text-gray-400">Backend</th>
                <th className="text-left py-2 px-4 text-gray-400">Model</th>
                <th className="text-left py-2 px-4 text-gray-400">VRAM</th>
                <th className="text-left py-2 px-4 text-gray-400">Speed</th>
                <th className="text-left py-2 px-4 text-gray-400">Setup</th>
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
              <tr>
                <td className="py-2 px-4 text-amber-400 font-medium">Unsloth + vLLM</td>
                <td className="py-2 px-4 text-white">Qwen2.5-14B-AWQ</td>
                <td className="py-2 px-4 text-gray-300">~8GB</td>
                <td className="py-2 px-4 text-gray-300">~40 tok/s</td>
                <td className="py-2 px-4 text-amber-400">Medium</td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-amber-400 font-medium">Unsloth Direct</td>
                <td className="py-2 px-4 text-white">Qwen2.5-14B 4bit</td>
                <td className="py-2 px-4 text-gray-300">~7GB</td>
                <td className="py-2 px-4 text-gray-300">~35 tok/s</td>
                <td className="py-2 px-4 text-amber-400">Medium</td>
              </tr>
              <tr>
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
      </div>
    </div>
  )
}

/* ─── Config Tab ─── */
function ConfigTab({ copyToClipboard, copiedId }: { copyToClipboard: (t: string, i: string) => void; copiedId: string | null }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          <i className="fas fa-cog text-gray-400 mr-2"></i>.env Configuration
        </h2>
        <p className="text-gray-400">
          Complete .env file for running OpenShorts 100% locally on your hardware (16GB VRAM, 32GB RAM, Ryzen 7600X).
        </p>
      </div>

      {/* Full .env */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Complete .env for Local Setup</h3>
        <CodeBlock code={`# ═══════════════════════════════════════════════════════
# OpenShorts - 100% Local Configuration
# Hardware: 16GB VRAM GPU | 32GB RAM | Ryzen 7600X
# ═══════════════════════════════════════════════════════

# ─── Local LLM (replaces Google Gemini for moment picking) ───
LLM_BASE_URL=http://host.docker.internal:11434/v1
LLM_MODEL=qwen2.5:14b
# LLM_API_KEY=  # Not needed for local Ollama
LLM_SCORE_BATCH=3  # Reduced from 8 for local (context limits)

# ─── Whisper / Transcription (runs on GPU) ───
WHISPER_MODEL=large-v3-turbo
WHISPER_DEVICE=cuda
WHISPER_COMPUTE=float16
TRANSCRIBE_BACKEND=parakeet  # Faster than whisper, 25 EU languages
ASR_GPU_CONCURRENCY=1

# ─── FFmpeg / Encoding ───
FFMPEG_ENCODER=auto  # Probes h264_nvenc, falls back to x264

# ─── Scene Detection ───
SCENE_ENGINE=transnetv2  # Neural scene detection (runs on GPU)

# ─── Layout (optional - needs Gemini for vision) ───
# AUTO_LAYOUT=0  # Disable if no Gemini key
# GEMINI_API_KEY=  # Optional, only for layout picker

# ─── Performance Tuning for 16GB VRAM ───
MAX_CONCURRENT_JOBS=1  # Only 1 job at a time with limited VRAM
CLIP_WORKERS=3  # Reduced from 6 for 16GB VRAM
GPU_MIN_FREE_MB=2048  # Minimum free VRAM before starting a job
ASR_HOST_SLOTS=1  # Only 1 transcription at a time

# ─── Storage ───
# OUTPUT_DIR=./output  # Default
# UPLOAD_DIR=./uploads  # Default

# ─── AI Shorts (optional - needs fal.ai + ElevenLabs) ───
# FAL_KEY=  # Only for AI Shorts feature
# ELEVENLABS_API_KEY=  # Only for voice dubbing

# ─── Social Publishing (optional) ───
# UPLOAD_POST_API_KEY=  # Only for auto-publishing

# ─── Billing (disable for self-hosted) ───
BILLING_ENABLED=0`} id="env1" copyToClipboard={copyToClipboard} copiedId={copiedId} language="env" />
      </div>

      {/* Minimal .env */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Minimal .env (Clip Generator Only)</h3>
        <p className="text-sm text-gray-400 mb-4">
          If you only want the clip generator (no AI Shorts, no dubbing, no publishing):
        </p>
        <CodeBlock code={`# Minimal config - just the clip generator, fully local
LLM_BASE_URL=http://host.docker.internal:11434/v1
LLM_MODEL=qwen2.5:14b
LLM_SCORE_BATCH=3

WHISPER_MODEL=large-v3-turbo
WHISPER_DEVICE=cuda
WHISPER_COMPUTE=float16

FFMPEG_ENCODER=auto
MAX_CONCURRENT_JOBS=1
CLIP_WORKERS=3
GPU_MIN_FREE_MB=2048

BILLING_ENABLED=0`} id="env2" copyToClipboard={copyToClipboard} copiedId={copiedId} language="env" />
      </div>

      {/* Ollama Modelfile */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Ollama Modelfile (Extended Context)</h3>
        <CodeBlock code={`# Modelfile for OpenShorts - extended context for transcript scoring
FROM qwen2.5:14b

# Critical: OpenShorts needs 16k+ context for scoring
PARAMETER num_ctx 16384

# Temperature for consistent JSON output
PARAMETER temperature 0.3

# System prompt hint
SYSTEM """You are a video content analyzer. You score transcript windows 
for viral potential and select the best moments for short-form clips. 
Always respond with valid JSON."""`} id="env3" copyToClipboard={copyToClipboard} copiedId={copiedId} language="dockerfile" />
        <div className="mt-4">
          <p className="text-sm text-gray-400 mb-2">Build and use:</p>
          <CodeBlock code={`ollama create openshorts-llm -f Modelfile
# Then set in .env: LLM_MODEL=openshorts-llm`} id="env4" copyToClipboard={copyToClipboard} copiedId={copiedId} />
        </div>
      </div>

      {/* Docker Compose Override */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">docker-compose.override.yml (GPU)</h3>
        <CodeBlock code={`# docker-compose.override.yml - GPU acceleration for your 16GB card
services:
  backend:
    build:
      context: .
      args:
        GPU: "1"  # Adds cuBLAS/cuDNN + onnxruntime-gpu
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu, video]  # video = NVENC
    extra_hosts:
      - "host.docker.internal:host-gateway"  # Access Ollama on host
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
      - NVIDIA_DRIVER_CAPABILITIES=compute,utility,video`} id="env5" copyToClipboard={copyToClipboard} copiedId={copiedId} language="yaml" />
      </div>
    </div>
  )
}

/* ─── Docker Tab ─── */
function DockerTab({ copyToClipboard, copiedId }: { copyToClipboard: (t: string, i: string) => void; copiedId: string | null }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          <i className="fas fa-box text-blue-400 mr-2"></i>Complete Docker Setup
        </h2>
        <p className="text-gray-400">
          Full step-by-step Docker setup for running OpenShorts with local models on your 16GB VRAM system.
        </p>
      </div>

      {/* Prerequisites */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Prerequisites</h3>
        <CodeBlock code={`# 1. Verify NVIDIA driver
nvidia-smi

# 2. Install Docker (if not installed)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 3. Install NVIDIA Container Toolkit
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \\
  sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \\
  sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \\
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# 4. Verify GPU access in Docker
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi`} id="dock1" copyToClipboard={copyToClipboard} copiedId={copiedId} />
      </div>

      {/* Full Setup */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Full Setup (Copy-Paste Ready)</h3>
        <CodeBlock code={`# ═══════════════════════════════════════════════════════
# Complete Local OpenShorts Setup
# ═══════════════════════════════════════════════════════

# Step 1: Clone the repository
git clone https://github.com/mutonby/openshorts.git
cd openshorts

# Step 2: Install and configure Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen2.5:14b

# Step 3: Create Modelfile with extended context
cat > Modelfile << 'EOF'
FROM qwen2.5:14b
PARAMETER num_ctx 16384
PARAMETER temperature 0.3
EOF
ollama create openshorts-llm -f Modelfile

# Step 4: Create .env
cat > .env << 'EOF'
LLM_BASE_URL=http://host.docker.internal:11434/v1
LLM_MODEL=openshorts-llm
LLM_SCORE_BATCH=3
WHISPER_MODEL=large-v3-turbo
WHISPER_DEVICE=cuda
WHISPER_COMPUTE=float16
TRANSCRIBE_BACKEND=parakeet
FFMPEG_ENCODER=auto
MAX_CONCURRENT_JOBS=1
CLIP_WORKERS=3
GPU_MIN_FREE_MB=2048
ASR_HOST_SLOTS=1
BILLING_ENABLED=0
EOF

# Step 5: Create docker-compose.override.yml for GPU
cat > docker-compose.override.yml << 'EOF'
services:
  backend:
    build:
      context: .
      args:
        GPU: "1"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu, video]
    extra_hosts:
      - "host.docker.internal:host-gateway"
EOF

# Step 6: Launch!
docker compose up --build -d

# Step 7: Open dashboard
echo "OpenShorts is running at http://localhost:5175"
echo "Ollama API at http://localhost:11434"`} id="dock2" copyToClipboard={copyToClipboard} copiedId={copiedId} />
      </div>

      {/* Verification */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Verify Everything Works</h3>
        <CodeBlock code={`# Check Ollama is accessible from Docker
docker exec openshorts-backend curl -s http://host.docker.internal:11434/api/tags

# Check GPU is visible in container
docker exec openshorts-backend nvidia-smi -L

# Check NVENC encoder is available
docker exec openshorts-backend ffmpeg -hide_banner -f lavfi \\
  -i testsrc=size=256x256:rate=1 -frames:v 1 \\
  -c:v h264_nvenc -f null -

# Check the backend logs
docker compose logs -f backend

# Test the API
curl http://localhost:8000/api/config`} id="dock3" copyToClipboard={copyToClipboard} copiedId={copiedId} />
      </div>

      {/* Update commands */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Update & Maintenance</h3>
        <CodeBlock code={`# Update OpenShorts
cd openshorts
git pull
docker compose up --build -d

# Update Ollama model
ollama pull qwen2.5:14b
ollama create openshorts-llm -f Modelfile

# View resource usage
docker stats
nvidia-smi

# Clean up old images
docker system prune -f`} id="dock4" copyToClipboard={copyToClipboard} copiedId={copiedId} />
      </div>
    </div>
  )
}

/* ─── Troubleshoot Tab ─── */
function TroubleshootTab() {
  const issues = [
    {
      title: "CUDA Out of Memory (OOM)",
      symptoms: "Job fails with 'CUDA out of memory' error",
      solutions: [
        "Reduce CLIP_WORKERS from 6 to 3",
        "Set MAX_CONCURRENT_JOBS=1",
        "Use qwen2.5:7b instead of 14b",
        "Set WHISPER_MODEL=medium instead of large-v3-turbo",
        "Increase GPU_MIN_FREE_MB to 4096",
      ]
    },
    {
      title: "Ollama Context Truncation",
      symptoms: "Model returns garbage or incomplete JSON",
      solutions: [
        "Ensure Modelfile has PARAMETER num_ctx 16384",
        "Verify with: ollama show openshorts-llm --modelfile",
        "Set LLM_SCORE_BATCH=3 (not higher)",
        "Check Ollama logs: journalctl -u ollama -f",
      ]
    },
    {
      title: "Docker Can't Reach Ollama",
      symptoms: "Connection refused to host.docker.internal:11434",
      solutions: [
        "Ensure extra_hosts is in docker-compose.override.yml",
        "On Linux, Ollama must listen on 0.0.0.0: export OLLAMA_HOST=0.0.0.0",
        "Check firewall: sudo ufw allow 11434",
        "Test from host: curl http://localhost:11434/api/tags",
      ]
    },
    {
      title: "NVENC Not Available",
      symptoms: "FFmpeg falls back to x264 (slow CPU encoding)",
      solutions: [
        "Ensure capabilities include 'video' in compose override",
        "Verify: docker exec openshorts-backend ffmpeg -encoders | grep nvenc",
        "Check GPU: docker exec openshorts-backend nvidia-smi",
        "NVIDIA driver must be installed on HOST (not in container)",
      ]
    },
    {
      title: "Slow Transcription",
      symptoms: "Transcription takes too long",
      solutions: [
        "Use TRANSCRIBE_BACKEND=parakeet (2x faster than whisper)",
        "Ensure WHISPER_DEVICE=cuda (not cpu)",
        "Check: docker exec openshorts-backend nvidia-smi during transcription",
        "Set ASR_GPU_CONCURRENCY=1 to avoid VRAM contention",
      ]
    },
    {
      title: "Model Returns Invalid JSON",
      symptoms: "Pipeline fails with JSON parse error",
      solutions: [
        "Use qwen2.5:14b or llama3.1:8b (better JSON compliance)",
        "Set temperature to 0.3 in Modelfile",
        "Avoid models smaller than 7B parameters",
        "Check: ollama run qwen2.5:14b 'Return {\"test\": true}' for JSON test",
      ]
    },
    {
      title: "Layout Picker Not Working (No Gemini)",
      symptoms: "All clips use basic face-tracking crop",
      solutions: [
        "This is expected without a Gemini key",
        "Layout picker needs vision (can't run locally easily)",
        "Force a layout via dashboard: 'Single crop only'",
        "Or add a free Gemini key for layout picking only",
      ]
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          <i className="fas fa-wrench text-amber-400 mr-2"></i>Troubleshooting
        </h2>
        <p className="text-gray-400">
          Common issues and solutions when running OpenShorts locally with 16GB VRAM.
        </p>
      </div>

      {issues.map((issue, i) => (
        <div key={i} className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <i className="fas fa-exclamation-circle text-amber-400"></i>
            {issue.title}
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            <strong className="text-gray-300">Symptoms:</strong> {issue.symptoms}
          </p>
          <div className="space-y-2">
            <p className="text-sm text-emerald-400 font-medium">Solutions:</p>
            <ul className="space-y-1">
              {issue.solutions.map((sol, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                  <i className="fas fa-check text-emerald-500 text-xs mt-1"></i>
                  <span>{sol}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      {/* Useful Commands */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          <i className="fas fa-terminal text-violet-400 mr-2"></i>Useful Debug Commands
        </h3>
        <div className="space-y-3 text-sm">
          <div className="p-3 rounded bg-gray-800/50">
            <code className="text-gray-300">nvidia-smi</code>
            <p className="text-gray-500 text-xs mt-1">Check GPU usage and VRAM allocation</p>
          </div>
          <div className="p-3 rounded bg-gray-800/50">
            <code className="text-gray-300">docker compose logs -f backend</code>
            <p className="text-gray-500 text-xs mt-1">Follow backend logs in real-time</p>
          </div>
          <div className="p-3 rounded bg-gray-800/50">
            <code className="text-gray-300">ollama ps</code>
            <p className="text-gray-500 text-xs mt-1">Check which models are loaded in Ollama</p>
          </div>
          <div className="p-3 rounded bg-gray-800/50">
            <code className="text-gray-300">docker exec openshorts-backend du -sh /output/*</code>
            <p className="text-gray-500 text-xs mt-1">Check output directory size</p>
          </div>
          <div className="p-3 rounded bg-gray-800/50">
            <code className="text-gray-300">curl http://localhost:8000/api/config</code>
            <p className="text-gray-500 text-xs mt-1">Check OpenShorts configuration</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
