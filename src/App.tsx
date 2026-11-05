import { Suspense } from 'react'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import AppContextProvider from '@contexts/AppContext'
import { MultiTabBlockContextProvider } from '@contexts/MultiTabBlockContext'
import { NetworkStatusProvider } from '@contexts/NetworkStatusContext'
import InfoContainer from '@pages/InfoContainer'

export default function App() {
  return (
    <AppContextProvider>
      {/* lazy() 로 분할된 Container chunk 로드 중 fallback */}
      <Suspense fallback={<CenteredLoading fillViewport />}>
        <NetworkStatusProvider>
          <MultiTabBlockContextProvider>
            <InfoContainer />
          </MultiTabBlockContextProvider>
        </NetworkStatusProvider>
      </Suspense>
    </AppContextProvider>
  )
}
