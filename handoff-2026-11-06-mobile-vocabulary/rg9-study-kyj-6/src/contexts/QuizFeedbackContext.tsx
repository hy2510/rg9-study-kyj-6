import {
  createContext,
  type ReactNode,
  type TransitionEvent,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

import { media } from '@styles/tokens/breakpoints'
import { useTranslation } from 'react-i18next'
import { styled } from 'styled-components'

import correctionCorrectSound from '@assets/sounds/common/correction-correct-sound.mp3'
import correctionIncorrectSound from '@assets/sounds/common/correction-incorrect-sound.mp3'
import { useVisualViewportRect } from '@hooks/useVisualViewportRect'
import { QUIZ_FEEDBACK } from '@src/constants/study/quizFeedback'
import { getQuizCorrectionCharacterMarks } from '@utils/Assets'

type QuizFeedbackOptions = {
  correctAnswer?: string
}

type QuizFeedbackContextValue = {
  presentResult: (
    isCorrect: boolean,
    onContinue: () => void,
    options?: QuizFeedbackOptions,
  ) => void
}

const QuizFeedbackContext = createContext<QuizFeedbackContextValue | null>(null)

export function QuizFeedbackProvider({
  children,
  character,
}: {
  children: ReactNode
  character: string
}) {
  const characterMarks = getQuizCorrectionCharacterMarks(character)
  const onContinueRef = useRef<(() => void) | null>(null)
  const feedbackAudioRef = useRef<HTMLAudioElement | null>(null)
  const isExitingRef = useRef(false)
  const [banner, setBanner] = useState<{
    isCorrect: boolean
    seq: number
    correctAnswer?: string
  } | null>(null)
  const [isExiting, setIsExiting] = useState(false)
  const [enterOnscreen, setEnterOnscreen] = useState(false)
  const viewport = useVisualViewportRect(banner !== null)

  useEffect(() => {
    if (!banner) {
      feedbackAudioRef.current?.pause()
      feedbackAudioRef.current = null
      return
    }

    feedbackAudioRef.current?.pause()
    const src = banner.isCorrect
      ? correctionCorrectSound
      : correctionIncorrectSound
    const audio = new Audio(src)
    feedbackAudioRef.current = audio
    audio.play().catch(() => {
      // 재생 실패(자동재생 정책 등)는 무시
    })

    return () => {
      audio.pause()
    }
  }, [banner])

  useLayoutEffect(() => {
    if (!banner) return undefined
    setEnterOnscreen(false)
    let innerRaf = 0
    const outerRaf = requestAnimationFrame(() => {
      innerRaf = requestAnimationFrame(() => setEnterOnscreen(true))
    })
    return () => {
      cancelAnimationFrame(outerRaf)
      cancelAnimationFrame(innerRaf)
    }
  }, [banner?.seq])

  const presentResult = useCallback(
    (
      isCorrect: boolean,
      onContinue: () => void,
      options?: QuizFeedbackOptions,
    ) => {
      isExitingRef.current = false
      onContinueRef.current = onContinue
      setIsExiting(false)
      setEnterOnscreen(false)
      setBanner((prev) => ({
        isCorrect,
        seq: (prev?.seq ?? 0) + 1,
        correctAnswer:
          !isCorrect && options?.correctAnswer
            ? options.correctAnswer
            : undefined,
      }))
    },
    [],
  )

  const dismissAndContinue = useCallback(() => {
    if (!banner || isExitingRef.current) return
    isExitingRef.current = true
    feedbackAudioRef.current?.pause()
    feedbackAudioRef.current = null
    setIsExiting(true)
  }, [banner])

  useEffect(() => {
    if (!banner?.isCorrect || !enterOnscreen) return undefined

    const timer = window.setTimeout(() => {
      dismissAndContinue()
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [banner?.isCorrect, banner?.seq, dismissAndContinue, enterOnscreen])

  useEffect(() => {
    if (!banner) return undefined
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== 'NumpadEnter' && e.key !== 'Tab') {
        return
      }
      if (isExitingRef.current) return
      e.preventDefault()
      e.stopPropagation()
      dismissAndContinue()
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [banner, dismissAndContinue])

  const onFeedbackBarTransitionEnd = useCallback(
    (e: TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return
      if (!isExitingRef.current || e.propertyName !== 'opacity') return
      isExitingRef.current = false
      setIsExiting(false)
      setEnterOnscreen(false)
      const fn = onContinueRef.current
      onContinueRef.current = null
      setBanner(null)
      fn?.()
    },
    [],
  )

  return (
    <QuizFeedbackContext.Provider value={{ presentResult }}>
      {children}
      {banner
        ? createPortal(
            <FeedbackViewport
              style={{
                top: viewport.top,
                left: viewport.left,
                width: viewport.width,
                height: viewport.height,
              }}
            >
              <FeedbackBar
                $isCorrect={banner.isCorrect}
                $enterOnscreen={enterOnscreen}
                $exiting={isExiting}
                onClick={dismissAndContinue}
                onPointerDown={(event) => event.preventDefault()}
                onTransitionEnd={onFeedbackBarTransitionEnd}
              >
                <FeedbackTextCol>
                  <FeedbackTitle>
                    <TranslatedLine
                      i18nKey={
                        banner.isCorrect
                          ? QUIZ_FEEDBACK.CORRECT
                          : QUIZ_FEEDBACK.INCORRECT
                      }
                    />
                  </FeedbackTitle>
                  {!banner.isCorrect ? (
                    <FeedbackHint>
                      {banner.correctAnswer ? (
                        <span className='right-answer'>
                          Right Answer | {banner.correctAnswer}
                        </span>
                      ) : (
                        <span className='tap-to-continue'>
                          <TranslatedLine
                            i18nKey={QUIZ_FEEDBACK.TAP_TO_CONTINUE}
                          />
                        </span>
                      )}
                    </FeedbackHint>
                  ) : null}
                </FeedbackTextCol>
                <CharacterFigure aria-hidden>
                  <img
                    src={
                      banner.isCorrect
                        ? characterMarks.correct
                        : characterMarks.incorrect
                    }
                    alt=''
                    draggable={false}
                  />
                </CharacterFigure>
              </FeedbackBar>
            </FeedbackViewport>,
            document.body,
          )
        : null}
    </QuizFeedbackContext.Provider>
  )
}

function TranslatedLine({ i18nKey }: { i18nKey: string }) {
  const { t } = useTranslation()
  return <>{t(i18nKey)}</>
}

/** 리믹스 학습 등 Provider 밖에서는 null (레거시 경로는 즉시 진행) */
export function useQuizFeedbackOptional(): QuizFeedbackContextValue | null {
  return useContext(QuizFeedbackContext)
}

// Render outside the transformed study background; use the area above the OS keyboard.
const FeedbackViewport = styled.div`
  position: fixed;
  z-index: 9000;
  pointer-events: none;
`

const FeedbackBar = styled.div<{
  $isCorrect: boolean
  $enterOnscreen: boolean
  $exiting: boolean
}>`
  cursor: pointer;
  position: absolute;
  pointer-events: auto;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9000;
  width: 100%;
  min-height: 120px;
  background: ${(p) => (p.$isCorrect ? '#CBFFB0' : '#FDEAEC')};
  color: ${(p) => (p.$isCorrect ? '#199261' : '#EF3D2E')};
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(
    ${(p) => (p.$exiting || p.$enterOnscreen ? '0' : '100%')}
  );
  opacity: ${(p) => (p.$exiting ? 0 : 1)};
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
  will-change: transform, opacity;

  ${media.mobile} {
    min-height: 80px;
    padding: 8px 16px;
    box-sizing: border-box;
    justify-content: space-between;
    gap: 12px;
  }
`

const CharacterFigure = styled.div`
  position: absolute;
  bottom: 0;
  right: 10%;

  img {
    display: block;
    min-width: 150px;
    width: 10vw;
    max-width: 200px;
    object-fit: contain;
  }

  ${media.mobile} {
    right: 0;

    img {
      min-width: 0;
      width: 100%;
      max-width: 120px;
    }
  }
`

const FeedbackTextCol = styled.div`
  width: fit-content;

  ${media.mobile} {
    flex: 1;
    min-width: 0;
    padding-left: 4px;
  }
`

const FeedbackTitle = styled.div`
  text-align: center;
  font-size: 2em;
  font-weight: 800;
  font-family: 'Rg-B', 'Fredoka', sans-serif;

  ${media.mobile} {
    text-align: left;
    font-size: 1.5em;
  }
`

const FeedbackHint = styled.div`
  text-align: center;
  font-size: 1.25em;
  font-family: 'Rg-R', 'Fredoka', sans-serif;
  max-width: 980px;

  .right-answer {
    color: #3c4b62;
  }

  .tap-to-continue {
    opacity: 0.5;
  }

  ${media.mobile} {
    text-align: left;
    font-size: 1em;
  }
`
