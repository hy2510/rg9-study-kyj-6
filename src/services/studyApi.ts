// 학습에 관련된 api
import axios from 'axios'

import { getRecordPath } from '@services/studyPath'
import {
  DELETE_PENALTY_PATH,
  GET_STUDY_INFO_PATH,
  GET_TRIAL_STUDY_INFO_PATH,
  SAVE_RE_WRITING_PATH,
  SAVE_STUDENT_ANSWER_PATH,
  SAVE_STUDENT_PARTIAL_ANSWER_PATH,
  SAVE_WRITING_PATH,
} from '@src/constants/study/studyConstants'
import type {
  IDeletePenaltyType,
  IQuizStudyRef,
  IRecordAnswerType,
  IResultType,
  IUserAnswer,
  IUserAnswerPartial,
  IUserAnswerRewriting,
  IUserAnswerWriting,
} from '@src/interfaces/common/Common'
import { BookInfo } from '@src/interfaces/common/IBookInfo'
import { IStudyInfo } from '@src/interfaces/study/IStudyInfo'
import { toTrialApiPath } from '@utils/study/trialApiPath'

const REF = (window as any).REF
const lang = REF?.language || 'ko'

const sessionMsgKor =
  '앱이 장시간 실행된 상태여서 보안상의 이유로 자동 로그아웃되었습니다. 번거로우시겠지만, 재접속 후 다시 학습을 진행해 주세요.'
const sessionMsgEng =
  'For security reasons, you were automatically logged out due to prolonged app usage. Please reconnect to continue your study.'
const sessionMsg = lang === 'ko' ? sessionMsgKor : sessionMsgEng

const manyTabMsgKor =
  '비정상적인 접근으로 인하여 사용이 일시적으로 제한되었습니다.'
const manyTabMsgEng = 'Access temporarily restricted due to unusual activity.'
const manyTabMsg = lang === 'ko' ? manyTabMsgKor : manyTabMsgEng

const wirelessMsgKor = '인터넷 연결이 원활하지 않습니다.'
const wirelessMsgEng = 'The internet connection is unstable.'
const wirelessMsg = lang === 'ko' ? wirelessMsgKor : wirelessMsgEng

const overPointMsgKor = '일일 획득 가능 포인트 초과'
const overPointMsgEng = 'Daily available points exceeded'
const overPointMsg = lang === 'ko' ? overPointMsgKor : overPointMsgEng

/**
 * Quiz 데이터 조회
 * @param path
 * @param transformType JSON 객체를 Quiz 객체로 전환하는 함수
 * @returns 변환된 Quiz 객체
 */
async function getQuizData<T>(
  path: string,
  transformType: (rawData: any) => Promise<T>,
): Promise<T> {
  const requestUrl = `/${toTrialApiPath(path)}`
  let quiz: T

  try {
    const response = await axios.get(requestUrl)

    if (response.status >= 200 && response.status < 300) {
      const responseData: any = response.data
      quiz = await transformType(responseData)
    } else {
      throw new Error('QuizData Load Failed 1')
    }
  } catch (error: any) {
    console.error(error)
    throw new Error('QuizData Load Failed 2')
  }

  return quiz
}

// study info 가져오기
async function getStudyInfo(
  studyId: string,
  studentHistoryId: string,
  bookType: string,
  isTrial = false,
): Promise<IStudyInfo> {
  const studyInfoPath = isTrial ? GET_TRIAL_STUDY_INFO_PATH : GET_STUDY_INFO_PATH
  const requestUrl = `/${studyInfoPath}/${bookType}?studentHistoryId=${studentHistoryId}&studyId=${studyId}`
  let studyInfo: IStudyInfo

  try {
    const res = await axios.get(requestUrl)

    if (res.status >= 200 && res.status < 300) {
      studyInfo = res.data
    } else {
      throw new Error('API Load Failed 1')
    }
  } catch (err) {
    console.error(err)
    throw new Error('API Load Failed 2')
  }

  return studyInfo
}

// book info 가져오기
async function getBookInfo(
  studyId: string,
  studentHistoryId: string,
  levelRoundId: string,
): Promise<BookInfo> {
  const requestUrl = `/${toTrialApiPath('api/library/book-info')}?studentHistoryId=${studentHistoryId}&studyId=${studyId}&levelRoundId=${levelRoundId}`

  let bookInfo: BookInfo

  try {
    const res = await axios.get(requestUrl)

    if (res.status >= 200 && res.status < 300) {
      const response = res.data

      bookInfo = await response
    } else {
      throw new Error('API Load Failed 1')
    }
  } catch (err) {
    console.error(err)
    throw new Error('API Load Failed 2')
  }
  console.log('bookInfo', bookInfo)
  return bookInfo
}

async function saveUserAnswer(
  mode: string,
  payload: IUserAnswer,
): Promise<IResultType> {
  // 리뷰/관리자/프리뷰 모드는 학습 기록을 서버에 저장하지 않는다.
  if (mode !== 'student') return { result: '0', resultMessage: '' }
  const res = await axios.post(`/${SAVE_STUDENT_ANSWER_PATH}`, payload)
  return res.data
}

async function saveUserAnswerPartial(
  mode: string,
  payload: IUserAnswerPartial,
): Promise<IResultType> {
  if (mode !== 'student') return { result: '0', resultMessage: '' }
  const res = await axios.post(`/${SAVE_STUDENT_PARTIAL_ANSWER_PATH}`, payload)
  return res.data
}

async function deletePenalty(
  mode: string,
  payload: IDeletePenaltyType,
): Promise<IResultType> {
  if (mode !== 'student') return { result: '0', resultMessage: '' }
  const res = await axios.post(`/${DELETE_PENALTY_PATH}`, payload)
  return res.data
}

/**
 * Writing Activity2 저장
 * S: 첨삭용 제출, E: 첨삭 없이 제출, R: 글 안쓰고 마침, X: 임시저장
 */
async function saveWritingActivity(
  mode: string,
  payload: IUserAnswerWriting,
): Promise<IResultType> {
  if (mode !== 'student') return { result: '0', resultMessage: '' }
  const res = await axios.post(`/${SAVE_WRITING_PATH}`, payload)
  const data: IResultType = res.data
  if (data.result === '1100') throw new Error(manyTabMsg)
  if (data.result === '1003') throw new Error(overPointMsg)
  return data
}

/**
 * Writing Activity2 Re-writing 저장
 */
async function saveRewriting(
  mode: string,
  payload: IUserAnswerRewriting,
): Promise<IResultType> {
  if (mode !== 'student') return { result: '0', resultMessage: '' }
  const res = await axios.post(`/${SAVE_RE_WRITING_PATH}`, payload)
  const data: IResultType = res.data
  if (data.result === '1100') throw new Error(manyTabMsg)
  if (data.result === '1003') throw new Error(overPointMsg)
  return data
}

async function loadRecordedData(
  step: string | number,
  study: IQuizStudyRef,
): Promise<IRecordAnswerType[]> {
  const path = getRecordPath(String(step), study)
  const res = await axios.get(`/${toTrialApiPath(path)}`)
  const data = res.data
  if (Array.isArray(data)) return data
  if (data?.record && Array.isArray(data.record)) return data.record
  return []
}

export {
  deletePenalty,
  getBookInfo,
  getQuizData,
  getStudyInfo,
  loadRecordedData,
  saveRewriting,
  saveUserAnswer,
  saveUserAnswerPartial,
  saveWritingActivity,
}
