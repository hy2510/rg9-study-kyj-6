// 학습 기기
export type Mobile = '' | 'A' | 'B' | 'I' | 'J'

// 학습 모드
export type Mode =
  | 'student'
  | 'staff'
  | 'review'
  | 'preview'
  | 'guide'
  | 'trial'

// 학습 액트 종류
export type StudyMode = 'Act1' | 'Act2' | 'Review'

// 책 종류
export type BookType = 'PB' | 'EB'

// 학습 코드
export type StudyTypeCode = '001001' | '001006'

/** Study Entry Type (진입 시 Remix / Legacy 중 하나) */
export type StudyEntryType = 'remix' | 'legacy'

/** 레거시 Writing Activity 2 저장 타입 */
export type WritingActivity2SaveType = 'S' | 'E' | 'R' | 'X'
