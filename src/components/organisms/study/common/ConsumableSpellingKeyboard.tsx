import {
  type ChangeEvent,
  type CompositionEvent,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { media } from '@styles/tokens/breakpoints'
import styled, { css } from 'styled-components'

import { IconArrowRightWhite } from '@components/atoms/common/icons/IconArrowRightWhite'
import { IconDeleteKey } from '@components/atoms/common/icons/IconDeleteKey'
import { IconKeyboardFull } from '@components/atoms/common/icons/IconKeyboardFull'
import { IconKeyboardSimple } from '@components/atoms/common/icons/IconKeyboardSimple'
import { IconRecordingInput } from '@components/atoms/common/icons/IconRecordingInput'
import { getLettersOnly } from '@utils/spellingUtils'

const QWERTY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].map((row) =>
  row.split(''),
)

type InputMode = 'simple' | 'full' | 'recording'

type LetterKey = {
  id: string
  letter: string
}

type ConsumableSpellingKeyboardProps = {
  correctWord: string
  inputLetters: string
  isEnterEnabled: boolean
  fullKeyboardOnly?: boolean
  allowFullKeyboardToggle?: boolean
  allowRecordingMode?: boolean
  recordingContent?: ReactNode
  allowNativeKeyboard?: boolean
  /** Vocabulary uses the device keyboard for the full-input option on phones. */
  systemKeyboardForFullMode?: boolean
  disabled?: boolean
  isNativeMode: boolean
  onInputModeChange?: (mode: InputMode) => void
  onNativeModeChange: (isNative: boolean) => void
  onNativeValueChange: (value: string) => void
  onRemoveInputLetter: (letterIndex: number) => void
  onKeyPress: (key: string) => void
}

function shuffleArray<T>(values: T[]): T[] {
  const shuffled = [...values]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function buildSimpleKeys(correctWord: string): LetterKey[] {
  const occurrenceByLetter = new Map<string, number>()
  const keys = getLettersOnly(correctWord)
    .toLowerCase()
    .split('')
    .map((letter) => {
      const occurrence = occurrenceByLetter.get(letter) ?? 0
      occurrenceByLetter.set(letter, occurrence + 1)
      return { id: `${letter}-${occurrence}`, letter }
    })

  return shuffleArray(keys)
}

/** 승인된 스펠링 활동에서만 사용하는 소진형/기기 키보드 전환 UI */
export default function ConsumableSpellingKeyboard({
  correctWord,
  inputLetters,
  isEnterEnabled,
  fullKeyboardOnly = false,
  allowFullKeyboardToggle = false,
  allowRecordingMode = false,
  recordingContent,
  allowNativeKeyboard = false,
  systemKeyboardForFullMode = false,
  disabled = false,
  isNativeMode,
  onInputModeChange,
  onNativeModeChange,
  onNativeValueChange,
  onRemoveInputLetter,
  onKeyPress,
}: ConsumableSpellingKeyboardProps) {
  const [inputMode, setInputMode] = useState<InputMode>(
    fullKeyboardOnly ? 'full' : 'simple',
  )
  const [nativeDraft, setNativeDraft] = useState(inputLetters)
  const [simpleKeyIdsByInputIndex, setSimpleKeyIdsByInputIndex] = useState<
    (string | null)[]
  >([])
  const nativeInputRef = useRef<HTMLInputElement>(null)
  const isComposingRef = useRef(false)
  const simpleKeys = useMemo(() => buildSimpleKeys(correctWord), [correctWord])
  const simpleUsage = useMemo(
    () =>
      new Map(
        simpleKeyIdsByInputIndex.flatMap((keyId, inputIndex) =>
          keyId ? [[keyId, inputIndex] as const] : [],
        ),
      ),
    [simpleKeyIdsByInputIndex],
  )

  const isFullKeyboard = fullKeyboardOnly || inputMode === 'full'
  const isRecordingInput = inputMode === 'recording'
  const isNativeKeyboardActive = allowNativeKeyboard && isNativeMode

  const focusNativeInput = useCallback(() => {
    const input = nativeInputRef.current
    if (!input) return
    input.focus()
    input.setSelectionRange(input.value.length, input.value.length)
  }, [])

  useEffect(() => {
    if (!isNativeKeyboardActive || disabled) return
    focusNativeInput()
    // 문제가 바뀐 뒤 시스템 입력을 계속할 수 있게 커서를 끝으로 이동한다.
  }, [correctWord, disabled, focusNativeInput, isNativeKeyboardActive])

  useEffect(() => {
    if (isComposingRef.current) return
    setNativeDraft(inputLetters)
  }, [inputLetters])

  useEffect(() => {
    setSimpleKeyIdsByInputIndex((previous) => {
      const usedKeyIds = new Set<string>()
      return inputLetters.split('').map((letter, inputIndex) => {
        const previousKeyId = previous[inputIndex]
        const previousKey = simpleKeys.find(
          (candidate) => candidate.id === previousKeyId,
        )
        if (previousKey?.letter === letter && !usedKeyIds.has(previousKey.id)) {
          usedKeyIds.add(previousKey.id)
          return previousKey.id
        }

        const availableKey = simpleKeys.find(
          (candidate) =>
            candidate.letter === letter && !usedKeyIds.has(candidate.id),
        )
        if (!availableKey) return null
        usedKeyIds.add(availableKey.id)
        return availableKey.id
      })
    })
  }, [inputLetters, simpleKeys])

  const selectInputMode = (mode: InputMode) => {
    if (disabled) return
    setInputMode(mode)
    onNativeModeChange(false)
    onInputModeChange?.(mode)
  }

  const selectNativeMode = () => {
    if (disabled || !allowNativeKeyboard) return
    const keyboardMode: InputMode = fullKeyboardOnly ? 'full' : 'simple'
    setInputMode(keyboardMode)
    onNativeModeChange(true)
    onInputModeChange?.(keyboardMode)
    // iOS에서는 사용자 click 스택 안에서 focus해야 시스템 키보드가 열린다.
    focusNativeInput()
  }

  const selectOnScreenMode = () => {
    if (disabled) return
    nativeInputRef.current?.blur()
    onNativeModeChange(false)
  }

  const normalizeNativeValue = (value: string) =>
    getLettersOnly(value)
      .toLowerCase()
      .slice(0, getLettersOnly(correctWord).length)

  const handleNativeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value
    if (isComposingRef.current) {
      setNativeDraft(value)
      return
    }
    const normalizedValue = normalizeNativeValue(value)
    setNativeDraft(normalizedValue)
    onNativeValueChange(normalizedValue)
  }

  const handleCompositionStart = () => {
    isComposingRef.current = true
  }

  const handleCompositionEnd = (event: CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false
    const normalizedValue = normalizeNativeValue(event.currentTarget.value)
    setNativeDraft(normalizedValue)
    onNativeValueChange(normalizedValue)
  }

  const handleNativeKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || isComposingRef.current) return
    if (event.key === 'Enter') {
      event.preventDefault()
      onKeyPress('enter')
    } else if (event.key === 'Escape') {
      event.preventDefault()
      selectOnScreenMode()
    }
  }

  const handleSimpleKey = (key: LetterKey) => {
    if (disabled) return
    const usedInputIndex = simpleUsage.get(key.id)
    if (usedInputIndex !== undefined) {
      setSimpleKeyIdsByInputIndex((previous) =>
        previous.filter((_, inputIndex) => inputIndex !== usedInputIndex),
      )
      onRemoveInputLetter(usedInputIndex)
      return
    }
    if (inputLetters.length >= getLettersOnly(correctWord).length) return
    setSimpleKeyIdsByInputIndex((previous) => [...previous, key.id])
    onKeyPress(key.letter)
  }

  return (
    <KeyboardRoot>
      <NativeInput
        ref={nativeInputRef}
        type='text'
        inputMode='text'
        enterKeyHint='done'
        autoCapitalize='none'
        autoComplete='off'
        spellCheck={false}
        disabled={disabled || !allowNativeKeyboard}
        tabIndex={isNativeKeyboardActive ? 0 : -1}
        aria-label='System keyboard spelling input'
        value={nativeDraft}
        onChange={handleNativeChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleNativeKeyDown}
      />

      {isNativeKeyboardActive ? (
        <NativeModePanel>
          <NativeKeyboardButton
            type='button'
            disabled={disabled}
            aria-label='Open system keyboard'
            onClick={focusNativeInput}
          >
            <IconKeyboardFull width={22} height={22} />
            System keyboard
          </NativeKeyboardButton>
          <OnScreenReturnButton
            type='button'
            disabled={disabled}
            aria-label='Use on-screen keyboard'
            onClick={selectOnScreenMode}
          >
            <SwitchGlyph aria-hidden='true'>↻</SwitchGlyph>
            On-screen keyboard
          </OnScreenReturnButton>
        </NativeModePanel>
      ) : (
        <>
          {(((allowFullKeyboardToggle || allowRecordingMode) &&
            !fullKeyboardOnly) ||
            allowNativeKeyboard) && (
            <ControlRow>
              <ControlSpacer />
              {(allowFullKeyboardToggle || allowRecordingMode) &&
                !fullKeyboardOnly && (
                  <KeyboardModeToggle role='group' aria-label='Keyboard mode'>
                    <ToggleOption
                      type='button'
                      disabled={disabled}
                      $active={inputMode === 'simple'}
                      onClick={() => selectInputMode('simple')}
                      aria-pressed={inputMode === 'simple'}
                      aria-label='Simple keyboard'
                    >
                      <IconKeyboardSimple width={20} height={20} />
                    </ToggleOption>
                    <ToggleOption
                      type='button'
                      disabled={disabled}
                      $active={isFullKeyboard}
                      onClick={() => selectInputMode('full')}
                      aria-pressed={isFullKeyboard}
                      aria-label={
                        systemKeyboardForFullMode
                          ? 'System keyboard'
                          : 'Full keyboard'
                      }
                    >
                      <IconKeyboardFull width={20} height={20} />
                    </ToggleOption>
                    {allowRecordingMode && (
                      <ToggleOption
                        type='button'
                        disabled={disabled}
                        $active={isRecordingInput}
                        $emphasized
                        onClick={() => selectInputMode('recording')}
                        aria-pressed={isRecordingInput}
                        aria-label='Voice input'
                      >
                        <IconRecordingInput width={20} height={20} />
                      </ToggleOption>
                    )}
                  </KeyboardModeToggle>
                )}
              {allowNativeKeyboard && (
                <NativeModeButton
                  type='button'
                  disabled={disabled}
                  aria-label='Switch to system keyboard'
                  title='System keyboard'
                  onClick={selectNativeMode}
                >
                  <SwitchGlyph aria-hidden='true'>↻</SwitchGlyph>
                  <IconKeyboardFull width={18} height={18} />
                </NativeModeButton>
              )}
            </ControlRow>
          )}

          {isRecordingInput && recordingContent
            ? recordingContent
            : (isFullKeyboard && systemKeyboardForFullMode
                ? []
                : isFullKeyboard
                  ? QWERTY_ROWS
                  : [simpleKeys]
              ).map((row, rowIndex) => {
                const isLastRow =
                  rowIndex ===
                  (isFullKeyboard && !systemKeyboardForFullMode
                    ? QWERTY_ROWS.length
                    : 1) -
                    1
                return (
                  <KeyRow key={rowIndex} $compactRow={isFullKeyboard}>
                    {row.map((item) => {
                      const key =
                        typeof item === 'string'
                          ? { id: item, letter: item }
                          : item
                      const isConsumed =
                        !isFullKeyboard && simpleUsage.has(key.id)
                      return (
                        <LetterKeyButton
                          key={key.id}
                          type='button'
                          disabled={disabled}
                          $compactRow={isFullKeyboard}
                          $consumed={isConsumed}
                          aria-pressed={isFullKeyboard ? undefined : isConsumed}
                          aria-label={`${key.letter}${
                            isConsumed ? ', selected; press to remove' : ''
                          }`}
                          onClick={() =>
                            isFullKeyboard
                              ? onKeyPress(key.letter)
                              : handleSimpleKey(key)
                          }
                        >
                          <KeyLabel $compactRow={isFullKeyboard}>
                            {key.letter}
                          </KeyLabel>
                        </LetterKeyButton>
                      )
                    })}
                    {isLastRow &&
                      !(isFullKeyboard && systemKeyboardForFullMode) && (
                        <ActionKey
                          type='button'
                          disabled={disabled}
                          onClick={() => onKeyPress('backspace')}
                          $compactRow={isFullKeyboard}
                          aria-label='Delete last letter'
                        >
                          <IconDeleteKey
                            className='key-icon'
                            width={20}
                            height={20}
                          />
                        </ActionKey>
                      )}
                    {isLastRow && (
                      <ActionKey
                        type='button'
                        onClick={() => onKeyPress('enter')}
                        onMouseDown={(event) => event.preventDefault()}
                        disabled={disabled || !isEnterEnabled}
                        $isEnter
                        $compactRow={isFullKeyboard}
                        aria-label='Submit spelling'
                      >
                        <IconArrowRightWhite
                          className='key-icon'
                          width={20}
                          height={20}
                        />
                      </ActionKey>
                    )}
                  </KeyRow>
                )
              })}
        </>
      )}
    </KeyboardRoot>
  )
}

const KeyboardRoot = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`

const NativeInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  border: 0;
  opacity: 0.01;
  overflow: hidden;
`

const ControlRow = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr 48px;
  align-items: center;
  padding: 4px 4px 8px;

  ${media.mobile} {
    grid-template-columns: 42px 1fr 42px;
    padding: 2px 2px 6px;
  }
`

const ControlSpacer = styled.span`
  width: 1px;
  height: 1px;
`

const KeyboardModeToggle = styled.div`
  display: inline-flex;
  justify-self: center;
  align-items: center;
  gap: 2px;
  padding: 3px;
  background: #f4f6f8;
  border: 1.5px solid #e9edf3;
  border-radius: 14px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
`

const ToggleOption = styled.button<{
  $active?: boolean
  $emphasized?: boolean
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 11px;
  background: ${({ $active }) => ($active ? '#fff' : 'transparent')};
  box-shadow: ${({ $active }) =>
    $active ? '0 1px 3px rgba(60, 75, 98, 0.12)' : 'none'};
  cursor: pointer;
  opacity: ${({ $active, $emphasized }) =>
    $active ? 1 : $emphasized ? 0.85 : 0.55};

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`

const NativeModeButton = styled.button`
  display: inline-flex;
  justify-self: end;
  align-items: center;
  justify-content: center;
  gap: 1px;
  width: 42px;
  height: 32px;
  padding: 0;
  border: 1.5px solid #dbe2eb;
  border-radius: 11px;
  background: #fff;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const SwitchGlyph = styled.span`
  font-size: 16px;
  line-height: 1;
  color: #687991;
`

const NativeModePanel = styled.div`
  display: flex;
  min-height: 116px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  box-sizing: border-box;

  ${media.mobile} {
    flex-direction: column;
  }
`

const NativeKeyboardButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 44px;
  padding: 0 16px;
  border: 1.5px solid #dbe2eb;
  border-radius: 12px;
  background: #fff;
  color: #3c4b62;
  font:
    600 15px 'Rg-B',
    sans-serif;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const OnScreenReturnButton = styled(NativeKeyboardButton)`
  background: #f4f6f8;
`

const KeyRow = styled.div<{ $compactRow: boolean }>`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  padding: 4px;
  box-sizing: border-box;

  ${media.mobile} {
    gap: 4px;
    padding: 2px 0;
  }

  ${({ $compactRow }) =>
    $compactRow &&
    css`
      ${media.mobile} {
        flex-wrap: nowrap;
      }
    `}
`

const BaseKey = styled.button<{ $compactRow: boolean }>`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  height: 52px;
  padding: 0;
  border: 1.5px solid #e9edf3;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 2px 0 #e9edf3;
  box-sizing: border-box;
  cursor: pointer;
  transition:
    transform 0.05s ease,
    opacity 0.15s ease,
    background 0.15s ease;

  ${media.mobile} {
    min-width: ${({ $compactRow }) => ($compactRow ? 0 : '36px')};
    width: ${({ $compactRow }) => ($compactRow ? 'auto' : '36px')};
    height: ${({ $compactRow }) => ($compactRow ? '40px' : '44px')};
    flex: ${({ $compactRow }) => ($compactRow ? '1 1 0' : '0 0 auto')};
    border-radius: 10px;
  }

  &:active:not(:disabled) {
    transform: translateY(2px);
    box-shadow: none;
  }

  &:focus-visible {
    outline: 3px solid rgba(32, 173, 117, 0.35);
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
  }
`

const LetterKeyButton = styled(BaseKey)<{ $consumed: boolean }>`
  background: ${({ $consumed }) => ($consumed ? '#e5e9ef' : '#fff')};
  box-shadow: ${({ $consumed }) =>
    $consumed ? 'inset 0 1px 2px rgba(60, 75, 98, 0.14)' : '0 2px 0 #e9edf3'};
  opacity: ${({ $consumed }) => ($consumed ? 0.48 : 1)};

  &:disabled {
    opacity: ${({ $consumed }) => ($consumed ? 0.48 : 0.5)};
  }
`

const ActionKey = styled(BaseKey)<{ $isEnter?: boolean }>`
  background: ${({ $isEnter }) => ($isEnter ? '#20ad75' : '#fff')};

  ${media.mobile} {
    flex: 0 0 40px;
    min-width: 40px;
    width: 40px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const KeyLabel = styled.span<{ $compactRow: boolean }>`
  color: #a2b1c4;
  font-family: 'Rg-B', sans-serif;
  font-size: 19.2px;
  font-weight: 600;
  line-height: 1;
  text-transform: lowercase;

  ${media.mobile} {
    font-size: ${({ $compactRow }) => ($compactRow ? '14px' : '16px')};
  }
`
