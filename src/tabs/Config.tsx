import { useState, useMemo } from 'react'
import { Card, SectionTitle, CodeBlock, Badge } from '../components'
import { MODELS, WHISPER_MODELS } from '../data'

export default function ConfigTab({ copy, copiedId }: { copy: (t: string, i: string) => boolean; copiedId: string | null }) {
  const [model, setModel] = useState(MODELS[0].id)
  const [whisper, setWhisper] = useState('large-v3-turbo')
  const [backend, setBackend] = useState<'ollama' | 'vllm' | 'unsloth'>('ollama')
  const [ollamaUrl, setOllamaUrl] = useState('http://host.docker.internal:11434')
  const [gpuEnabled, setGpuEnabled] = useState(true)
  const [maxJobs, setMaxJobs] = useState(1)
  const [clipWorkers, setClipWorkers] = useState(3)
  const [billing, setBilling] = useState(false)

  const envContent = useMemo(() => {
    const llmUrl = backend === 'ollama' ? ollamaUrl :
                   backend === 'vllm' ? 'http://host.docker.internal:8080/v1' :
                   'http://host.docker.internal:8080/v1'

    return `# ═══════════════════════════════════════════════════════
# OpenShorts - 100% Local Configuration
# Generated for your hardware: 16GB VRAM | 32GB RAM | Ryzen 7600X
# ═══════════════════════════════════════════════════════

# ─── Local LLM (${backend.toUpperCase()}) ───
LLM_BASE_URL=${llmUrl}
LLM_MODEL=${model}
# LLM_API_KEY=  # Not needed for local
LLM_SCORE_BATCH=3

# ─── Whisper / Transcription (GPU) ───
WHISPER_MODEL=${whisper}
WHISPER_DEVICE=cuda
WHISPER_COMPUTE=float16
TRANSCRIBE_BACKEND=parakeet
ASR_GPU_CONCURRENCY=1

# ─── FFmpeg / Encoding ───
FFMPEG_ENCODER=auto

# ─── Performance (16GB VRAM) ───
MAX_CONCURRENT_JOBS=${maxJobs}
CLIP_WORKERS=${clipWorkers}
GPU_MIN_FREE_MB=2048

# ─── Billing ───
BILLING_ENABLED=${billing ? '1' : '0'}`
  }, [model, whisper, backend, ollamaUrl, maxJobs, clipWorkers, billing])

  const modelfile = useMemo(() => `# Modelfile for OpenShorts
FROM ${model.includes(':') ? model : model.split('/').pop()}

# Critical: 16k+ context for transcript scoring
PARAMETER num_ctx 16384
PARAMETER temperature 0.3

SYSTEM """You are a video content analyzer. Score transcript
windows for viral potential. Always respond with valid JSON."""`, [model])

  const dockerOverride = useMemo(() => `# docker-compose.override.yml
services:
  backend:
    build:
      context: .
      args:
        GPU: "${gpuEnabled ? '1' : '0'}"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu, video]
    extra_hosts:
      - "host.docker.internal:host-gateway"
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
      - NVIDIA_DRIVER_CAPABILITIES=compute,utility,video`, [gpuEnabled])

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle icon="fa-sliders" color="text-violet-400">
          Interactive Configuration Builder
        </SectionTitle>
        <p className="text-gray-400 text-sm mb-6">
          Configure your local OpenShorts setup. Changes update the generated files in real-time.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">LLM Backend</label>
            <select value={backend} onChange={(e) => setBackend(e.target.value as 'ollama' | 'vllm' | 'unsloth')}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="ollama">Ollama (Recommended)</option>
              <option value="vllm">vLLM (Fastest)</option>
              <option value="unsloth">Unsloth (Optimized)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">LLM Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
              {MODELS.filter(m => m.backend === backend || backend === 'ollama').map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.vramGB}GB)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Whisper Model</label>
            <select value={whisper} onChange={(e) => setWhisper(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
              {WHISPER_MODELS.map((w) => (
                <option key={w.id} value={w.id}>{w.name} ({w.vramMB}MB)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Ollama URL</label>
            <input type="text" value={ollamaUrl} onChange={(e) => setOllamaUrl(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Max Concurrent Jobs</label>
            <input type="number" min={1} max={5} value={maxJobs} onChange={(e) => setMaxJobs(+e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Clip Workers</label>
            <input type="number" min={1} max={10} value={clipWorkers} onChange={(e) => setClipWorkers(+e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={gpuEnabled} onChange={(e) => setGpuEnabled(e.target.checked)}
              className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-violet-600 focus:ring-violet-500" />
            <span className="text-sm text-gray-300">GPU Acceleration (NVENC)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={billing} onChange={(e) => setBilling(e.target.checked)}
              className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-violet-600 focus:ring-violet-500" />
            <span className="text-sm text-gray-300">Enable Billing (Cloud Mode)</span>
          </label>
        </div>
      </Card>

      {/* Generated .env */}
      <Card>
        <SectionTitle icon="fa-file-code" color="text-emerald-400">
          Generated .env File
        </SectionTitle>
        <CodeBlock code={envContent} id="cfg-env" copy={copy} copiedId={copiedId} language="env" />
      </Card>

      {/* Modelfile */}
      <Card>
        <SectionTitle icon="fa-file-import" color="text-amber-400">
          Ollama Modelfile
        </SectionTitle>
        <p className="text-sm text-gray-400 mb-3">
          Create this file and run <code className="bg-gray-800 px-1 rounded text-xs">ollama create openshorts-llm -f Modelfile</code>
        </p>
        <CodeBlock code={modelfile} id="cfg-model" copy={copy} copiedId={copiedId} language="dockerfile" />
      </Card>

      {/* Docker Override */}
      <Card>
        <SectionTitle icon="fa-box" color="text-blue-400">
          docker-compose.override.yml
        </SectionTitle>
        <CodeBlock code={dockerOverride} id="cfg-docker" copy={copy} copiedId={copiedId} language="yaml" />
      </Card>

      {/* Full Setup Script */}
      <Card>
        <SectionTitle icon="fa-terminal" color="text-violet-400">
          Complete Setup Script
        </SectionTitle>
        <p className="text-sm text-gray-400 mb-3">Copy-paste this entire script to set up everything from scratch:</p>
        <CodeBlock code={`#!/bin/bash
# OpenShorts Local Setup - Auto-generated
set -e

echo "=== Installing Ollama ==="
curl -fsSL https://ollama.com/install.sh | sh

echo "=== Pulling Model ==="
ollama pull ${model}

echo "=== Creating Modelfile ==="
cat > Modelfile << 'MODEL_EOF'
${modelfile}
MODEL_EOF
ollama create openshorts-llm -f Modelfile

echo "=== Cloning OpenShorts ==="
git clone https://github.com/mutonby/openshorts.git
cd openshorts

echo "=== Writing .env ==="
cat > .env << 'ENV_EOF'
${envContent}
ENV_EOF

echo "=== Writing docker-compose.override.yml ==="
cat > docker-compose.override.yml << 'DOCKER_EOF'
${dockerOverride}
DOCKER_EOF

echo "=== Building & Launching ==="
docker compose up --build -d

echo ""
echo "✓ OpenShorts is running at http://localhost:5175"
echo "✓ Ollama API at http://localhost:11434"
echo "✓ Model: ${model}"`} id="cfg-script" copy={copy} copiedId={copiedId} language="bash" />
      </Card>
    </div>
  )
}
