/**
 * SpellingInputDisplay, BlankSlotContent 등에서 사용하는
 * 대소문자·특수문자·띄어쓰기 처리 유틸리티
 */

/** 정답/입력에서 알파벳만 추출 (띄어쓰기·특수문자 제외) */
export function getLettersOnly(str: string): string {
  return str.replace(/[^a-zA-Z]/g, '')
}

/** 알파벳만 비교하여 정답 여부 판단 (대소문자 무시) */
export function isSpellingCorrect(input: string, answer: string): boolean {
  const inputLetters = getLettersOnly(input).toLowerCase()
  const answerLetters = getLettersOnly(answer).toLowerCase()
  return inputLetters === answerLetters
}

/** 특수문자 또는 띄어쓰기 여부 */
export function isSpecialOrSpace(char: string): boolean {
  return char === ' ' || !/^[a-zA-Z]$/.test(char)
}

/** 특수문자·띄어쓰기가 아닌 위치에서 입력 글자가 정답과 다른지 (대소문자 무시) */
export function isSpellingInputCharIncorrect(
  answerChar: string,
  inputChar: string,
): boolean {
  if (!inputChar || isSpecialOrSpace(answerChar)) return false
  return inputChar.toLowerCase() !== answerChar.toLowerCase()
}

/** 정답 포맷 + 사용자 입력으로 표시용 문자 계산 (대문자·특수문자 반영) */
export function getDisplayChar(answerChar: string, inputChar: string): string {
  if (isSpecialOrSpace(answerChar)) {
    return answerChar
  }
  return /^[A-Z]$/.test(answerChar) ? inputChar.toUpperCase() : inputChar
}

/** 정답 문자열 + 사용자 입력(알파벳만)으로 완성된 표시 텍스트 생성 */
export function buildDisplayText(answer: string, input: string): string {
  return Array.from({ length: answer.length })
    .map((_, i) => {
      const answerChar = answer[i]
      const letterIndex = getLettersOnly(answer.slice(0, i)).length
      const inputChar = input[letterIndex] ?? ''
      return getDisplayChar(answerChar, inputChar)
    })
    .join('')
}
