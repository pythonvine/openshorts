import { useState, useCallback } from 'react'
import { Card, SectionTitle, StatusDot, CodeBlock, Badge } from '../components'
import { useOllamaConnection, useClipboard } from '../hooks'
import type { ChatMessage } from '../types'

export default function LiveTestTab({ copy, copiedId }: { copy: (t: string, i: string) => boolean; copiedId: string | null }) {
  const [baseUrl, setBaseUrl] = useState('http://localhost:11434')
  const [selectedModel, setSelectedModel] = useState('')
  const [prompt, setPrompt] = useState('Score this video transcript for viral potential. Rate each moment 1-10 and explain why.\n\nTranscript: "In today\'s video, I\'m going to show you something that completely changed my mind about AI..."')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { status, models, error: connError, connect, testModel } = useOllamaConnection(baseUrl)

  const handleConnect = useCallback(async () => {
    await connect()
  }, [connect])

  const handleSend = useCallback(async () => {
    if (!selectedModel || !prompt.trim()) return
    setLoading(true)
    setError('')

    const userMsg: ChatMessage = { role: 'user', content: prompt }
    setMessages((prev) => [...prev, userMsg])

    try {
      const response = await testModel(selectedModel, prompt)
      const assistantMsg: ChatMessage = { role: 'assistant', content: response }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }, [selectedModel, prompt, testModel])

  const handleClear = useCallback(() => {
    setMessages([])
    setError('')
  }, [])

  return (
    <div className="space-y-6">
      {/* Connection Panel */}
      <Card>
        <SectionTitle icon="fa-plug" color="text-emerald-400">
          Live Ollama Connection
        </SectionTitle>
        <p className="text-gray-400 text-sm mb-4">
          Connect to your local Ollama instance and test models in real-time. Make sure Ollama is running.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Ollama Base URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://localhost:11434"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Status</label>
            <div className="flex items-center gap-3 h-[38px]">
              <StatusDot status={status} />
              <span className={`text-sm font-medium ${
                status === 'connected' ? 'text-emerald-400' :
                status === 'error' ? 'text-red-400' :
                status === 'connecting' ? 'text-amber-400' : 'text-gray-400'
              }`}>
                {status === 'connected' ? 'Connected' :
                 status === 'error' ? 'Disconnected' :
                 status === 'connecting' ? 'Connecting...' : 'Not connected'}
              </span>
              <button
                onClick={handleConnect}
                disabled={status === 'connecting'}
                className="ml-auto px-4 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm rounded-lg transition-colors"
              >
                {status === 'connecting' ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>

        {connError && (
          <div className="p-3 rounded-lg bg-red-900/20 border border-red-800 text-red-400 text-sm mb-4">
            <i className="fas fa-exclamation-triangle mr-2" aria-hidden="true" />
            {connError}
          </div>
        )}

        {status === 'connected' && models.length > 0 && (
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Available Models ({models.length})</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Select a model...</option>
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        )}

        {status === 'connected' && models.length === 0 && (
          <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-800 text-amber-400 text-sm">
            <i className="fas fa-info-circle mr-2" aria-hidden="true" />
            Connected but no models found. Pull a model first: <code className="bg-gray-800 px-1 rounded">ollama pull qwen2.5:14b</code>
          </div>
        )}
      </Card>

      {/* Chat Interface */}
      <Card>
        <SectionTitle icon="fa-comments" color="text-violet-400">
          Test Chat Interface
        </SectionTitle>

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1.5">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono resize-y focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Enter your prompt..."
          />
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={handleSend}
            disabled={!selectedModel || loading || status !== 'connected'}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin" aria-hidden="true" />
                Generating...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane" aria-hidden="true" />
                Send
              </>
            )}
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-900/20 border border-red-800 text-red-400 text-sm mb-4">
            <i className="fas fa-exclamation-triangle mr-2" aria-hidden="true" />
            {error}
          </div>
        )}

        {/* Messages */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              <i className="fas fa-comments text-3xl mb-2" aria-hidden="true" />
              <p>No messages yet. Send a prompt to test your model.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`p-3 rounded-lg ${
              msg.role === 'user' ? 'bg-violet-900/20 border border-violet-800/50' : 'bg-gray-800/50 border border-gray-700/50'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <i className={`fas ${msg.role === 'user' ? 'fa-user text-violet-400' : 'fa-robot text-emerald-400'}`} aria-hidden="true" />
                <span className={`text-xs font-medium ${msg.role === 'user' ? 'text-violet-400' : 'text-emerald-400'}`}>
                  {msg.role === 'user' ? 'You' : 'Assistant'}
                </span>
              </div>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Commands */}
      <Card>
        <SectionTitle icon="fa-terminal" color="text-amber-400">
          Quick Setup Commands
        </SectionTitle>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">1. Install Ollama</p>
            <CodeBlock code="curl -fsSL https://ollama.com/install.sh | sh" id="lt1" copy={copy} copiedId={copiedId} />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">2. Pull recommended model</p>
            <CodeBlock code="ollama pull qwen2.5:14b" id="lt2" copy={copy} copiedId={copiedId} />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">3. Create model with extended context</p>
            <CodeBlock code={`cat > Modelfile << 'EOF'\nFROM qwen2.5:14b\nPARAMETER num_ctx 16384\nPARAMETER temperature 0.3\nEOF\nollama create openshorts-llm -f Modelfile`} id="lt3" copy={copy} copiedId={copiedId} />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">4. Test API</p>
            <CodeBlock code={`curl http://localhost:11434/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "qwen2.5:14b",\n    "messages": [{"role": "user", "content": "Hello"}]\n  }'`} id="lt4" copy={copy} copiedId={copiedId} />
          </div>
        </div>
      </Card>
    </div>
  )
}
