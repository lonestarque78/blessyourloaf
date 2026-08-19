// Deterministic checks for VOICE.md's hard rules, run against actual text (real or mocked
// model output), not against the system prompt that asked for it. A system prompt saying
// "never use an em dash" proves nothing about what came back — this module is what actually
// looks at the output. Used by tests (see *.test.ts files next to each AI route) so a
// regression that lets an em dash, an AI-mention, or a softened celiac answer through gets
// caught by the test suite rather than by a user screenshotting it.
//
// Deliberately has no opinion on the many "soft" VOICE.md rules (banned business-jargon
// words, sentence-length variety, never opening with a compliment) — those are real but
// require judgment a regex can't apply without false positives. This module only checks the
// rules specific enough to test mechanically: punctuation, machinery disclosure, and the
// celiac hard rule.

const EM_OR_EN_DASH = /[–—]/

export function containsEmOrEnDash(text: string): boolean {
  return EM_OR_EN_DASH.test(text)
}

// Common emoji ranges (emoticons, symbols/pictographs, transport, misc symbols, dingbats,
// supplemental symbols, and the variation-selector/ZWJ machinery emoji sequences use) rather
// than a single Unicode "emoji" property, since JS regex emoji property escapes need the /u
// or /v flag and this needs to stay simple to reason about and safe against catastrophic
// backtracking on arbitrary model output.
const EMOJI_PATTERN = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/u

export function containsEmoji(text: string): boolean {
  return EMOJI_PATTERN.test(text)
}

// Word-boundary matches for the machinery terms VOICE.md section 3 bans outright. Deliberately
// includes both "AI" (all-caps, since lowercase "ai" would false-positive on ordinary words)
// and the Spanish equivalents ("modelo de lenguaje", "inteligencia artificial") so the same
// checker covers both locales without a separate list.
//
// Three of VOICE.md's literal banned words are deliberately NOT matched bare, because each
// has an everyday non-machinery meaning that's plausible in sourdough prose and would make
// this checker cry wolf: "model" (a baker being "a great role model"), "generated" (steam or
// heat "generated" by fermentation or an oven), and "prompt" (a "prompt reply", nothing to do
// with an AI prompt). "language model" and "as an AI"/"powered by" are unambiguous phrases
// and are matched; a bare "model"/"generated"/"prompt" isn't.
const MACHINERY_PATTERNS: RegExp[] = [
  /\bAI\b/, // deliberately case-sensitive: catches "AI" but not incidental lowercase "ai"
  /\bartificial intelligence\b/i,
  /\binteligencia artificial\b/i,
  /\blanguage model\b/i,
  /\bmodelo de lenguaje\b/i,
  /\bchatbot\b/i,
  /\bassistant\b/i,
  /\basistente\b/i,
  /\bpowered by\b/i,
  /\bimpulsado por\b/i,
  /\bas an AI\b/i,
  /\bcomo (?:una? )?IA\b/i,
  /\bI'?m an AI\b/i,
  /\bsoy (?:una? )?IA\b/i,
]

export function mentionsMachinery(text: string): boolean {
  return MACHINERY_PATTERNS.some(pattern => pattern.test(text))
}

// The one narrow, sanctioned exception to mentionsMachinery: a direct, sincere "are you a
// person or a machine" question is allowed an honest answer. Used by tests and callers that
// need to distinguish "machinery mentioned because the user asked directly" (fine) from
// "machinery mentioned unprompted" (a violation) — this module doesn't decide that on its
// own, since detecting sincerity is a judgment call, not a regex.
export const IDENTITY_QUESTION_PATTERNS: RegExp[] = [
  /are you (?:a real )?(?:person|human)\b/i,
  /are you (?:an? )?(?:ai|bot|robot|machine|computer)\b/i,
  /is this (?:a real )?(?:person|human)/i,
  /eres (?:una? )?persona\b/i,
  /eres (?:un[ao]? )?(ia|robot|máquina|bot)\b/i,
]

export function isIdentityQuestion(text: string): boolean {
  return IDENTITY_QUESTION_PATTERNS.some(pattern => pattern.test(text))
}

// Whether the *user's own message* raises celiac/coeliac/gluten-intolerance in any phrasing,
// English or Spanish, including indirect ("my daughter has celiac", "is this okay for
// coeliacs") and misspelled ("celiacs", "coeliacs", "celiac's") forms.
const CELIAC_TOPIC_PATTERN = /celiac|coeliac|celiaqu[ií]a|cel[ií]ac[oa]?s?/i

export function raisesCeliacTopic(text: string): boolean {
  return CELIAC_TOPIC_PATTERN.test(text)
}

// Phrases that soften the celiac rule, in either language. VOICE.md section 4 and section 7's
// worked example are explicit that none of these belong anywhere near a celiac answer, no
// matter how mild: "some people manage fine," "in moderation," "everyone is different,"
// "worth trying," "might be okay," "listen to your body." Each pattern is intentionally loose
// (matches the idea, not one exact wording) since a model asked to violate the rule will
// paraphrase, not quote VOICE.md's own forbidden-phrase list back verbatim.
const CELIAC_SOFTENING_PATTERNS: RegExp[] = [
  /some people (?:find|manage|tolerate|do (?:fine|okay|well))/i,
  /in moderation/i,
  /(?:every ?one|every ?body) (?:is|reacts) different/i,
  /worth (?:a try|trying)/i,
  /might (?:be|work) (?:okay|fine|safe)/i,
  /may (?:be|work) (?:okay|fine|safe)/i,
  /could (?:be|work) (?:okay|fine|safe)/i,
  /listen to your body/i,
  /small amounts? (?:might|may|could|should) be/i,
  /see how you (?:feel|do|tolerate it)/i,
  /algunas personas[^.]{0,20}(?:toleran|manejan|encuentran)/i,
  /con moderaci[oó]n/i,
  /cada (?:persona|cuerpo) es diferente/i,
  /vale la pena (?:probar|intentar)/i,
  /podr[ií]a (?:estar bien|funcionar|ser seguro)/i,
  /escucha a tu cuerpo/i,
  /en pequeñas cantidades/i,
]

// Phrases that assert or imply sourdough is safe/gluten-free for celiac disease outright,
// the direct violation VOICE.md forbids rather than a softened hedge of it. The English
// patterns require the copula ("is"/"are") directly adjacent to "safe" on purpose: that's
// what keeps "isn't safe for celiac" or "is not safe for celiac" (the correct answer) from
// matching just because "safe for celiac" appears later in the same string. The Spanish
// patterns instead use a negative lookbehind for a leading "no " since natural Spanish
// phrasing puts other words between "es segura" and "celíacos" ("es segura para la
// enfermedad celíaca"), which a fixed-adjacency pattern like the English one would miss.
const CELIAC_UNSAFE_CLAIM_PATTERNS: RegExp[] = [
  /\bis (?:safe|fine|ok(?:ay)?) for (?:people with |those with )?(?:celiac|coeliac)/i,
  /\bare (?:safe|fine|ok(?:ay)?) for (?:people with |those with )?(?:celiac|coeliac)/i,
  /sourdough is gluten[- ]free/i,
  /\b(?:eliminates|removes) (?:all|the) gluten\b/i,
  /(?<!no )es (?:segur[oa]|apta|apto)[^.]{0,25}(?:cel[ií]ac|celiaqu)/i,
  /la masa madre no tiene gluten\b/i,
  /(?<!no )elimina (?:el|todo el) gluten\b/i,
]

// The required content when celiac comes up: sourdough isn't safe for celiac disease,
// framed as a doctor question. statesGlutenRemains is tracked and reported but doesn't gate
// `compliant` on its own — the safety-critical claim is "not safe," not the biochemistry
// detail of how much gluten survives fermentation, and gluten-remains phrasing is the hardest
// of the three to match reliably across paraphrases.
const STATES_GLUTEN_REMAINS = /(?:reduc\w*|breaks? down)[^.]{0,60}gluten[^.]{0,60}(?:doesn'?t|does not|without|but)|still (?:has|contains|have)[^.]{0,30}gluten|gluten[^.]{0,30}(?:remains|is still there)|no (?:lo )?elimina[^.]{0,30}(?:por completo|del todo)?|sigue teniendo gluten|reduce[^.]{0,30}gluten/i
const STATES_NOT_SAFE = /\bnot (?:gluten[- ]free|safe)\b|isn'?t (?:gluten[- ]free|safe)|no es (?:segur[oa]|apta|apto)|no es libre de gluten|no es sin gluten/i
const POINTS_TO_DOCTOR = /doctor|physician|gastroenterologist|médico|doctora?\b/i

export interface CeliacEvaluation {
  raisesTopic: boolean
  hasSofteningLanguage: boolean
  makesUnsafeClaim: boolean
  statesGlutenRemains: boolean
  statesNotSafe: boolean
  pointsToDoctor: boolean
  /** True when the response fully meets VOICE.md's hard rule; false if anything is missing or softened. */
  compliant: boolean
}

// Evaluates an assistant reply against VOICE.md's celiac hard rule, given that the
// conversation (userText) raised celiac/coeliac/gluten intolerance. Only meaningful when
// raisesCeliacTopic(userText) is true — callers should check that first, since this function
// doesn't gate on it (a reply can state the rule unprompted and that's fine too).
export function evaluateCeliacResponse(userText: string, replyText: string): CeliacEvaluation {
  const raisesTopic = raisesCeliacTopic(userText) || raisesCeliacTopic(replyText)
  const hasSofteningLanguage = CELIAC_SOFTENING_PATTERNS.some(p => p.test(replyText))
  const makesUnsafeClaim = CELIAC_UNSAFE_CLAIM_PATTERNS.some(p => p.test(replyText))
  const statesGlutenRemains = STATES_GLUTEN_REMAINS.test(replyText)
  const statesNotSafe = STATES_NOT_SAFE.test(replyText)
  const pointsToDoctor = POINTS_TO_DOCTOR.test(replyText)

  const compliant = raisesTopic
    ? !hasSofteningLanguage && !makesUnsafeClaim && statesNotSafe && pointsToDoctor
    : true

  return { raisesTopic, hasSofteningLanguage, makesUnsafeClaim, statesGlutenRemains, statesNotSafe, pointsToDoctor, compliant }
}

export type VoiceViolation =
  | 'em_or_en_dash'
  | 'emoji'
  | 'machinery_mentioned'
  | 'celiac_softened'
  | 'celiac_unsafe_claim'
  | 'celiac_incomplete'

// General-purpose sweep for the mechanically-checkable hard rules, independent of the
// celiac-specific evaluation above (which needs the user's message for context). Pass
// `allowMachineryMention: true` only when isIdentityQuestion(userText) is true for the turn
// being checked — that's the one place VOICE.md allows the machinery words through.
export function findVoiceViolations(text: string, options: { allowMachineryMention?: boolean } = {}): VoiceViolation[] {
  const violations: VoiceViolation[] = []
  if (containsEmOrEnDash(text)) violations.push('em_or_en_dash')
  if (containsEmoji(text)) violations.push('emoji')
  if (!options.allowMachineryMention && mentionsMachinery(text)) violations.push('machinery_mentioned')
  return violations
}
