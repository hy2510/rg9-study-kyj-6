export type LegacyPenaltyState = 'none' | 'penalty' | 'success'

export type ClozeInputValue = {
  text: string
  isCorrected: boolean
  /**
   * 패널티 비활성 & 오답 소진 시 정답이 자동 공개된 blank 를 나타낸다.
   * 유저가 실제로 맞춘 blank (isCorrected: true 단독) 와 시각적으로 구분해
   * 붉은 정답 스타일로 렌더하기 위한 플래그.
   */
  isRevealed?: boolean
}

export type Summary2FilledEntry = {
  text: string
  isCorrect: boolean
}
