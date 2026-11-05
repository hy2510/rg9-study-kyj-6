export type WordMeaningPracticeItem = {
  wordId: string
  word: string
  meaning: string
  sound?: string
}

export type WordMeaningChoiceRound = {
  meaning: string
  correctWord: string
  sound?: string
  options: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
}
