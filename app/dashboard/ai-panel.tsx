'use client'

import { useState, useRef, useEffect } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
  isInsight?: boolean
}

const SUGGESTIONS = [
  'Who should I contact today?',
  'How do I reduce churn this month?',
  'Write a win-back email for my top at-risk subscriber',
  'What revenue opportunities do I have?',
]

export default function AIPanel({ userName, isEmpty }: { userName?: string; isEmpty?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialising, setInitialising] = useState(!isEmpty)
  const bottomRef = useRef<HTMLDivElement>(null)

  // On mount — generate the opening insight message (skip if no data yet)
  useEffect(() => {
    if (isEmpty) {
      setInitialising(false)
      return
    }
    const init = async () => {
      setInitialising(true)
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Generate a personalised morning briefing for ${userName || 'the business owner'}.
Start with "Hi ${userName || 'there'}!" then in 3-4 sentences tell them:
1. The most important thing happening in their subscription business today
2. Who needs attention and why
3. One specific action they should take right now
Be direct, warm, and specific to their actual data. No bullet points — flowing sentences only.`,
            history: [],
            isInitial: true,
          }),
        })
        const data = await res.json()
        setMessages([{
          role: 'assistant',
          content: data.reply || `Hi ${userName || 'there'}! Your subscription business looks healthy today. Run a churn analysis to see detailed insights about your subscribers.`,
          isInsight: true,
        }])
      } catch {
        setMessages([{
          role: 'assistant',
          content: `Hi ${userName || 'there'}! I'm your SubPilot AI. Ask me anything about your subscribers or churn risk.`,
        }])
      } finally {
        setInitialising(false)
      }
    }
    init()
  }, [userName, isEmpty])

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
          history: messages.slice(-6),
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
          <div className="text-sm font-semibold">SubPilot AI</div>
          <div className="text-xs text-white/30">Your subscription co-pilot</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto px-5 py-4 space-y-3">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-lg">✦</div>
            <div>
              <div className="text-sm font-medium text-white/70 mb-1">Your AI insights will appear here</div>
              <div className="text-xs text-white/35 leading-relaxed max-w-[240px]">Once you import your first subscribers, SubPilot AI will give you a daily briefing on who needs attention.</div>
            </div>
          </div>
        )}
        {!isEmpty && initialising && (
          <div className="flex justify-start">
            <div className="bg-white/[0.05] rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-white/20 border-t-emerald-400 rounded-full animate-spin" />
              <span className="text-xs text-white/40">Analysing your business...</span>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-xl text-xs leading-relaxed ${
              m.role === 'user'
                ? 'bg-emerald-500 text-black font-medium'
                : m.isInsight
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-white/80'
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

      {/* Suggestions — show after initial message loads */}
      {!isEmpty && !initialising && messages.length <= 1 && (
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
          placeholder={isEmpty ? 'Import subscribers to unlock AI chat...' : 'Ask anything about your subscribers...'}
          disabled={!!isEmpty}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        />
        <button
          onClick={() => send(input)}
          disabled={!!isEmpty || loading || !input.trim() || initialising}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-black font-semibold px-3 py-2 rounded-lg text-xs transition-colors"
        >
          ↑
        </button>
      </div>
    </div>
  )
}