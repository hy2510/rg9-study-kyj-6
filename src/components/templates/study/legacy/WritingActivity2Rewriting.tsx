import { type ChangeEvent, useEffect, useRef, useState } from 'react'

import { BREAKPOINT_MOBILE_MAX, media } from '@styles/tokens/breakpoints'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import QuizComment from '@components/atoms/study/comments/QuizComment'
import {
  calcQuizBodyMaxHeightPx,
  QUIZ_BODY_MAX_HEIGHT_OFFSET_MOBILE_PX,
  QUIZ_BODY_MAX_HEIGHT_OFFSET_PX,
  QuizBody,
} from '@components/atoms/study/layout/QuizBody'
import RevisionReport from '@components/organisms/study/writing/RevisionReport'
import { ILegacyStudyData } from '@interfaces/study/legacy/LegacyStudy'
import Button from '@src/components/atoms/common/Button'
import { IWritingActivity2 } from '@src/interfaces/study/IWritingActivity'
import { saveRewriting } from '@src/services/studyApi'
import { captureFinishStudyInfoFromResult } from '@src/utils/study/finishStudyInfo'
import { countWords } from '@src/utils/study/legacy/writingActivityHelpers'

/**
 * 리뷰 모드 · 재작성 (RevisionStatusCode ∈ {028009, 028010}).
 *
 * - 상단: 첨삭 리포트(이미지 2장 + 코멘트) 노출
 * - 중단: 하나의 큰 textarea 로 재작성 (`IsReWriting=false` 이면 조회 전용)
 * - 하단: 단어 수 카운터 + 재작성 제출 버튼 (`IsReWriting=true` 에서만)
 *
 * 저장 성공 시 `captureFinishStudyInfoFromResult` 로 종료 메시지를 캡처하고
 * `onFinishActivity()` 를 호출한다.
 */
export default function WritingActivity2Rewriting(props: ILegacyStudyData) {
  const { t } = useTranslation()
  const quizData = props.quizData as IWritingActivity2 | undefined
  const recordedData = props.recordedData ?? []

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
  const [answer, setAnswer] = useState('')
  const [isReady, setIsReady] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const seededRef = useRef(false)

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

  useEffect(() => {
    if (seededRef.current) return
    if (!quizData) return
    seededRef.current = true
    // 7차 방식: 저장된 record 각 문항의 TempText 를 하나의 문단으로 이어붙여 초기값으로 사용
    const seed = recordedData.map((r) => r.TempText ?? '').join('\n\n')
    setAnswer(seed)
    setIsReady(true)
  }, [quizData, recordedData])

  if (!quizData) return <CenteredLoading />

  const rewriting = quizData.Rewriting
  const isRewritingEnabled = Boolean(rewriting?.IsReWriting)
  const minWords = quizData.Writing?.WordMinCount ?? 10
  const maxWords = quizData.Writing?.WordMaxCount ?? 300
  const wordCount = countWords(answer)
  const canSubmit =
    !isFinished &&
    !isSaving &&
    isRewritingEnabled &&
    answer.trim().length > 0 &&
    wordCount >= minWords &&
    wordCount <= maxWords

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSaving(true)
    setIsFinished(true)
    try {
      const res = await saveRewriting(props.mode, {
        bookType: props.bookType,
        studyId: props.studyId,
        studentHistoryId: props.studentHistoryId,
        writeText: answer,
      })
      captureFinishStudyInfoFromResult(res)
      props.onFinishActivity()
    } catch {
      setIsFinished(false)
    } finally {
      setIsSaving(false)
    }
  }

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

  return (
    <Wrapper $heightPx={panelBodyHeightPx}>
      <QuizBody $maxHeightPx={quizBodyMaxHeightPx}>
        <RevisionReport
          revisionImageTop={rewriting?.ReWritingImage1}
          revisionImageBottom={rewriting?.ReWritingImage2}
          comment={rewriting?.ReWritingComment}
        />

        <QuizComment
          style={{
            color: '#3C4B62',
            fontFamily: 'RG-B, sans-serif',
            marginTop: '8px',
          }}
        >
          {t('study.writing.rewriting.instruction')}
        </QuizComment>

        <InputArea>
          <InputAreaTextarea
            value={answer}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setAnswer(event.target.value)
            }
            placeholder={t('study.writing.rewriting.placeholder', {
              min: minWords,
              max: maxWords,
            })}
            disabled={!isRewritingEnabled || isFinished}
            readOnly={!isRewritingEnabled}
          />
        </InputArea>
      </QuizBody>

      {isReady && isRewritingEnabled ? (
        <BottomBar ref={bottomBarRef}>
          <WordCounter>
            <WordCountValue>
              {t('study.writing.wordCount', { count: wordCount })}
            </WordCountValue>{' '}
            ({minWords}~{maxWords})
          </WordCounter>
          <ActionButtonRow>
            <SubmitButton
              type='button'
              className={canSubmit ? 'active' : undefined}
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {t('study.writing.rewriting.submit')}
            </SubmitButton>
          </ActionButtonRow>
        </BottomBar>
      ) : null}
    </Wrapper>
  )
}

const Wrapper = styled.div<{ $heightPx: number }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: ${(p) => p.$heightPx}px;
  min-height: 0;
`

const InputArea = styled.div`
  width: 100%;
  box-sizing: border-box;
  min-height: 200px;
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
  min-height: 180px;
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

  &:disabled,
  &[readonly] {
    color: #3c4b62;
    cursor: default;
  }
`

const BottomBar = styled.div`
  display: flex;
  justify-content: flex-end;
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

    > * {
      width: 100%;
    }
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

const WordCountValue = styled.span`
  font-family: 'Rg-B', 'Fredoka', sans-serif;
  color: #20ad75;
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
