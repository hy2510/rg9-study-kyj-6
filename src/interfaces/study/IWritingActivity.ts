// WritingActivity1
interface IWritingActivity1Quiz {
  QuizId: string
  QuizNo: number
  Question: {
    Text: string
    Sound: string
  }
  Examples: IWritingActivity1Example[]
}
interface IWritingActivity1Example {
  Text: string
}
interface IWritingActivity1 {
  readonly ContentsId: number
  readonly IsQuizTimeoutIncorrect: boolean
  readonly QuizAnswerCount: number
  readonly QuizTime: number
  Quiz: IWritingActivity1Quiz[]
}
// WritingActivity1 end

// WritingActivity2
interface IWritingActivity2Writing {
  IsWritingOn: boolean
  Activity: string
  Type: 'In School' | 'Overseas' | 'No Revision'
  Mode: 'Free' | 'All' | 'Limit'
  MaxSubmitCount: number
  CurrentSubmitCount: number
  WordMinCount: number
  WordMaxCount: number
  Question: string[]
}

interface IWritingActivity2ReWriting {
  IsReWriting: boolean
  ReWritingImage1: string
  ReWritingImage2: string
  ReWritingComment: string
  ReWritingReason: string
}

interface IWritingActivity2 {
  readonly QuizTime: number
  readonly Title: string
  readonly Author: string
  Writing: IWritingActivity2Writing
  Rewriting: IWritingActivity2ReWriting
}

interface IGECResult {
  matches: IGECResultMatch[]
  text: string
  correct_text: string
}

interface IGECResultMatch {
  replacements: [
    {
      value: string
      types: [
        {
          type: string
          category: string
        },
      ]
    },
  ]
  offset: number
  length: number
}

// WritingActivity2 end

export type {
  IGECResult,
  IWritingActivity1,
  IWritingActivity1Example,
  IWritingActivity1Quiz,
  IWritingActivity2,
  IWritingActivity2ReWriting,
  IWritingActivity2Writing,
}
