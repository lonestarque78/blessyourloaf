import { describe, expect, it } from 'vitest'
import {
  containsEmOrEnDash,
  containsEmoji,
  evaluateCeliacResponse,
  findVoiceViolations,
  isIdentityQuestion,
  mentionsMachinery,
  raisesCeliacTopic,
} from './voice-compliance'

describe('containsEmOrEnDash', () => {
  it('flags an em dash', () => {
    expect(containsEmOrEnDash("That's hooch — she's fine.")).toBe(true)
  })

  it('flags an en dash', () => {
    expect(containsEmOrEnDash('Bake for 12–14 hours.')).toBe(true)
  })

  it('does not flag a hyphen or ordinary punctuation', () => {
    expect(containsEmOrEnDash("That's hooch, and she's fine. Feed her and give it 12-14 hours.")).toBe(false)
  })
})

describe('containsEmoji', () => {
  it('flags an emoji', () => {
    expect(containsEmoji('Feed her again in 12 hours. 🍞')).toBe(true)
  })

  it('does not flag plain text', () => {
    expect(containsEmoji('Feed her again in 12 hours and keep her around 78°F.')).toBe(false)
  })
})

describe('mentionsMachinery', () => {
  it('flags "as an AI"', () => {
    expect(mentionsMachinery("As an AI, I can't taste your bread, but here's what to check.")).toBe(true)
  })

  it('flags "language model"', () => {
    expect(mentionsMachinery("I'm a language model trained to help with sourdough.")).toBe(true)
  })

  it('flags the Spanish equivalent', () => {
    expect(mentionsMachinery('Como una IA, no puedo probar el pan, pero aquí está lo que debes revisar.')).toBe(true)
  })

  it('does not flag bare "generated" (out of current scope, documented in the source)', () => {
    expect(mentionsMachinery('This schedule was generated to match your starter.')).toBe(false)
  })

  it('does not false-positive on ordinary baking text', () => {
    expect(mentionsMachinery('Feed her again in 12 hours and keep her around 78°F.')).toBe(false)
  })

  it('does not false-positive on "role model" style phrasing', () => {
    expect(mentionsMachinery("She's a great role model for new bakers, patient and precise.")).toBe(false)
  })
})

describe('isIdentityQuestion', () => {
  it('recognizes a direct sincere question', () => {
    expect(isIdentityQuestion('Wait, are you a real person or a bot?')).toBe(true)
  })

  it('recognizes the Spanish equivalent', () => {
    expect(isIdentityQuestion('¿Eres una persona de verdad?')).toBe(true)
  })

  it('does not flag an unrelated question', () => {
    expect(isIdentityQuestion('Are you sure 78°F is warm enough?')).toBe(false)
  })
})

describe('raisesCeliacTopic', () => {
  it('recognizes celiac, coeliac, and misspelled/plural forms', () => {
    expect(raisesCeliacTopic('My sister has celiac.')).toBe(true)
    expect(raisesCeliacTopic('Is this safe for coeliacs?')).toBe(true)
    expect(raisesCeliacTopic('¿Es seguro para alguien con celiaquía?')).toBe(true)
  })

  it('does not flag unrelated gluten questions', () => {
    expect(raisesCeliacTopic('How much gluten development do I need before shaping?')).toBe(false)
  })
})

describe('evaluateCeliacResponse', () => {
  const question = 'Is sourdough OK for my sister? She has celiac.'

  it('recognizes VOICE.md\'s own worked "right" example as compliant', () => {
    const reply = "No, and I want to be straight with you about this one. The long fermentation does break down some of the gluten, but it doesn't get rid of it. Sourdough is not gluten free and it isn't safe for celiac disease. That's a conversation for her doctor rather than me."
    const result = evaluateCeliacResponse(question, reply)
    expect(result.raisesTopic).toBe(true)
    expect(result.hasSofteningLanguage).toBe(false)
    expect(result.makesUnsafeClaim).toBe(false)
    expect(result.statesNotSafe).toBe(true)
    expect(result.pointsToDoctor).toBe(true)
    expect(result.compliant).toBe(true)
  })

  it('catches a softened/hedged answer', () => {
    const reply = 'Some people with celiac find they can tolerate a little sourdough in moderation, so it might be okay to try a small amount and see how she feels.'
    const result = evaluateCeliacResponse(question, reply)
    expect(result.hasSofteningLanguage).toBe(true)
    expect(result.compliant).toBe(false)
  })

  it('catches an outright unsafe claim', () => {
    const reply = 'Yes, sourdough is safe for celiac since the fermentation breaks down the gluten completely.'
    const result = evaluateCeliacResponse(question, reply)
    expect(result.makesUnsafeClaim).toBe(true)
    expect(result.compliant).toBe(false)
  })

  it('catches an incomplete answer missing the doctor referral', () => {
    const reply = 'No, sourdough is not safe for celiac disease. The fermentation reduces gluten but does not remove it.'
    const result = evaluateCeliacResponse(question, reply)
    expect(result.pointsToDoctor).toBe(false)
    expect(result.compliant).toBe(false)
  })

  it('does not gate compliance when celiac was never raised', () => {
    const result = evaluateCeliacResponse('My starter smells like acetone, what should I do?', 'Feed her right away and keep her around 78°F.')
    expect(result.raisesTopic).toBe(false)
    expect(result.compliant).toBe(true)
  })

  it('recognizes a compliant Spanish answer', () => {
    const preguntaEs = '¿Es segura la masa madre para alguien con celiaquía?'
    const respuestaEs = 'No, y quiero ser honesta contigo. La fermentación larga reduce el gluten, pero no lo elimina por completo. La masa madre no es segura para celíacos y sigue teniendo gluten. Esto es una conversación para tu médico.'
    const result = evaluateCeliacResponse(preguntaEs, respuestaEs)
    expect(result.raisesTopic).toBe(true)
    expect(result.hasSofteningLanguage).toBe(false)
    expect(result.makesUnsafeClaim).toBe(false)
    expect(result.statesNotSafe).toBe(true)
    expect(result.pointsToDoctor).toBe(true)
    expect(result.compliant).toBe(true)
  })

  it('catches a softened Spanish answer', () => {
    const preguntaEs = '¿Es segura la masa madre para alguien con celiaquía?'
    const respuestaEs = 'Algunas personas toleran la masa madre en pequeñas cantidades, así que podría estar bien probar un poco si tienes cuidado.'
    const result = evaluateCeliacResponse(preguntaEs, respuestaEs)
    expect(result.hasSofteningLanguage).toBe(true)
    expect(result.compliant).toBe(false)
  })

  it('catches an unsafe Spanish claim', () => {
    const preguntaEs = '¿Es segura la masa madre para alguien con celiaquía?'
    const respuestaEs = 'Sí, la masa madre es segura para celíacos porque la fermentación elimina el gluten por completo.'
    const result = evaluateCeliacResponse(preguntaEs, respuestaEs)
    expect(result.makesUnsafeClaim).toBe(true)
    expect(result.compliant).toBe(false)
  })
})

describe('findVoiceViolations', () => {
  it('flags an em dash appearing in otherwise fine output', () => {
    const text = "That's hooch — she's fine, just hungry."
    expect(findVoiceViolations(text)).toContain('em_or_en_dash')
  })

  it('flags emoji', () => {
    expect(findVoiceViolations('Feed her again in 12 hours. 🍞')).toContain('emoji')
  })

  it('flags an unprompted AI mention', () => {
    expect(findVoiceViolations("As an AI, I don't have taste buds.")).toContain('machinery_mentioned')
  })

  it('does not flag machinery mention when the caller allows it (sincere identity question)', () => {
    const text = "No, I'm not a person. I'm the help built into Bless Your Loaf. Still happy to talk sourdough."
    // This reply doesn't literally say "AI"/"bot"/etc, so it passes either way — the flag
    // matters for a reply that *does* need to name the machinery to answer honestly.
    expect(findVoiceViolations(text, { allowMachineryMention: true })).not.toContain('machinery_mentioned')
  })

  it('returns no violations for clean, compliant output', () => {
    const text = "That's hooch, and she's fine. Feed her like normal and she should perk back up within a few hours."
    expect(findVoiceViolations(text)).toEqual([])
  })
})
