import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

import {
  QuizSelectableFeedbackStateProps,
  resolveQuizSelectableFeedback,
} from '@components/atoms/study/feedback/QuizSelectableFeedbackFoundation'

/**
 * Atom: 스펠링 입력 영역 컨테이너 (퀴즈 카드 팔레트).
 * 정답: #DDF2EA / 오답: #EDE7EE / 기본: #fff
 */
export const SpellingDisplayBox = styled.div<
  QuizSelectableFeedbackStateProps & {
    $plain?: boolean
    $clickable?: boolean
  }
>`
  display: flex;
  justify-content: safe center;
  align-items: center;
  gap: 4px;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  height: ${(p) => (p.$plain ? 'auto' : '80px')};
  min-height: ${(p) => (p.$plain ? '52px' : '0')};
  padding: ${(p) => (p.$plain ? '8px 0' : '16px')};
  margin-bottom: 12px;
  border-radius: ${(p) => (p.$plain ? '0' : '20px')};
  border: ${(p) =>
    p.$plain ? 'none' : resolveQuizSelectableFeedback(p).border};
  background: ${(p) =>
    p.$plain ? 'transparent' : resolveQuizSelectableFeedback(p).bg};
  transition: all 0.2s ease;
  box-sizing: border-box;
  max-width: 100%;
  cursor: ${(p) => (p.$clickable ? 'pointer' : 'default')};

  ${media.mobile} {
    gap: 2px;
    height: ${(p) => (p.$plain ? 'auto' : '64px')};
    min-height: ${(p) => (p.$plain ? '44px' : '0')};
    padding: ${(p) => (p.$plain ? '6px 0' : '10px 8px')};
    margin-bottom: 8px;
  }
`
