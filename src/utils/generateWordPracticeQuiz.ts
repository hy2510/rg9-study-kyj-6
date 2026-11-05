import type {
  WordPracticeContentItem,
  WordPracticeImageChoiceRound,
  WordPracticeQuizRound,
  WordPracticeScrambleRound,
  WordPracticeSoundChoiceRound,
} from '@interfaces/study/word-practice/wordPractice'

function pickRandomWrongWord(words: string[], correctWord: string) {
  const wrongWords = words.filter((word) => word !== correctWord)
  if (wrongWords.length === 0) return correctWord
  return wrongWords[Math.floor(Math.random() * wrongWords.length)]
}

export function generateWordPracticeQuizRounds(
  items: WordPracticeContentItem[],
): WordPracticeQuizRound[] {
  const words = items.map((item) => item.word)
  return items.map((item) => {
    const isMatch = Math.random() < 0.5
    const displayWord = isMatch
      ? item.word
      : pickRandomWrongWord(words, item.word)
    return {
      image: item.image,
      displayWord,
      correctWord: item.word,
      sound: item.sound,
      isMatch,
    }
  })
}

export function generateWordPracticeImageChoiceRounds(
  items: WordPracticeContentItem[],
): WordPracticeImageChoiceRound[] {
  const words = items.map((item) => item.word)
  return items.map((item) => {
    const wrongWord = pickRandomWrongWord(words, item.word)
    const correctFirst = Math.random() < 0.5
    const options: [string, string] = correctFirst
      ? [item.word, wrongWord]
      : [wrongWord, item.word]
    return {
      image: item.image,
      correctWord: item.word,
      options,
      correctIndex: correctFirst ? 0 : 1,
    }
  })
}

export function generateWordPracticeSoundChoiceRounds(
  items: WordPracticeContentItem[],
): WordPracticeSoundChoiceRound[] {
  const words = items.map((item) => item.word)
  return items.map((item) => {
    const wrongWord = pickRandomWrongWord(words, item.word)
    const correctFirst = Math.random() < 0.5
    const options: [string, string] = correctFirst
      ? [item.word, wrongWord]
      : [wrongWord, item.word]
    return {
      sound: item.sound,
      correctWord: item.word,
      options,
      correctIndex: correctFirst ? 0 : 1,
    }
  })
}

export function shuffleWordLetters(word: string): string[] {
  const letters = word.split('')
  if (letters.length <= 1) return letters
  const shuffled = [...letters]
  let attempts = 0
  do {
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    attempts += 1
  } while (shuffled.join('') === word && attempts < 10)
  return shuffled
}

export function generateWordPracticeScrambleRounds(
  items: WordPracticeContentItem[],
): WordPracticeScrambleRound[] {
  return items.map((item) => ({
    image: item.image,
    word: item.word,
    sound: item.sound,
    scrambledLetters: shuffleWordLetters(item.word),
  }))
}
