/* ═══ Core Types ═══ */

export type TabId =
  | 'dashboard'
  | 'models'
  | 'livetest'
  | 'config'
  | 'server'
  | 'pipeline'
  | 'guide'

export interface TabDef {
  id: TabId
  label: string
  icon: string
  description: string
}

export interface ModelDef {
  id: string
  name: string
  provider: string
  params: string
  quantization: string
  vramGB: number
  ramGB: number
  speedTokS: number
  quality: 1 | 2 | 3 | 4 | 5
  jsonQuality: 'excellent' | 'good' | 'fair' | 'poor'
  contextMax: number
  bestFor: string
  backend: 'ollama' | 'vllm' | 'unsloth' | 'airllm'
  recommended?: boolean
}

export interface HardwareConfig {
  vramGB: number
  ramGB: number
  cpuCores: number
  cpuName: string
  gpuName: string
}

export interface EnvConfig {
  llmBaseUrl: string
  llmModel: string
  llmScoreBatch: number
  whisperModel: string
  whisperDevice: string
  whisperCompute: string
  transcribeBackend: string
  ffmpegEncoder: string
  maxConcurrentJobs: number
  clipWorkers: number
  gpuMinFreeMB: number
  asrGpuConcurrency: number
  billingEnabled: boolean
}

export interface DockerConfig {
  gpuEnabled: boolean
  ollamaHost: string
  ollamaPort: number
  backendPort: number
  dashboardPort: number
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface PipelineStep {
  id: string
  name: string
  icon: string
  description: string
  vramMB: number
  duration: string
  local: boolean
  color: string
}

export interface ToastMessage {
  id: string
  text: string
  type: 'success' | 'error' | 'info'
}
