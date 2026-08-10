import { describe, expect, it } from 'vitest'
import { feedingReminderCopy } from './feeding-reminder-copy'

describe('feedingReminderCopy', () => {
  it('renders English reminder copy with the starter name interpolated', () => {
    const { title, body } = feedingReminderCopy('en', 'Willow')
    expect(title).toBe('Feeding time 🫙')
    expect(body).toContain('Willow')
  })

  it('renders Spanish reminder copy with the starter name interpolated', () => {
    const { title, body } = feedingReminderCopy('es', 'Willow')
    expect(title).toBe('Hora de alimentar 🫙')
    expect(body).toContain('Willow')
  })
})
