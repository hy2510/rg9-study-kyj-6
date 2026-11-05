import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import TextBox from '@components/atoms/common/TextBox'
import CompletePopupButton from '@components/molecules/common/CompletePopupButton'
import PopupLayout from '@components/molecules/common/PopupLayout'

type StoryCompletePopupProps = {
  hasMovie: boolean
  hasSpeak: boolean
  /**
   * 학습(퀴즈) 진입 버튼의 시각적 비활성화 여부.
   * true 여도 클릭 자체는 가능하며(파이어됨), 실제 얼럿/차단 로직은 부모의 `onGoQuiz` 가 담당한다.
   * (예: preview 모드에서는 안내 얼럿을 띄운 뒤 조기 return)
   */
  isGoQuizDisabled?: boolean
  onClose: () => void
  onGoQuiz: () => void
  onReadAgain: () => void
  onWatchMovie: () => void
  onSpeakPractice: () => void
  onExitStudy: () => void
}

export default function StoryCompletePopup({
  hasMovie,
  hasSpeak,
  isGoQuizDisabled = false,
  onClose,
  onGoQuiz,
  onReadAgain,
  onWatchMovie,
  onSpeakPractice,
  onExitStudy,
}: StoryCompletePopupProps) {
  const { t } = useTranslation()

  return (
    <PopupLayout onClose={onClose}>
      <MainContainer>
        <div>
          <TextBox
            fontFamily='Chiron GoRound TC'
            fontWeight={600}
            fontSize={2}
            style={{ textAlign: 'center' }}
            color='#3c4b62'
          >
            Good Job!
          </TextBox>
          <TextBox
            fontFamily='Chiron GoRound TC'
            fontWeight={600}
            fontSize={1.1}
            color='#3c4b62'
          >
            {"You've finished the story."}
          </TextBox>
        </div>
        <Buttons>
          <CompletePopupButton
            variant='primary'
            aria-disabled={isGoQuizDisabled}
            onClick={onGoQuiz}
          >
            {t('story.takeQuiz')}
          </CompletePopupButton>
          <CompletePopupButton variant='secondary' onClick={onReadAgain}>
            {t('story.readAgain')}
          </CompletePopupButton>
          {hasMovie ? (
            <CompletePopupButton variant='secondary' onClick={onWatchMovie}>
              {t('story.watchMovie')}
            </CompletePopupButton>
          ) : null}
          {hasSpeak ? (
            <CompletePopupButton variant='secondary' onClick={onSpeakPractice}>
              {t('header.speakPractice')}
            </CompletePopupButton>
          ) : null}
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

const Buttons = styled.div`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
`
