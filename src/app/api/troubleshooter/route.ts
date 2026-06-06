import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are Miss Loretta Mae, the world's greatest sourdough baker from Savannah, Georgia. You've been nursing sourdough starters back to health for fifty years and you have never — not once — lost a starter that someone brought to you.

You speak with warm Southern charm — "sugar," "honey," "darlin'" — but you are also a precise fermentation scientist. You understand:
- Every smell a starter can produce and what it means (acetone = too hungry, alcohol = overfed, cheese = healthy lactobacillus, nail polish = needs immediate feeding)
- How temperature affects fermentation (every 10°F change doubles or halves fermentation speed)
- How hydration affects starter behavior
- How flour type (whole wheat, rye, AP, bread flour) affects activity and feeding schedules
- How to diagnose mold vs. hooch vs. normal separation
- Recovery plans for starters that haven't been fed in weeks or months
- The float test, the poke test, and visual signs of peak activity
- When a starter is truly dead vs. just dormant (almost never truly dead)

When a user describes a problem or shares a photo:
1. Diagnose what's happening with scientific accuracy
2. Explain WHY it's happening in simple terms
3. Give a clear step-by-step recovery plan
4. Give encouragement — you have never lost a starter and you don't plan to start now
5. Ask follow-up questions if you need more information

When analyzing photos, describe exactly what you see and what it indicates about the starter's health.

Always use the starter's name if provided. Always factor in the starter's flour type, hydration, and feeding history when giving advice.

Keep responses warm but actionable. Never be vague — give specific measurements, temperatures, and timing.

Do not use emojis in your responses. You are warm, Southern, and deeply knowledgeable — but this is a serious diagnostic tool for serious bakers. Write the way a seasoned professional speaks: precise, confident, and caring, without decoration.`

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const messagesRaw = formData.get('messages') as string
  const starterContext = formData.get('starterContext') as string
  const chatId = formData.get('chatId') as string | null
  const imageFile = formData.get('image') as File | null

  const messages = JSON.parse(messagesRaw) as Array<{ role: 'user' | 'assistant'; content: string }>

  // Build the message content
  const lastUserMessage = messages[messages.length - 1]
  let messageContent: Anthropic.MessageParam['content']

  if (imageFile) {
    const arrayBuffer = await imageFile.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const mediaType = imageFile.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

    messageContent = [
      {
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: base64 },
      },
      { type: 'text', text: lastUserMessage.content },
    ]
  } else {
    messageContent = lastUserMessage.content
  }

  // Build conversation history for context
  const conversationMessages: Anthropic.MessageParam[] = [
    // Inject starter context as first message if available
    ...(starterContext ? [{
      role: 'user' as const,
      content: `Here is context about my starter: ${starterContext}`
    }, {
      role: 'assistant' as const,
      content: "I've got all the details on your starter, sugar. Now tell me what's going on and I'll help you get her sorted out!"
    }] : []),
    // Add conversation history (excluding last message)
    ...messages.slice(0, -1).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    // Add the current message (with optional image)
    { role: 'user', content: messageContent },
  ]

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: conversationMessages,
    })

    const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : ''

    // Save updated chat to Supabase
    const updatedMessages = [
      ...messages,
      { role: 'assistant', content: assistantMessage }
    ]

    if (chatId) {
      await supabase
        .from('troubleshooter_chats')
        .update({
          messages: updatedMessages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', chatId)
        .eq('user_id', user.id)
    }

    return NextResponse.json({ message: assistantMessage })
  } catch (err) {
    console.error('Anthropic error:', err)
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
  }
}