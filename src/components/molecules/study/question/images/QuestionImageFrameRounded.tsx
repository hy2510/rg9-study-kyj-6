import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

import QuestionImageFrame, {
  QUESTION_IMAGE_FRAME_HEIGHT_PX,
} from '@components/atoms/study/question/images/QuestionImageFrame'

/** ListeningActivity4, ReadingComprehension2·3 — 둥근 이미지 */
const QuestionImageFrameRounded = styled(QuestionImageFrame)`
  min-width: 370px;
  height: ${QUESTION_IMAGE_FRAME_HEIGHT_PX}px;
  margin-bottom: 16px;
  padding: 8px;
  flex-shrink: 0;

  img {
    display: block;
    width: auto;
    height: 100%;
    border-radius: 33px;
    object-fit: cover;
    object-position: center;
  }

  ${media.mobile} {
    min-width: 0;
    width: 100%;
    max-width: 100%;
    margin-bottom: 12px;
  }
`

export default QuestionImageFrameRounded
