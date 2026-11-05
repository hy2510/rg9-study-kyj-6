export type WordPracticeContentItem = {
  wordId: string
  image: string
  word: string
  sound: string
  meaning: string
}

export type WordPracticeQuizItem = {
  StudentWordId: string
  StudentId: string
  BookCode: string
  LevelNAME: string
  LevelId: number
  WordId: string
  WordNo: number
  Word: string
  SpeechPart: string
  Korean: string
  Chinese: string
  Japanese: string
  Vietnamese: string
  Indonesian: string
  English: string
  Britannica: string
  ImagePath: string
  SoundPath: string
  CorrectCount: number
  WrongCount: number
  ReviewCount: number
  LastReviewDate: string
  DaysSinceReview: number
  MasteryScore: number
  WeaknessScore: number
  IsWeakWordYn: boolean
}

export type WordPracticeQuizRound = {
  image: string
  displayWord: string
  correctWord: string
  sound: string
  isMatch: boolean
}

export type WordPracticeImageChoiceRound = {
  image: string
  correctWord: string
  options: [string, string]
  correctIndex: 0 | 1
}

export type WordPracticeSoundChoiceRound = {
  sound: string
  correctWord: string
  options: [string, string]
  correctIndex: 0 | 1
}

export type WordPracticeScrambleRound = {
  image: string
  word: string
  sound: string
  scrambledLetters: string[]
}
