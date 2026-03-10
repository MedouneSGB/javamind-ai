import { useState, useEffect } from 'react'
import { isElectron } from '../lib/platform'

/**
 * Détecte si l'app est affichée sur un écran mobile (< 768px).
 * Toujours false en Electron — le desktop garde son layout fixe.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => !isElectron && typeof window !== 'undefined' && window.innerWidth < 768
  )

  useEffect(() => {
    if (isElectron) return
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return isMobile
}
