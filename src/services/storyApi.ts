// story에 관련된 api
import axios from 'axios'

import {
  GET_BOOK_DATA_PATH,
  SUBMIT_ANIMATION_COMPLETE_PATH,
  SUBMIT_ANIMATION_COMPLETE_PATH_NB,
  SUBMIT_BOOK_MARK_PATH,
  SUBMIT_PREFERENCE_PATH,
  SUBMIT_READING_END_PATH,
  SUBMIT_READING_START_PATH,
} from '@src/constants/study/studyConstants'
import { IResultPreference } from '@src/interfaces/common/Common'
import { PageProps } from '@src/interfaces/story/IStory'
import { toTrialApiPath } from '@utils/study/trialApiPath'

/**
 * story 정보 가져오기
 * @param studyId
 * @param studentHistoryId
 * @returns
 */
async function getStoryInfo(
  studyId: string,
  studentHistoryId: string,
): Promise<PageProps[]> {
  const requestUrl = `/${toTrialApiPath(GET_BOOK_DATA_PATH)}?studentHistoryId=${studentHistoryId}&studyId=${studyId}`
  let storyInfo: PageProps[]

  try {
    const res = await axios.get(requestUrl)

    if (res.status >= 200 && res.status < 300) {
      const response = res.data

      storyInfo = await response
    } else {
      throw new Error('Get Story Data Failed 1')
    }
  } catch (e) {
    console.error(e)
    throw new Error('Get Story Data Failed 2')
  }

  return storyInfo
}

/**
 * 첫장을 읽으면 DB에 저장한다.
 * @param studyId
 * @param studentHistoryId
 */
async function submitReadFirstPage(studyId: string, studentHistoryId: string) {
  let result = { success: false }

  try {
    const res = await axios.post(`/${SUBMIT_READING_START_PATH}`, {
      studyId: studyId,
      studentHistoryId: studentHistoryId,
    })

    if (res.status >= 200 && res.status < 300) {
      const response = await res.data

      if (response.success) {
        result = response
      } else {
        throw new Error('Post Preference Failed 1')
      }
    } else {
      throw new Error('Post Preference Failed 1')
    }
  } catch (e) {
    console.error(e)
  }

  return result
}

/**
 * 마지막 페이지를 읽으면 DB에 저장한다.
 * @param studyId
 * @param studentHistoryId
 */
async function submitReadLastPage(studyId: string, studentHistoryId: string) {
  let result = { success: false }

  try {
    const res = await axios.post(`/${SUBMIT_READING_END_PATH}`, {
      studyId: studyId,
      studentHistoryId: studentHistoryId,
    })

    if (res.status >= 200 && res.status < 300) {
      const response = await res.data

      if (response.success) {
        result = response
      } else {
        throw new Error('Post Preference Failed 1')
      }
    } else {
      throw new Error('Post Preference Failed 1')
    }
  } catch (e) {
    console.error(e)
  }

  return result
}

/**
 * 책갈피
 * @param studyId
 * @param studentHistoryId
 * @param page
 */
async function saveBookMark(
  studyId: string,
  studentHistoryId: string,
  page: number,
) {
  let result = { success: false }

  try {
    const res = await axios.post(`/${SUBMIT_BOOK_MARK_PATH}`, {
      studyId: studyId,
      studentHistoryId: studentHistoryId,
      page: page,
    })

    if (res.status >= 200 && res.status < 300) {
      const response = await res.data

      if (response.success) {
        result = response
      } else {
        throw new Error('Post Preference Failed 1')
      }
    } else {
      throw new Error('Post Preference Failed 1')
    }
  } catch (e) {
    console.error(e)
  }

  return result
}

/**
 * movie book을 끝까지 시청한 경우 값을 변경한다
 * @param studyId
 * @param studentHistoryId
 */
async function submitWatchMovie(studyId: string, studentHistoryId: string) {
  let result = { success: false }

  try {
    const res = await axios.post(`/${SUBMIT_ANIMATION_COMPLETE_PATH}`, {
      studyId: studyId,
      studentHistoryId: studentHistoryId,
    })

    if (res.status >= 200 && res.status < 300) {
      const response = await res.data

      if (response.success) {
        result = response
      } else {
        throw new Error('Post Preference Failed 1')
      }
    } else {
      throw new Error('Post Preference Failed 1')
    }
  } catch (e) {
    console.error(e)
  }

  return result
}

/**
 * movie book을 끝까지 시청한 경우 값을 변경한다 - 늘봄
 * @param studyId
 * @param studentHistoryId
 */
async function submitWatchMovieNB(studyId: string, studentHistoryId: string) {
  let result = { success: false }

  try {
    const res = await axios.post(`/${SUBMIT_ANIMATION_COMPLETE_PATH_NB}`, {
      studyId: studyId,
      studentHistoryId: studentHistoryId,
    })

    if (res.status >= 200 && res.status < 300) {
      const response = await res.data

      if (response.success) {
        result = response
      } else {
        throw new Error('Post Preference Failed 1')
      }
    } else {
      throw new Error('Post Preference Failed 1')
    }
  } catch (e) {
    console.error(e)
  }

  return result
}

/**
 * 책 별점(선호도) 제출.
 *
 * - Story 완료 직후 학습 진입 전, `studyInfo.isSubmitPreference === false` 일 때만
 *   호출한다 (이미 제출했다면 호출하지 않는다).
 * - `value` 는 사내 정책상 0 ~ 100 정수 (별점 1~5 점이라면 보통 `star * 10` 으로 변환).
 *
 * @param studyId
 * @param studentHistoryId
 * @param value 0~100 정수 별점
 * @returns `{ success: boolean }` — 실패 시 `success: false`
 */
async function submitPreference(
  mode: string,
  studyId: string,
  studentHistoryId: string,
  preference: number,
): Promise<IResultPreference> {
  if (mode !== 'student') return { success: true }
  let result = { success: false }

  try {
    const res = await axios.post(`/${SUBMIT_PREFERENCE_PATH}`, {
      studyId: studyId,
      studentHistoryId: studentHistoryId,
      preference: preference,
    })

    if (res.status >= 200 && res.status < 300) {
      const response = await res.data

      if (response.success) {
        result = response
      } else {
        throw new Error('Post Preference Failed 1')
      }
    } else {
      throw new Error('Post Preference Failed 1')
    }
  } catch (e) {
    console.error(e)
  }

  return result
}

export {
  getStoryInfo,
  saveBookMark,
  submitPreference,
  submitReadFirstPage,
  submitReadLastPage,
  submitWatchMovie,
}
