import type { ModelDef, TabDef, PipelineStep, HardwareConfig } from './types'

/* ═══ Tabs ═══ */
export const TABS: TabDef[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fa-gauge-high', description: 'System overview & VRAM calculator' },
  { id: 'models', label: 'Models', icon: 'fa-brain', description: 'Compare & select local LLMs' },
  { id: 'livetest', label: 'Live Test', icon: 'fa-plug', description: 'Connect to Ollama & test' },
  { id: 'config', label: 'Config Builder', icon: 'fa-sliders', description: 'Generate .env & Docker files' },
  { id: 'server', label: 'Server Code', icon: 'fa-code', description: 'Python server implementations' },
  { id: 'pipeline', label: 'Pipeline', icon: 'fa-diagram-project', description: 'Visual processing pipeline' },
  { id: 'guide', label: 'Setup Guide', icon: 'fa-book', description: 'Step-by-step installation' },
]

/* ═══ Default Hardware ═══ */
export const DEFAULT_HARDWARE: HardwareConfig = {
  vramGB: 16,
  ramGB: 32,
  cpuCores: 12,
  cpuName: 'AMD Ryzen 7600X',
  gpuName: 'NVIDIA GPU (16GB VRAM)',
}

/* ═══ Model Database ═══ */
export const MODELS: ModelDef[] = [
  {
    id: 'qwen2.5:14b',
    name: 'Qwen 2.5 14B',
    provider: 'Alibaba',
    params: '14B',
    quantization: 'Q4_K_M',
    vramGB: 10,
    ramGB: 14,
    speedTokS: 25,
    quality: 5,
    jsonQuality: 'excellent',
    contextMax: 32768,
    bestFor: 'Best overall quality for moment picking',
    backend: 'ollama',
    recommended: true,
  },
  {
    id: 'qwen2.5:7b',
    name: 'Qwen 2.5 7B',
    provider: 'Alibaba',
    params: '7B',
    quantization: 'Q4_K_M',
    vramGB: 6,
    ramGB: 8,
    speedTokS: 40,
    quality: 4,
    jsonQuality: 'good',
    contextMax: 32768,
    bestFor: 'Best balance of speed & quality',
    backend: 'ollama',
  },
  {
    id: 'llama3.1:8b',
    name: 'Llama 3.1 8B',
    provider: 'Meta',
    params: '8B',
    quantization: 'Q4_K_M',
    vramGB: 6,
    ramGB: 9,
    speedTokS: 35,
    quality: 4,
    jsonQuality: 'excellent',
    contextMax: 16384,
    bestFor: 'Most reliable JSON output',
    backend: 'ollama',
  },
  {
    id: 'mistral:7b',
    name: 'Mistral 7B',
    provider: 'Mistral AI',
    params: '7B',
    quantization: 'Q4_K_M',
    vramGB: 5,
    ramGB: 7,
    speedTokS: 45,
    quality: 3,
    jsonQuality: 'good',
    contextMax: 8192,
    bestFor: 'Fastest inference speed',
    backend: 'ollama',
  },
  {
    id: 'gemma2:9b',
    name: 'Gemma 2 9B',
    provider: 'Google',
    params: '9B',
    quantization: 'Q4_K_M',
    vramGB: 7,
    ramGB: 10,
    speedTokS: 30,
    quality: 4,
    jsonQuality: 'good',
    contextMax: 16384,
    bestFor: "Google's open model, great reasoning",
    backend: 'ollama',
  },
  {
    id: 'qwen2.5-coder:7b',
    name: 'Qwen 2.5 Coder 7B',
    provider: 'Alibaba',
    params: '7B',
    quantization: 'Q4_K_M',
    vramGB: 6,
    ramGB: 8,
    speedTokS: 38,
    quality: 4,
    jsonQuality: 'excellent',
    contextMax: 32768,
    bestFor: 'Best structured/JSON output',
    backend: 'ollama',
  },
  {
    id: 'phi3:14b',
    name: 'Phi-3 14B',
    provider: 'Microsoft',
    params: '14B',
    quantization: 'Q4_K_M',
    vramGB: 9,
    ramGB: 14,
    speedTokS: 22,
    quality: 4,
    jsonQuality: 'good',
    contextMax: 16384,
    bestFor: 'Strong reasoning, compact size',
    backend: 'ollama',
  },
  {
    id: 'qwen2.5:32b',
    name: 'Qwen 2.5 32B',
    provider: 'Alibaba',
    params: '32B',
    quantization: 'Q4_K_M',
    vramGB: 20,
    ramGB: 22,
    speedTokS: 8,
    quality: 5,
    jsonQuality: 'excellent',
    contextMax: 32768,
    bestFor: 'Maximum quality (needs offloading)',
    backend: 'airllm',
  },
  {
    id: 'Qwen/Qwen2.5-14B-Instruct-AWQ',
    name: 'Qwen 2.5 14B AWQ',
    provider: 'Alibaba',
    params: '14B',
    quantization: 'AWQ 4-bit',
    vramGB: 8,
    ramGB: 10,
    speedTokS: 40,
    quality: 5,
    jsonQuality: 'excellent',
    contextMax: 16384,
    bestFor: 'Fastest high-quality option (vLLM)',
    backend: 'vllm',
  },
  {
    id: 'unsloth/Qwen2.5-14B-Instruct',
    name: 'Qwen 2.5 14B Unsloth',
    provider: 'Alibaba',
    params: '14B',
    quantization: '4-bit',
    vramGB: 7,
    ramGB: 9,
    speedTokS: 35,
    quality: 5,
    jsonQuality: 'excellent',
    contextMax: 16384,
    bestFor: 'Optimized kernels, best VRAM efficiency',
    backend: 'unsloth',
  },
]

/* ═══ VRAM Components ═══ */
export interface VramComponent {
  id: string
  name: string
  vramMB: number
  color: string
  required: boolean
}

export const VRAM_COMPONENTS: VramComponent[] = [
  { id: 'llm', name: 'LLM Model', vramMB: 10000, color: 'bg-violet-500', required: true },
  { id: 'whisper', name: 'Whisper ASR', vramMB: 3000, color: 'bg-emerald-500', required: true },
  { id: 'scene', name: 'Scene Detection', vramMB: 800, color: 'bg-amber-500', required: true },
  { id: 'face', name: 'Face Tracking (YOLO)', vramMB: 700, color: 'bg-blue-500', required: true },
  { id: 'ffmpeg', name: 'NVENC Encoder', vramMB: 500, color: 'bg-pink-500', required: false },
  { id: 'headroom', name: 'Safety Headroom', vramMB: 1000, color: 'bg-gray-500', required: true },
]

/* ═══ Pipeline Steps ═══ */
export const PIPELINE_STEPS: PipelineStep[] = [
  { id: 'ingest', name: 'Ingest', icon: 'fa-upload', description: 'Load video file or URL', vramMB: 0, duration: '< 1s', local: true, color: 'violet' },
  { id: 'transcribe', name: 'Transcribe', icon: 'fa-microphone', description: 'faster-whisper GPU transcription', vramMB: 3000, duration: '~30s/min', local: true, color: 'emerald' },
  { id: 'scenes', name: 'Scene Detect', icon: 'fa-film', description: 'TransNetV2 neural scene boundaries', vramMB: 800, duration: '~5s/min', local: true, color: 'amber' },
  { id: 'analyze', name: 'AI Analyze', icon: 'fa-brain', description: 'Local LLM scores viral moments', vramMB: 10000, duration: '~10s', local: true, color: 'violet' },
  { id: 'extract', name: 'Extract Clips', icon: 'fa-scissors', description: 'FFmpeg precise clip cutting', vramMB: 200, duration: '~2s/clip', local: true, color: 'blue' },
  { id: 'reframe', name: 'Reframe', icon: 'fa-crop-alt', description: 'AI vertical crop + face tracking', vramMB: 1500, duration: '~15s/clip', local: true, color: 'pink' },
  { id: 'subtitles', name: 'Subtitles', icon: 'fa-closed-captioning', description: 'Word-level ASS subtitle burn', vramMB: 100, duration: '~5s/clip', local: true, color: 'emerald' },
  { id: 'encode', name: 'Encode', icon: 'fa-file-video', description: 'NVENC h264 GPU encoding', vramMB: 500, duration: '~10s/clip', local: true, color: 'amber' },
]

/* ═══ Whisper Models ═══ */
export const WHISPER_MODELS = [
  { id: 'large-v3-turbo', name: 'large-v3-turbo', vramMB: 3000, speed: 'Fast', accuracy: 'Best' },
  { id: 'large-v3', name: 'large-v3', vramMB: 3200, speed: 'Medium', accuracy: 'Best' },
  { id: 'medium', name: 'medium', vramMB: 1600, speed: 'Fast', accuracy: 'Good' },
  { id: 'small', name: 'small', vramMB: 500, speed: 'Very Fast', accuracy: 'Fair' },
  { id: 'base', name: 'base', vramMB: 150, speed: 'Fastest', accuracy: 'Basic' },
]
