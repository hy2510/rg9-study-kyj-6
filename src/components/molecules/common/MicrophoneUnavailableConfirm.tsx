import { media } from '@styles/tokens/breakpoints'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type MicrophoneUnavailableConfirmProps = {
  open: boolean
  onConfirmSkip: () => void
  onCancel: () => void
}

/** 마이크 미지원·미연결 시 다음 단계 스킵 여부를 묻는 확인 팝업 */
export default function MicrophoneUnavailableConfirm({
  open,
  onConfirmSkip,
  onCancel,
}: MicrophoneUnavailableConfirmProps) {
  const { t } = useTranslation()

  if (!open) return null

  return (
    <Overlay role='presentation' onClick={onCancel}>
      <Dialog
        role='alertdialog'
        aria-modal='true'
        aria-labelledby='mic-unavailable-title'
        aria-describedby='mic-unavailable-message'
        onClick={(event) => event.stopPropagation()}
      >
        <DialogTitle id='mic-unavailable-title'>
          {t('study.microphoneUnavailableTitle')}
        </DialogTitle>
        <Message id='mic-unavailable-message'>
          {t('study.microphoneUnavailableMessage')}
        </Message>
        <ButtonRow>
          <ActionButton type='button' $variant='secondary' onClick={onCancel}>
            {t('study.microphoneUnavailableCancel')}
          </ActionButton>
          <ActionButton type='button' $variant='primary' onClick={onConfirmSkip}>
            {t('study.microphoneUnavailableConfirm')}
          </ActionButton>
        </ButtonRow>
      </Dialog>
    </Overlay>
  )
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: rgba(26, 31, 40, 0.55);
`

const Dialog = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: min(100%, 360px);
  padding: 28px 24px 24px;
  background-color: #fff;
  border: 1.5px solid #e9edf3;
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(60, 75, 98, 0.18);

  ${media.mobile} {
    width: calc(100vw - 32px);
    padding: 24px 20px 20px;
    border-radius: 16px;
  }
`

const DialogTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  color: #3c4b62;
`

const Message = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  color: #6b7a8f;
  white-space: pre-line;
`

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 4px;
`

const ActionButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
  flex: 1;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1.5px solid
    ${({ $variant }) => ($variant === 'primary' ? '#1baa70' : '#e9edf3')};
  background-color: ${({ $variant }) =>
    $variant === 'primary' ? '#1baa70' : '#fff'};
  color: ${({ $variant }) => ($variant === 'primary' ? '#fff' : '#3c4b62')};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.05s ease;

  &:active {
    transform: scale(0.98) translateY(1px);
  }
`
