import { useTranslation } from 'react-i18next'
import { styled } from 'styled-components'

import TextBox from '@components/atoms/common/TextBox'
import { KeyboardWrap } from '@components/atoms/study/activities/cloze-test-02/KeyboardWrap'
import { SpellingDisplayBox } from '@components/atoms/study/blanks/SpellingDisplayBox'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import QuestionSoundButton from '@components/molecules/study/question/QuestionSoundButton'
import BlankSlotContent from '@components/organisms/study/common/BlankSlotContent'
import SpellingKeyboard from '@components/organisms/study/common/SpellingKeyboard'
import { AugmentOptions } from '@hooks/study/remix/useAugmentManager'
import { BaseQuiz } from '@hooks/study/remix/useQuizManager'
import { useSpellingInput } from '@hooks/study/remix/useSpellingInput'
import { LANGUAGE_MAP } from '@src/constants/common/language'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'
import { isSpellingCorrect } from '@utils/spellingUtils'

type VocabularyTest4Props = {
  augmentOptions: AugmentOptions
  quizData: BaseQuiz
  onComplete: (isCorrect: boolean) => void
}

const REF = (window as any).REF
const lang = REF?.language || 'ko'

function isInputCorrect(input: string, answer: string) {
  return isSpellingCorrect(input, answer)
}

export default function VocabularyTest4({
  augmentOptions,
  quizData,
  onComplete,
}: VocabularyTest4Props) {
  const { t } = useTranslation()
  const answer = quizData.Question.Text

  const {
    handleKeyPress,
    isChecked,
    isCorrect,
    isIncorrect,
    inputText,
    setInputValue,
    isAllFilled,
  } = useSpellingInput({
    augmentOptions,
    correctWord: answer,
    onComplete,
  })

  const getQuestion = (quiz: BaseQuiz): string => {
    return (
      (quiz?.Question as Record<string, string>)?.[
        LANGUAGE_MAP[lang] as string
      ] ?? ''
    )
  }

  const renderInput = () => {
    return (
      <BlankSlotContent
        augmentOptions={augmentOptions}
        input={inputText || ''}
        answer={answer || ''}
        isChecked={isChecked}
        isCurrent={true}
        onBlankClick={() => {}}
        isInputCorrect={isInputCorrect}
        onInputChange={
          !augmentOptions.word.showMask ? setInputValue : undefined
        }
      />
    )
  }

  return (
    <>
      <QuestionSoundButton
        soundUrl={quizData.Question.Sound}
        augmentOptions={augmentOptions}
        autoPlay={true}
        forceEnable={false}
      />
      <QuizBody $fillToMaxHeightOnTablet>
        <QuizComment>{t(ACTIVITY_INSTRUCTIONS.VOCABULARY_TEST3)}</QuizComment>

        <VocabularyTest4QuestionContainer>
          <TextBox fontSize={2.5} fontWeight={800} color='primary'>
            {getQuestion(quizData)}
          </TextBox>
          <TextBox fontSize={1.5} fontWeight={300} color='lightslategray'>
            {quizData.Question.SpeechPart}.{quizData.Question.Britannica}
          </TextBox>
          <SpellingDisplayBox $isCorrect={isCorrect} $isIncorrect={isIncorrect}>
            <TextBox fontSize={2.5} fontWeight={800} color='primary'>
              {renderInput()}
            </TextBox>
          </SpellingDisplayBox>
        </VocabularyTest4QuestionContainer>

        {augmentOptions.keyboard.enableKeyboard && (
          <KeyboardWrap>
            <SpellingKeyboard
              correctWord={answer}
              showEnterButton
              isEnterEnabled={isAllFilled}
              wrongKeyCount={augmentOptions.keyboard.wrongKeyCount}
              onKeyPress={handleKeyPress}
            />
          </KeyboardWrap>
        )}
      </QuizBody>
    </>
  )
}

const VocabularyTest4QuestionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  min-height: 120px;
`
