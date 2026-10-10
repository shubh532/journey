import { useEffect, useRef, useState } from 'react'
import type { JourneyOverview } from '../journey/overview'
import { buildChatReply, type ChatReply } from './replies'

export type ChatMessage = ChatReply & { id: number; role: 'user' | 'assistant' }

const REPLY_DELAY_MS = 700

export function useJourneyChat(overview: JourneyOverview) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: 'assistant',
      text: `Hi! I'm Journey AI. Ask me for activity ideas or anything about your ${overview.days}-day trip to ${overview.plan.destination}.`,
    },
  ])
  const [pending, setPending] = useState(false)
  const nextId = useRef(1)
  const timer = useRef<number>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function send(raw: string) {
    const text = raw.trim()
    if (!text || pending) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setMessages((current) => [...current, { id: nextId.current++, role: 'user', text }])
    setPending(true)
    timer.current = window.setTimeout(() => {
      const reply = buildChatReply(overview, text)
      setMessages((current) => [...current, { id: nextId.current++, role: 'assistant', ...reply }])
      setPending(false)
    }, reduceMotion ? 0 : REPLY_DELAY_MS)
  }

  return { messages, pending, send }
}
