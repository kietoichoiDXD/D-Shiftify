import {
  DEFAULT_SETTINGS,
  SETTINGS_FOR_NEED,
  type AccessibilityProfile,
  type AccessibilitySettings,
  type DisabilityNeed
} from './accessibility.types'

const NEED_KEYWORDS: Record<Exclude<DisabilityNeed, 'none'>, string[]> = {
  visual: ['visual_impairment', 'khiếm thị', 'mù', 'thị lực', 'thị giác', 'đọc màn hình', 'screen reader', 'blind', 'low vision', 'mắt'],
  hearing: ['hearing_impairment', 'khiếm thính', 'điếc', 'thính lực', 'trợ thính', 'nghe', 'deaf', 'hearing', 'tai'],
  motor: ['mobility_impairment', 'vận động', 'xe lăn', 'nẹp', 'chi', 'tay', 'chân', 'liệt', 'wheelchair', 'motor', 'mobility', 'cụt']
}

const normalize = (value: string): string => value.toLowerCase().normalize('NFC').trim()

const matchNeeds = (haystack: string): DisabilityNeed[] => {
  const text = normalize(haystack)
  const needs: DisabilityNeed[] = []
  ;(Object.keys(NEED_KEYWORDS) as Array<Exclude<DisabilityNeed, 'none'>>).forEach((need) => {
    if (NEED_KEYWORDS[need].some((kw) => text.includes(kw))) needs.push(need)
  })
  return needs
}

export interface ProfileSignal {
  disabilityStatus?: string | null
  deviceNames?: string[]
}

export const classifyDisability = ({ disabilityStatus, deviceNames = [] }: ProfileSignal): AccessibilityProfile => {
  const combined = [disabilityStatus ?? '', ...deviceNames].join(' ')
  const detected = Array.from(new Set(matchNeeds(combined)))

  return {
    needs: detected.length ? detected : ['none'],
    disabilityStatus: disabilityStatus ?? null,
    deviceNames,
    autoDetected: detected.length > 0
  }
}

export const settingsForProfile = (profile: AccessibilityProfile): AccessibilitySettings => {
  return profile.needs.reduce<AccessibilitySettings>(
    (acc, need) => (need === 'none' ? acc : { ...acc, ...SETTINGS_FOR_NEED[need] }),
    { ...DEFAULT_SETTINGS }
  )
}
