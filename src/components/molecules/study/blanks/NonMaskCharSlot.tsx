import { useEffect, useRef } from 'react'

import { styled } from 'styled-components'

type NonMaskCharSlotProps = {
  answer: string
  input: string
  isCurrent: boolean
  slotIncorrect: boolean
  onInputChange: (value: string) => void
  disabled?: boolean
}

/** 비마스크 모드: 정답 글자 수만큼 너비 + 여유 10px 의 단일 input */
export default function NonMaskCharSlot({
  answer,
  input,
  isCurrent,
  slotIncorrect,
  onInputChange,
  disabled = false,
}: NonMaskCharSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isCurrent) {
      inputRef.current?.focus()
    }
  }, [isCurrent])

  // input 값 변경 시 커서 끝(뒷칸)이 보이도록 스크롤
  useEffect(() => {
    const el = inputRef.current
    if (el) {
      el.scrollLeft = el.scrollWidth - el.clientWidth
    }
  }, [input])

  return (
    <BlankInputField
      ref={inputRef}
      type='text'
      value={input}
      onChange={(e) => {
        const filtered = e.target.value.replace(/[^a-zA-Z\s]/g, '')
        onInputChange(filtered)
      }}
      $answerCharCount={answer.length}
      $isCurrent={isCurrent}
      $isIncorrect={slotIncorrect}
      disabled={disabled}
    />
  )
}

const BlankInputField = styled.input<{
  $isCurrent?: boolean
  $isIncorrect?: boolean
  $answerCharCount: number
}>`
  box-sizing: border-box;
  width: calc(
    ${({ $answerCharCount }) => Math.max(1, $answerCharCount)}ch + 10px
  );
  min-width: calc(
    ${({ $answerCharCount }) => Math.max(1, $answerCharCount)}ch + 10px
  );
  max-width: calc(
    ${({ $answerCharCount }) => Math.max(1, $answerCharCount)}ch + 10px
  );
  height: 1.5em;
  padding: 0 2px;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  color: ${(props) =>
    props.$isIncorrect ? '#ef3d2e' : 'var(--color-primary, #3c4b62)'};
  background: transparent;
  border: none;
  border-bottom: 2px solid
    ${(props) =>
      props.$isIncorrect
        ? '#ef3d2e'
        : props.$isCurrent
          ? '#3c4b62'
          : '#a2b1c4'};
  outline: none;
  vertical-align: middle;

  &::placeholder {
    color: #a2b1c4;
  }
`
