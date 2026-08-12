'use client'

import { useState, useEffect, useRef } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { INTL_LOCALE, type Locale } from '@/i18n/locale'
import { renderMarkdown } from '@/lib/render-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// Unlike the troubleshooter, this chat isn't persisted to Supabase — a substitution question
// is a one-off lookup, not an ongoing multi-day conversation about one starter's health, so
// there's no need for the troubleshooter_chats-style 48-hour/2-week retention. It simply
// resets on reload.
export default function IngredientSubstitutionPage() {
  const t = useTranslations('IngredientSubstitution')
  const locale = useLocale() as Locale
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const QUICK_QUESTIONS = [
    t('quickQuestions.flour'),
    t('quickQuestions.dutchOven'),
    t('quickQuestions.dairy'),
    t('quickQuestions.sweetener'),
    t('quickQuestions.noStarter'),
  ]

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  async function sendMessage() {
    if (!input.trim()) return
    setSending(true)

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')

    try {
      const res = await fetch('/api/ingredient-substitution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          locale,
        }),
      })
      const data = await res.json()

      if (data.message) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date().toISOString(),
        }
        setMessages([...updatedMessages, assistantMessage])
      }
    } catch (err) {
      console.error(err)
    }

    setSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function sendQuickQuestion(q: string) {
    setInput(q)
    textareaRef.current?.focus()
  }

  return (
    <div className="fixed inset-0 z-10 flex flex-col pt-16" style={{ background: '#fdf6f0' }}>
      {/* Header */}
      <div className="bg-white border-b border-[#f0e4db] px-6 py-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-playfair text-2xl font-bold text-[#3d2b1f]">{t('title')}</h1>
          <p className="font-lora italic text-sm text-[#9a7060]">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-3">
                {t('emptyTitle')}
              </h2>
              <p className="font-lora italic text-[#9a7060] mb-8 max-w-md mx-auto">
                {t('emptySubtitle')}
              </p>

              {/* Quick questions */}
              <div className="grid grid-cols-1 gap-3 max-w-lg mx-auto">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => sendQuickQuestion(q)}
                    className="text-left bg-white border border-[#e8d5c8] rounded-xl px-4 py-3 font-lora text-sm text-[#7a4f3a] hover:border-[#c9956c] hover:bg-[#f9ede5] transition-all">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-lora text-xs text-[#b8896e]">{t('assistantLabel')}</span>
                  </div>
                )}

                <div className={`rounded-2xl px-5 py-4 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white rounded-br-sm'
                    : 'bg-white border border-[#f0e4db] text-[#3d2b1f] rounded-bl-sm shadow-sm'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div
                      className="font-lora text-sm text-[#3d2b1f]"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                    />
                  ) : (
                    <p className="font-lora text-sm leading-relaxed whitespace-pre-wrap text-white">
                      {msg.content}
                    </p>
                  )}
                </div>

                <span className="font-lora text-xs text-[#b8896e]">
                  {new Date(msg.timestamp).toLocaleTimeString(INTL_LOCALE[locale], { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#f0e4db] rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 rounded-full bg-[#c9956c] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#c9956c] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#c9956c] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area - persistent at bottom */}
      <div className="bg-white border-t border-[#f0e4db] px-6 py-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 border border-[#e8d5c8] rounded-2xl overflow-hidden focus-within:border-[#c9956c] transition-colors bg-[#fdf9f6]">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('inputPlaceholder')}
                rows={2}
                className="w-full px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none bg-transparent resize-none"
              />
            </div>

            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white flex items-center justify-center hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:hover:translate-y-0 mb-0.5">
              →
            </button>
          </div>

          <p className="font-lora text-xs text-[#b8896e] mt-2 text-center">
            {t('footerNote')}
          </p>
        </div>
      </div>
    </div>
  )
}
