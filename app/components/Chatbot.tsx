'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog } from '@headlessui/react'
import { motion } from 'framer-motion'
import { auth } from '@/firebase/authClient'
import { usePathname } from 'next/navigation'
import SendIcon from '@mui/icons-material/Send'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatbotProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export default function Chatbot({ open, setOpen }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [userLoggedIn, setUserLoggedIn] = useState(false)

  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserLoggedIn(!!user)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content:
            'Hallo! 👋 Ich bin dein persönlicher Hilfsbot und helfe dir gerne bei Problemen oder bei der Suche nach Geschenk Ideen für dich selbst.',
        },
      ])
    }
  }, [open])

  const sendMessage = async () => {
    const messageText = input.trim()
    if (!messageText) return

    const userMessage: ChatMessage = { role: 'user', content: messageText }
    const newMessages: ChatMessage[] = [...messages, userMessage]

    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const safeMessages: ChatMessage[] = newMessages.map((m) => ({
        role: m.role,
        content: m.content || '',
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: safeMessages }),
      })

      const data = await res.json()

      if (data.text) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.text,
        }
        setMessages([...safeMessages, assistantMessage])
      }
    } catch (err) {
      console.error(err)
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: 'Ups, es gab ein Problem beim Abrufen der Antwort. 😅',
      }
      setMessages([...newMessages, assistantMessage])
    } finally {
      setLoading(false)
    }
  }

  if (!userLoggedIn || pathname === '/' || pathname === '/login') return null

  return (
    <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-2">
        <Dialog.Panel
          className="
            bg-red-900
            rounded-2xl
            shadow-2xl
            w-full
            max-w-[480px]
            h-[600px]
            flex flex-col
            overflow-hidden
            border-2 border-yellow-400
          "
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-yellow-400">
            <h2 className="text-xl font-bold text-yellow-300">SamiGPT-67</h2>
            <IconButton
              onClick={() => setOpen(false)}
              sx={{
                color: '#FFD700',
                '&:hover': { color: '#FFFF66', backgroundColor: 'rgba(255,255,0,0.2)' },
                p: 1,
              }}
              size="large"
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </div>

          {/* Chat body */}
          <div className="flex flex-col gap-2 overflow-y-auto p-3 bg-red-800 flex-1">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: m.role === 'user' ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-xl break-words max-w-[80%] ${
                  m.role === 'user'
                    ? 'bg-yellow-400 text-red-900 self-end'
                    : 'bg-yellow-200 text-red-900 self-start'
                }`}
              >
                {m.content}
              </motion.div>
            ))}

            {loading && (
              <motion.div
                className="flex gap-2 self-start p-2 bg-yellow-300 text-red-900 rounded-xl max-w-[40%]"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                <span>KI überlegt…</span>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-yellow-400 bg-red-800">
            <input
              type="text"
              placeholder="Stelle irgendeine Frage..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-grow p-3 rounded-xl bg-red-900 text-yellow-100 border border-yellow-400 focus:outline-none"
              style={{ fontSize: '16px' }}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-yellow-400 text-red-900 px-4 py-2 rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? '…' : <SendIcon />}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
