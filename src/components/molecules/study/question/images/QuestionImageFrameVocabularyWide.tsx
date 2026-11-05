import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

import QuestionImageFrame, {
  QUESTION_IMAGE_FRAME_HEIGHT_PX,
} from '@components/atoms/study/question/images/QuestionImageFrame'

/** VocabularyTest1 — 직각 이미지, 넓은 프레임 */
const QuestionImageFrameVocabularyWide = styled(QuestionImageFrame)`
  width: fit-content;
  min-width: 0;
  min-height: 0;
  max-width: 100%;
  height: fit-content;
  flex: 0 0 auto;
  padding: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  --quiz-image-size: min(${QUESTION_IMAGE_FRAME_HEIGHT_PX}px, 32vh);
  --quiz-image-size: min(${QUESTION_IMAGE_FRAME_HEIGHT_PX}px, 32dvh);
  min-width: min(calc(var(--quiz-image-size) + 24px), 100%);
  min-height: calc(var(--quiz-image-size) + 24px);

  img {
    display: block;
    min-width: 0;
    max-width: 100%;
    width: auto;
    height: var(--quiz-image-size);
    max-height: var(--quiz-image-size);
    object-fit: contain;
    flex: 0 1 auto;
  }

  ${media.mobile} {
    width: fit-content;
    min-width: 0;
    min-height: 0;
    margin-bottom: 12px;
    --quiz-image-size: min(220px, 28vh);
    --quiz-image-size: min(220px, 28dvh);
    min-width: min(calc(var(--quiz-image-size) + 24px), 100%);
    min-height: calc(var(--quiz-image-size) + 24px);

    img {
      width: auto;
      max-width: 100%;
      height: var(--quiz-image-size);
      max-height: var(--quiz-image-size);
      object-fit: contain;
    }
  }
`

export default QuestionImageFrameVocabularyWide
