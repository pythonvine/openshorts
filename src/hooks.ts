import { useState, useCallback, useRef, useEffect } from 'react'

/* ═══ useClipboard ═══ */
export function useClipboard() {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copy = useCallback((text: string, id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    const success = (() => {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {})
        return true
      }
      try {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(ta)
        return ok
      } catch {
        return false
      }
    })()

    if (success) {
      setCopiedId(id)
      timeoutRef.current = setTimeout(() => setCopiedId(null), 2000)
    }
    return success
  }, [])

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }, [])

  return { copiedId, copy }
}

/* ═══ useLocalStorage ═══ */
export function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initial
    } catch {
      return initial
    }
  })

  const set = useCallback((v: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next = typeof v === 'function' ? (v as (prev: T) => T)(prev) : v
      try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
      return next
    })
  }, [key])

  return [value, set]
}

/* ═══ useToast ═══ */
export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; text: string; type: 'success' | 'error' | 'info' }>>([])

  const addToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = crypto.randomUUID?.() || String(Date.now())
    setToasts((prev) => [...prev, { id, text, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return { toasts, addToast }
}

/* ═══ useOllamaConnection ═══ */
export function useOllamaConnection(baseUrl: string) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [models, setModels] = useState<string[]>([])
  const [error, setError] = useState<string>('')

  const connect = useCallback(async () => {
    setStatus('connecting')
    setError('')
    try {
      const res = await fetch(`${baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const modelNames = (data.models || []).map((m: { name: string }) => m.name)
      setModels(modelNames)
      setStatus('connected')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Connection failed')
      setModels([])
    }
  }, [baseUrl])

  const testModel = useCallback(async (model: string, prompt: string): Promise<string> => {
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(60000),
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        temperature: 0.3,
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
    const data = await res.json()
    return data.choices?.[0]?.message?.content || 'No response'
  }, [baseUrl])

  return { status, models, error, connect, testModel }
}
