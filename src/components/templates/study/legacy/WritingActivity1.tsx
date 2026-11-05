import { useContext } from 'react'

import { useTranslation } from 'react-i18next'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import { IconArrowUp } from '@components/atoms/common/icons/IconArrowUp'
import TextBox from '@components/atoms/common/TextBox'
import { CorrectAnswerBox } from '@components/atoms/study/activities/writing-activity-01/CorrectAnswerBox'
import { Divider } from '@components/atoms/study/activities/writing-activity-01/Divider'
import { OptionCardsArea } from '@components/atoms/study/activities/writing-activity-01/OptionCardsArea'
import { SentenceAreaContainer } from '@components/atoms/study/activities/writing-activity-01/SentenceAreaContainer'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { MainContentBox } from '@components/atoms/study/layout/ActivityLayout'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import {
  WritingActivity1SentenceRow,
  WritingActivity1SlotBox,
} from '@components/molecules/study/activities/writing-activity-01/WritingActivity1Slots'
import QuestionSoundButton from '@components/molecules/study/question/QuestionSoundButton'
import { WritingWordBankCardBox } from '@components/molecules/study/quizOptions/cards/WritingWordBankCardBox'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useHeartContext } from '@contexts/HeartContext'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import { useWritingActivity1Quiz } from '@hooks/study/legacy/useWritingActivity1Quiz'
import { useWritingActivity1View } from '@hooks/study/legacy/useWritingActivity1View'
import { useWritingActivity1SlotInteraction } from '@hooks/study/useWritingActivity1SlotInteraction'
import { ILegacyStudyData } from '@interfaces/study/legacy/LegacyStudy'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'
import { IWritingActivity1 } from '@src/interfaces/study/IWritingActivity'
import { isObserverMode, isReviewPassMode } from '@src/utils/study/reviewMode'

export default function WritingActivity1(props: ILegacyStudyData) {
  const { t } = useTranslation()
  const { studyInfo, bookInfo } = useContext(AppContext) as AppContextProps
  const isReviewPass = isObserverMode(studyInfo) || isReviewPassMode(studyInfo, bookInfo)
  const quizFeedback = useQuizFeedbackOptional()
  const heart = useHeartContext()

  const isAutoPlayDisabledLevel = ['1A', '1B', '1C'].includes(
    bookInfo.BookLevel?.trim().toUpperCase() ?? '',
  )

  const quizData = props.quizData as IWritingActivity1 | undefined
  const recordedData = props.recordedData ?? []

  const {
    isReady,
    totalQuiz,
    quizAnswerCount,
    startQuizNo,
    startTryCount,
    getQuizMeta,
  } = useWritingActivity1View({
    quizData,
    recordedData,
    studyMode: studyInfo.mode,
  })

  const {
    currentMeta,
    currentQuizIndex,
    tryCount,
    shuffledOptions,
    tokenById,
    slotCount,
    isChecked,
    isCorrect,
    isIncorrect,
    isAllSlotsFilled,
    selectedIds,
    showCorrectAnswer,
    handleOptionClick,
    handleSlotClick,
    handleSlotReorder,
    handleSlotDragStart,
    handleSlotDragEnd,
  } = useWritingActivity1Quiz({
    props,
    isReady,
    totalQuiz,
    quizAnswerCount,
    startQuizNo,
    startTryCount,
    getQuizMeta,
    recordedData,
    studyMode: studyInfo.mode,
    isReviewPass,
    heart,
    quizFeedback,
  })

  const { getSlotProps } = useWritingActivity1SlotInteraction({
    selectedCount: selectedIds.length,
    isChecked,
    onReorder: handleSlotReorder,
    onRemove: handleSlotClick,
    onDragStart: handleSlotDragStart,
    onDragEnd: handleSlotDragEnd,
  })

  if (!isReady || !currentMeta) return <CenteredLoading />

  const showFinishedSentence = isChecked && isCorrect

  return (
    <>
      <QuestionSoundButton
        soundUrl={currentMeta.sound}
        autoPlay={!isAutoPlayDisabledLevel}
        replayKey={`${currentQuizIndex}-${tryCount}`}
      />

      <QuizBody>
        <QuizComment>{t(ACTIVITY_INSTRUCTIONS.WRITING_ACTIVITY1)}</QuizComment>

        <MainContentBox>
          <SentenceAreaContainer
            $isCompleted={showFinishedSentence}
            $isCorrect={isCorrect}
            $isIncorrect={isIncorrect}
          >
            <WritingActivity1SentenceRow $isCorrect={isCorrect}>
              {Array.from({ length: slotCount }).map((_, i) => {
                const token = selectedIds[i]
                  ? tokenById.get(selectedIds[i])
                  : undefined
                return (
                  <WritingActivity1SlotBox
                    key={i}
                    $filled={!!token}
                    $isNext={
                      !isChecked &&
                      !isAllSlotsFilled &&
                      selectedIds.length === i
                    }
                    $isChecked={isChecked}
                    $isIncorrect={isIncorrect}
                    $clickable={!isChecked && !!token}
                    $isCompleted={showFinishedSentence}
                    {...getSlotProps(i, !!token)}
                  >
                    <TextBox
                      fontSize={isCorrect ? 1.6 : 1.3}
                      fontWeight={600}
                      color='primary'
                    >
                      {token?.text ?? '\u00A0'}
                    </TextBox>
                  </WritingActivity1SlotBox>
                )
              })}
            </WritingActivity1SentenceRow>
          </SentenceAreaContainer>

          {showCorrectAnswer && (
            <CorrectAnswerBox>
              <span className='label'>Correct Answer :</span>
              <TextBox fontSize={1.3} fontWeight={600} color='primary'>
                {currentMeta.correctText}
              </TextBox>
            </CorrectAnswerBox>
          )}

          {!isAllSlotsFilled && (
            <>
              <Divider>
                <div className='line' />
                <div className='arrow-up'>
                  <IconArrowUp alt='arrow-up' />
                </div>
                <div className='line' />
              </Divider>

              <OptionCardsArea>
                {shuffledOptions.map((token) => {
                  const selected = selectedIds.includes(token.id)
                  return (
                    <WritingWordBankCardBox
                      key={token.id}
                      $isEmpty={selected}
                      $pressed={false}
                      onClick={() => handleOptionClick(token)}
                      disabled={isChecked || selected}
                    >
                      {selected ? (
                        '\u00A0'
                      ) : (
                        <TextBox
                          fontSize={1.3}
                          fontWeight={600}
                          color='primary'
                        >
                          {token.text}
                        </TextBox>
                      )}
                    </WritingWordBankCardBox>
                  )
                })}
              </OptionCardsArea>
            </>
          )}
        </MainContentBox>
      </QuizBody>
    </>
  )
}
