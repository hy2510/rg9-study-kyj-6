import { type RefObject, useEffect, useRef, useState } from 'react'

import styled from 'styled-components'

import { getLettersOnly } from '@utils/spellingUtils'

type Props = {
  word: string
  value: string
  onValueChange: (value: string) => void
  onEnter: () => void
  inputRef?: RefObject<HTMLInputElement>
}

/** Keep the existing slots visible while the actual input owns native editing. */
export default function MobileVocabularyInput({
  word,
  value,
  onValueChange,
  onEnter,
  inputRef: suppliedInputRef,
}: Props) {
  const localInputRef = useRef<HTMLInputElement>(null)
  const inputRef = suppliedInputRef ?? localInputRef
  const composing = useRef(false)
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    if (!composing.current) setDraft(value)
  }, [value])

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [word, inputRef])

  const commit = (text: string) => {
    const normalized = getLettersOnly(text)
      .toLowerCase()
      .slice(0, getLettersOnly(word).length)
    setDraft(normalized)
    onValueChange(normalized)
  }

  return (
    <Input
      ref={inputRef}
      aria-label='System keyboard spelling input'
      type='text'
      inputMode='text'
      enterKeyHint='done'
      autoCapitalize='none'
      autoComplete='off'
      autoCorrect='off'
      spellCheck={false}
      value={draft}
      onChange={(event) => {
        if (composing.current) setDraft(event.currentTarget.value)
        else commit(event.currentTarget.value)
      }}
      onCompositionStart={() => {
        composing.current = true
      }}
      onCompositionEnd={(event) => {
        composing.current = false
        commit(event.currentTarget.value)
      }}
      onKeyDown={(event) => {
        if (
          event.key !== 'Enter' ||
          event.nativeEvent.isComposing ||
          composing.current
        )
          return
        event.preventDefault()
        event.stopPropagation()
        onEnter()
      }}
    />
  )
}

const Input = styled.input`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0;
  border: 0;
  background: transparent;
  color: transparent;
  caret-color: transparent;
  opacity: 0.01;
  font-size: 16px;
  z-index: 1;
`
