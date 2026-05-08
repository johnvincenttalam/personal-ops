import { useCallback, useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

export type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved'

export function useAutoSave<T>(
  value: T,
  save: (value: T) => Promise<void> | void,
  delay = 800
) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const serializedRef = useRef<string | undefined>(undefined)
  const latestValue = useRef(value)
  latestValue.current = value

  const debounced = useDebouncedCallback(async (next: T) => {
    setStatus('saving')
    await save(next)
    setStatus('saved')
  }, delay)

  useEffect(() => {
    const serialized = JSON.stringify(value)
    if (serializedRef.current === undefined) {
      serializedRef.current = serialized
      return
    }
    if (serialized === serializedRef.current) return
    serializedRef.current = serialized
    setStatus('unsaved')
    debounced(value)
  }, [value, debounced])

  const flush = useCallback(async () => {
    debounced.cancel()
    setStatus('saving')
    await save(latestValue.current)
    serializedRef.current = JSON.stringify(latestValue.current)
    setStatus('saved')
  }, [save, debounced])

  return { status, flush }
}
