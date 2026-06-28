import { useContext } from 'react'

import { AccessibilityContext } from './accessibility-context'

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return ctx
}
