import { useEffect, useRef } from 'react'

export function useClickOutside<TElement extends HTMLElement>(
  onOutsideClick: () => void,
  enabled: boolean,
) {
  const ref = useRef<TElement | null>(null)

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target

      if (!(target instanceof Node) || ref.current?.contains(target)) {
        return
      }

      onOutsideClick()
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [enabled, onOutsideClick])

  return ref
}
