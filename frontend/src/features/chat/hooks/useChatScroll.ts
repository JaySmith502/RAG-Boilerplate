import { useRef, useEffect, useCallback } from 'react'

export function useChatScroll<T>(deps: T[]) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isUserScrolledUp = useRef(false)

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    // User is "at bottom" if within 100px of bottom
    isUserScrolledUp.current = scrollHeight - scrollTop - clientHeight > 100
  }, [])

  useEffect(() => {
    if (!containerRef.current || isUserScrolledUp.current) return
    containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, deps)

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
      isUserScrolledUp.current = false
    }
  }, [])

  return { containerRef, handleScroll, scrollToBottom }
}
