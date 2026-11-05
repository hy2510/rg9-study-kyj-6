import React, { useEffect, useState } from 'react'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import { getBookInfo, getStudyInfo } from '@services/studyApi'
import { BookInfo } from '@src/interfaces/common/IBookInfo'
import { BookType, Mode, StudyEntryType } from '@src/interfaces/common/Types'
import { IStudyInfo } from '@src/interfaces/study/IStudyInfo'
import {
  normalizeUserRole,
  resolveStudyMode,
  UserRole,
} from '@utils/study/resolveStudyMode'

/**
 * `initialize()` 단계에서 `REF` 로부터 추출한 신호.
 * 서버 응답 `isReview` 와 합쳐서 최종 `Mode` 로 collapse 된다.
 */
interface RefModeSignals {
  isGuide: boolean
  isPreviewMode: boolean
  isTrialMode: boolean
  userRole: UserRole
}

interface AppContextDataProps {
  studyInfo: IStudyInfo
  bookInfo: BookInfo
}

export interface AppContextProps extends AppContextDataProps {
  handler: {
    actionFinishStudy: (
      finishStudyInfo: { id: number; cause: string | undefined },
      character: string,
    ) => void
    markPreferenceSubmitted: () => void
    markReadingCompletedEB: () => void
  }
}

export const AppContext = React.createContext<AppContextProps | undefined>(
  undefined,
)

export default function AppContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | undefined>()
  const [contextInfo, setContextInfo] = useState<AppContextDataProps>()

  useEffect(() => {
    initialize()
      .then((response) => {
        setContextInfo(response)
        setLoading(false)
      })
      .catch((error) => {
        setError(error)
      })
  }, [])

  if (error) {
    return <div>Error: {error.message}</div>
  } else if (loading) {
    return <CenteredLoading fillViewport />
  }

  const contextHandler = {
    actionFinishStudy: (
      finishStudyInfo: { id: number; cause: string | undefined },
      character: string,
    ) => {
      try {
        window.onFinishStudyResult(
          finishStudyInfo.id,
          finishStudyInfo.cause,
          character,
        )
      } catch (e) {
        location.replace('/')
      }
    },
    markPreferenceSubmitted: () => {
      setContextInfo((prev) => {
        if (!prev) return prev
        if (prev.studyInfo.isSubmitPreference) return prev
        return {
          ...prev,
          studyInfo: {
            ...prev.studyInfo,
            isSubmitPreference: true,
          },
        }
      })
    },
    markReadingCompletedEB: () => {
      setContextInfo((prev) => {
        if (!prev) return prev
        if (prev.bookInfo.ReadingCompletedEB === 'Y') return prev
        return {
          ...prev,
          bookInfo: {
            ...prev.bookInfo,
            ReadingCompletedEB: 'Y',
          },
        }
      })
    },
  }

  const contextValue = {
    ...contextInfo!,
    handler: { ...contextHandler },
  }

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  )
}

function initialize(): Promise<AppContextDataProps> {
  return new Promise((resolve, reject) => {
    if (window) {
      const REF = (window as any).REF

      if (REF.isStartWordPractice === true) {
        resolve(buildWordPracticeContext(REF))
        return
      }

      const studyId = REF.StudyId
      const studentHistoryId = REF.StudentHistoryId
      const bookType = REF.BookType as BookType
      const levelRoundId = REF.LevelRoundId
      const token = REF.Token
      const isDev = REF.isDev === undefined ? false : true
      // REF 신호는 여기서 정규화만 수행하고, 서버 응답(isReview) 과 합쳐 최종 모드를
      // 결정하는 것은 appContextData() 에서 resolveStudyMode 가 담당한다.
      const refModeSignals: RefModeSignals = {
        isGuide: REF.isGuide === true,
        isPreviewMode: REF.Mode === 'preview',
        isTrialMode: REF.Mode === 'trial',
        userRole: normalizeUserRole(REF.User),
      }
      const isStartWordPractice = REF.isStartWordPractice ?? false
      const isStartSpeak = REF.isStartSpeak ?? false

      appContextData(
        studyId,
        studentHistoryId,
        bookType,
        levelRoundId,
        token,
        isDev,
        refModeSignals,
        isStartWordPractice,
        isStartSpeak,
      )
        .then((response) => resolve(response))
        .catch((error) => {
          reject(new Error(error.message))
        })
    } else {
      reject(new Error('Null Data'))
    }
  })
}

function buildWordPracticeContext(REF: any): AppContextDataProps {
  // Word Practice 전용 초기화 경로. guide/preview/isReview 개념이 없으므로
  // 사용자 역할만 화이트리스트로 좁혀서 반영한다.
  const studyInfo: IStudyInfo = {
    studyId: '',
    studentHistoryId: '',
    bookType: (REF.BookType as BookType) ?? 'PB',
    mode: normalizeUserRole(REF.User),
    token: '',
    isDev: false,
    isStartWordPractice: true,
    isStartSpeak: false,
    allSteps: [],
    openSteps: [],
    mappedStepActivity: [],
    startStep: 0,
    availableQuizStatus: 0,
    isSubmitPreference: false,
    isSuper: false,
    isQuizLearning: false,
    isEbAnotherSizeYn: false,
    bookmarkPage: 0,
    pbookStorySoundPath: undefined,
    studyEntryType: 'legacy',
    isReview: false,
    isAvailableSpeaking: false,
  }

  const bookInfo = {
    BookLevel: (REF.level as string) ?? '',
  } as BookInfo

  return { studyInfo, bookInfo }
}

async function appContextData(
  studyId: string,
  studentHistoryId: string,
  bookType: BookType,
  levelRoundId: string,
  token: string,
  isDev: boolean,
  refModeSignals: RefModeSignals,
  isStartWordPractice: boolean,
  isStartSpeak: boolean,
): Promise<AppContextDataProps> {
  try {
    const useTrialStudyInfoApi =
      refModeSignals.isTrialMode || refModeSignals.isGuide
    const responseStudyInfo = await requestStudyInfo(
      studyId,
      studentHistoryId,
      bookType as string,
      useTrialStudyInfoApi,
    )

    if (responseStudyInfo) {
      const isSuper = responseStudyInfo.isSuper
      const isAvailableSpeaking = responseStudyInfo.isAvailableSpeaking
      const isSubmitPreference = responseStudyInfo.isSubmitPreference
      const allSteps = responseStudyInfo.allSteps
      const openSteps = responseStudyInfo.openSteps
      const mappedStepActivity = responseStudyInfo.mappedStepActivity
      const isQuizLearning = responseStudyInfo.isQuizLearning
      const startStep = responseStudyInfo.startStep
      const availableQuizStatus = responseStudyInfo.availableQuizStatus
      const bookmarkPage = responseStudyInfo.bookmarkPage
      const pbookStorySoundPath = responseStudyInfo.pbookStorySoundPath
      const isEbAnotherSizeYn = responseStudyInfo.isEbAnotherSizeYn ?? false
      const studyEntryType: StudyEntryType = 'legacy'
      const isReview = responseStudyInfo.isReview ?? false
      const isReTestYn = responseStudyInfo.isReTestYn ?? false
      // REF 신호와 서버 isReview 를 합쳐 단일 Mode enum 으로 collapse.
      // 우선순위: guide > preview > trial > staff > review > student
      const studyMode: Mode = resolveStudyMode({
        ...refModeSignals,
        isReview,
      })

      const studyInfo = {
        studyId,
        studentHistoryId,
        bookType,
        mode: studyMode,
        isSuper,
        isSubmitPreference,
        allSteps: [...allSteps],
        openSteps: [...openSteps],
        mappedStepActivity: [...mappedStepActivity],
        isQuizLearning,
        startStep,
        availableQuizStatus,
        token,
        isDev,
        isEbAnotherSizeYn,
        bookmarkPage,
        pbookStorySoundPath,
        studyEntryType,
        isReview,
        isReTestYn,
        isStartWordPractice,
        isStartSpeak,
        isAvailableSpeaking,
      }

      const responseBookInfo = await requestBookInfo(
        studyId,
        studentHistoryId,
        levelRoundId,
      )
      const bookInfo = { ...responseBookInfo }

      return {
        studyInfo,
        bookInfo,
      }
    } else {
      throw new Error('Get Study Info Failed')
    }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

/**
 * Study Info 받아오기
 * @param studyId
 * @param studentHistoryId
 * @param bookType
 * @param isTrial
 * @returns
 */
async function requestStudyInfo(
  studyId: string,
  studentHistoryId: string,
  bookType: string,
  isTrial: boolean,
) {
  const studyInfo = await getStudyInfo(
    studyId,
    studentHistoryId,
    bookType,
    isTrial,
  )

  return studyInfo
}

/**
 * Book Info 받아오기
 * @param studyId
 * @param studentHistoryId
 * @param levelRoundId
 * @returns
 */
async function requestBookInfo(
  studyId: string,
  studentHistoryId: string,
  levelRoundId: string,
) {
  const bookInfo = await getBookInfo(studyId, studentHistoryId, levelRoundId)

  return bookInfo
}
