// NetworkStatusContext.tsx
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

// 1. Context 타입 정의
interface NetworkStatusContextType {
  isOnline: boolean
}

// 2. Context 객체 생성 (기본값: undefined 사용, 강제 사용 방지)
const NetworkStatusContext = createContext<
  NetworkStatusContextType | undefined
>(undefined)

// 3. Provider 컴포넌트 정의
interface NetworkStatusProviderProps {
  children: ReactNode
}

export function NetworkStatusProvider({
  children,
}: NetworkStatusProviderProps) {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)

  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return (
    <NetworkStatusContext.Provider value={{ isOnline }}>
      {children}
    </NetworkStatusContext.Provider>
  )
}

// 4. Context 사용 커스텀 훅
export function useNetworkStatus() {
  const context = useContext(NetworkStatusContext)
  if (!context) {
    throw new Error(
      'useNetworkStatus는 NetworkStatusProvider 내에서만 사용해야 합니다.',
    )
  }
  return context
}
