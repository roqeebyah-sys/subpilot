'use client'

import { useState, useRef, useEffect } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Who should I contact today?',
  'How do I reduce churn this month?',
  'Which plan is underperforming?',
  'Write a win-back strategy for at-risk users',
]

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your SubPilot AI — ask me anything about your subscribers, churn risk, or how to grow your MRR. I'm here to help you take action.",
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6), // send last 6 messages for context
        }),
      })

      const data = await res.json()

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || data.error || 'Something went wrong.',
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection error. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden mb-6">

      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
        <div className="w-5 h-5 bg-emerald-500/20 rounded flex items-center justify-center text-xs">✦</div>
        <div>
          <div className="text-sm font-semibold">Ask SubPilot AI</div>
          <div className="text-xs text-white/30">Focused on your subscription business</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="h-72 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2.5 rounded-xl text-xs leading-relaxed ${
              m.role === 'user'
                ? 'bg-emerald-500 text-black font-medium'
                : 'bg-white/[0.05] text-white/80'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.05] rounded-xl px-3 py-2.5 flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white/80 px-3 py-1.5 rounded-full transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/5 px-5 py-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
          placeholder="Ask about your subscribers..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-black font-semibold px-3 py-2 rounded-lg text-xs transition-colors"
        >
          ↑
        </button>
      </div>
    </div>
  )
}