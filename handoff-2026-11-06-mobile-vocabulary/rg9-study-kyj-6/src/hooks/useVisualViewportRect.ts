import { useLayoutEffect, useState } from 'react'

function readViewport() {
  const viewport = window.visualViewport
  return {
    top: viewport?.offsetTop ?? 0,
    left: viewport?.offsetLeft ?? 0,
    width: viewport?.width ?? window.innerWidth,
    height: viewport?.height ?? window.innerHeight,
  }
}

/** Keyboard resize and Safari focus panning both change the visible rectangle. */
export function useVisualViewportRect(active: boolean) {
  const [rect, setRect] = useState(readViewport)

  useLayoutEffect(() => {
    if (!active) return
    const viewport = window.visualViewport
    const update = () => setRect(readViewport())
    update()
    viewport?.addEventListener('resize', update)
    viewport?.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    return () => {
      viewport?.removeEventListener('resize', update)
      viewport?.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [active])

  return rect
}
