import { type KeyboardEvent, type ReactNode } from 'react'

import { media } from '@styles/tokens/breakpoints'
import styled from 'styled-components'

import { SpellingCharSlot } from '@components/atoms/study/blanks/SpellingCharSlot'
import { SpellingDisplayBox } from '@components/atoms/study/blanks/SpellingDisplayBox'
import SpellingKeyboard from '@components/organisms/study/common/SpellingKeyboard'
import {
  buildDisplayText,
  getDisplayChar,
  getLettersOnly,
  isSpecialOrSpace,
  isSpellingInputCharIncorrect,
} from '@utils/spellingUtils'

type SpellingSlotDisplayProps = {
  correctWord: string
  inputLetters: string
  isCorrect: boolean
  isIncorrect: boolean
  onInputLetterClick?: (letterIndex: number) => void
}

/** 스펠링 입력 슬롯만 (키보드 없음) */
export function SpellingSlotDisplay({
  correctWord,
  inputLetters,
  isCorrect,
  isIncorrect,
  onInputLetterClick,
}: SpellingSlotDisplayProps) {
  return (
    <SpellingDisplayBox $isCorrect={isCorrect} $isIncorrect={isIncorrect}>
      {isCorrect ? (
        <SlotText $tone='success'>
          {buildDisplayText(correctWord, inputLetters)}
        </SlotText>
      ) : (
        Array.from({ length: correctWord.length }).map((_, i) => {
          const answerChar = correctWord[i]
          const letterIndex = getLettersOnly(correctWord.slice(0, i)).length
          const inputChar = inputLetters[letterIndex] ?? ''
          const isFixed = isSpecialOrSpace(answerChar)
          const displayChar = getDisplayChar(answerChar, inputChar)
          const isRemovable =
            !!onInputLetterClick && !isFixed && inputChar !== ''

          return (
            <SpellingCharSlot
              key={i}
              as={isRemovable ? 'button' : undefined}
              $isFixed={isFixed}
              $isIncorrect={isIncorrect}
              aria-label={
                isRemovable
                  ? `Remove letter ${inputChar} at position ${letterIndex + 1}`
                  : undefined
              }
              onClick={
                isRemovable
                  ? (event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      onInputLetterClick(letterIndex)
                    }
                  : undefined
              }
              style={
                isRemovable
                  ? {
                      padding: 0,
                      borderTop: 0,
                      borderRight: 0,
                      borderLeft: 0,
                      background: 'transparent',
                      cursor: 'pointer',
                    }
                  : undefined
              }
            >
              <SlotText $tone={isIncorrect ? 'error' : 'primary'}>
                {displayChar}
              </SlotText>
            </SpellingCharSlot>
          )
        })
      )}
    </SpellingDisplayBox>
  )
}

type SpellingInputDisplayProps = {
  correctWord: string
  /** 사용자가 입력한 글자들 (letters only) */
  inputLetters: string
  isCorrect: boolean
  isIncorrect: boolean
  /** 패널티 모드: 미입력 슬롯에 정답을 회색 placeholder 로 노출 */
  isPenalty?: boolean
  showEnterButton?: boolean
  isEnterEnabled?: boolean
  wrongKeyCount?: number
  /** 지정 시 정답 알파벳 + 랜덤 오답 알파벳을 합쳐 총 이 개수만큼 노출 */
  totalKeyCount?: number
  /** true 면 알파벳 전체(26자) 풀키보드로 전환하는 토글을 노출 */
  allowFullKeyboardToggle?: boolean
  /** true 면 토글 없이 알파벳 전체 풀키보드만 노출 */
  fullKeyboardOnly?: boolean
  allowRecordingMode?: boolean
  recordingContent?: ReactNode
  onInputModeChange?: (mode: 'simple' | 'full' | 'recording') => void
  /** true 면 태블릿 이하에서 부모 높이를 채우고 키보드를 하단에 배치 */
  fillHeightOnTablet?: boolean
  /** true 면 입력 영역의 카드 배경과 테두리를 제거 */
  plainDisplay?: boolean
  /** 정오답 피드백이 표시될 때 단어를 조금 더 크게 강조 */
  emphasizeFeedbackText?: boolean
  /** 입력 슬롯 왼쪽에 표시할 컨트롤 */
  displayLeadingContent?: ReactNode
  displayTrailingContent?: ReactNode
  /** 입력 영역을 뜻/설명 등의 콘텐츠로 감쌀 때 사용 */
  renderDisplay?: (display: ReactNode) => ReactNode
  /** 지정하면 기존 키보드 대신 같은 위치에 표시 */
  keyboardReplacement?: ReactNode
  /** Mobile Vocabulary uses a native input over the existing spelling slots. */
  nativeInput?: ReactNode
  /** 입력 표시 영역을 클릭했을 때 실행 */
  onDisplayClick?: () => void
  /** 입력된 글자 슬롯을 누르면 해당 letters-only 인덱스를 전달 */
  onInputLetterClick?: (letterIndex: number) => void
  onKeyPress: (key: string) => void
}

/**
 * Organism: 스펠링 입력 표시 영역 + 키보드.
 * 로직(훅)은 부모가 담당하고, UI 상태를 props 로 받아 렌더링만 수행.
 */
export default function SpellingInputDisplay({
  correctWord,
  inputLetters,
  isCorrect,
  isIncorrect,
  isPenalty = false,
  showEnterButton = false,
  isEnterEnabled = false,
  wrongKeyCount = 5,
  totalKeyCount,
  allowFullKeyboardToggle = false,
  fullKeyboardOnly = false,
  allowRecordingMode = false,
  recordingContent,
  onInputModeChange,
  fillHeightOnTablet = false,
  plainDisplay = false,
  emphasizeFeedbackText = false,
  displayLeadingContent,
  displayTrailingContent,
  renderDisplay,
  keyboardReplacement,
  nativeInput,
  onDisplayClick,
  onInputLetterClick,
  onKeyPress,
}: SpellingInputDisplayProps) {
  const spellingDisplay = (
    <SpellingDisplayBox
      $isCorrect={isCorrect}
      $isIncorrect={isIncorrect}
      $plain={plainDisplay}
      $clickable={!!onDisplayClick}
      role={onDisplayClick ? 'button' : undefined}
      tabIndex={onDisplayClick ? 0 : undefined}
      onClick={onDisplayClick}
      style={nativeInput ? { position: 'relative' } : undefined}
      onKeyDown={
        onDisplayClick
          ? (event: KeyboardEvent<HTMLDivElement>) => {
              if (event.key !== ' ' && event.key !== 'Enter') return
              event.preventDefault()
              event.stopPropagation()
              onDisplayClick()
            }
          : undefined
      }
    >
      {nativeInput}
      {displayLeadingContent}
      {isCorrect ? (
        <SlotText $tone='success' $emphasized={emphasizeFeedbackText}>
          {buildDisplayText(correctWord, inputLetters)}
        </SlotText>
      ) : (
        Array.from({ length: correctWord.length }).map((_, i) => {
          const answerChar = correctWord[i]
          const letterIndex = getLettersOnly(correctWord.slice(0, i)).length
          const inputChar = inputLetters[letterIndex] ?? ''
          const isFixed = isSpecialOrSpace(answerChar)
          const isPenaltyPlaceholder = isPenalty && !isFixed && inputChar === ''
          const isCharIncorrect =
            isPenalty &&
            !isPenaltyPlaceholder &&
            isSpellingInputCharIncorrect(answerChar, inputChar)
          const isSlotIncorrect = isIncorrect || isCharIncorrect
          const displayChar = isPenaltyPlaceholder
            ? answerChar
            : getDisplayChar(answerChar, inputChar)

          const slotTone: SlotTone = isPenaltyPlaceholder
            ? 'placeholder'
            : isSlotIncorrect
              ? 'error'
              : 'primary'

          const isRemovable =
            !!onInputLetterClick && !isFixed && inputChar !== ''

          return (
            <SpellingCharSlot
              key={i}
              as={isRemovable ? 'button' : undefined}
              $isFixed={isFixed}
              $isCorrect={!isPenaltyPlaceholder && isCorrect}
              $isIncorrect={isSlotIncorrect}
              $isPlaceholder={isPenaltyPlaceholder}
              aria-label={
                isRemovable
                  ? `Remove letter ${inputChar} at position ${letterIndex + 1}`
                  : undefined
              }
              onClick={
                isRemovable
                  ? (event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      onInputLetterClick(letterIndex)
                    }
                  : undefined
              }
              style={
                isRemovable
                  ? {
                      padding: 0,
                      borderTop: 0,
                      borderRight: 0,
                      borderLeft: 0,
                      background: 'transparent',
                      cursor: 'pointer',
                    }
                  : undefined
              }
            >
              <SlotText
                $tone={slotTone}
                $emphasized={emphasizeFeedbackText && isIncorrect}
              >
                {displayChar}
              </SlotText>
            </SpellingCharSlot>
          )
        })
      )}
      {displayTrailingContent}
    </SpellingDisplayBox>
  )

  return (
    <SpellingInputRoot $fillHeightOnTablet={fillHeightOnTablet}>
      {renderDisplay ? renderDisplay(spellingDisplay) : spellingDisplay}

      {keyboardReplacement ?? (
        <SpellingKeyboard
          correctWord={correctWord}
          wrongKeyCount={wrongKeyCount}
          totalKeyCount={totalKeyCount}
          allowFullKeyboardToggle={allowFullKeyboardToggle}
          fullKeyboardOnly={fullKeyboardOnly}
          allowRecordingMode={allowRecordingMode}
          recordingContent={recordingContent}
          onInputModeChange={onInputModeChange}
          showEnterButton={showEnterButton}
          isEnterEnabled={isEnterEnabled}
          onKeyPress={onKeyPress}
        />
      )}
    </SpellingInputRoot>
  )
}

type SlotTone = 'primary' | 'success' | 'error' | 'placeholder'

const SpellingInputRoot = styled.div<{ $fillHeightOnTablet: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  ${({ $fillHeightOnTablet }) =>
    $fillHeightOnTablet &&
    `
      ${media.tablet} {
        flex: 1 1 auto;
        min-height: 0;
        justify-content: space-between;
      }

      ${media.touchTablet} {
        flex: 1 1 auto;
        min-height: 0;
        justify-content: space-between;
      }
    `}
`

const SlotText = styled.span<{ $tone: SlotTone; $emphasized?: boolean }>`
  font-family: 'Rg-B', sans-serif;
  font-size: ${({ $emphasized }) => ($emphasized ? '32px' : '28px')};
  font-weight: 600;
  line-height: 1;
  color: ${({ $tone }) =>
    $tone === 'success'
      ? '#1baa70'
      : $tone === 'error'
        ? '#ef3d2e'
        : $tone === 'placeholder'
          ? '#a2b1c4'
          : '#3c4b62'};

  ${media.mobile} {
    font-size: ${({ $emphasized }) => ($emphasized ? '24px' : '20px')};
  }
`
