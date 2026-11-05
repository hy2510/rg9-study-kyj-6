export interface RawQuizMetaBase {
  ContentsId: string | number
  isQuizTimeoutIncorrect: boolean
  QuizAnswerCount: string | number
  QuizTime: string | number
}

export interface QuizMetaBaseResult {
  ContentsId: number
  IsQuizTimeoutIncorrect: boolean
  QuizAnswerCount: number
  QuizTime: number
}

export function mapQuizMetaBase(raw: RawQuizMetaBase): QuizMetaBaseResult {
  return {
    ContentsId: Number(raw.ContentsId),
    IsQuizTimeoutIncorrect: Boolean(raw.isQuizTimeoutIncorrect),
    QuizAnswerCount: Number(raw.QuizAnswerCount),
    QuizTime: Number(raw.QuizTime),
  }
}

export interface RawQuizId {
  QuizId: string | number
  QuizNo: string | number
}

export function mapQuizId(q: RawQuizId): { QuizId: string; QuizNo: number } {
  return {
    QuizId: q.QuizId.toString(),
    QuizNo: Number(q.QuizNo),
  }
}
