import {
  IRecordAnswerType,
  IScoreBoardData,
} from '@src/interfaces/common/Common'

export const convertRecordToScoreBoard = (
  recordData: IRecordAnswerType[],
  maxQuizCount: number,
): IScoreBoardData[] => {
  const convertedData: IScoreBoardData[] = []

  recordData.map((data) => {
    convertedData.push({
      quizNo: data.CurrentQuizNo,
      maxCount: maxQuizCount,
      answerCount: data.AnswerCount,
      ox: data.OX === '1' ? true : false,
    })
  })

  return convertedData
}

export const convertPartialRecordToScoreBoard = (
  recordData: IRecordAnswerType[],
  maxQuizCount: number,
): IScoreBoardData[] => {
  const convertedData: IScoreBoardData[] = []
  let quizNo = 1

  recordData.map((record) => {
    record.StudentAnswer.split(',').map((data) => {
      const lastAnswer = data.charAt(data.length - 1)

      convertedData.push({
        quizNo: quizNo++,
        maxCount: maxQuizCount,
        answerCount: data.split('').length,
        ox: lastAnswer === '1' ? true : false,
      })
    })
  })

  return convertedData
}

export const convertPartialRecordToScoreBoardClozeTest3 = (
  recordData: IRecordAnswerType[],
  maxQuizCount: number,
): IScoreBoardData[] => {
  const convertedData: IScoreBoardData[] = []
  let quizNo = 1

  recordData.map((record) => {
    record.StudentAnswer.split('/').map((data) => {
      const lastAnswer = data.charAt(data.length - 1)

      convertedData.push({
        quizNo: quizNo++,
        maxCount: maxQuizCount,
        answerCount: data.split('').length,
        ox: lastAnswer === '1' ? true : false,
      })
    })
  })

  return convertedData
}
