import {
  BookType,
  Mobile,
  Mode,
  WritingActivity2SaveType,
} from '@src/interfaces/common/Types'

/** 레거시 퀴즈 답안지 스코어보드 */
export interface IScoreBoardData {
  readonly quizNo: number
  readonly maxCount: number
  readonly answerCount: number
  readonly ox: boolean
}

/** 유저 답안 정보 - 일반 */
export interface IUserAnswer {
  readonly mobile: Mobile
  readonly bookType: BookType
  readonly studyId: string
  readonly studentHistoryId: string
  readonly step: string
  quizId: string
  quizNo: number
  currentQuizNo: number
  correct: string
  studentAnswer: string
  answerCount: number
  isEnabledPenalty?: boolean
  isLastQuiz?: boolean
  isFinishStudy?: boolean
  score?: number
}

/** 유저 답안 정보 - 단어 */
export interface IUserAnswerWord {
  readonly bookType: BookType
  readonly studyId: string
  readonly studentHistoryId: string
  readonly step: string
  quizId: string
  quizNo: number
  currentQuizNo: number
  correct: string
  studentAnswer: string
  answerCount: number
}

/** 유저 답안 정보 - 부분 점수 */
export interface IUserAnswerPartial {
  readonly mobile: Mobile
  readonly bookType: BookType
  readonly studyId: string
  readonly studentHistoryId: string
  readonly step: string
  quizId: string
  quizNo: number
  currentQuizNo: number
  correct: string
  studentAnswer: string
  partialRecord: string
  answerCount: number
  isEnabledPenalty?: boolean
  isLastQuiz?: boolean
  isFinishStudy?: boolean
  score?: number
}

/** 유저 답안 정보 - Writing Activity 2 */
export interface IUserAnswerWriting {
  readonly bookType: BookType
  readonly studyId: string
  readonly studentHistoryId: string
  readonly step: string
  saveType: WritingActivity2SaveType
  writeText: string
  isFinishStudy?: boolean
}

/** 유저 답안 정보 - Writing Activity 2 Re-writing */
export interface IUserAnswerRewriting {
  readonly bookType: BookType
  readonly studyId: string
  readonly studentHistoryId: string
  writeText: string
}

/** checkAnswer 후 돌아오는 값들 */
export interface IResultType {
  readonly result: string
  readonly resultMessage: '' | string
}

/** 학습 완료 후 메시지 */
export interface IResultMessage {
  readonly average: number
  readonly rgpoint: number
  readonly totalpoint: number
  readonly levelup: string
  readonly levelmaster: string
  readonly newreadingunit: string
  readonly dailybook: string
  readonly dailypoint: string
  readonly dailytype: string
  readonly dailygoal: string
  readonly prizetitle: string
}

/** 과거 기록 */
export interface IRecordAnswerType {
  readonly QuizId: string
  readonly QuizNo: number
  readonly CurrentQuizNo: number
  readonly OX: string
  readonly TempText: string
  readonly PenaltyWord: string
  readonly Correct: string
  readonly StudentAnswer: string
  readonly AnswerCount: number
}

/** 패널티 삭제 요청 */
export interface IDeletePenaltyType {
  readonly mobile: Mobile
  readonly bookType: BookType
  readonly studyId: string
  readonly studentHistoryId: string
  readonly step: string
  quizId: string
  isLastQuiz?: boolean
  isFinishStudy?: boolean
  score?: number
}

/** 별점 */
export interface IResultPreference {
  success: boolean
}

/**
 * 레거시 기록 API용 유저 식별 (mode + studyId + studentHistoryId)
 */
export interface ILegacyUserContext {
  readonly mode: Mode
  readonly studyId: string
  readonly studentHistoryId: string
}
