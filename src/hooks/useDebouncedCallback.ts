import { useCallback, useEffect, useRef } from 'react'

export type DebouncedCallback<T extends unknown[]> = {
  schedule: (...args: T) => void
  cancel: () => void
}

export const useDebouncedCallback = <T extends unknown[]>(
  callback: (...args: T) => void,
  delayMs: number,
): DebouncedCallback<T> => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestArgsRef = useRef<T | null>(null)
  const latestCallbackRef = useRef(callback)

  useEffect(() => {
    latestCallbackRef.current = callback
  }, [callback])

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    latestArgsRef.current = null
  }, [])

  const schedule = useCallback(
    (...args: T) => {
      latestArgsRef.current = args
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        const latestArgs = latestArgsRef.current
        if (!latestArgs) return
        latestCallbackRef.current(...latestArgs)
      }, delayMs)
    },
    [delayMs],
  )

  useEffect(() => cancel, [cancel])

  return { schedule, cancel }
}
