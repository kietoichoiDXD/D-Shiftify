import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  DEFAULT_SETTINGS,
  type AccessibilityProfile,
  type AccessibilitySettings
} from '@/core/accessibility/accessibility.types'
import { classifyDisability, settingsForProfile } from '@/core/accessibility/classify-disability'
import { fetchAccessibilitySignal } from '@/core/services/accessibility.service'
import { speakAccessibleText } from '@/core/services/speech.service'
import { useAuthStore } from '@/core/store/features/auth/authStore'

import { AccessibilityContext, type AccessibilityContextValue } from './accessibility-context'

const OVERRIDES_KEY = 'a11y_setting_overrides'

const loadOverrides = (): Partial<AccessibilitySettings> => {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY)
    return raw ? (JSON.parse(raw) as Partial<AccessibilitySettings>) : {}
  } catch {
    return {}
  }
}

interface AccessibilityProviderProps {
  children: ReactNode
}

export const AccessibilityProvider = ({ children }: AccessibilityProviderProps) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [profile, setProfile] = useState<AccessibilityProfile | null>(null)
  const [detectedSettings, setDetectedSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS)
  const [overrides, setOverrides] = useState<Partial<AccessibilitySettings>>(() => loadOverrides())

  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(null)
      setDetectedSettings(DEFAULT_SETTINGS)
      return
    }
    let cancelled = false
    fetchAccessibilitySignal()
      .then((signal) => {
        if (cancelled) return
        const derived = classifyDisability(signal)
        setProfile(derived)
        setDetectedSettings(settingsForProfile(derived))
      })
      .catch(() => {
        if (!cancelled) setProfile(null)
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const settings = useMemo<AccessibilitySettings>(
    () => ({ ...detectedSettings, ...overrides }),
    [detectedSettings, overrides]
  )

  const setSetting = useCallback<AccessibilityContextValue['setSetting']>((key, value) => {
    setOverrides((prev) => {
      const next = { ...prev, [key]: value }
      try {
        localStorage.setItem(OVERRIDES_KEY, JSON.stringify(next))
      } catch {

      }
      return next
    })
  }, [])

  const resetToDetected = useCallback(() => {
    setOverrides({})
    try {
      localStorage.removeItem(OVERRIDES_KEY)
    } catch {

    }
  }, [])

  const announce = useCallback<AccessibilityContextValue['announce']>(
    (text, opts) => {
      if (!text) return
      if (!opts?.force && !settings.autoTTS) return
      speakAccessibleText(text)
    },
    [settings.autoTTS]
  )

  const haptic = useCallback<AccessibilityContextValue['haptic']>(
    (pattern = 60, opts) => {
      if (!opts?.force && !settings.haptics) return
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern)
      }
    },
    [settings.haptics]
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('a11y-high-contrast', settings.highContrast)
    root.classList.toggle('a11y-large-targets', settings.largeTargets)
  }, [settings.highContrast, settings.largeTargets])

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      profile,
      isAssistiveActive: Boolean(profile?.autoDetected) || Object.values(settings).some(Boolean),
      settings,
      setSetting,
      resetToDetected,
      announce,
      haptic
    }),
    [profile, settings, setSetting, resetToDetected, announce, haptic]
  )

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>

}
