import { useEffect, useRef } from 'react'

/**
 * Custom hook for auto-scrolling to the bottom of a message list
 * Smoothly scrolls when new messages arrive
 */
export const useAutoScroll = (dependency: unknown) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to the end of messages when the dependency changes
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [dependency])

  return messagesEndRef
}
