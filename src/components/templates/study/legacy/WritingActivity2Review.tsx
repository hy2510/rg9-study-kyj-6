import { Fragment, useEffect, useState } from 'react'

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
import { ILegacyStudyData } from '@interfaces/study/legacy/LegacyStudy'
import { IWritingActivity2 } from '@src/interfaces/study/IWritingActivity'

/**
 * 리뷰 모드 · 첨삭 조회 (RevisionStatusCode ≠ 028009/028010).
 *
 * 이미 저장된 학생의 답안을 질문/답변(Q/A) 쌍으로 조회 전용 나열한다.
 * 다음 스텝 이동은 사이드 메뉴의 스텝 카드 헤더 클릭으로 처리 (리뷰 모드 정책).
 *
 * 안전 처리: 서버에 저장된 record 가 누락된 인덱스는 플레이스홀더로 표시해
 * 화면이 크래시하지 않도록 한다.
 */
export default function WritingActivity2Review(props: ILegacyStudyData) {
  const { t } = useTranslation()
  const quizData = props.quizData as IWritingActivity2 | undefined
  const recordedData = props.recordedData ?? []

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

  if (!quizData) return <CenteredLoading />

  const questions = quizData.Writing?.Question ?? []
  const quizBodyOffsetPx =
    viewport.w <= BREAKPOINT_MOBILE_MAX
      ? QUIZ_BODY_MAX_HEIGHT_OFFSET_MOBILE_PX
      : QUIZ_BODY_MAX_HEIGHT_OFFSET_PX
  const quizBodyMaxHeightPx = calcQuizBodyMaxHeightPx(
    viewport.h,
    quizBodyOffsetPx,
  )

  return (
    <QuizBody $maxHeightPx={quizBodyMaxHeightPx}>
      {questions.map((question, i) => {
        const answerText = recordedData[i]?.TempText?.trim()
        return (
          <Fragment key={i}>
            <QuizComment
              style={{
                color: '#3C4B62',
                fontFamily: 'RG-B, sans-serif',
                marginTop: '8px',
              }}
            >
              Q{i + 1}. {question}
            </QuizComment>
            <AnswerBox $isEmpty={!answerText}>
              {answerText ? (
                <AnswerText>{answerText}</AnswerText>
              ) : (
                <EmptyText>
                  — {t('study.writing.review.emptyAnswer')}
                </EmptyText>
              )}
            </AnswerBox>
          </Fragment>
        )
      })}
    </QuizBody>
  )
}

const AnswerBox = styled.div<{ $isEmpty: boolean }>`
  width: 100%;
  box-sizing: border-box;
  background-color: #fff;
  border: 1.5px solid ${({ $isEmpty }) => ($isEmpty ? '#f0f2f6' : '#e9edf3')};
  border-radius: 20px;
  padding: 20px;

  ${media.mobile} {
    padding: 14px;
    border-radius: 16px;
  }
`

const AnswerText = styled.p`
  margin: 0;
  font-family: 'Rg-R', 'Fredoka', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #3c4b62;
  white-space: pre-wrap;
  word-break: break-word;
`

const EmptyText = styled.p`
  margin: 0;
  font-family: 'Rg-R', 'Fredoka', sans-serif;
  font-size: 15px;
  color: #a2b1c4;
`
