export type BakePhase = 'autolyse' | 'bulk_fermentation' | 'proofing' | 'bake' | 'other'

export const BAKE_PHASE_LABELS: Record<BakePhase, string> = {
  autolyse: 'Autolyse',
  bulk_fermentation: 'Bulk Fermentation',
  proofing: 'Proofing',
  bake: 'Bake',
  other: 'Prep',
}

export const BAKE_PHASE_ICONS: Record<BakePhase, string> = {
  autolyse: '💧',
  bulk_fermentation: '🫧',
  proofing: '🧺',
  bake: '🔥',
  other: '🥣',
}

const VALID_PHASES = new Set<string>(Object.keys(BAKE_PHASE_LABELS))

// Steps saved before phase tagging existed (or a malformed AI response) have no phase, or an
// unrecognized one — default to 'other' rather than letting bad data break icon/label lookups.
export function normalizeBakePhase(value: unknown): BakePhase {
  return typeof value === 'string' && VALID_PHASES.has(value) ? (value as BakePhase) : 'other'
}

// Parses a freeform duration string like "1 hour", "30 minutes", or "12 hours" into seconds.
export function parseDurationSeconds(duration: string): number | null {
  const lower = duration.toLowerCase()
  let total = 0
  let found = false

  const hourMatch = lower.match(/(\d+(?:\.\d+)?)\s*h(?:our)?s?/)
  const minMatch = lower.match(/(\d+(?:\.\d+)?)\s*m(?:in(?:ute)?s?)?/)

  if (hourMatch) { total += parseFloat(hourMatch[1]) * 3600; found = true }
  if (minMatch) { total += parseFloat(minMatch[1]) * 60; found = true }

  return found && total > 0 ? Math.round(total) : null
}

// Formats seconds as MM:SS for anything under an hour, H:MM:SS beyond that — bake steps
// (autolyse, bulk fermentation, cold retard) routinely run many hours, unlike a kitchen-timer
// MM:SS display which reads badly past 60 minutes (e.g. "720:00" for a 12-hour lead time).
export function formatCountdown(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
