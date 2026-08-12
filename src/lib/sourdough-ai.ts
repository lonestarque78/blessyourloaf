import type { Locale } from '@/i18n/locale'

// Shared by every conversational AI skill (troubleshooter, ingredient substitution) that
// needs the "stay on topic" cost-saving fast path described in CLAUDE.md's brand voice
// section. Cheap keyword pre-check so an obviously off-topic message (no baking terms at
// all) never reaches the Anthropic call — saves latency and quota on messages like "write
// me a poem." Deliberately conservative: short replies (<=4 words) always pass through,
// since mid-conversation answers like "about 3 days ago" or "no bubbles" won't repeat
// baking vocabulary but are clearly still part of an ongoing conversation. Longer messages
// need at least one on-topic term. This is a cost-saving fast path only, not the source of
// truth — each route's system prompt is the actual hard boundary, and is what catches
// anything (including photo uploads) that slips past this.
//
// Moved here unchanged from troubleshooter/route.ts (previously the only caller) so
// ingredient-substitution can reuse it. Don't tighten this list without checking it
// against real multi-turn troubleshooter conversations first — over-tightening will start
// blocking legitimate replies there. Callers that need extra on-topic terms (e.g.
// substitution-specific words like "allergic" or "dairy") should pass their own extended
// list to looksOffTopic rather than editing this one, so troubleshooter's behavior stays
// unaffected.
export const SOURDOUGH_KEYWORDS = [
  'starter', 'sourdough', 'dough', 'flour', 'water', 'hydrat', 'ferment', 'ris', 'feed',
  'bake', 'baking', 'baked', 'oven', 'proof', 'score', 'shap', 'knead', 'yeast', 'crumb',
  'crust', 'mold', 'mould', 'hooch', 'discard', 'banneton', 'lame', 'dutch oven', 'autolyse',
  'gluten', 'bulk', 'levain', 'culture', 'bran', 'rye', 'wheat', 'loaf', 'bread', 'smell',
  'bubbl', 'peak', 'starve', 'hungry', 'jar', 'lid', 'temperature', 'kitchen', 'recipe',
  'schedule', 'salt', 'stretch', 'fold', 'boule', 'batard', 'crackly', 'ear', 'retard',
]

export function looksOffTopic(text: string, keywords: readonly string[] = SOURDOUGH_KEYWORDS): boolean {
  const trimmed = text.trim()
  if (!trimmed || trimmed.split(/\s+/).length <= 4) return false
  const lower = trimmed.toLowerCase()
  return !keywords.some(kw => lower.includes(kw))
}

// Appended to a route's SYSTEM_PROMPT when the user's locale isn't English — the base
// prompt stays the single source of truth for tone/boundaries, this just redirects the
// output language. Shared across conversational (free-text reply) AI skills; JSON-output
// skills like recipe generation and recipe import localize specific fields instead and
// define their own instruction, since translating the whole response would break field
// values (category/difficulty enum keys, etc.) they depend on staying in English.
export const CHAT_LANGUAGE_INSTRUCTIONS: Record<Locale, string> = {
  en: '',
  es: '\n\nRespond in Spanish (español), using correct sourdough baking terminology — for example "masa madre" for starter, "hidratación" for hydration, "fermentación en bloque" for bulk fermentation, "fermentación final" for proofing, "autolisis" for autolyse. Keep the same warm, confident, precise tone described above, translated naturally rather than word-for-word.',
}
