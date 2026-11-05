import styled from 'styled-components'

import QuizOptionImageFrame from '@components/atoms/study/quizOptions/images/QuizOptionImageFrame'
import { media } from '@src/styles/tokens/breakpoints'

/** ListeningActivity1 보기 카드 이미지 영역 */
const QuizOptionImageFrameListeningActivity1 = styled(QuizOptionImageFrame)`
  min-height: 168px;

  ${media.mobile} {
    min-height: 100px;
  }

  img {
    width: 100%;
    height: auto;
    display: block;
    transition: opacity 0.3s ease;
  }
`

export default QuizOptionImageFrameListeningActivity1
