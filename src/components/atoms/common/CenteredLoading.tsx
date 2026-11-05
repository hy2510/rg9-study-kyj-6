import { spin } from '@styles/tokens/animations'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type CenteredLoadingProps = {
  fillViewport?: boolean
  /**
   * 스피너 아래 노출할 안내 문구.
   * - undefined (기본): `common.preparingStudy` 자동 노출
   * - null: 문구 숨김 (opt-out)
   * - string: 커스텀 문구
   */
  message?: string | null
}

export default function CenteredLoading({
  fillViewport = false,
  message,
}: CenteredLoadingProps) {
  const { t } = useTranslation()
  const resolvedMessage =
    message === undefined ? t('common.preparingStudy') : message

  return (
    <Root
      $fillViewport={fillViewport}
      role='status'
      aria-live='polite'
      aria-label='Loading'
    >
      <Spinner />
      {resolvedMessage && <Message>{resolvedMessage}</Message>}
    </Root>
  )
}

const Root = styled.div<{ $fillViewport: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
  height: 100%;
  min-height: ${(p) => (p.$fillViewport ? '100vh' : '280px')};
  flex: 1;
`

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(128, 128, 128, 0.35);
  border-top-color: #20ad75;
  border-radius: 50%;
  animation: ${spin} 0.75s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.85;
  }
`

const Message = styled.p`
  margin: 0;
  font-family: 'Rg-B', sans-serif;
  font-size: 1em;
  color: rgba(90, 90, 90, 0.9);
  text-align: center;
`
