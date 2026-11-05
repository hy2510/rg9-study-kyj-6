import { useContext } from 'react'

import { useTranslation } from 'react-i18next'
import reactStringReplace from 'react-string-replace'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import TextBox from '@components/atoms/common/TextBox'
import { KeyboardWrap } from '@components/atoms/study/activities/cloze-test-02/KeyboardWrap'
import { SentenceBlank } from '@components/atoms/study/activities/cloze-test-02/SentenceBlank'
import { SentenceBlankFilled } from '@components/atoms/study/activities/cloze-test-02/SentenceBlankFilled'
import { SentenceBlankRevealed } from '@components/atoms/study/activities/cloze-test-02/SentenceBlankRevealed'
import { SentenceBlankSaved } from '@components/atoms/study/activities/cloze-test-02/SentenceBlankSaved'
import { SentencePanel } from '@components/atoms/study/activities/cloze-test-03/SentencePanel'
import { QuestionSoundWrapper } from '@components/atoms/study/audio/QuestionSoundWrapper'
import { SoundControlGroup } from '@components/atoms/study/audio/SoundControlGroup'
import { SoundPlayToggleIcon } from '@components/atoms/study/audio/SoundPlayToggleIcon'
import { SoundSeekButton } from '@components/atoms/study/audio/SoundSeekButton'
import { ReviewBadge } from '@components/atoms/study/badges/ReviewBadge'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import {
  ClozeTest2InlineCharSlot,
  ClozeTest2InlineSpellingSlots,
} from '@components/molecules/study/activities/cloze-test-02/ClozeTest2InlineSlots'
import { ClozeTest2SentenceText } from '@components/molecules/study/activities/cloze-test-02/ClozeTest2SentenceText'
import SpellingKeyboard from '@components/organisms/study/common/SpellingKeyboard'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useHeartContext } from '@contexts/HeartContext'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import { useClozeTest3Quiz } from '@hooks/study/legacy/useClozeTest3Quiz'
import { useClozeTest3View } from '@hooks/study/legacy/useClozeTest3View'
import { ILegacyStudyData } from '@interfaces/study/legacy/LegacyStudy'
import { IconSoundLongPlay } from '@src/components/atoms/common/icons/IconSoundLongPlay'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'
import { IClozeTest3 } from '@src/interfaces/study/IClozeTest'
import { isObserverMode, isReviewPassMode } from '@src/utils/study/reviewMode'
import {
  getDisplayChar,
  getLettersOnly,
  isSpecialOrSpace,
  isSpellingInputCharIncorrect,
} from '@utils/spellingUtils'

export default function ClozeTest3(props: ILegacyStudyData) {
  const { t } = useTranslation()
  const { studyInfo, bookInfo } = useContext(AppContext) as AppContextProps
  const isReviewPass = isObserverMode(studyInfo) || isReviewPassMode(studyInfo, bookInfo)
  const quizFeedback = useQuizFeedbackOptional()
  const heart = useHeartContext()

  const quizData = props.quizData as IClozeTest3 | undefined
  const recordedData = props.recordedData ?? []

  const {
    isReady,
    totalQuiz,
    quizAnswerCount,
    isEnabledPenalty,
    initial,
    getQuizMeta,
    makeEmptyInputs,
  } = useClozeTest3View({
    quizData,
    recordedData,
    studyMode: studyInfo.mode,
  })

  const {
    currentMeta,
    sentenceTokens,
    playState,
    penaltyState,
    inputValues,
    currentBlankIndex,
    inputLetters,
    currentCorrectText,
    isCurrentIncorrect,
    isRevealing,
    handleKeyPress,
    onPlaySoundToggle,
    onSeekSound,
    isSoundControlDisabled,
    canSeekSound,
    onClickBlank,
  } = useClozeTest3Quiz({
    props,
    isReady,
    totalQuiz,
    quizAnswerCount,
    isEnabledPenalty,
    initial,
    getQuizMeta,
    makeEmptyInputs,
    recordedData,
    studyMode: studyInfo.mode,
    isReviewPass,
    heart,
    quizFeedback,
  })

  if (!isReady || !currentMeta) return <CenteredLoading />

  const renderBlankSlot = (blankIndex: number) => {
    const val = inputValues[blankIndex]
    if (!val) return null

    if (val.isCorrected) {
      if (val.isRevealed) {
        return (
          <SentenceBlankRevealed key={`revealed-${blankIndex}`}>
            {val.text}
          </SentenceBlankRevealed>
        )
      }
      return (
        <SentenceBlankFilled key={`filled-${blankIndex}`}>
          {val.text}
        </SentenceBlankFilled>
      )
    }

    const isActive = currentBlankIndex === blankIndex

    if (isActive) {
      const correctText = currentMeta.correctAnswers[blankIndex] ?? ''
      const isPenaltyAllPlaceholder =
        penaltyState === 'penalty' && inputLetters === ''

      const charSlots = Array.from({ length: correctText.length }).map(
        (_, i) => {
          const answerChar = correctText[i]
          const letterIndex = getLettersOnly(correctText.slice(0, i)).length
          const inputChar = inputLetters[letterIndex] ?? ''
          const isFixed = isSpecialOrSpace(answerChar)
          const isPenaltyPlaceholder =
            penaltyState === 'penalty' && !isFixed && inputChar === ''
          const isCharIncorrect =
            penaltyState === 'penalty' &&
            !isPenaltyPlaceholder &&
            isSpellingInputCharIncorrect(answerChar, inputChar)
          const displayChar = isPenaltyPlaceholder
            ? answerChar
            : getDisplayChar(answerChar, inputChar)
          return {
            i,
            isFixed,
            isPenaltyPlaceholder,
            isCharIncorrect,
            displayChar,
          }
        },
      )

      const isSlotIncorrect =
        penaltyState === 'penalty'
          ? charSlots.some((slot) => slot.isCharIncorrect)
          : isCurrentIncorrect

      return (
        <ClozeTest2InlineSpellingSlots
          key={`active-${blankIndex}`}
          $isIncorrect={isSlotIncorrect}
          $isPlaceholder={isPenaltyAllPlaceholder}
        >
          {charSlots.map(
            ({
              i,
              isFixed,
              isPenaltyPlaceholder,
              isCharIncorrect,
              displayChar,
            }) => (
              <ClozeTest2InlineCharSlot
                key={i}
                $isFixed={isFixed}
                $isIncorrect={
                  penaltyState === 'penalty'
                    ? isCharIncorrect
                    : isCurrentIncorrect
                }
                $isPlaceholder={isPenaltyPlaceholder}
              >
                {displayChar}
              </ClozeTest2InlineCharSlot>
            ),
          )}
        </ClozeTest2InlineSpellingSlots>
      )
    }

    if (val.text) {
      return (
        <SentenceBlankSaved
          key={`saved-${blankIndex}`}
          onClick={() => onClickBlank(blankIndex)}
        >
          {val.text}
        </SentenceBlankSaved>
      )
    }

    const blankLen = Math.max(
      (currentMeta.correctAnswers[blankIndex] ?? '').length,
      3,
    )
    return (
      <SentenceBlank
        key={`blank-${blankIndex}`}
        onClick={() => onClickBlank(blankIndex)}
      >
        {'_'.repeat(blankLen)}
      </SentenceBlank>
    )
  }

  return (
    <>
      <QuestionSoundWrapper>
        <SoundControlGroup>
          <SoundSeekButton
            aria-label='5초 뒤로'
            disabled={!canSeekSound || isRevealing}
            onClick={() => onSeekSound(-5)}
          >
            -5s
          </SoundSeekButton>
          <SoundPlayToggleIcon
            isPlaying={playState === 'playing'}
            disabled={isSoundControlDisabled || isRevealing}
            onClick={onPlaySoundToggle}
            icon={<IconSoundLongPlay width={40} height={40} />}
          />
          <SoundSeekButton
            aria-label='5초 앞으로'
            disabled={!canSeekSound || isRevealing}
            onClick={() => onSeekSound(5)}
          >
            +5s
          </SoundSeekButton>
        </SoundControlGroup>
      </QuestionSoundWrapper>

      <QuizBody $fillToMaxHeightOnTablet>
        <QuizComment>{t(ACTIVITY_INSTRUCTIONS.CLOZE_TEST3)}</QuizComment>

        {penaltyState !== 'none' && <ReviewBadge>· Test Review</ReviewBadge>}

        <SentencePanel>
          <TextBox
            fontSize={1.2}
            fontWeight={600}
            color='primary'
            fontFamily='Rg-B'
          >
            <ClozeTest2SentenceText>
              {sentenceTokens.map((tok) => {
                if (!tok.word.includes('┒')) {
                  return (
                    <span
                      key={`w-${tok.key}`}
                      dangerouslySetInnerHTML={{ __html: tok.word + ' ' }}
                    />
                  )
                }
                return (
                  <span key={`bw-${tok.key}`}>
                    {reactStringReplace(tok.word, '┒', () =>
                      renderBlankSlot(tok.index),
                    )}{' '}
                  </span>
                )
              })}
            </ClozeTest2SentenceText>
          </TextBox>
        </SentencePanel>

        <KeyboardWrap>
          <SpellingKeyboard
            correctWord={currentCorrectText}
            wrongKeyCount={0}
            fullKeyboardOnly
            showEnterButton
            isEnterEnabled
            onKeyPress={handleKeyPress}
          />
        </KeyboardWrap>
      </QuizBody>
    </>
  )
}
