/** 공통·레거시 타입 배럴 — 도메인별 정의는 `./common/*`, `./legacy/*` 참고 */

export type { IQuizStudyRef, IUserData } from '@interfaces/common/quizStudyRef'
export type { ILegacyStudyData } from '@src/interfaces/study/legacy/LegacyStudy'

/** 하위 호환: 레거시 액티비티 페이지에서 기존 이름 유지 */
export type {
  IDeletePenaltyType,
  ILegacyUserContext,
  IRecordAnswerType,
  IResultMessage,
  IResultPreference,
  IResultType,
  IScoreBoardData,
  IUserAnswer,
  IUserAnswerPartial,
  IUserAnswerRewriting,
  IUserAnswerWord,
  IUserAnswerWriting,
} from '@src/interfaces/study/legacy/legacyAnswers'
export type { ILegacyStudyData as IStudyData } from '@src/interfaces/study/legacy/LegacyStudy'
