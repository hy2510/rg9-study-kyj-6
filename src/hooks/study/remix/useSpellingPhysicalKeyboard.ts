import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'

type UseSpellingPhysicalKeyboardOptions = {
  enabled?: boolean
  captureTab?: boolean
  nonEnglishAlertMessage?: string
  onKeyPress: (key: string) => void
}

/**
 * 물리 키보드 입력 감지 훅
 * - 입력기 언어와 관계없이 물리 키보드의 KeyA~KeyZ 위치를 영문자로 변환
 * - Backspace: onKeyPress('backspace') 호출
 * - 영어 외 입력 시 alert 표시
 */
export function useSpellingPhysicalKeyboard({
  enabled = true,
  captureTab = true,
  onKeyPress,
  nonEnglishAlertMessage,
}: UseSpellingPhysicalKeyboardOptions) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!enabled) return undefined

    const handleKeyDown = (e: KeyboardEvent) => {
      const physicalLetter = /^Key([A-Z])$/.exec(e.code)?.[1]

      if (e.key === 'Backspace') {
        e.preventDefault()
        onKeyPress('backspace')
      } else if (e.key === 'Enter') {
        e.preventDefault()
        onKeyPress('enter')
      } else if (e.key === 'Tab' && captureTab) {
        e.preventDefault()
        onKeyPress('tab')
      } else if (physicalLetter && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        onKeyPress(physicalLetter.toLowerCase())
      } else if (
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !['Backspace', 'Enter', 'Tab', 'Escape', 'Shift', 'CapsLock'].includes(
          e.key,
        ) &&
        (e.key === 'Process' ||
          e.key === 'Unidentified' ||
          (e.key.length === 1 && !/^[a-zA-Z]$/.test(e.key)))
      ) {
        e.preventDefault()
        alert(
          nonEnglishAlertMessage ?? t('study.vocabularyPractice.englishOnly'),
        )
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [captureTab, enabled, onKeyPress, nonEnglishAlertMessage, t])
}
