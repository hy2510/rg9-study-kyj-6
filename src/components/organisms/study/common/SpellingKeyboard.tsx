import { type ReactNode, useMemo, useState } from 'react'

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

function shuffleArray<T>(values: T[]): T[] {
  const shuffled = [...values]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function getKeyLetters(
  correctWord: string,
  wrongKeyCount: number,
  totalKeyCount?: number,
): string[] {
  const lettersOnly = getLettersOnly(correctWord).toLowerCase()
  const correctLetters = lettersOnly.split('')
  const wrongPool = 'abcdefghijklmnopqrstuvwxyz'
    .split('')
    .filter((c) => !lettersOnly.includes(c))

  if (totalKeyCount !== undefined) {
    const need = Math.max(0, totalKeyCount - correctLetters.length)
    const wrongLetters = shuffleArray(wrongPool).slice(0, need)
    return shuffleArray([...correctLetters, ...wrongLetters])
  }

  const wrongLetters = wrongPool.slice(0, wrongKeyCount)
  return [...correctLetters, ...wrongLetters].sort()
}

type SpellingKeyboardProps = {
  correctWord: string
  showEnterButton?: boolean
  isEnterEnabled?: boolean
  wrongKeyCount?: number
  totalKeyCount?: number
  allowFullKeyboardToggle?: boolean
  fullKeyboardOnly?: boolean
  allowRecordingMode?: boolean
  recordingContent?: ReactNode
  onInputModeChange?: (mode: 'simple' | 'full' | 'recording') => void
  onKeyPress: (key: string) => void
}

/** 온스크린 가상 키보드 (Simple / Full QWERTY) */
export default function SpellingKeyboard({
  correctWord,
  showEnterButton = false,
  isEnterEnabled = false,
  wrongKeyCount = 5,
  totalKeyCount,
  allowFullKeyboardToggle = false,
  fullKeyboardOnly = false,
  allowRecordingMode = false,
  recordingContent,
  onInputModeChange,
  onKeyPress,
}: SpellingKeyboardProps) {
  const [inputMode, setInputMode] = useState<'simple' | 'full' | 'recording'>(
    'simple',
  )
  const isFullKeyboard = inputMode === 'full'
  const isRecordingInput = inputMode === 'recording'

  const selectInputMode = (mode: 'simple' | 'full' | 'recording') => {
    setInputMode(mode)
    onInputModeChange?.(mode)
  }

  const keyRows = useMemo(
    () =>
      fullKeyboardOnly || isFullKeyboard
        ? QWERTY_ROWS
        : [getKeyLetters(correctWord, wrongKeyCount, totalKeyCount)],
    [
      fullKeyboardOnly,
      isFullKeyboard,
      correctWord,
      wrongKeyCount,
      totalKeyCount,
    ],
  )

  return (
    <SpellingKeyboardRoot>
      {(allowFullKeyboardToggle || allowRecordingMode) && !fullKeyboardOnly && (
        <ToggleRow>
          <KeyboardModeToggle role='group' aria-label='Keyboard mode'>
            <ToggleOption
              type='button'
              $active={inputMode === 'simple'}
              onClick={() => selectInputMode('simple')}
              aria-pressed={inputMode === 'simple'}
              aria-label='Simple keyboard'
            >
              <IconKeyboardSimple width={20} height={20} />
            </ToggleOption>
            <ToggleOption
              type='button'
              $active={isFullKeyboard}
              onClick={() => selectInputMode('full')}
              aria-pressed={isFullKeyboard}
              aria-label='Full keyboard'
            >
              <IconKeyboardFull width={20} height={20} />
            </ToggleOption>
            {allowRecordingMode && (
              <ToggleOption
                type='button'
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
        </ToggleRow>
      )}
      {isRecordingInput && recordingContent
        ? recordingContent
        : keyRows.map((row, rowIdx) => {
            const isLastRow = rowIdx === keyRows.length - 1
            const isCompactRow = fullKeyboardOnly || isFullKeyboard

            return (
              <SpellingKeyRowBox key={rowIdx} $compactRow={isCompactRow}>
                {row.map((letter, i) => (
                  <SpellingKeyBox
                    key={`${letter}-${i}`}
                    type='button'
                    onClick={() => onKeyPress(letter)}
                    $compactRow={isCompactRow}
                  >
                    <KeyLabel $compactRow={isCompactRow}>{letter}</KeyLabel>
                  </SpellingKeyBox>
                ))}
                {isLastRow && (
                  <SpellingKeyBox
                    type='button'
                    onClick={() => onKeyPress('backspace')}
                    $isBackspace
                    $compactRow={isCompactRow}
                  >
                    <IconDeleteKey
                      className='key-icon'
                      width={20}
                      height={20}
                    />
                  </SpellingKeyBox>
                )}
                {isLastRow && showEnterButton && (
                  <SpellingKeyBox
                    type='button'
                    onClick={() => onKeyPress('enter')}
                    disabled={!isEnterEnabled}
                    $isEnter
                    $compactRow={isCompactRow}
                  >
                    <IconArrowRightWhite
                      className='key-icon'
                      width={20}
                      height={20}
                    />
                  </SpellingKeyBox>
                )}
              </SpellingKeyRowBox>
            )
          })}
    </SpellingKeyboardRoot>
  )
}

const SpellingKeyboardRoot = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`

const ToggleRow = styled.div`
  display: flex;
  justify-content: center;
  padding: 4px 4px 8px;

  ${media.mobile} {
    padding: 2px 2px 6px;
  }
`

const KeyboardModeToggle = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  background: #f4f6f8;
  border: 1.5px solid #e9edf3;
  border-radius: 14px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);

  ${media.mobile} {
    border-radius: 12px;
    padding: 2px;
  }
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
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease;
  opacity: ${({ $active, $emphasized }) =>
    $active ? 1 : $emphasized ? 0.85 : 0.55};

  ${media.mobile} {
    width: 32px;
    height: 26px;
    border-radius: 9px;
  }

  img {
    display: block;
  }

  &:hover {
    opacity: 1;
  }

  &:active {
    transform: scale(0.96);
  }
`

const SpellingKeyRowBox = styled.div<{ $compactRow?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  padding: 4px;
  width: 100%;
  max-width: 100%;
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

const KeyLabel = styled.span<{ $compactRow?: boolean }>`
  font-family: 'Rg-B', sans-serif;
  font-size: 19.2px;
  font-weight: 600;
  line-height: 1;
  color: #a2b1c4;
  text-transform: lowercase;

  ${media.mobile} {
    font-size: ${({ $compactRow }) => ($compactRow ? '14px' : '16px')};
  }
`

const SpellingKeyBox = styled.button<{
  $isBackspace?: boolean
  $isEnter?: boolean
  $compactRow?: boolean
}>`
  min-width: 52px;
  height: 52px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $isEnter }) => ($isEnter ? '#20ad75' : '#fff')};
  border: 1.5px solid #e9edf3;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.05s ease;
  box-shadow: 0 2px 0 0 #e9edf3;
  box-sizing: border-box;
  padding: 0;

  .key-icon {
    display: block;
    flex-shrink: 0;
  }

  ${media.mobile} {
    border-radius: 10px;
    border-width: 1px;
    box-shadow: 0 1px 0 0 #e9edf3;

    .key-icon {
      width: 16px;
      height: 16px;
    }
  }

  ${({ $compactRow }) =>
    !$compactRow &&
    css`
      ${media.mobile} {
        min-width: 36px;
        width: 36px;
        height: 44px;
      }
    `}

  ${({ $compactRow }) =>
    $compactRow &&
    css`
      ${media.mobile} {
        flex: 1 1 0;
        min-width: 0;
        width: auto;
        height: 40px;
      }
    `}

  ${({ $isBackspace, $isEnter, $compactRow }) =>
    ($isBackspace || $isEnter) &&
    css`
      ${media.mobile} {
        flex: 0 0 ${$compactRow ? '40px' : '44px'};
        min-width: ${$compactRow ? '40px' : '44px'};
        width: ${$compactRow ? '40px' : '44px'};
        height: ${$compactRow ? '40px' : '44px'};
      }
    `}

  &:active:not(:disabled) {
    transform: translateY(2px);
    box-shadow: none;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
