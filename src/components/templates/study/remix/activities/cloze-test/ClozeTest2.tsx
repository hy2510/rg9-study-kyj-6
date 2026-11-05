import { useTranslation } from 'react-i18next'

import TextBox from '@components/atoms/common/TextBox'
import { KeyboardWrap } from '@components/atoms/study/activities/cloze-test-02/KeyboardWrap'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import { ClozeTest2SentenceText } from '@components/molecules/study/activities/cloze-test-02/ClozeTest2SentenceText'
import CheckingSentencePanel from '@components/molecules/study/feedback/CheckingSentencePanel'
import QuestionSoundButton from '@components/molecules/study/question/QuestionSoundButton'
import BlankSlotContent from '@components/organisms/study/common/BlankSlotContent'
import SpellingKeyboard from '@components/organisms/study/common/SpellingKeyboard'
import type { AugmentOptions } from '@hooks/study/remix/useAugmentManager'
import { useClozeSpellingInput } from '@hooks/study/remix/useClozeSpellingInput'
import { BaseQuiz } from '@hooks/study/remix/useQuizManager'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'
import { isSpellingCorrect } from '@utils/spellingUtils'

type ClozeTest2Props = {
  augmentOptions: AugmentOptions
  quizData: BaseQuiz
  onComplete: (isCorrect: boolean) => void
}

function isInputCorrect(input: string, answer: string) {
  return isSpellingCorrect(input, answer)
}

export default function ClozeTest2({
  augmentOptions,
  quizData,
  onComplete,
}: ClozeTest2Props) {
  const { t } = useTranslation()
  const sentence = quizData.Question.Text
  const answers = quizData.Examples.map((example) => example.Text)

  const sentenceParts = sentence.split('┒')
  const blankCount = Math.max(sentenceParts.length - 1, 1)
  const normalizedAnswers = answers.slice(0, blankCount)

  const {
    inputValues,
    currentBlankIndex,
    setCurrentBlankIndex,
    setInputValue,
    handleKeyPress,
    isChecked,
    isCorrect,
    isIncorrect,
    allFilled,
    combinedWord,
  } = useClozeSpellingInput({
    augmentOptions,
    answers: normalizedAnswers,
    onComplete,
  })

  const handleBlankClick = (index: number) => {
    if (isChecked) return
    setCurrentBlankIndex(index)
  }

  const renderSentenceWithBlanks = () => (
    <ClozeTest2SentenceText>
      {sentenceParts.map((part, i) => (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: part }} />
          {i < blankCount && (
            <BlankSlotContent
              augmentOptions={augmentOptions}
              input={inputValues[i] ?? ''}
              answer={normalizedAnswers[i] ?? ''}
              isChecked={isChecked}
              isCurrent={currentBlankIndex === i}
              onBlankClick={() => handleBlankClick(i)}
              isInputCorrect={isInputCorrect}
              onInputChange={
                !augmentOptions.word.showMask
                  ? (value) => setInputValue(i, value)
                  : undefined
              }
            />
          )}
        </span>
      ))}
    </ClozeTest2SentenceText>
  )

  return (
    <>
      <QuestionSoundButton
        soundUrl={quizData.Question.Sound}
        augmentOptions={augmentOptions}
        autoPlay={false}
        forceEnable={false}
      />
      <QuizBody $fillToMaxHeightOnTablet>
        <QuizComment>{t(ACTIVITY_INSTRUCTIONS.CLOZE_TEST2)}</QuizComment>
        <CheckingSentencePanel isCorrect={isCorrect} isIncorrect={isIncorrect}>
          <TextBox fontSize={1.2} fontWeight={600} color='primary'>
            {renderSentenceWithBlanks()}
          </TextBox>
        </CheckingSentencePanel>

        {augmentOptions.keyboard.enableKeyboard && (
          <KeyboardWrap>
            <SpellingKeyboard
              correctWord={combinedWord}
              showEnterButton
              isEnterEnabled={allFilled}
              wrongKeyCount={augmentOptions.keyboard.wrongKeyCount}
              onKeyPress={handleKeyPress}
            />
          </KeyboardWrap>
        )}
      </QuizBody>
    </>
  )
}
