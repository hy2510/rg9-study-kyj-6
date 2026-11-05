import axios from 'axios'

import {
  GET_WORD_PRACTICE_QUIZ_PATH,
  SAVE_WORD_PRACTICE_SCORE_PATH,
} from '@src/constants/study/word-practice/wordConstants'
import type { WordPracticeQuizItem } from '@src/interfaces/study/word-practice/wordPractice'
import type { WordPracticeScoreItem } from '@src/interfaces/study/word-practice/wordPracticeScore'

export type { WordPracticeQuizItem, WordPracticeScoreItem }

export async function getWordPracticeQuiz(
  bookType: string,
  level: string,
): Promise<WordPracticeQuizItem[]> {
  const requestUrl = `/${GET_WORD_PRACTICE_QUIZ_PATH}/${bookType}?level=${level}`

  try {
    const res = await axios.get(requestUrl)

    if (res.status >= 200 && res.status < 300) {
      return res.data.Quiz
    } else {
      throw new Error('API Load Failed 1')
    }
  } catch (err) {
    console.error(err)
    throw new Error('API Load Failed 2')
  }
}

export async function postWordPracticeScore(
  scores: WordPracticeScoreItem[],
): Promise<{ success: boolean }> {
  try {
    const res = await axios.post(`/${SAVE_WORD_PRACTICE_SCORE_PATH}`, {
      scores,
    })

    if (res.status >= 200 && res.status < 300) {
      return res.data
    } else {
      throw new Error('API Load Failed 1')
    }
  } catch (err) {
    console.error(err)
    throw new Error('API Load Failed 2')
  }
}
