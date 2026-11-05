import { useState } from 'react'

import {
  IRecordAnswerType,
  IScoreBoardData,
  IUserAnswer,
  IUserAnswerPartial,
} from '@src/interfaces/common/Common'
import { BookType, Mobile, Mode } from '@src/interfaces/common/Types'
import {
  convertPartialRecordToScoreBoard,
  convertPartialRecordToScoreBoardClozeTest3,
  convertRecordToScoreBoard,
} from '@src/utils/study/legacy/studentAnswerHelpers'

type UserAnswerDataProps = {
  mobile: Mobile
  studyId: string
  studentHistoryId: string
  bookType: BookType
  step: string | number
  quizId: string
  quizNo: number
  currentQuizNo: number
  correct: string
  selectedAnswer: string
  tryCount: number
  maxQuizCount: number
  quizLength: number
  isCorrect: boolean
  answerData: IScoreBoardData
  isEnabledPenalty?: boolean
  isFinishStudy?: boolean
}

type UserPartialAnswersDataProps = {
  mobile: Mobile
  studyId: string
  studentHistoryId: string
  bookType: BookType
  step: string | number
  quizId: string
  quizNo: number
  currentQuizNo: number
  correct: string
  selectedAnswer: string
  partialRecord: string
  tryCount: number
  maxQuizCount: number
  quizLength: number
  isCorrect: boolean
  answerData: IScoreBoardData
  isEnabledPenalty?: boolean
  isFinishStudy?: boolean
}

const useStudentAnswer = (mode: Mode, type: string = 'normal') => {
  const [scoreBoardData, setScoreBoardData] = useState<IScoreBoardData[]>([])

  const setStudentAnswers = (
    recordedData: IRecordAnswerType[],
    maxQuizCount: number,
  ) => {
    const convertedData = convertRecordToScoreBoard(recordedData, maxQuizCount)

    setScoreBoardData(convertedData)
  }

  const setStudentAnswersPartial = (
    recordedData: IRecordAnswerType[],
    maxQuizCount: number,
  ) => {
    let convertedData

    if (type === 'normal') {
      convertedData = convertPartialRecordToScoreBoard(
        recordedData,
        maxQuizCount,
      )
    } else {
      convertedData = convertPartialRecordToScoreBoardClozeTest3(
        recordedData,
        maxQuizCount,
      )
    }

    setScoreBoardData(convertedData)
  }

  const addStudentAnswer = (recordData: IScoreBoardData, isFail?: boolean) => {
    if (mode !== 'review' || isFail) {
      let newRecordData: IScoreBoardData[] = []

      if (scoreBoardData.length > 0) {
        newRecordData = [...scoreBoardData]
      }

      if (recordData.maxCount > 1) {
        const isRecordIndex = scoreBoardData.find(
          (data) => data.quizNo === recordData.quizNo,
        )

        if (isRecordIndex) {
          newRecordData = scoreBoardData.map((data) =>
            data.quizNo === recordData.quizNo &&
            data.answerCount < recordData.maxCount
              ? {
                  ...data,
                  quizNo: recordData.quizNo,
                  maxCount: recordData.maxCount,
                  answerCount: recordData.answerCount,
                  ox: recordData.ox,
                }
              : data,
          )
        } else {
          newRecordData.push(recordData)
        }
      } else {
        newRecordData.push(recordData)
      }

      setScoreBoardData(newRecordData)
    }
  }

  const addStudentAnswers = (recordDatas: IScoreBoardData[]) => {
    if (mode !== 'review') {
      let newRecordData: IScoreBoardData[] = []

      if (scoreBoardData.length > 0) {
        newRecordData = [...scoreBoardData]
      }

      recordDatas.map((recordData) => {
        if (recordData.maxCount > 1) {
          const isRecordIndex = scoreBoardData.find(
            (data) => data.quizNo === recordData.quizNo,
          )

          if (isRecordIndex) {
            newRecordData = scoreBoardData.map((data) =>
              data.quizNo === recordData.quizNo &&
              data.answerCount < recordData.maxCount
                ? {
                    ...data,
                    quizNo: recordData.quizNo,
                    maxCount: recordData.maxCount,
                    answerCount: recordData.answerCount,
                    ox: recordData.ox,
                  }
                : data,
            )
          } else {
            newRecordData.push(recordData)
          }
        } else {
          newRecordData.push(recordData)
        }
      })

      setScoreBoardData(newRecordData)
    }
  }

  const getScore = (
    lastScoreData: IScoreBoardData,
    quizLength: number,
    quizAnswerCount: number,
  ): number => {
    const prevStuentAnswers: IScoreBoardData[] = [
      ...scoreBoardData,
      lastScoreData,
    ]

    const point = 100 / quizLength
    let score: number = 0
    let correctCount: number = 0
    let incorrectCount: number = 0

    prevStuentAnswers.map((el) => {
      if (el.ox) {
        correctCount++

        switch (el.answerCount) {
          case 1:
            score += 1 * point
            break

          case 2:
            score += 0.5 * point
            break

          case 3:
            score += 0.25 * point
            break
        }
      } else {
        if (el.answerCount === quizAnswerCount) incorrectCount++
      }
    })

    return Math.round(score)
  }

  const makeUserAnswerData = ({
    mobile,
    studyId,
    studentHistoryId,
    bookType,
    step,
    quizId,
    quizNo,
    currentQuizNo,
    correct,
    selectedAnswer,
    tryCount,
    maxQuizCount,
    quizLength,
    isCorrect,
    answerData,
    isEnabledPenalty,
    isFinishStudy,
  }: UserAnswerDataProps): IUserAnswer => {
    let userAnswer: IUserAnswer

    if (currentQuizNo + 1 > quizLength) {
      if (isCorrect) {
        const score = getScore(answerData, quizLength, maxQuizCount)

        userAnswer = {
          mobile: mobile,
          studyId: studyId,
          studentHistoryId: studentHistoryId,
          bookType: bookType,
          step: `${step}`,
          quizId: quizId,
          quizNo: quizNo,
          currentQuizNo: currentQuizNo,
          correct: correct,
          studentAnswer: selectedAnswer,
          answerCount: tryCount,
          isLastQuiz: true,
          score: score,
          isFinishStudy: isFinishStudy,
        }
      } else {
        // 오답인 경우
        if (tryCount >= maxQuizCount) {
          // 오답인데 기회를 다 소진한 경우
          const score = getScore(answerData, quizLength, maxQuizCount)

          // 유저 답안
          userAnswer = {
            mobile: mobile,
            studyId: studyId,
            studentHistoryId: studentHistoryId,
            bookType: bookType,
            step: `${step}`,
            quizId: quizId,
            quizNo: quizNo,
            currentQuizNo: currentQuizNo,
            correct: correct,
            studentAnswer: selectedAnswer,
            answerCount: tryCount,
            isLastQuiz: true,
            score: score,
            isEnabledPenalty: isEnabledPenalty,
            isFinishStudy: isFinishStudy,
          }
        } else {
          // 오답이지만 기회가 남아있는 경우
          // 유저 답안
          userAnswer = {
            mobile: mobile,
            studyId: studyId,
            studentHistoryId: studentHistoryId,
            bookType: bookType,
            step: `${step}`,
            quizId: quizId,
            quizNo: quizNo,
            currentQuizNo: currentQuizNo,
            correct: correct,
            studentAnswer: selectedAnswer,
            answerCount: tryCount,
          }
        }
      }
    } else {
      // 다음 문제가 있는 경우
      if (isEnabledPenalty) {
        // 패널티가 있는 학습
        // 유저 답안
        userAnswer = {
          mobile: mobile,
          studyId: studyId,
          studentHistoryId: studentHistoryId,
          bookType: bookType,
          step: `${step}`,
          quizId: quizId,
          quizNo: quizNo,
          currentQuizNo: currentQuizNo,
          correct: correct,
          studentAnswer: selectedAnswer,
          answerCount: tryCount,
          isEnabledPenalty: tryCount >= maxQuizCount ? true : undefined,
        }
      } else {
        // 패널티가 없는 학습
        // 유저 답안
        userAnswer = {
          mobile: mobile,
          studyId: studyId,
          studentHistoryId: studentHistoryId,
          bookType: bookType,
          step: `${step}`,
          quizId: quizId,
          quizNo: quizNo,
          currentQuizNo: currentQuizNo,
          correct: correct,
          studentAnswer: selectedAnswer,
          answerCount: tryCount,
        }
      }
    }

    return userAnswer
  }

  /**
   * 부분 점수 생성
   * @param studentId
   * @param studentHistoryId
   * @param bookTye
   * @param step
   * @param quizNo
   * @param quizId
   * @param currentQuizNo
   * @param correct
   * @param selectedAnswer
   * @param tryCount
   * @param maxQuizCount
   * @param quizLength
   * @param isCorrect
   * @param answerData
   * @param isFinishStudy
   * @param isEnabledPenalty
   * @returns answerData Object
   */
  const makeUserPartialAnswerData = ({
    mobile,
    studyId,
    studentHistoryId,
    bookType,
    step,
    quizId,
    quizNo,
    currentQuizNo,
    correct,
    selectedAnswer,
    partialRecord,
    tryCount,
    maxQuizCount,
    quizLength,
    isCorrect,
    answerData,
    isEnabledPenalty,
    isFinishStudy,
  }: UserPartialAnswersDataProps): IUserAnswerPartial => {
    let userAnswer: IUserAnswerPartial

    if (currentQuizNo + 1 > quizLength) {
      // 다음 문제가 없는 경우
      if (isCorrect) {
        // 정답인 경우
        const score = getScore(answerData, quizLength, maxQuizCount)

        // 유저 답안
        userAnswer = {
          mobile: mobile,
          studyId: studyId,
          studentHistoryId: studentHistoryId,
          bookType: bookType,
          step: `${step}`,
          quizId: quizId,
          quizNo: quizNo,
          currentQuizNo: currentQuizNo,
          correct: correct,
          studentAnswer: selectedAnswer,
          partialRecord: partialRecord,
          answerCount: tryCount,
          isLastQuiz: true,
          score: score,
          isFinishStudy: isFinishStudy,
        }
      } else {
        // 오답인 경우
        if (tryCount >= maxQuizCount) {
          // 오답인데 기회를 다 소진한 경우
          const score = getScore(answerData, quizLength, maxQuizCount)

          // 유저 답안
          userAnswer = {
            mobile: mobile,
            studyId: studyId,
            studentHistoryId: studentHistoryId,
            bookType: bookType,
            step: `${step}`,
            quizId: quizId,
            quizNo: quizNo,
            currentQuizNo: currentQuizNo,
            correct: correct,
            studentAnswer: selectedAnswer,
            partialRecord: partialRecord,
            answerCount: tryCount,
            isLastQuiz: true,
            score: score,
            isEnabledPenalty: isEnabledPenalty,
            isFinishStudy: isFinishStudy,
          }
        } else {
          // 오답이지만 기회가 남아있는 경우
          // 유저 답안
          userAnswer = {
            mobile: mobile,
            studyId: studyId,
            studentHistoryId: studentHistoryId,
            bookType: bookType,
            step: `${step}`,
            quizId: quizId,
            quizNo: quizNo,
            currentQuizNo: currentQuizNo,
            correct: correct,
            studentAnswer: selectedAnswer,
            partialRecord: partialRecord,
            answerCount: tryCount,
          }
        }
      }
    } else {
      // 다음 문제가 있는 경우
      // 유저 답안
      userAnswer = {
        mobile: mobile,
        studyId: studyId,
        studentHistoryId: studentHistoryId,
        bookType: bookType,
        step: `${step}`,
        quizId: quizId,
        quizNo: quizNo,
        currentQuizNo: currentQuizNo,
        correct: correct,
        studentAnswer: selectedAnswer,
        partialRecord: partialRecord,
        answerCount: tryCount,
        isEnabledPenalty: tryCount >= maxQuizCount ? true : undefined,
      }
    }

    return userAnswer
  }

  /**
   * 스코어 초기화
   */
  const resetStudentAnswer = () => {
    setScoreBoardData([])
  }

  return {
    scoreBoardData,
    setStudentAnswers,
    setStudentAnswersPartial,
    addStudentAnswer,
    addStudentAnswers,
    getScore,
    makeUserAnswerData,
    makeUserPartialAnswerData,
    resetStudentAnswer,
    convertRecordToScoreBoard,
    convertPartialRecordToScoreBoard,
    convertPartialRecordToScoreBoardClozeTest3,
  }
}

export { useStudentAnswer }
