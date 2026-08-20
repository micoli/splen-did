import { useEffect } from 'react'

export function useBeforeUnloadWarning(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [enabled])
}
