import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type SimpleIntroProps = {
  variant: 'study' | 'review'
  onStart: () => void
}

export default function SimpleIntro({ variant, onStart }: SimpleIntroProps) {
  const { t } = useTranslation()
  const titleKey =
    variant === 'study' ? 'intro.studyTitle' : 'intro.reviewTitle'

  return (
    <Backdrop role='dialog' aria-modal='true' aria-labelledby='intro-title'>
      <Panel>
        <Title id='intro-title'>{t(titleKey)}</Title>
        <StartButton type='button' onClick={onStart}>
          {t('intro.start')}
        </StartButton>
      </Panel>
    </Backdrop>
  )
}

const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  background: rgba(20, 24, 32, 0.55);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  transform: translateZ(0);
  isolation: isolate;
`

const Panel = styled.div`
  width: min(92vw, 400px);
  flex: 0 0 auto;
  margin: auto;
  padding: 28px 24px 24px;
  box-sizing: border-box;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.18),
    0 0 0 1px rgba(255, 255, 255, 0.6) inset;
  text-align: center;
`

const Title = styled.h1`
  margin: 0 0 24px;
  font-size: clamp(1.05rem, 4vw, 1.25rem);
  font-weight: 700;
  line-height: 1.45;
  color: #1a1d24;
`

const StartButton = styled.button`
  min-width: 160px;
  padding: 14px 28px;
  border: none;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(145deg, #3b7cff 0%, #2563eb 100%);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.45);

  &:active {
    transform: scale(0.98);
  }
`
