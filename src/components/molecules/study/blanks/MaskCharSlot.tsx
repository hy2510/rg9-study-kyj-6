import { styled } from 'styled-components'

import BlankCharSlot from '@components/atoms/study/blanks/BlankCharSlot'
import {
  getDisplayChar,
  getLettersOnly,
  isSpecialOrSpace,
} from '@utils/spellingUtils'

type MaskCharSlotProps = {
  answer: string
  input: string
  isCurrent: boolean
  slotIncorrect: boolean
  showFirst?: boolean
  showLast?: boolean
}

/** 마스크 모드: _ _ _ _ (글자 수 표시, 길이 제한) + showFirst/showLast 힌트 */
export default function MaskCharSlot({
  answer,
  input,
  isCurrent,
  slotIncorrect,
  showFirst = false,
  showLast = false,
}: MaskCharSlotProps) {
  const lettersOnly = getLettersOnly(answer)
  return (
    <>
      {Array.from({ length: answer.length }).map((_, j) => {
        const char = answer[j]
        const fixed = isSpecialOrSpace(char)
        const letterIndex = getLettersOnly(answer.slice(0, j)).length
        const inputChar = input[letterIndex] ?? ''
        const displayChar = getDisplayChar(char, inputChar)
        const isFirstLetterSlot = !fixed && letterIndex === 0
        const isLastLetterSlot =
          !fixed && letterIndex === lettersOnly.length - 1
        const showAsHint =
          (showFirst && isFirstLetterSlot) || (showLast && isLastLetterSlot)
        const displayValue = fixed
          ? char
          : showAsHint
            ? displayChar || '\u00A0'
            : displayChar || '\u00A0'
        return (
          <BlankCharSlot
            key={j}
            $isCorrect={false}
            $isIncorrect={slotIncorrect}
            $isCurrent={isCurrent}
            $isFixed={fixed}
          >
            {showAsHint ? (
              <MaskSlotWithPlaceholder>
                <HintPlaceholder>{char}</HintPlaceholder>
                <InputOverlay>
                  <MaskCharTypography>{displayValue}</MaskCharTypography>
                </InputOverlay>
              </MaskSlotWithPlaceholder>
            ) : (
              <MaskCharTypography>{displayValue}</MaskCharTypography>
            )}
          </BlankCharSlot>
        )
      })}
    </>
  )
}

const MaskSlotWithPlaceholder = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`

/** 문장 타이포와 동일(크기·굵기·글꼴 상속), 색만 힌트용 */
const HintPlaceholder = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  color: #a2b1c4;
  pointer-events: none;
`

/** 마스크 칸 입력 글자 — 정답 행(BlankFilledText)과 동일하게 부모 문장 상속 */
const MaskCharTypography = styled.span`
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
`

const InputOverlay = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`
