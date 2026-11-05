import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import styled from 'styled-components'

const SIDE_MENU_SCROLLBAR_HIDE_MS = 900

export default function SideMenuPanelBody({
  children,
}: {
  children: ReactNode
}) {
  const [scrollbarVisible, setScrollbarVisible] = useState(false)
  const hideTimerRef = useRef<number | null>(null)

  const onScroll = useCallback(() => {
    setScrollbarVisible(true)
    if (hideTimerRef.current != null) {
      window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
    hideTimerRef.current = window.setTimeout(() => {
      setScrollbarVisible(false)
      hideTimerRef.current = null
    }, SIDE_MENU_SCROLLBAR_HIDE_MS)
  }, [])

  useEffect(() => {
    return () => {
      if (hideTimerRef.current != null) {
        window.clearTimeout(hideTimerRef.current)
      }
    }
  }, [])

  return (
    <PanelBody $showScrollbar={scrollbarVisible} onScroll={onScroll}>
      {children}
    </PanelBody>
  )
}

const PanelBody = styled.div<{ $showScrollbar: boolean }>`
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  ${(p) =>
    !p.$showScrollbar &&
    `
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
      background: transparent;
    }
  `}
`
