import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

import QuestionImageFrame, {
  QUESTION_IMAGE_FRAME_HEIGHT_PX,
} from '@components/atoms/study/question/images/QuestionImageFrame'

/** VocabularyTest2 — 직각 이미지, 좁은 프레임 */
const QuestionImageFrameVocabularyNarrow = styled(QuestionImageFrame)`
  width: fit-content;
  min-width: 0;
  max-width: 100%;
  min-height: 0;
  height: fit-content;
  flex: 0 0 auto;
  padding: 12px;
  margin-bottom: 0;
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
    min-width: 0;
    width: fit-content;
    --quiz-image-size: min(220px, 28vh);
    --quiz-image-size: min(220px, 28dvh);
    min-width: min(calc(var(--quiz-image-size) + 24px), 100%);
    min-height: calc(var(--quiz-image-size) + 24px);

    img {
      min-width: 0;
      max-width: 100%;
      width: auto;
      height: var(--quiz-image-size);
      max-height: var(--quiz-image-size);
      object-fit: contain;
    }
  }
`

export default QuestionImageFrameVocabularyNarrow
