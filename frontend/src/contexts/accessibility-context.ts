import { createContext } from 'react'

import { type AccessibilityProfile, type AccessibilitySettings } from '@/core/accessibility/accessibility.types'

export interface AccessibilityContextValue {

  profile: AccessibilityProfile | null

  isAssistiveActive: boolean
  settings: AccessibilitySettings
  setSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void
  resetToDetected: () => void

  announce: (text: string, opts?: { force?: boolean }) => void

  haptic: (pattern?: number | number[], opts?: { force?: boolean }) => void
}

export const AccessibilityContext = createContext<AccessibilityContextValue | null>(null)
