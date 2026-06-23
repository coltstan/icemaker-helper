import { useEffect, useRef, useState } from 'react'
import { buildSystemPrompt } from '../data/assistantContext'
import { useModel } from '../data/modelContext'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const KEY_STORAGE = 'anthropic_api_key'
const MODEL = 'claude-opus-4-8'

const SUGGESTIONS = [
  'It runs but makes no ice and the cubes melt',
  'The ice tastes bad / looks cloudy',
  "It's making a loud rattling noise",
  'How do I clean the condenser?',
]

export default function Assistant() {
  const { model } = useModel()
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem(KEY_STORAGE) ?? ''
    } catch {
      return ''
    }
  })
  const [keyInput, setKeyInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streaming])

  function saveKey() {
    const k = keyInput.trim()
    if (!k) return
    try {
      localStorage.setItem(KEY_STORAGE, k)
    } catch {}
    setApiKey(k)
    setKeyInput('')
  }

  function forgetKey() {
    try {
      localStorage.removeItem(KEY_STORAGE)
    } catch {}
    setApiKey('')
    setMessages([])
  }

  async function send(text: string) {
    const content = text.trim()
    if (!content || busy) return
    setError(null)
    setInput('')
    const next = [...messages, { role: 'user' as const, content }]
    setMessages(next)
    setBusy(true)
    setStreaming('')

    try {
      const { default: Anthropic } = await import('@anthropic-ai/sdk')
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

      let acc = ''
      const stream = client.messages.stream({
        model: MODEL,
        max_tokens: 1024,
        system: buildSystemPrompt(model.name),
        messages: next.map((m) => ({ role: m.role, content: m.content })),
      })
      stream.on('text', (delta: string) => {
        acc += delta
        setStreaming(acc)
      })
      const final = await stream.finalMessage()
      const textOut =
        acc || final.content.map((b) => (b.type === 'text' ? b.text : '')).join('')
      setMessages((m) => [...m, { role: 'assistant', content: textOut }])
      setStreaming('')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      // Surface the most common failures plainly.
      if (/401|authentication/i.test(msg)) {
        setError('That API key was rejected. Check it and re-enter.')
        forgetKey()
      } else if (/429|rate/i.test(msg)) {
        setError('Rate limited by the API — wait a moment and try again.')
      } else {
        setError(msg)
      }
      setStreaming('')
    } finally {
      setBusy(false)
    }
  }

  if (!apiKey) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">AI diagnostician</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Describe your problem in plain English and get a diagnosis grounded in this model's real
            parts and the cheapest-fix-first logic. This is a static site, so it calls the Anthropic
            API directly from your browser — paste your own Anthropic API key to use it. The key is
            stored only in this browser (localStorage) and sent only to Anthropic.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveKey()}
              placeholder="sk-ant-..."
              aria-label="Anthropic API key"
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-accent-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
            <button
              type="button"
              onClick={saveKey}
              className="btn-primary cursor-pointer rounded-xl px-5 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            >
              Start
            </button>
          </div>
          <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
            Get a key at console.anthropic.com. For a shared/public deployment you'd instead route
            through a small serverless proxy so no key lives in the browser.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <div className="card flex h-[60vh] flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && !streaming && (
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              <p className="mb-3">
                Describe what your ice maker is doing and I'll diagnose it — steering you to the
                cheapest correct fix first.
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="cursor-pointer rounded-full border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 transition-colors hover:border-accent-500 hover:text-accent-700 dark:border-zinc-600 dark:text-zinc-300 dark:hover:text-accent-400"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} text={m.content} />
          ))}
          {streaming && <Bubble role="assistant" text={streaming} />}
          {busy && !streaming && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-accent-600" />
              Thinking…
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
          className="flex items-center gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the problem…"
            aria-label="Message"
            disabled={busy}
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-accent-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="btn-primary cursor-pointer rounded-xl px-5 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>

      <div className="mt-2 flex items-center justify-between px-1 text-xs text-zinc-400 dark:text-zinc-500">
        <span>Model: {MODEL} · grounded in this unit's verified parts</span>
        <div className="flex gap-3">
          {messages.length > 0 && (
            <button type="button" onClick={() => setMessages([])} className="cursor-pointer underline hover:text-zinc-600 dark:hover:text-zinc-300">
              Clear chat
            </button>
          )}
          <button type="button" onClick={forgetKey} className="cursor-pointer underline hover:text-zinc-600 dark:hover:text-zinc-300">
            Forget key
          </button>
        </div>
      </div>
    </div>
  )
}

function Bubble({ role, text }: { role: 'user' | 'assistant'; text: string }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
          isUser
            ? 'bg-accent-600 text-white'
            : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100'
        }`}
      >
        {text}
      </div>
    </div>
  )
}
