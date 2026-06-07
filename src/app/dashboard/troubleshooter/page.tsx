'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
  image?: string
  timestamp: string
}

interface Starter {
  id: string
  name: string
  flour_type: string
  hydration_percent: number
  born_at: string
}

interface Feeding {
  rise_percent: number | null
  fed_at: string
  smell: string | null
}

function renderMarkdown(text: string): string {
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const inline = (s: string) => escape(s).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  const blocks: string[] = []

  for (const para of text.split(/\n\n+/)) {
    const lines = para.split('\n')
    let listItems: string[] = []
    let paraLines: string[] = []

    const flushList = () => {
      if (listItems.length > 0) {
        blocks.push(`<ul class="list-disc list-inside space-y-1 my-2 pl-2">${listItems.join('')}</ul>`)
        listItems = []
      }
    }
    const flushPara = () => {
      if (paraLines.length > 0) {
        blocks.push(`<p class="leading-relaxed mb-2">${paraLines.join('<br />')}</p>`)
        paraLines = []
      }
    }

    for (const line of lines) {
      if (/^###\s+/.test(line)) {
        flushPara(); flushList()
        blocks.push(`<p class="font-semibold text-sm text-[#5a3a2a] mt-3 mb-0.5">${inline(line.replace(/^###\s+/, ''))}</p>`)
      } else if (/^##\s+/.test(line)) {
        flushPara(); flushList()
        blocks.push(`<p class="font-semibold text-[#5a3a2a] mt-3 mb-0.5">${inline(line.replace(/^##\s+/, ''))}</p>`)
      } else if (/^[-*]\s+/.test(line)) {
        flushPara()
        listItems.push(`<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`)
      } else if (line.trim()) {
        flushList()
        paraLines.push(inline(line))
      }
    }

    flushPara(); flushList()
  }

  return blocks.join('')
}

const STARTER_QUESTIONS = [
  "How does she smell? (yeasty, sour, like nail polish, like cheese...)",
  "What does her surface look like? Any bubbles, hooch, or mold?",
  "When did you last feed her?",
  "Has her rise activity changed recently?",
  "What's the temperature in your kitchen?",
]

export default function TroubleshooterPage() {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)
  const [starters, setStarters] = useState<Starter[]>([])
  const [selectedStarter, setSelectedStarter] = useState<Starter | null>(null)
  const [lastFeeding, setLastFeeding] = useState<Feeding | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    // Load starters
    const { data: startersData } = await supabase
      .from('starters')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (startersData && startersData.length > 0) {
      setStarters(startersData)
      const primary = startersData[0]
      setSelectedStarter(primary)

      // Load last feeding for primary starter
      const { data: feedingData } = await supabase
        .from('feedings')
        .select('rise_percent, fed_at, smell')
        .eq('starter_id', primary.id)
        .order('fed_at', { ascending: false })
        .limit(1)
        .single()

      if (feedingData) setLastFeeding(feedingData)
    }

    // Check for existing active chat (within 48 hours)
    const { data: existingChat } = await supabase
      .from('troubleshooter_chats')
      .select('*')
      .eq('user_id', user.id)
      .gt('expires_at', new Date().toISOString())
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (existingChat) {
      setChatId(existingChat.id)
      setMessages(existingChat.messages || [])
    } else {
      // Create a new chat
      const { data: newChat } = await supabase
        .from('troubleshooter_chats')
        .insert({
          user_id: user.id,
          messages: [],
        })
        .select()
        .single()

      if (newChat) setChatId(newChat.id)
    }

    setLoading(false)
  }

  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        // Max dimension 800px
        const maxDim = 800
        let { width, height } = img
        if (width > height && width > maxDim) {
          height = (height * maxDim) / width
          width = maxDim
        } else if (height > maxDim) {
          width = (width * maxDim) / height
          height = maxDim
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(blob => {
          URL.revokeObjectURL(url)
          if (blob) {
            resolve(new File([blob], 'starter.jpg', { type: 'image/jpeg' }))
          } else {
            resolve(file)
          }
        }, 'image/jpeg', 0.7) // 70% quality
      }
      img.src = url
    })
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
    setImage(file)
  }

  function getStarterContext() {
    if (!selectedStarter) return ''
    return `
Starter name: ${selectedStarter.name}
Flour type: ${selectedStarter.flour_type}
Hydration: ${selectedStarter.hydration_percent}%
Born: ${new Date(selectedStarter.born_at).toLocaleDateString()}
${lastFeeding ? `Last fed: ${new Date(lastFeeding.fed_at).toLocaleString()}
Last rise activity: ${lastFeeding.rise_percent || 'not recorded'}%
Last smell: ${lastFeeding.smell || 'not recorded'}` : 'No feedings logged yet'}
    `.trim()
  }

  async function sendMessage() {
    if (!input.trim() && !image) return
    setSending(true)

    const userMessage: Message = {
      role: 'user',
      content: input,
      image: imagePreview || undefined,
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setImagePreview(null)

    // Compress image if present
    let compressedImage: File | null = null
    if (image) {
      compressedImage = await compressImage(image)
      setImage(null)
    }

    // Save user message to Supabase
    if (chatId) {
      await supabase
        .from('troubleshooter_chats')
        .update({ messages: updatedMessages })
        .eq('id', chatId)
    }

    const formData = new FormData()
    formData.append('messages', JSON.stringify(updatedMessages.map(m => ({
      role: m.role,
      content: m.content,
    }))))
    formData.append('starterContext', getStarterContext())
    if (chatId) formData.append('chatId', chatId)
    if (compressedImage) formData.append('image', compressedImage)

    try {
      const res = await fetch('/api/troubleshooter', {
        method: 'POST',
        body: formData,
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

  function useQuickQuestion(q: string) {
    setInput(q)
    textareaRef.current?.focus()
  }

  return (
    <div className="fixed inset-0 z-10 flex flex-col pt-16" style={{ background: '#fdf6f0' }}>
      {/* Header */}
      <div className="bg-white border-b border-[#f0e4db] px-6 py-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-playfair text-2xl font-bold text-[#3d2b1f]">Starter Troubleshooter</h1>
            </div>
            <p className="font-lora italic text-sm text-[#9a7060]">
              "I have never lost a starter, darlin'. I don't plan to start now."
            </p>
          </div>

          {/* Starter selector */}
          {!loading && starters.length > 1 && (
            <select
              value={selectedStarter?.id || ''}
              onChange={e => {
                const s = starters.find(s => s.id === e.target.value)
                if (s) setSelectedStarter(s)
              }}
              className="border border-[#e8d5c8] rounded-xl px-3 py-2 font-lora text-sm text-[#3d2b1f] outline-none focus:border-[#c9956c] bg-[#fdf9f6]">
              {starters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
        </div>

        {/* Active starter info - skeleton while loading */}
        {loading ? (
          <div className="max-w-3xl mx-auto mt-3">
            <div className="h-9 bg-[#f0e4db] rounded-xl animate-pulse" />
          </div>
        ) : selectedStarter ? (
          <div className="max-w-3xl mx-auto mt-3">
            <div className="bg-[#f9ede5] rounded-xl px-4 py-2.5 flex flex-wrap gap-4">
              <span className="font-lora text-xs text-[#7a4f3a]">
                <strong>{selectedStarter.name}</strong>
              </span>
              <span className="font-lora text-xs text-[#7a4f3a]">
                {selectedStarter.flour_type} · {selectedStarter.hydration_percent}% hydration
              </span>
              {lastFeeding && (
                <>
                  <span className="font-lora text-xs text-[#7a4f3a]">
                    Last fed: {new Date(lastFeeding.fed_at).toLocaleDateString()}
                  </span>
                  {lastFeeding.rise_percent && (
                    <span className="font-lora text-xs text-[#7a4f3a]">
                      Rise: {lastFeeding.rise_percent}%
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <h2 className="font-playfair text-2xl font-bold text-[#3d2b1f] mb-3">
                Tell Miss Loretta Mae what's wrong, sugar.
              </h2>
              <p className="font-lora italic text-[#9a7060] mb-8 max-w-md mx-auto">
                Describe what you're seeing, upload a photo, or answer one of these common questions to get started.
              </p>

              {/* Quick questions */}
              <div className="grid grid-cols-1 gap-3 max-w-lg mx-auto">
                {STARTER_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => useQuickQuestion(q)}
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
                    <span className="font-lora text-xs text-[#b8896e]">Miss Loretta Mae</span>
                  </div>
                )}

                {msg.image && (
                  <img src={msg.image} alt="Starter photo" className="rounded-xl max-w-xs mb-2 shadow-md" />
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
                  {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
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
          {/* Image preview */}
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-xl shadow-md" />
              <button
                onClick={() => { setImagePreview(null); setImage(null) }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                ×
              </button>
            </div>
          )}

          <div className="flex gap-3 items-end">
            {/* Photo upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 h-10 px-3 rounded-xl bg-[#f9ede5] text-[#b07d62] font-lora text-sm flex items-center justify-center hover:bg-[#f0d5c0] transition-colors mb-0.5">
              Photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden" />

            {/* Text input */}
            <div className="flex-1 border border-[#e8d5c8] rounded-2xl overflow-hidden focus-within:border-[#c9956c] transition-colors bg-[#fdf9f6]">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe what's going on with your starter, sugar... (Shift+Enter for new line)"
                rows={2}
                className="w-full px-4 py-3 font-lora text-sm text-[#3d2b1f] outline-none bg-transparent resize-none"
              />
            </div>

            {/* Send button */}
            <button
              onClick={sendMessage}
              disabled={sending || (!input.trim() && !image)}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-[#c9956c] to-[#b07d62] text-white flex items-center justify-center hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:hover:translate-y-0 mb-0.5">
              →
            </button>
          </div>

          <p className="font-lora text-xs text-[#b8896e] mt-2 text-center">
            Chat is saved for 48 hours · History kept for 2 weeks
          </p>
        </div>
      </div>
    </div>
  )
}