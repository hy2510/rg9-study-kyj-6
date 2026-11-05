import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

interface MultiTabBlockContextType {
  currentTabId: string
}

export const MultiTabBlockContext = createContext<MultiTabBlockContextType>({
  currentTabId: '',
})

export function MultiTabBlockContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const TAB_IDS_KEY = 'tab_ids'

  // 컨텍스트 노출용 (render-safe)
  const [currentTabId, setCurrentTabId] = useState<string>('')
  // 즉시 접근용 (storage/beforeunload 핸들러에서 최신 값 사용)
  const currentTabIdRef = useRef<string>('')

  // 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    // 새로운 탭 ID 생성
    const newTabId = Math.random().toString(36).slice(2)

    const tabIdList = JSON.parse(localStorage.getItem(TAB_IDS_KEY) || '[]')

    // 새 탭 ID를 배열에 추가
    tabIdList.push(newTabId)
    localStorage.setItem(TAB_IDS_KEY, JSON.stringify(tabIdList))

    // 현재 탭의 ID 저장 (sessionStorage 사용)
    currentTabIdRef.current = newTabId
    setCurrentTabId(newTabId)
    sessionStorage.setItem('current_tab_id', newTabId)
  }, []) // 빈 의존성 배열로 마운트 시 한 번만 실행

  // 새로운 탭 생성 감지
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TAB_IDS_KEY) {
        const isMultiTab = JSON.parse(e.newValue || '[]').length > 1
        const tabIds = JSON.parse(e.newValue || '[]')
        const lastTabId = tabIds[tabIds.length - 1]

        // 새로운 탭이 생성되었고, 현재 탭이 아닌 경우
        if (isMultiTab && lastTabId && lastTabId !== currentTabIdRef.current) {
          window.onExitStudy()
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // 탭이 닫힐 때 해당 탭 ID 제거
  useEffect(() => {
    const cleanup = () => {
      const tabIds = JSON.parse(localStorage.getItem(TAB_IDS_KEY) || '[]')
      const updatedTabIds = tabIds.filter(
        (id: string) => id !== currentTabIdRef.current,
      )
      localStorage.setItem(TAB_IDS_KEY, JSON.stringify(updatedTabIds))
      sessionStorage.removeItem('current_tab_id')
    }

    window.addEventListener('beforeunload', cleanup)
    return () => {
      cleanup()
      window.removeEventListener('beforeunload', cleanup)
    }
  }, [])

  return (
    <MultiTabBlockContext.Provider
      value={{
        currentTabId,
      }}
    >
      {children}
    </MultiTabBlockContext.Provider>
  )
}

export function useMultiTabBlock() {
  const context = useContext(MultiTabBlockContext)
  if (!context) {
    throw new Error(
      'useMultiTabBlock must be used within a MultiTabBlockContextProvider',
    )
  }
  return context
}
