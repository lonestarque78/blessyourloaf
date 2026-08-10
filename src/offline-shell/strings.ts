import enMessages from '../../messages/en/my-recipes.json'
import esMessages from '../../messages/es/my-recipes.json'
import type { Locale } from '../i18n/locale'

export interface OfflineRecipeStrings {
  category: string
  difficulty: string
  prep: string
  bake: string
  minutesShort: (count: number) => string
  whatYoullNeed: string
  letsGetBaking: string
  myNotes: string
  offlineBadge: string
  notCachedTitle: string
  notCachedBody: string
  timerPause: string
  timerResume: string
  timerReset: string
  timerDone: string
  categoryLabels: Record<string, string>
  difficultyLabels: Record<string, string>
}

// The messages/{locale}/my-recipes.json files stay the single source of truth for these
// strings — this view can't run next-intl (no server render for a NetworkOnly-failed
// navigation to render through), so the same JSON already used by the online detail page
// is imported here directly and picked from at runtime by cookie instead of by next-intl.
function fromMessages(messages: typeof enMessages): OfflineRecipeStrings {
  return {
    category: messages.detail.category,
    difficulty: messages.detail.difficulty,
    prep: messages.detail.prep,
    bake: messages.detail.bake,
    minutesShort: (count: number) => messages.detail.minutesShort.replace('{count}', String(count)),
    whatYoullNeed: messages.detail.whatYoullNeed,
    letsGetBaking: messages.detail.letsGetBaking,
    myNotes: messages.detail.myNotes,
    offlineBadge: messages.detail.offlineBadge,
    notCachedTitle: messages.detail.notCachedOfflineTitle,
    notCachedBody: messages.detail.notCachedOfflineBody,
    timerPause: messages.detail.timerPause,
    timerResume: messages.detail.timerResume,
    timerReset: messages.detail.timerReset,
    timerDone: messages.detail.timerDone,
    categoryLabels: messages.categoryLabels,
    difficultyLabels: messages.difficultyLabels,
  }
}

export const OFFLINE_STRINGS: Record<Locale, OfflineRecipeStrings> = {
  en: fromMessages(enMessages),
  es: fromMessages(esMessages),
}
