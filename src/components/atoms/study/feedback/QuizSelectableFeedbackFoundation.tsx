import styled, { css } from 'styled-components'

const quizSelectableFeedbackPalette = {
  correct: {
    bg: '#DDF2EA',
    border: '1.5px solid #1baa70',
    boxShadow: '0 3px 0 0 #1baa70',
  },
  incorrect: {
    bg: '#EDE7EE',
    border: '1.5px solid #ef3d2e',
    boxShadow: '0 3px 0 0 #ef3d2e',
  },
  default: {
    bg: '#fff',
    border: '1.5px solid #e9edf3',
    boxShadow: '0 3px 0 0 #e9edf3',
  },
} as const

export type QuizSelectableFeedbackStateProps = {
  $isCorrect?: boolean
  $isIncorrect?: boolean
  isCorrect?: 'correct' | 'incorrect' | ''
}

/** 정답/오답/기본 — 배경·테두리·그림자 */
export function resolveQuizSelectableFeedback(
  props: QuizSelectableFeedbackStateProps,
) {
  const isCorrect = props.$isCorrect ?? props.isCorrect === 'correct'
  const isIncorrect = props.$isIncorrect ?? props.isCorrect === 'incorrect'
  if (isCorrect) return quizSelectableFeedbackPalette.correct
  if (isIncorrect) return quizSelectableFeedbackPalette.incorrect
  return quizSelectableFeedbackPalette.default
}

/** 눌림 — 그림자 제거 + translateY */
export const quizSelectablePressedStyle = css`
  box-shadow: none;
  transform: translateY(3px);
`

export type QuizSelectableFeedbackBoxProps =
  QuizSelectableFeedbackStateProps & {
    $pressed?: boolean
  }

/** Atom: 피드백 테두리·배경·그림자·눌림만 담당하는 기본 면 (레이아웃·cursor 등은 확장 측에서) */
export const QuizSelectableFeedbackBox = styled.div<QuizSelectableFeedbackBoxProps>`
  border: ${(p) => resolveQuizSelectableFeedback(p).border};
  background: ${(p) => resolveQuizSelectableFeedback(p).bg};
  box-shadow: ${(p) => resolveQuizSelectableFeedback(p).boxShadow};
  ${(p) => p.$pressed && quizSelectablePressedStyle}
`
