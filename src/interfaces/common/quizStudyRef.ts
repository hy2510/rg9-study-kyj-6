import { BookType, Mode, StudyTypeCode } from '@src/interfaces/common/Types'

/** 유저 식별 (퀴즈·기록 API 공통) */
export interface IUserData {
  readonly mode: Mode
  readonly studentHistoryId: string
}

/**
 * 퀴즈 API 호출에 필요한 최소 학습 식별자
 * (리믹스 `useQuizManager`, Story `VocaPreviewPopup` 등 — 레거시 액티비티 전체 props와 구분)
 */
export interface IQuizStudyRef extends IUserData {
  readonly studyId: string
  readonly bookType: BookType
  readonly studyTypeCode: StudyTypeCode
}
