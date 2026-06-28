export type DisabilityNeed = 'visual' | 'hearing' | 'motor' | 'none'

export interface AccessibilitySettings {

  autoTTS: boolean

  autoSTT: boolean

  captions: boolean

  haptics: boolean

  largeTargets: boolean

  highContrast: boolean
}

export interface AccessibilityProfile {
  needs: DisabilityNeed[]
  disabilityStatus: string | null
  deviceNames: string[]

  autoDetected: boolean
}

export const DEFAULT_SETTINGS: AccessibilitySettings = {
  autoTTS: false,
  autoSTT: false,
  captions: false,
  haptics: false,
  largeTargets: false,
  highContrast: false
}

export const SETTINGS_FOR_NEED: Record<Exclude<DisabilityNeed, 'none'>, Partial<AccessibilitySettings>> = {
  visual: { autoTTS: true, autoSTT: true, highContrast: true },
  hearing: { captions: true, haptics: true, autoTTS: false },
  motor: { autoSTT: true, largeTargets: true, haptics: true }
}
