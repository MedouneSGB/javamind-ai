import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Lang = 'fr' | 'en'

export const LABELS: Record<Lang, Record<string, string>> = {
  fr: {
    open: 'Ouvrir',
    file: 'Fichier',
    run: 'Lancer',
    stop: 'Arrêter',
    building: 'Compilation...',
    mentor: 'Mentor',
    review: 'Revue',
    challenge: 'Défi',
    duck: 'Duck',
    hideAi: 'Cacher IA',
    showAi: 'Afficher IA',
  },
  en: {
    open: 'Open',
    file: 'File',
    run: 'Run',
    stop: 'Stop',
    building: 'Building...',
    mentor: 'Mentor',
    review: 'Review',
    challenge: 'Challenge',
    duck: 'Duck',
    hideAi: 'Hide AI',
    showAi: 'Show AI',
  },
}

interface LangStore {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

export const useLangStore = create<LangStore>()(
  persist(
    (set, get) => ({
      lang: 'fr',
      setLang: (l) => set({ lang: l }),
      t: (key) => LABELS[get().lang][key] ?? key,
    }),
    { name: 'javamind:lang' }
  )
)
