import { type ChangeEvent, Fragment, useEffect, useRef, useState } from 'react'

import { BREAKPOINT_MOBILE_MAX, media } from '@styles/tokens/breakpoints'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ILegacyStudyData } from '@interfaces/study/legacy/LegacyStudy'
import Button from '@src/components/atoms/common/Button'
import { HintButton } from '@src/components/atoms/study/buttons/HintButton'
import QuizComment from '@src/components/atoms/study/comments/QuizComment'
import {
  calcQuizBodyMaxHeightPx,
  QUIZ_BODY_MAX_HEIGHT_OFFSET_MOBILE_PX,
  QUIZ_BODY_MAX_HEIGHT_OFFSET_PX,
  QuizBody,
} from '@src/components/atoms/study/layout/QuizBody'
import WritingRevisionConfirmPopup from '@src/components/organisms/study/writing/WritingRevisionConfirmPopup'
import { IWritingActivity2 } from '@src/interfaces/study/IWritingActivity'
import { saveWritingActivity } from '@src/services/studyApi'
import { captureFinishStudyInfoFromResult } from '@src/utils/study/finishStudyInfo'
import { resolveWritingRevisionMode } from '@src/utils/study/legacy/writingRevisionMode'
import {
  buildWritingActivity2DefaultAnswers,
  countWords,
} from '@src/utils/study/legacy/writingActivityHelpers'

export default function WritingActivity2(props: ILegacyStudyData) {
  const { t } = useTranslation()
  const { onFinishActivity } = props

  const [draftSaved, setDraftSaved] = useState(false)
  const [isRevisionConfirmOpen, setIsRevisionConfirmOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const recordLoadedRef = useRef(false)
  const isSavingRef = useRef(false)

  const bottomBarRef = useRef<HTMLDivElement | null>(null)
  const [bottomBarHeight, setBottomBarHeight] = useState(0)
  const [viewport, setViewport] = useState(() => ({
    h:
      typeof window !== 'undefined'
        ? (window.visualViewport?.height ?? window.innerHeight)
        : 800,
    w:
      typeof window !== 'undefined'
        ? (window.visualViewport?.width ?? window.innerWidth)
        : 800,
  }))

  useEffect(() => {
    const update = () => {
      setViewport({
        h: window.visualViewport?.height ?? window.innerHeight,
        w: window.visualViewport?.width ?? window.innerWidth,
      })
    }
    window.addEventListener('resize', update)
    window.visualViewport?.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [])

  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!isReady) return
    const el = bottomBarRef.current
    if (!el) return
    const obs = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setBottomBarHeight(entry.contentRect.height)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [isReady])

  const quizBodyOffsetPx =
    viewport.w <= BREAKPOINT_MOBILE_MAX
      ? QUIZ_BODY_MAX_HEIGHT_OFFSET_MOBILE_PX
      : QUIZ_BODY_MAX_HEIGHT_OFFSET_PX
  const panelBodyHeightPx = calcQuizBodyMaxHeightPx(
    viewport.h,
    quizBodyOffsetPx,
  )
  const quizBodyMaxHeightPx = Math.max(
    0,
    panelBodyHeightPx - bottomBarHeight,
  )

  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
    }
  }, [])

  const buildWritingPayload = (
    saveType: 'S' | 'E' | 'R' | 'X',
    isFinish?: boolean,
  ) => ({
    bookType: props.bookType,
    studyId: props.studyId,
    studentHistoryId: props.studentHistoryId,
    step: `${props.currentStep}`,
    saveType,
    writeText: answers.join('┒'),
    ...(isFinish ? { isFinishStudy: true } : {}),
  })

  const handleSaveDraft = async () => {
    if (isSaving || isFinished) return
    setIsSaving(true)
    try {
      await saveWritingActivity(props.mode, buildWritingPayload('X'))
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
      setDraftSaved(true)
      savedTimeoutRef.current = setTimeout(() => {
        setDraftSaved(false)
        savedTimeoutRef.current = null
      }, 2000)
    } catch {
      // 임시저장 실패 — 자동저장이 재시도하므로 무시
    } finally {
      setIsSaving(false)
    }
  }

  // 첨삭 모드 (all: 스킵버튼 삭제, free: 스킵버튼 노출, limit: 첨삭 기회 없을 때 팝업이 먼저 나옴)
  const quizData = props.quizData as IWritingActivity2 | undefined

  // 최소~최대 단어 수 (서버값 우선, 없으면 fallback)
  const minWords = quizData?.Writing?.WordMinCount ?? 10
  const maxWords = quizData?.Writing?.WordMaxCount ?? 300
  const revisionMode = resolveWritingRevisionMode(quizData?.Writing?.Mode)
  const isAllRevisionMode = revisionMode === 'all'

  // 첨삭 없음(No Revision): 첨삭 관련 UI(배지, 첨삭 기회) 미노출
  const isNoRevision = quizData?.Writing?.Type === 'No Revision'

  // 첨삭 횟수 (실제 데이터: Writing.MaxSubmitCount / CurrentSubmitCount)
  const maxRevision = quizData?.Writing?.MaxSubmitCount ?? 0
  const completedRevision = quizData?.Writing?.CurrentSubmitCount ?? 0
  // TODO: 선생님 첨삭 완료 건수는 임시 0 처리.
  const teacherCompletedRevision = 0
  const showRevisionStats = !isNoRevision

  const [answers, setAnswers] = useState<string[]>([])

  useEffect(() => {
    if (recordLoadedRef.current) return
    if (!quizData) return

    recordLoadedRef.current = true

    if (props.recordedData && props.recordedData.length > 0) {
      setAnswers(props.recordedData.map((r) => r.TempText))
    } else {
      setAnswers(buildWritingActivity2DefaultAnswers(quizData))
    }
    setIsReady(true)
  }, [quizData, props.recordedData])

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const wordCount = answers.reduce(
    (total, answer) => total + countWords(answer),
    0,
  )

  const hasBlankAnswer = answers.some((answer) => answer.trim() === '')
  const canSubmit =
    !isFinished && !hasBlankAnswer && wordCount >= minWords && wordCount <= maxWords

  const handleSkipWriting = async () => {
    if (isSaving || isFinished) return
    if (!window.confirm(t('study.writing.confirmSkip'))) return
    setIsSaving(true)
    setIsFinished(true)
    try {
      const res = await saveWritingActivity(
        props.mode,
        buildWritingPayload('R', true),
      )
      captureFinishStudyInfoFromResult(res)
      onFinishActivity()
    } catch {
      setIsFinished(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmitAnswers = () => {
    if (!canSubmit) return
    setIsRevisionConfirmOpen(true)
  }

  const handleRevisionCancel = () => {
    setIsRevisionConfirmOpen(false)
  }

  const isLimitCompleted =
    revisionMode === 'limit' && maxRevision - completedRevision === 0

  // No Revision: 첨삭 횟수 미적용 → 항상 완료 상태 팝업
  const isAlwaysCompleted = isNoRevision || isLimitCompleted

  const seededAnswers = buildWritingActivity2DefaultAnswers(quizData)
  const hasUserInput = answers.some((answer, index) => {
    const seeded = seededAnswers[index] ?? ''
    return answer.length > 0 && answer !== seeded
  })

  // No Revision 은 첨삭 모드와 무관하게 스킵 버튼 항상 노출
  // 입력이 한 글자라도 있으면 스킵 숨김, 입력이 없으면 활성화
  const hideSkipButton =
    (isAllRevisionMode && !isNoRevision) || hasUserInput

  const isRevisionExhausted =
    isAlwaysCompleted || completedRevision >= maxRevision

  const handleRevisionConfirm = async () => {
    if (isSaving || isFinished) return
    setIsSaving(true)
    setIsFinished(true)
    try {
      const saveType = isRevisionExhausted ? 'E' : 'S'
      const res = await saveWritingActivity(
        props.mode,
        buildWritingPayload(saveType, true),
      )
      captureFinishStudyInfoFromResult(res)
      setIsRevisionConfirmOpen(false)
      onFinishActivity()
    } catch {
      setIsFinished(false)
      setIsRevisionConfirmOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    if (isLimitCompleted && !isFinished) {
      setIsRevisionConfirmOpen(true)
    }
  }, [isLimitCompleted, isFinished])

  useEffect(() => {
    isSavingRef.current = isSaving
  }, [isSaving])

  useEffect(() => {
    if (isFinished) return
    const interval = setInterval(() => {
      if (isSavingRef.current || isFinished) return
      void saveWritingActivity(props.mode, buildWritingPayload('X'))
    }, 10000)
    return () => clearInterval(interval)
  }, [answers, isFinished])

  return (
    <>
      <Wrapper $heightPx={panelBodyHeightPx}>
        <QuizBody $maxHeightPx={quizBodyMaxHeightPx}>
          {quizData?.Writing?.Question?.map((question, i) => (
            <Fragment key={i}>
              <QuizComment
                style={{
                  color: '#3C4B62',
                  fontFamily: 'RG-B, sans-serif',
                  marginTop: '8px',
                }}
              >
                {i + 1}. {question}
              </QuizComment>

              <InputArea>
                <InputAreaTextarea
                  value={answers[i] ?? ''}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                    handleAnswerChange(i, event.target.value)
                  }
                  placeholder={t('study.writing.answerPlaceholder')}
                />
              </InputArea>
            </Fragment>
          ))}
        </QuizBody>

        {isReady ? (
          <BottomBar ref={bottomBarRef}>
            <HintButton
              type='button'
              onClick={handleSkipWriting}
              disabled={hideSkipButton}
              style={hideSkipButton ? { visibility: 'hidden' } : undefined}
              aria-hidden={hideSkipButton}
              tabIndex={hideSkipButton ? -1 : undefined}
            >
              {t('study.writing.skip')}
            </HintButton>
            <SubmitButtonGroup>
              <WordCounter>
                <WordCountValue>
                  {t('study.writing.wordCount', { count: wordCount })}
                </WordCountValue>{' '}
                ({minWords}~{maxWords})
              </WordCounter>
              <ActionButtonRow>
                <HintButton type='button' onClick={handleSaveDraft}>
                  {draftSaved
                    ? t('study.writing.saved')
                    : t('study.writing.saveDraft')}
                </HintButton>
                <SubmitButton
                  type='button'
                  className={canSubmit ? 'active' : undefined}
                  disabled={!canSubmit}
                  onClick={handleSubmitAnswers}
                >
                  {revisionMode === 'limit'
                    ? t('study.writing.submitRevision')
                    : t('study.writing.submit')}
                </SubmitButton>
              </ActionButtonRow>
            </SubmitButtonGroup>
          </BottomBar>
        ) : null}
      </Wrapper>

      {isRevisionConfirmOpen ? (
        <WritingRevisionConfirmPopup
          maxRevision={maxRevision}
          completedRevision={completedRevision}
          teacherCompletedRevision={teacherCompletedRevision}
          showRevisionStats={showRevisionStats}
          showModeBadge={!isNoRevision}
          revisionMode={revisionMode}
          isRevisionExhausted={isRevisionExhausted}
          onConfirm={handleRevisionConfirm}
          onCancel={handleRevisionCancel}
        />
      ) : null}
    </>
  )
}

const InputArea = styled.div`
  width: 100%;
  box-sizing: border-box;
  min-height: 120px;
  background-color: #fff;
  border: 1.5px solid #e9edf3;
  border-radius: 20px;
  padding: 20px;
  padding-bottom: 0;
`

const InputAreaTextarea = styled.textarea`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  min-height: 100px;
  font-family: 'Rg-R', 'Fredoka', sans-serif;
  font-size: 16px;
  background-color: transparent;
  resize: none;
  border: none;
  padding: 0;
  padding-bottom: 20px;
  -webkit-tap-highlight-color: transparent;

  &::placeholder {
    color: rgb(162, 177, 196, 0.5);
  }

  &:focus {
    box-shadow: none;
  }
`

const Wrapper = styled.div<{ $heightPx: number }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: ${(p) => p.$heightPx}px;
  min-height: 0;
`

const BottomBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
  margin-top: auto;
  padding: 16px 50px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background-color: rgba(255, 255, 255, 0.6);

  ${media.tablet} {
    padding: 12px 24px;
  }

  ${media.mobile} {
    flex-direction: column;
    align-items: stretch;
    flex-wrap: nowrap;
    padding: 12px 12px;

    > button[aria-hidden='true'] {
      display: none;
    }

    > button {
      width: 100%;
    }
  }
`

const SubmitButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  ${media.mobile} {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
`

const ActionButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 10px;

  > button {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  ${media.tablet} {
    width: 100%;

    > button {
      flex: 1 1 0;
      min-width: 0;
      width: auto;
    }
  }
`

const WordCounter = styled.div`
  font-family: 'Rg-R', 'Fredoka', sans-serif;
  font-size: 14px;
  color: #a2b1c4;

  ${media.mobile} {
    text-align: center;
  }
`

const SubmitButton = styled(Button)`
  cursor: not-allowed;
  background-color: rgba(32, 173, 117, 0.2);
  padding: 10px 20px;
  border: 1.5px solid transparent;
  border-radius: 999px;
  color: #fff;
  font-family: 'Rg-B', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  box-sizing: border-box;

  &.active {
    cursor: pointer;
    background-color: #20ad75;

    &:active {
      transform: scale(0.98);
    }
  }

  &:disabled {
    opacity: 1;
  }
`

const WordCountValue = styled.span`
  font-family: 'Rg-B', 'Fredoka', sans-serif;
  color: #20ad75;
`
