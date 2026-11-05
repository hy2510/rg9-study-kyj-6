import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import TextBox from '@components/atoms/common/TextBox'
import CompletePopupButton from '@components/molecules/common/CompletePopupButton'
import PopupLayout from '@components/molecules/common/PopupLayout'
import {
  type WritingRevisionMode,
  writingRevisionModeLabelKey,
} from '@src/utils/study/legacy/writingRevisionMode'

type WritingRevisionConfirmPopupProps = {
  maxRevision: number
  completedRevision: number
  teacherCompletedRevision: number
  showRevisionStats?: boolean
  showModeBadge?: boolean
  revisionMode: WritingRevisionMode
  isRevisionExhausted: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function WritingRevisionConfirmPopup({
  maxRevision,
  completedRevision,
  teacherCompletedRevision,
  showRevisionStats = true,
  showModeBadge = true,
  revisionMode,
  isRevisionExhausted,
  onConfirm,
  onCancel,
}: WritingRevisionConfirmPopupProps) {
  const { t } = useTranslation()

  const confirmMessage = isRevisionExhausted
    ? maxRevision - completedRevision === 0
      ? t('study.writing.doneMessage')
      : t('study.writing.completeMessage')
    : revisionMode === 'limit'
      ? t('study.writing.confirmMonthlyRevision')
      : t('study.writing.confirmRevision')

  const revisionModeLabel = t(writingRevisionModeLabelKey(revisionMode))

  return (
    <PopupLayout onClose={onCancel} hideCloseButton>
      <MainContainer>
        {showModeBadge ? <ModeBadge>{revisionModeLabel}</ModeBadge> : null}
        <div>
          <TextBox
            fontFamily='Chiron GoRound TC'
            fontWeight={600}
            fontSize={2}
            style={{ textAlign: 'center' }}
            color='#3c4b62'
          >
            {t('study.writing.title')}
          </TextBox>
          <TextBox
            fontFamily='Chiron GoRound TC'
            fontWeight={600}
            fontSize={1.1}
            color='#3c4b62'
            style={{ textAlign: 'center' }}
          >
            {confirmMessage}
          </TextBox>
        </div>

        {showRevisionStats ? (
          <RevisionStats>
            <RevisionRow>
              <RevisionLabel>
                {t('study.writing.revisionRequestLabel')}
              </RevisionLabel>
              <RevisionValue>
                {t('study.writing.revisionProgress', {
                  max: maxRevision,
                  completed: completedRevision,
                })}
              </RevisionValue>
            </RevisionRow>

            {/* 선생님의 첨삭 완료 건수 <- 살려 달라고 하면 기능 추가해서 살리기 */}
            {/* <RevisionRow>
              <RevisionLabel>{t('study.writing.teacherRevisionLabel')}</RevisionLabel>
              <RevisionValue>
                {t('study.writing.revisionCompletedCount', {
                  count: teacherCompletedRevision,
                })}
              </RevisionValue>
            </RevisionRow> */}
          </RevisionStats>
        ) : null}

        <Buttons>
          {isRevisionExhausted ? (
            <CompletePopupButton variant='primary' onClick={onConfirm}>
              {t('study.writing.done')}
            </CompletePopupButton>
          ) : (
            <>
              <CompletePopupButton variant='primary' onClick={onConfirm}>
                {t('common.yes')}!
              </CompletePopupButton>
              <CompletePopupButton variant='secondary' onClick={onCancel}>
                {t('common.no')}
              </CompletePopupButton>
            </>
          )}
        </Buttons>
      </MainContainer>
    </PopupLayout>
  )
}

const MainContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 100%;
`

const ModeBadge = styled.span`
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 4px 14px;
  border-radius: 999px;
  background: rgba(32, 173, 117, 0.12);
  color: #20ad75;
  font-family: 'Chiron GoRound TC', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
`

const RevisionStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  max-width: 250px;
  margin-bottom: 20px;
`

const RevisionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: 'Chiron GoRound TC', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #a2b1c4;
`

const RevisionLabel = styled.span``

const RevisionValue = styled.span``

const Buttons = styled.div`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
`
