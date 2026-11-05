import styled, { css } from 'styled-components'

import QuizOptionImageFrame from '@components/atoms/study/quizOptions/images/QuizOptionImageFrame'

/** ListeningActivity3, ReadingComprehension1 — LargeImageQuizChoiceCard 이미지 영역 */
const QuizOptionImageFrameLargeChoice = styled(QuizOptionImageFrame)<{
  $reserveLoadingHeight?: boolean
}>`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  ${({ $reserveLoadingHeight }) =>
    $reserveLoadingHeight &&
    css`
      &&& {
        height: clamp(180px, 38vh, 320px);
        height: clamp(180px, 38dvh, 320px);
        min-height: clamp(180px, 38vh, 320px);
        min-height: clamp(180px, 38dvh, 320px);
      }

      &&& img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      @media (max-width: 767px) and (orientation: portrait) {
        &&& {
          height: clamp(150px, 28vh, 240px);
          height: clamp(150px, 28dvh, 240px);
          min-height: clamp(150px, 28vh, 240px);
          min-height: clamp(150px, 28dvh, 240px);
        }
      }

      @media (max-width: 767px) and (orientation: landscape) {
        &&& {
          height: clamp(110px, 42vh, 170px);
          height: clamp(110px, 42dvh, 170px);
          min-height: clamp(110px, 42vh, 170px);
          min-height: clamp(110px, 42dvh, 170px);
        }
      }
    `}
`

export default QuizOptionImageFrameLargeChoice
