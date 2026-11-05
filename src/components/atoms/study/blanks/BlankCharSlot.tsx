import { styled } from 'styled-components'

/** 블랭크 입력용 — 글자당 동일 너비 슬롯 */
const BlankCharSlot = styled.span<{
  $isCorrect?: boolean
  $isIncorrect?: boolean
  $isCurrent?: boolean
  $isFixed?: boolean
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0.8em;
  width: 0.8em;
  height: 1.5em;
  font-family: inherit;
  color: ${(props) =>
    props.$isCorrect ? '#199261' : props.$isIncorrect ? '#ef3d2e' : '#3c4b62'};
  border-bottom: 2px solid
    ${(props) =>
      props.$isFixed
        ? 'none'
        : props.$isCorrect
          ? '#199261'
          : props.$isIncorrect
            ? '#ef3d2e'
            : props.$isCurrent
              ? '#3c4b62'
              : '#a2b1c4'};
`

export default BlankCharSlot
