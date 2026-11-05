import type {
  WordMeaningChoiceRound,
  WordMeaningPracticeItem,
} from '@interfaces/study/word-practice/wordMeaningPractice'

function shuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function pickWrongWords(words: string[], correctWord: string, count: number): string[] {
  const wrongWords = words.filter((word) => word !== correctWord)
  return shuffleArray(wrongWords).slice(0, count)
}

export function generateWordMeaningChoiceRounds(
  items: WordMeaningPracticeItem[],
): WordMeaningChoiceRound[] {
  const words = items.map((item) => item.word)
  return items.map((item) => {
    const wrongOptions = pickWrongWords(words, item.word, 3)
    const shuffledOptions = shuffleArray([item.word, ...wrongOptions])
    const correctIndex = shuffledOptions.indexOf(item.word) as 0 | 1 | 2 | 3
    return {
      meaning: item.meaning,
      correctWord: item.word,
      sound: item.sound,
      options: shuffledOptions as [string, string, string, string],
      correctIndex,
    }
  })
}
