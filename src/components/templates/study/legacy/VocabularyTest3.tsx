import {
  type MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import { media } from '@styles/tokens/breakpoints'
import { useTranslation } from 'react-i18next'
import { css, keyframes, styled } from 'styled-components'

import correctionCorrectSound from '@assets/sounds/common/correction-correct-sound.mp3'
import correctionIncorrectSound from '@assets/sounds/common/correction-incorrect-sound.mp3'
import CenteredLoading from '@components/atoms/common/CenteredLoading'
import { IconArrowRightWhite } from '@components/atoms/common/icons/IconArrowRightWhite'
import { IconMicWhite } from '@components/atoms/common/icons/IconMicWhite'
import { IconSpeaker } from '@components/atoms/common/icons/IconSpeaker'
import TextBox from '@components/atoms/common/TextBox'
import { MeaningPanel } from '@components/atoms/study/activities/vocabulary-test-03/MeaningPanel'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import { QuizBody } from '@components/atoms/study/layout/QuizBody'
import ConsumableSpellingKeyboard from '@components/organisms/study/common/ConsumableSpellingKeyboard'
import SpellingInputDisplay from '@components/organisms/study/common/SpellingInputDisplay'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useHeartContext } from '@contexts/HeartContext'
import { useQuizFeedbackOptional } from '@contexts/QuizFeedbackContext'
import { useStudyStatus } from '@contexts/StudyStatusContext'
import { useVocaRecordingAnalysis } from '@hooks/story/useVocaRecordingAnalysis'
import { useStudentAnswer } from '@hooks/study/legacy/useStudentAnswer'
import useStudyAudio from '@hooks/study/legacy/useStudyAudio'
import {
  useVocabularyTest3View,
  VocabularyTest3PenaltyState,
} from '@hooks/study/legacy/useVocabularyTest3View'
import { useSpellingPhysicalKeyboard } from '@hooks/study/remix/useSpellingPhysicalKeyboard'
import { useMobileViewport } from '@hooks/useMobileViewport'
import { ILegacyStudyData } from '@interfaces/study/legacy/LegacyStudy'
import { deletePenalty, saveUserAnswer } from '@services/studyApi'
import { ACTIVITY_INSTRUCTIONS } from '@src/constants/study/activityInstructions'
import {
  IRecordAnswerType,
  IScoreBoardData,
} from '@src/interfaces/common/Common'
import { IVocabulary3Test } from '@src/interfaces/study/IVocabulary'
import { captureFinishStudyInfoFromResult } from '@src/utils/study/finishStudyInfo'
import {
  isPracticeGroupStart,
  isPracticeRecordingSupported,
  PRACTICE_GROUP_SIZE,
  resolveVocabularyTest3PronunciationLabelKey,
} from '@src/utils/study/legacy/vocabularyTest3Helpers'
import { isObserverMode } from '@src/utils/study/reviewMode'
import {
  buildDisplayText,
  getLettersOnly,
  isSpellingCorrect,
} from '@utils/spellingUtils'

export default function VocabularyTest3(props: ILegacyStudyData) {
  const { t } = useTranslation()
  const { bookInfo, studyInfo } = useContext(AppContext) as AppContextProps
  const quizFeedback = useQuizFeedbackOptional()
  const studyStatus = useStudyStatus()
  const setQuestionNumberVisible = studyStatus?.setQuestionNumberVisible
  const heart = useHeartContext()

  const quizData = props.quizData as IVocabulary3Test | undefined
  const recordedData = props.recordedData ?? []

  const {
    isReady,
    totalQuiz,
    quizAnswerCount,
    isEnabledPenalty,
    initial,
    getQuizMeta,
  } = useVocabularyTest3View({
    quizData,
    recordedData,
    studyMode: studyInfo.mode,
  })

  const studentAnswer = useStudentAnswer(studyInfo.mode)
  const { playAudio, stopAudio } = useStudyAudio()

  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(1)
  const [tryCount, setTryCount] = useState<number>(0)
  const [inputLetters, setInputLetters] = useState<string>('')
  const [penaltyState, setPenaltyState] =
    useState<VocabularyTest3PenaltyState>('none')
  const [checkedIncorrect, setCheckedIncorrect] = useState<boolean>(false)
  const [practiceQuizIndex, setPracticeQuizIndex] = useState<number | null>(
    null,
  )
  const [isPracticePronunciation, setIsPracticePronunciation] = useState(false)
  const [testInputMode, setTestInputMode] = useState<
    'simple' | 'full' | 'recording'
  >('simple')
  const [isNativeKeyboard, setIsNativeKeyboard] = useState(false)
  const isMobileViewport = useMobileViewport()
  const isWorking = useRef<boolean>(true)
  const onEnterRef = useRef<() => void>(() => {})
  const playedPracticeAudioIndexRef = useRef<number | null>(null)

  useEffect(() => {
    setQuestionNumberVisible?.(practiceQuizIndex === null)
  }, [practiceQuizIndex, setQuestionNumberVisible])

  useEffect(() => {
    if (!isMobileViewport) setIsNativeKeyboard(false)
  }, [isMobileViewport])

  useEffect(
    () => () => setQuestionNumberVisible?.(true),
    [setQuestionNumberVisible],
  )

  // 헤더 Q 번호 화면 동기화 — currentQuizIndex 를 컨테이너로 전달
  useEffect(() => {
    props.onActiveQuizChange?.(currentQuizIndex)
  }, [currentQuizIndex, props])

  const autoFillInputIfNeeded = (correctText: string) => {
    if (
      (studyInfo.mode === 'review' && Number(bookInfo.Average) >= 70) ||
      isObserverMode(studyInfo)
    ) {
      setInputLetters(getLettersOnly(correctText).toLowerCase())
    } else {
      setInputLetters('')
    }
  }

  useEffect(() => {
    if (!isReady) return
    if (initial.startQuizNo > totalQuiz) {
      props.onFinishActivity()
      return
    }
    setCurrentQuizIndex(initial.startQuizNo)
    setPracticeQuizIndex(
      isPracticeGroupStart(initial.startQuizNo) ? initial.startQuizNo : null,
    )
    setTryCount(initial.startTryCount)
    setPenaltyState(initial.startPenaltyState)
    studentAnswer.setStudentAnswers(recordedData, quizAnswerCount)
    heart.setMax(quizAnswerCount)
    heart.setCurrent(quizAnswerCount - initial.startTryCount)
    isWorking.current = false
    const meta = getQuizMeta(initial.startQuizNo)
    if (initial.startPenaltyState === 'none' && meta)
      autoFillInputIfNeeded(meta.correctText)
    else setInputLetters('')
  }, [isReady])

  useEffect(() => {
    if (!isReady) return
    if (currentQuizIndex === initial.startQuizNo) return
    setPenaltyState('none')
    setCheckedIncorrect(false)
    isWorking.current = false
    const meta = getQuizMeta(currentQuizIndex)
    if (meta) autoFillInputIfNeeded(meta.correctText)
  }, [currentQuizIndex])

  const currentMeta = isReady
    ? getQuizMeta(practiceQuizIndex ?? currentQuizIndex)
    : null

  const advancePractice = useCallback(() => {
    if (practiceQuizIndex === null) return

    const nextPracticeQuizIndex = practiceQuizIndex + 1
    const groupStartQuizIndex =
      Math.floor((practiceQuizIndex - 1) / PRACTICE_GROUP_SIZE) *
        PRACTICE_GROUP_SIZE +
      1
    const groupEndQuizIndex = Math.min(
      groupStartQuizIndex + PRACTICE_GROUP_SIZE - 1,
      totalQuiz,
    )

    setInputLetters('')
    setCheckedIncorrect(false)
    setIsPracticePronunciation(false)
    setPracticeQuizIndex(
      nextPracticeQuizIndex <= groupEndQuizIndex ? nextPracticeQuizIndex : null,
    )
    isWorking.current = false
  }, [practiceQuizIndex, totalQuiz])

  const {
    isRecordingMode,
    isAnalyzing,
    recordingResult,
    resetRecordingAnalysis,
    startRecordingAnalysis,
  } = useVocaRecordingAnalysis({
    targetWord: currentMeta?.correctText ?? '',
    targetSoundUrl: currentMeta?.sound,
    pauseBookAudio: stopAudio,
  })

  const advanceToNext = () => {
    resetRecordingAnalysis()
    const nextQuizNo = currentQuizIndex + 1
    if (nextQuizNo <= totalQuiz) {
      setInputLetters('')
      setCheckedIncorrect(false)
      setPenaltyState('none')
      setCurrentQuizIndex(nextQuizNo)
      setPracticeQuizIndex(isPracticeGroupStart(nextQuizNo) ? nextQuizNo : null)
      setTryCount(0)
      heart.setCurrent(quizAnswerCount)
      isWorking.current = false
    } else {
      props.onFinishActivity()
    }
  }

  const proceedAfterAnswer = (isCorrect: boolean, newTryCount: number) => {
    if (!currentMeta) return
    if (isCorrect) {
      const goNext = () => {
        stopAudio()
        advanceToNext()
      }
      if (currentMeta.sound) playAudio(currentMeta.sound, goNext)
      else goNext()
      return
    }

    if (newTryCount >= quizAnswerCount) {
      if (isEnabledPenalty) {
        setInputLetters('')
        setCheckedIncorrect(false)
        setPenaltyState('penalty')
      } else {
        advanceToNext()
      }
      return
    }

    setInputLetters('')
    setCheckedIncorrect(false)
    setTryCount(newTryCount)
    isWorking.current = false
    if (newTryCount === quizAnswerCount - 1) {
      if (currentMeta.sound) playAudio(currentMeta.sound)
    }
  }

  const checkAnswer = async (selectedAnswer: string) => {
    if (!currentMeta) return
    if (isWorking.current) return
    isWorking.current = true
    stopAudio()

    const isCorrect = isSpellingCorrect(selectedAnswer, currentMeta.correctText)
    const newTryCount = tryCount + 1

    const answerData: IScoreBoardData = {
      quizNo: currentMeta.quizNo,
      maxCount: quizAnswerCount,
      answerCount: newTryCount,
      ox: isCorrect,
    }

    const userAnswer = studentAnswer.makeUserAnswerData({
      mobile: '',
      studyId: props.studyId,
      studentHistoryId: props.studentHistoryId,
      bookType: props.bookType,
      step: props.currentStep,
      quizId: currentMeta.quizId,
      quizNo: currentMeta.quizNo,
      currentQuizNo: currentQuizIndex,
      correct: currentMeta.correctText,
      selectedAnswer,
      tryCount: newTryCount,
      maxQuizCount: quizAnswerCount,
      quizLength: totalQuiz,
      isCorrect,
      answerData,
      isEnabledPenalty,
      isFinishStudy: props.lastStep === props.currentStep,
    })

    try {
      const res = await saveUserAnswer(studyInfo.mode, userAnswer)
      captureFinishStudyInfoFromResult(res)
      if (Number(res.result) !== 0) {
        isWorking.current = false
        return
      }
    } catch {
      isWorking.current = false
      return
    }

    studentAnswer.addStudentAnswer(answerData)
    const tempRecord: IRecordAnswerType = {
      QuizId: `${currentMeta.quizId}`,
      QuizNo: currentMeta.quizNo,
      CurrentQuizNo: currentQuizIndex,
      OX: isCorrect ? '1' : '2',
      TempText: '',
      PenaltyWord: '',
      Correct: currentMeta.correctText,
      StudentAnswer: selectedAnswer,
      AnswerCount: newTryCount,
    }
    props.onUpdateRecord?.(tempRecord)
    if (!isCorrect) {
      heart.decrease()
    }

    if (quizFeedback) {
      quizFeedback.presentResult(isCorrect, () =>
        proceedAfterAnswer(isCorrect, newTryCount),
      )
    } else {
      proceedAfterAnswer(isCorrect, newTryCount)
    }
  }

  const handlePracticeDisplaySound = () => {
    if (practiceQuizIndex === null || isPracticePronunciation) return
    if (isWorking.current || !currentMeta?.sound) return
    stopAudio()
    playAudio(currentMeta.sound)
  }

  useEffect(() => {
    if (practiceQuizIndex === null) {
      playedPracticeAudioIndexRef.current = null
      return
    }
    if (playedPracticeAudioIndexRef.current === practiceQuizIndex) return

    playedPracticeAudioIndexRef.current = practiceQuizIndex
    if (currentMeta?.sound) playAudio(currentMeta.sound)
    // playAudio는 useStudyAudio가 렌더마다 생성하므로 문제 번호와 음원 변경만 감지한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceQuizIndex, currentMeta?.sound])

  useEffect(() => {
    if (!isPracticePronunciation) resetRecordingAnalysis()
  }, [isPracticePronunciation, resetRecordingAnalysis])

  useEffect(() => {
    if (recordingResult !== 'correct' && recordingResult !== 'incorrect') return

    if (practiceQuizIndex === null) {
      if (recordingResult === 'correct' && currentMeta) {
        setInputLetters(getLettersOnly(currentMeta.correctText).toLowerCase())
        setCheckedIncorrect(false)
        checkAnswer(currentMeta.correctText)
      }
      return
    }

    const finishFeedback = () => {
      resetRecordingAnalysis()
      if (recordingResult === 'correct') advancePractice()
    }

    stopAudio()
    playAudio(
      recordingResult === 'correct'
        ? correctionCorrectSound
        : correctionIncorrectSound,
      finishFeedback,
    )
    // 오디오 함수는 렌더마다 생성되므로 실제 평가 결과 변경만 감지한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordingResult])

  useEffect(() => {
    if (recordingResult !== 'unsupported') return
    if (practiceQuizIndex === null) return
    resetRecordingAnalysis()
    advancePractice()
  }, [
    advancePractice,
    practiceQuizIndex,
    recordingResult,
    resetRecordingAnalysis,
  ])

  useEffect(() => {
    if (penaltyState === 'penalty') {
      isWorking.current = false
    } else if (penaltyState === 'success') {
      // eslint-disable-next-line react-hooks/immutability -- finalizePenalty 는 컴포넌트 함수 내 정의
      finalizePenalty()
    }
  }, [penaltyState])

  useEffect(() => {
    onEnterRef.current = () => {
      if (!currentMeta) return
      if (isWorking.current) return

      if (practiceQuizIndex !== null && inputLetters.length === 0) {
        if (!isPracticeRecordingSupported()) {
          advancePractice()
          return
        }
        setInputLetters(getLettersOnly(currentMeta.correctText).toLowerCase())
        setCheckedIncorrect(false)
        setIsNativeKeyboard(false)
        setIsPracticePronunciation(true)
        isWorking.current = true
        return
      }

      const correctLetterLen = getLettersOnly(currentMeta.correctText).length
      if (inputLetters.length < correctLetterLen) return

      if (practiceQuizIndex !== null) {
        if (!isSpellingCorrect(inputLetters, currentMeta.correctText)) {
          setCheckedIncorrect(true)
          return
        }

        const showPronunciationStep = () => {
          if (!isPracticeRecordingSupported()) {
            advancePractice()
            return
          }
          setIsNativeKeyboard(false)
          setIsPracticePronunciation(true)
          isWorking.current = true
        }

        stopAudio()
        isWorking.current = true
        if (currentMeta.sound)
          playAudio(currentMeta.sound, showPronunciationStep)
        else showPronunciationStep()
        return
      }

      if (penaltyState === 'penalty') {
        if (isSpellingCorrect(inputLetters, currentMeta.correctText)) {
          setPenaltyState('success')
        } else {
          setCheckedIncorrect(true)
        }
        return
      }

      if (penaltyState !== 'none') return

      if (!isSpellingCorrect(inputLetters, currentMeta.correctText)) {
        setCheckedIncorrect(true)
      }
      // eslint-disable-next-line react-hooks/immutability -- checkAnswer 는 컴포넌트 함수 내 정의
      checkAnswer(buildDisplayText(currentMeta.correctText, inputLetters))
    }
  })

  const handleKeyPress = useCallback(
    (key: string) => {
      if (!currentMeta) return
      if (practiceQuizIndex === null && testInputMode === 'recording') {
        if (
          key === 'enter' &&
          !isRecordingMode &&
          recordingResult !== 'correct'
        )
          startRecordingAnalysis()
        return
      }
      if (isPracticePronunciation) {
        if (
          key === 'enter' &&
          !isRecordingMode &&
          recordingResult !== 'correct'
        )
          startRecordingAnalysis()
        return
      }
      if (isWorking.current) return
      const maxLen = getLettersOnly(currentMeta.correctText).length
      if (key === 'backspace') {
        setCheckedIncorrect(false)
        setInputLetters((prev) => prev.slice(0, -1))
      } else if (key === 'enter') {
        onEnterRef.current()
      } else if (/^[a-zA-Z]$/.test(key)) {
        setCheckedIncorrect(false)
        setInputLetters((prev) => (prev + key.toLowerCase()).slice(0, maxLen))
      }
    },
    [
      currentMeta,
      isPracticePronunciation,
      isRecordingMode,
      startRecordingAnalysis,
      practiceQuizIndex,
      recordingResult,
      testInputMode,
    ],
  )

  const removeInputLetter = useCallback(
    (letterIndex: number) => {
      if (
        isWorking.current ||
        isPracticePronunciation ||
        (practiceQuizIndex === null && testInputMode === 'recording')
      )
        return
      setCheckedIncorrect(false)
      setInputLetters(
        (prev) => prev.slice(0, letterIndex) + prev.slice(letterIndex + 1),
      )
    },
    [isPracticePronunciation, practiceQuizIndex, testInputMode],
  )

  const handleNativeValueChange = useCallback(
    (value: string) => {
      if (!currentMeta || isWorking.current || isPracticePronunciation) return
      const maxLen = getLettersOnly(currentMeta.correctText).length
      setCheckedIncorrect(false)
      setInputLetters(getLettersOnly(value).toLowerCase().slice(0, maxLen))
    },
    [currentMeta, isPracticePronunciation],
  )

  useSpellingPhysicalKeyboard({
    enabled: !(isMobileViewport && isNativeKeyboard),
    captureTab: false,
    onKeyPress: handleKeyPress,
  })

  if (!isReady || !currentMeta) return <CenteredLoading />

  /**
   * 패널티 완료 → deletePenalty → 음원 재생 → 다음 문제 진행.
   */
  const finalizePenalty = async () => {
    const isLastQuiz = currentQuizIndex + 1 > totalQuiz
    try {
      const res = await deletePenalty(props.mode, {
        mobile: '',
        bookType: props.bookType,
        studyId: props.studyId,
        studentHistoryId: props.studentHistoryId,
        step: String(props.currentStep),
        quizId: currentMeta.quizId,
        isLastQuiz,
        isFinishStudy: isLastQuiz && props.lastStep === props.currentStep,
      })
      captureFinishStudyInfoFromResult(res)
      if (Number(res.result) !== 0) return
    } catch {
      return
    }

    const goNext = () => {
      stopAudio()
      advanceToNext()
    }
    if (currentMeta.sound) playAudio(currentMeta.sound, goNext)
    else goNext()
  }

  // === Render ===

  const isPenalty = penaltyState !== 'none'
  const isPractice = practiceQuizIndex !== null
  const isAllFilled =
    inputLetters.length === getLettersOnly(currentMeta.correctText).length
  const isPracticeAnswerExact = isSpellingCorrect(
    inputLetters,
    currentMeta.correctText,
  )
  const isPracticeEnterEnabled =
    inputLetters.length === 0 || isPracticeAnswerExact
  const isRecordingActionLocked =
    isRecordingMode || isAnalyzing || recordingResult === 'correct'

  return (
    <QuizBody $fillToMaxHeightOnTablet>
      <QuizComment>{t(ACTIVITY_INSTRUCTIONS.VOCABULARY_TEST3)}</QuizComment>
      <TypingContent>
        <SpellingInputDisplay
          correctWord={currentMeta.correctText}
          inputLetters={inputLetters}
          isCorrect={recordingResult === 'correct'}
          isIncorrect={
            checkedIncorrect || (isPractice && recordingResult === 'incorrect')
          }
          isPenalty={isPenalty || isPractice}
          fillHeightOnTablet
          plainDisplay
          emphasizeFeedbackText={
            recordingResult === 'correct' || recordingResult === 'incorrect'
          }
          onInputLetterClick={removeInputLetter}
          displayLeadingContent={
            isPractice ? (
              <PracticeSoundButton
                type='button'
                aria-label={t('study.vocabularyPractice.playWordSound', {
                  word: currentMeta.correctText,
                })}
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  event.stopPropagation()
                  if (isPracticePronunciation) {
                    if (isRecordingActionLocked || !currentMeta?.sound) return
                    stopAudio()
                    playAudio(currentMeta.sound)
                  } else {
                    handlePracticeDisplaySound()
                  }
                }}
              >
                <IconSpeaker width={28} height={28} />
              </PracticeSoundButton>
            ) : undefined
          }
          renderDisplay={(display) => (
            <PracticeMeaningPanel $recordingResult={recordingResult}>
              <TextBox fontSize={1.6} fontWeight={700} color='primary'>
                {currentMeta.speechPart}. {currentMeta.mainMean}
              </TextBox>
              {display}
              {currentMeta.subMean && (
                <TextBox fontSize={1} fontWeight={400} color='lightslategray'>
                  {currentMeta.speechPart}. {currentMeta.subMean}
                </TextBox>
              )}
            </PracticeMeaningPanel>
          )}
          keyboardReplacement={
            isPracticePronunciation ? (
              <PronunciationPractice>
                <PronunciationStatus>
                  {t(
                    resolveVocabularyTest3PronunciationLabelKey({
                      isRecordingMode,
                      isAnalyzing,
                      recordingResult,
                      defaultPromptKey: 'study.vocabularyPractice.prompt',
                    }),
                  )}
                </PronunciationStatus>
                <PronunciationActions>
                  <SpeakRecordButton
                    type='button'
                    disabled={isRecordingActionLocked}
                    $recording={isRecordingMode}
                    $disabled={isRecordingActionLocked}
                    aria-label={t('study.vocabularyPractice.record')}
                    onClick={startRecordingAnalysis}
                  >
                    <IconMicWhite width={24} height={24} />
                  </SpeakRecordButton>
                  <SpeakNextButton
                    type='button'
                    disabled={isRecordingActionLocked}
                    $disabled={isRecordingActionLocked}
                    aria-label={t('study.vocabularyPractice.skip')}
                    onClick={() => {
                      stopAudio()
                      resetRecordingAnalysis()
                      advancePractice()
                    }}
                  >
                    <IconArrowRightWhite width={24} height={24} />
                  </SpeakNextButton>
                </PronunciationActions>
              </PronunciationPractice>
            ) : (
              <ConsumableSpellingKeyboard
                correctWord={currentMeta.correctText}
                inputLetters={inputLetters}
                allowNativeKeyboard={isMobileViewport}
                isNativeMode={isNativeKeyboard}
                isEnterEnabled={
                  isPractice ? isPracticeEnterEnabled : isAllFilled
                }
                fullKeyboardOnly={isPractice}
                allowFullKeyboardToggle={!isPractice}
                allowRecordingMode={!isPractice}
                recordingContent={
                  !isPractice ? (
                    <TestRecordingInput>
                      <PronunciationStatus>
                        {t(
                          resolveVocabularyTest3PronunciationLabelKey({
                            isRecordingMode,
                            isAnalyzing,
                            recordingResult,
                            defaultPromptKey:
                              'study.vocabularyPractice.testRecordingPrompt',
                          }),
                        )}
                      </PronunciationStatus>
                      <SpeakRecordButton
                        type='button'
                        disabled={isRecordingActionLocked}
                        $recording={isRecordingMode}
                        $disabled={isRecordingActionLocked}
                        aria-label={t('study.vocabularyPractice.record')}
                        onClick={startRecordingAnalysis}
                      >
                        <IconMicWhite width={24} height={24} />
                      </SpeakRecordButton>
                    </TestRecordingInput>
                  ) : undefined
                }
                onInputModeChange={(mode) => {
                  setTestInputMode(mode)
                  resetRecordingAnalysis()
                  setCheckedIncorrect(false)
                  if (mode === 'recording') setInputLetters('')
                }}
                onNativeModeChange={setIsNativeKeyboard}
                onNativeValueChange={handleNativeValueChange}
                onRemoveInputLetter={removeInputLetter}
                onKeyPress={handleKeyPress}
              />
            )
          }
          onDisplayClick={
            isPractice && !isPracticePronunciation
              ? handlePracticeDisplaySound
              : undefined
          }
          onKeyPress={handleKeyPress}
        />
      </TypingContent>
    </QuizBody>
  )
}

const TypingContent = styled.div`
  ${media.tablet} {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    flex-direction: column;
  }

  ${media.touchTablet} {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    flex-direction: column;
  }
`

const PracticeMeaningPanel = styled(MeaningPanel)<{
  $recordingResult?:
    'correct' | 'incorrect' | 'unsupported' | 'microphone-unavailable' | 'error'
}>`
  position: relative;
  background: ${({ $recordingResult }) =>
    $recordingResult === 'correct'
      ? '#d7ffc8'
      : $recordingResult === 'incorrect'
        ? '#fff0f3'
        : '#fff'};
  transition: background-color 0.25s ease;
`

const PracticeSoundButton = styled.button`
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  padding: 0;
  border: none;
  background: transparent;
  line-height: 0;
  cursor: pointer;

  ${media.mobile} {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 1;
    margin-right: 0;
  }
`

const PronunciationPractice = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  width: 100%;
  min-height: 132px;
  padding: 12px 0;
  box-sizing: border-box;
`

const TestRecordingInput = styled(PronunciationPractice)`
  min-height: 116px;
`

const PronunciationStatus = styled(QuizComment)`
  justify-content: center;
  text-align: center;
`

const PronunciationActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  width: 100%;
`

const recordingBorderWave = keyframes`
  0% {
    box-shadow:
      0 0 0 0 rgba(239, 61, 100, 0.38),
      0 0 0 0 rgba(239, 61, 100, 0.22);
  }
  70% {
    box-shadow:
      0 0 0 8px rgba(239, 61, 100, 0),
      0 0 0 18px rgba(239, 61, 100, 0);
  }
  100% {
    box-shadow:
      0 0 0 0 rgba(239, 61, 100, 0),
      0 0 0 0 rgba(239, 61, 100, 0);
  }
`

const SpeakActionButton = styled.button<{ $disabled: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  padding: 0;
  border-radius: 15px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.45 : 1)};

  &:active:not(:disabled) {
    transform: translateY(2px);
    border-bottom: none;
  }

  img {
    display: block;
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
`

const SpeakRecordButton = styled(SpeakActionButton)<{ $recording: boolean }>`
  border: 2px solid
    ${({ $recording }) => ($recording ? '#ef3d64' : 'transparent')};
  border-bottom: ${({ $recording }) =>
    $recording ? 'none' : '3px solid rgb(0, 0, 0, 0.2)'};
  background: #e82031;
  transform: ${({ $recording }) =>
    $recording ? 'translateY(2px)' : 'translateY(0)'};
  overflow: ${({ $recording }) => ($recording ? 'visible' : 'hidden')};

  ${({ $recording }) =>
    $recording
      ? css`
          animation: ${recordingBorderWave} 1.35s ease-out infinite;

          &::after {
            content: '';
            position: absolute;
            inset: -2px;
            border: 2px solid rgba(239, 61, 100, 0.28);
            border-radius: inherit;
            pointer-events: none;
            animation: ${recordingBorderWave} 1.35s ease-out infinite;
          }
        `
      : ''}
`

const SpeakNextButton = styled(SpeakActionButton)`
  border: 2px solid rgb(0, 0, 0, 0.2);
  background: #354257;
`
