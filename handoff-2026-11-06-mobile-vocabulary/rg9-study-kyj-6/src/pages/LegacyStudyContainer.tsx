import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useTranslation } from 'react-i18next'

import CenteredLoading from '@components/atoms/common/CenteredLoading'
import VocaPreviewPopup from '@components/organisms/story/VocaPreviewPopup'
import ActivityResultPopup from '@components/organisms/study/common/ActivityResultPopup'
import ActivityStage from '@components/organisms/study/common/ActivityStage'
import { renderLegacyActivity } from '@components/templates/study/legacy/renderLegacyActivity'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { HeartContextProvider, useHeartState } from '@contexts/HeartContext'
import { QuestionSoundSlotProvider } from '@contexts/QuestionSoundSlotContext'
import useCharacter from '@hooks/study/legacy/useCharacter'
import { useLegacyQuizManager } from '@hooks/study/legacy/useLegacyQuizManager'
import { useVocabularyPracticeByActivity } from '@hooks/study/legacy/useVocabularyPracticeByActivity'
import { useTimer } from '@hooks/study/remix/useTimer'
import { ViewType } from '@interfaces/common/ViewType'
import StudyShell from '@src/components/templates/study/common/StudyShell'
import { ACTIVITY } from '@src/constants/study/studyConstants'
import { IQuizStudyRef, IRecordAnswerType } from '@src/interfaces/common/Common'
import { StudyTypeCode } from '@src/interfaces/common/Types'
import { IReadingComprehension4 } from '@src/interfaces/study/IReadingComprehension'
import { IWritingActivity2 } from '@src/interfaces/study/IWritingActivity'
import { ILegacyStudyData } from '@src/interfaces/study/legacy/LegacyStudy'
import { buildStepProgressMap } from '@src/utils/study/legacy/buildStepProgressMap'
import { computeStepScore } from '@src/utils/study/legacy/computeStepScore'
import {
  resolveWritingRevisionMode,
  writingRevisionModeLabelKey,
} from '@src/utils/study/legacy/writingRevisionMode'
import { getGuideParentOrigin } from '@utils/study/guideMode'
import { isReviewFailMode, isReviewPassMode } from '@utils/study/reviewMode'

const LEGACY_TIMER_INITIAL_SEC = 1200

/**
 * ReadingComprehension4 재시험 정책 — 점수가 통과 기준 미만이면 다음 스텝으로
 * 진행하지 않고 해당 스텝을 처음부터 다시 풀게 한다.
 *
 * 통과 기준은 관리자 설정값(`quizData.PassMark`) 을 우선 사용하고, 값이 없거나
 * 유효하지 않으면 이 fallback 상수를 사용한다.
 */
const RC4_RETEST_MIN_SCORE_FALLBACK = 70

const VOCABULARY_ACTIVITIES = new Set<string>([
  ACTIVITY.VOCABULARY_1,
  ACTIVITY.VOCABULARY_2,
  ACTIVITY.VOCABULARY_3,
  ACTIVITY.VOCABULARY_4,
])

export type LegacyStudyContainerChildProps = {
  currentStep: number
  onFinishActivity: () => void
}

type LegacyStudyContainerProps = {
  changeCurrentView: (view: ViewType) => void
  isVisible?: boolean
  guideInitialStep?: number
}

export default function LegacyStudyContainer({
  changeCurrentView,
  isVisible = true,
  guideInitialStep,
}: LegacyStudyContainerProps) {
  const { t } = useTranslation()
  const CHARACTER = useCharacter()
  const { studyInfo, bookInfo, handler } = useContext(
    AppContext,
  ) as AppContextProps

  let startStep = studyInfo.startStep

  if (bookInfo.RevisionStatusCode === '028010') {
    const isOpenStep5 = studyInfo.openSteps.find((step) => step === 5)
    if (isOpenStep5) {
      startStep = 5
    }
  }

  const [currentStepId, setCurrentStepId] = useState<number>(
    guideInitialStep ?? startStep,
  )

  /**
   * 활동 종료 후 "다음 스텝 진행 전" 게이트.
   * - 값이 number 면 해당 step 의 결과 팝업이 노출되고, 사용자가 진행 버튼을 눌러야
   *   다음 스텝으로 넘어간다.
   * - null 이면 게이트 닫힘 (정상 진행 / 미사용 상태).
   *
   * WritingActivity2 류는 결과 팝업 정책이 추후 별도로 정해질 예정이라
   * 게이트를 열지 않는다 (아래 `onCurrentActivityFinish` 분기 참고).
   */
  const [pendingFinishStepId, setPendingFinishStepId] = useState<number | null>(
    null,
  )

  /**
   * 재시험(현재 스텝 처음부터 다시 풀기) 트리거용 nonce.
   * 증가 시 `ActivityStage` key 가 바뀌어 활동이 재마운트되고 첫 문제부터 시작한다.
   */
  const [stepRunNonce, setStepRunNonce] = useState(0)

  /**
   * "Try Again" 클릭한 세션 내에서만 true 인 로컬 재시험 플래그 (RC4 전용).
   * 새로고침 후엔 서버 `studyInfo.isReTestYn` 이 인계받으므로 로컬 값은 리셋되어도 무방.
   * 다른 스텝으로 이동 시(진행/사이드메뉴) 자동 리셋.
   */
  const [isCurrentStepRetest, setIsCurrentStepRetest] = useState(false)

  // 하트: 활동이 fetch 후 setMax(QuizAnswerCount)로 동적 설정.
  // currentStepId 변경 시 max/current 모두 0 으로 리셋 (활동 setMax 까지 빈 하트로 노출)
  const heart = useHeartState(0, currentStepId)

  /**
   * 스텝당 20분 타이머 — 사내 정책 (모든 Legacy 활동 공통).
   *
   * - `currentStepId` 변경 시 `setup(LEGACY_TIMER_INITIAL_SEC)` 재호출 (스텝마다 리셋)
   * - 타임아웃(`isFinished`) 시 `onLogoutStudy()` 호출 (7th 의 활동별 타이머 콜백과 동등)
   * - `isVisible` false 시 일시정지, true 시 재개
   *
   * 시간 관리는 컨테이너 단일 책임 — 활동 컴포넌트는 자체 타이머 hook 을 두지 않는다.
   */
  const {
    time,
    setup,
    startTimer,
    pauseTimer,
    resumeTimer,
    isFinished,
    initialTime,
  } = useTimer()

  // 활동 컴포넌트가 패널티 등의 이유로 타이머 정지를 요청했는지 추적.
  // ref 를 사용해 isVisible effect 가 startTimer 를 호출하기 전에 확인할 수 있도록 함.
  // (자식 effect → 부모 effect 순서: 자식의 onPauseTimer 가 먼저 실행되어 ref 를 true 로 설정,
  //  이후 부모의 startTimer effect 가 ref 를 확인해 타이머를 시작하지 않는다.)
  const activityPauseRef = useRef(false)

  // 현재 스텝의 퀴즈 데이터 로딩 완료 여부 — 로딩 중에는 타이머를 시작하지 않기 위해 사용
  const [isQuizDataReady, setIsQuizDataReady] = useState(false)

  /**
   * 현재 화면에 표시 중인 quiz(1-based) 인덱스.
   * 활동 컴포넌트가 `onActiveQuizChange` 로 갱신한다.
   * - 헤더 Q 번호를 화면과 정확히 동기화 (`onUpdateRecord` 시점에 헤더가
   *   먼저 튀지 않도록).
   * - step 이 바뀌거나 재시작(nonce)될 때 null 로 리셋 → 활동이 보고하기 전까지
   *   `solvedCount + 1` 폴백을 사용.
   */
  const [activeQuizIndex, setActiveQuizIndex] = useState<number | null>(null)
  useEffect(() => {
    setActiveQuizIndex(null)
  }, [currentStepId, stepRunNonce])

  const onPauseTimer = useCallback(() => {
    activityPauseRef.current = true
    pauseTimer()
  }, [pauseTimer])

  const onResumeTimer = useCallback(() => {
    activityPauseRef.current = false
    resumeTimer()
  }, [resumeTimer])

  const currentActivity = studyInfo.mappedStepActivity[currentStepId - 1] ?? ''
  const isBookTypePB = studyInfo.bookType === 'PB'
  /**
   * 리뷰 모드 세분화.
   * - Pass: 이미 학습을 통과(Average ≥ 70) 하고 조회만 하는 상태.
   *   → 타이머·시계·하트 무의미하므로 `useTimer.setup` 을 스킵하고 상단 라벨을 'Review Mode' 로 통일.
   * - Fail: 다시 풀어야 하는 상태.
   *   → 시계·하트·타이머는 유지하고 좌측에 'Review Mode' 배지만 추가로 표시.
   */
  const isReviewPass = isReviewPassMode(studyInfo, bookInfo)
  const isReviewFail = isReviewFailMode(studyInfo, bookInfo)
  const isVocabularyActivity = VOCABULARY_ACTIVITIES.has(currentActivity)
  const bookLevelNum = Number.parseInt(
    bookInfo.BookLevel?.trim().substring(0, 1) ?? '',
    10,
  )
  const isLevel2OrAbove = Number.isFinite(bookLevelNum) && bookLevelNum >= 2

  const needsVocaPreview = isVocabularyActivity
  const shouldAutoOpenVocaCards = isVocabularyActivity && !isLevel2OrAbove

  const { vocaData1, vocaData2, vocaData3, vocaData4, loadedActivity } =
    useVocabularyPracticeByActivity(
      needsVocaPreview ? currentActivity : undefined,
    )

  const hasVocaData = Boolean(vocaData1 || vocaData2 || vocaData3 || vocaData4)

  const [isVocaCardsOpen, setIsVocaCardsOpen] = useState(false)
  const [autoOpenedVocaStepId, setAutoOpenedVocaStepId] = useState<
    number | null
  >(null)

  const handleCloseVocaCards = useCallback(() => {
    setIsVocaCardsOpen(false)
    onResumeTimer()
  }, [onResumeTimer])

  const handleOpenVocaCardsFromMenu = useCallback(() => {
    if (!hasVocaData) return
    setIsVocaCardsOpen(true)
    onPauseTimer()
  }, [hasVocaData, onPauseTimer])

  useEffect(() => {
    setIsVocaCardsOpen(false)
  }, [currentStepId, needsVocaPreview])

  useEffect(() => {
    if (!shouldAutoOpenVocaCards) return
    if (loadedActivity !== currentActivity || !hasVocaData) return
    if (autoOpenedVocaStepId === currentStepId) return

    setAutoOpenedVocaStepId(currentStepId)
    setIsVocaCardsOpen(true)
    onPauseTimer()
  }, [
    currentActivity,
    currentStepId,
    autoOpenedVocaStepId,
    hasVocaData,
    loadedActivity,
    onPauseTimer,
    shouldAutoOpenVocaCards,
  ])

  const isWaitingForAutomaticVocaCards =
    shouldAutoOpenVocaCards &&
    autoOpenedVocaStepId !== currentStepId &&
    loadedActivity !== currentActivity

  useEffect(() => {
    // Review Pass 는 조회 목적이라 타이머 자체를 돌리지 않는다 (자동 로그아웃 방지).
    // `initialTime === 0` 이 유지되어 아래 타임아웃 useEffect 도 자연히 트리거되지 않는다.
    if (!isReviewPass) {
      setup(LEGACY_TIMER_INITIAL_SEC)
    }
    setIsQuizDataReady(false)
  }, [currentStepId, setup, isReviewPass])

  useEffect(() => {
    if (isVisible) {
      if (
        !activityPauseRef.current &&
        isQuizDataReady &&
        (time.timeMin > 0 || time.timeSec > 0)
      ) {
        startTimer()
      }
    } else {
      pauseTimer()
    }
  }, [isVisible, time, startTimer, pauseTimer, isQuizDataReady])

  useEffect(() => {
    // setup 호출 전(initialTime===0)이면 무시 — 초기 마운트 시 즉시 로그아웃 방지
    if (initialTime > 0 && isFinished) {
      try {
        ;(window as Window & { onLogoutStudy?: () => void }).onLogoutStudy?.()
      } catch {
        /* ignore */
      }
    }
  }, [isFinished, initialTime])

  const formatTime = (timeMin: number, timeSec: number): string => {
    const min = String(timeMin).padStart(2, '0')
    const sec = String(timeSec).padStart(2, '0')
    return `${min}:${sec}`
  }

  /**
   * 모든 step 의 quizData + recordedData prefetch.
   * - 활동 코드별 fetcher 매핑은 이 컨테이너의 switch(currentActivity) 와 1:1 대응
   * - Vocabulary 1~4 는 사내 정책으로 Practice 폐지 → 항상 Test fetcher
   * - 결과는 사이드바(stepProgressMap) 와 마이그레이션 완료 활동 컴포넌트의 props 로 주입된다.
   */
  const quizStudyRef = useMemo<IQuizStudyRef>(
    () => ({
      mode: studyInfo.mode,
      studyId: studyInfo.studyId,
      studentHistoryId: studyInfo.studentHistoryId,
      bookType: studyInfo.bookType,
      studyTypeCode: (studyInfo.bookType === 'EB'
        ? '001006'
        : '001001') as StudyTypeCode,
    }),
    [
      studyInfo.mode,
      studyInfo.studyId,
      studyInfo.studentHistoryId,
      studyInfo.bookType,
    ],
  )
  const openStepsMemo = useMemo(
    () => studyInfo.openSteps,
    [studyInfo.openSteps],
  )
  const mappedStepActivityMemo = useMemo(
    () => studyInfo.mappedStepActivity,
    [studyInfo.mappedStepActivity],
  )
  const legacyQuizManager = useLegacyQuizManager({
    studyRef: quizStudyRef,
    openSteps: openStepsMemo,
    mappedStepActivity: mappedStepActivityMemo,
  })

  /**
   * 사이드바 카드용 step 진행 정보.
   * 빌드 로직은 `buildStepProgressMap` 유틸로 분리 (자세한 표시 규칙은 유틸 참조).
   */
  const stepProgressMap = useMemo(
    () => buildStepProgressMap(legacyQuizManager.stepDataMap),
    [legacyQuizManager.stepDataMap],
  )

  /**
   * RC4 통과 기준 점수 해석기 — 관리자 설정값(`quizData.PassMark`) 을 우선 사용하고,
   * 값이 없거나 유효하지 않으면 fallback 상수를 사용한다.
   *
   * 관리자가 `PassMark=0` 으로 설정하면 모든 점수(≥0) 가 통과 → 사실상 무조건 통과.
   */
  const resolveRc4PassMark = useCallback(
    (stepId: number): number => {
      const quizData = legacyQuizManager.stepDataMap[stepId]?.quizData as
        IReadingComprehension4 | undefined
      const raw = quizData?.PassMark
      return typeof raw === 'number' && Number.isFinite(raw) && raw >= 0
        ? raw
        : RC4_RETEST_MIN_SCORE_FALLBACK
    },
    [legacyQuizManager.stepDataMap],
  )

  /**
   * RC4 이어풀기 정책 — 서버 `startStep` 을 그대로 신뢰한다.
   *
   * 서버는 RC4 통과/재시험 상태를 판정해 `startStep` 을 결정한다:
   *  - 원본/재시험 통과 → `startStep = 다음 스텝`
   *  - 미통과 or 재시험 진행 중 → `startStep = RC4 스텝`, `isReTestYn = true` 시 R 기록 이어풀기
   *
   * 과거에는 클라이언트가 점수를 재검증해 미통과 시 RC4 로 되돌리는 게이트가 있었으나,
   * 재시험 통과 이후 서버가 `isReTestYn=false` + `startStep=다음스텝` 을 반환하면
   * 클라이언트는 원본 실패 기록(numeric)을 보고 미통과로 오판해 스텝1 로 잘못 회귀하는
   * 버그가 있어 제거했다. 서버의 재시험 판정을 유일한 소스로 삼는다.
   */

  const getNextStepId = (): number | undefined => {
    const idx = studyInfo.openSteps.findIndex(
      (value) => value === currentStepId,
    )
    return idx >= 0 && studyInfo.openSteps.length > idx + 1
      ? studyInfo.openSteps[idx + 1]
      : undefined
  }

  /**
   * 실제 다음 스텝(또는 학습 종료)로 진행하는 단일 콜백.
   *
   * 결과 팝업의 진행 버튼과, 결과 팝업을 사용하지 않는 활동(WritingActivity2 등)의
   * 즉시 진행 분기 양쪽에서 호출된다. 게이트(`pendingFinishStepId`)도 함께 닫는다.
   */
  const proceedToNextStep = () => {
    setPendingFinishStepId(null)
    setIsCurrentStepRetest(false)
    const nextStepId = getNextStepId()

    if (nextStepId) {
      setCurrentStepId(nextStepId)
      return
    }

    if (studyInfo.mode === 'student' || studyInfo.mode === 'trial') {
      const tempFinishStudyInfo =
        window.sessionStorage.getItem('finishStudyInfo')

      if (tempFinishStudyInfo) {
        window.sessionStorage.removeItem('finishStudyInfo')
        handler.actionFinishStudy(JSON.parse(tempFinishStudyInfo), CHARACTER)
      } else {
        handler.actionFinishStudy({ id: 0, cause: undefined }, CHARACTER)
      }
      return
    }

    try {
      window.onExitStudy()
    } catch {
      location.replace('/')
    }
  }

  /**
   * 현재 스텝을 처음부터 다시 풀게 한다 (RC4 재시험).
   * - 해당 스텝의 로컬 recordedData 초기화 → 시작 위치가 첫 문제로 복귀
   * - nonce 증가로 활동 재마운트 (하트/진행도도 활동 마운트 시 리셋됨)
   */
  const retryCurrentStep = () => {
    const stepId = pendingFinishStepId
    setPendingFinishStepId(null)
    if (stepId === null) return
    legacyQuizManager.resetStepRecord(stepId)
    activityPauseRef.current = false
    setup(LEGACY_TIMER_INITIAL_SEC)
    setIsCurrentStepRetest(true)
    setStepRunNonce((n) => n + 1)
  }

  const isGuideMode = studyInfo.mode === 'guide'

  const postToParent = useCallback(
    (data: object) => {
      if (!isGuideMode) return
      const origin = getGuideParentOrigin()
      window.parent.postMessage(data, origin ?? '*')
    },
    [isGuideMode],
  )

  const onCurrentActivityFinish = () => {
    // Close the device keyboard before opening any step result or finishing study.
    const activeElement = document.activeElement
    if (
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement ||
      (activeElement instanceof HTMLElement && activeElement.isContentEditable)
    ) {
      activeElement.blur()
    }
    postToParent({ type: 'ACTIVITY_FINISHED', step: currentStepId })
    if (currentActivity === ACTIVITY.WRITING_2) {
      proceedToNextStep()
      return
    }
    setPendingFinishStepId(currentStepId)
  }

  const changeStep = (step: number) => {
    setIsCurrentStepRetest(false)
    setCurrentStepId(step)
  }

  /**
   * 사이드 메뉴에서 스텝 카드 헤더를 눌러 자유 이동할 때 사용 (리뷰/스태프/프리뷰 모드).
   * 결과 팝업이 떠 있으면 함께 닫아, 이동 후 즉시 대상 스텝의 활동이 표시되도록 한다.
   */
  const handleNavigateStep = useCallback((stepId: number) => {
    setPendingFinishStepId(null)
    setIsCurrentStepRetest(false)
    setCurrentStepId(stepId)
  }, [])
  const canNavigateStep =
    studyInfo.mode !== 'student' &&
    studyInfo.mode !== 'guide' &&
    studyInfo.mode !== 'trial'

  const datas: ILegacyStudyData = {
    mode: studyInfo.mode,
    currentStep: currentStepId,
    studyId: studyInfo.studyId,
    studentHistoryId: studyInfo.studentHistoryId,
    bookType: studyInfo.bookType,
    studyTypeCode: (studyInfo.bookType === 'EB'
      ? '001006'
      : '001001') as StudyTypeCode,
    lastStep: studyInfo.openSteps[studyInfo.openSteps.length - 1],
    onFinishActivity: onCurrentActivityFinish,
    changeStep,
  }

  /**
   * Phase 2 마이그레이션 완료된 활동에는 prefetch 결과를 주입한다.
   * ListeningActivity2 가 첫 파일럿이며, 나머지 활동은 후속 단계에서 추가 예정.
   *
   * `onUpdateRecord` — 활동이 채점 직후 호출하면 currentStep 의 `recordedData`
   * 가 머지되어 사이드바(stepProgressMap)가 다음 렌더에서 즉시 갱신된다.
   */
  const currentStepData = legacyQuizManager.stepDataMap[currentStepId]

  // 퀴즈 데이터 로딩 완료 시 타이머 시작 허용
  useEffect(() => {
    if (currentStepData?.quizData) {
      setIsQuizDataReady(true)
    }
  }, [currentStepData?.quizData])

  const onUpdateRecord = useCallback(
    (record: IRecordAnswerType) => {
      legacyQuizManager.patchStepRecord(currentStepId, record)
    },
    [currentStepId, legacyQuizManager],
  )
  const datasWithPrefetch: ILegacyStudyData = {
    ...datas,
    quizData: currentStepData?.quizData,
    recordedData: currentStepData?.recordedData,
    onUpdateRecord,
    onActiveQuizChange: setActiveQuizIndex,
    onPauseTimer,
    onResumeTimer,
    isRetest: isCurrentStepRetest || (studyInfo.isReTestYn ?? false),
  }

  const component = renderLegacyActivity({
    activity: currentActivity,
    datas,
    datasWithPrefetch,
    isWriting2Review: Boolean(studyInfo.isReview),
    isWriting2Rewriting:
      bookInfo.RevisionStatusCode === '028010' ||
      bookInfo.RevisionStatusCode === '028009',
  })

  /**
   * 헤더 프로그레스바: 현재 activity(step) 내부 quiz 진행만 표시.
   * activity 가 바뀌면 0 부터 다시 채워진다.
   * - progress: `attempts` 행 중 "완결" 된 quiz 수
   *   (정답으로 마감된 행 또는 모든 시도가 오답으로 소진된 행)
   *   → 첫 시도 오답으로 재시도 가능한 상태는 미완결로 간주해 Q 번호가
   *     현재 진행 중인 문제를 가리키도록 한다.
   * - total   : 현재 step 의 `quizCount` (없으면 1 로 폴백)
   */
  const currentStepProgress = stepProgressMap[currentStepId]
  const currentStepSolvedCount = currentStepProgress
    ? currentStepProgress.attempts.filter(
        (row) => row.includes('O') || row.every((mark) => mark === 'X'),
      ).length
    : 0

  /**
   * RC4 결과 분기 — 방금 완료한 스텝이 ReadingComprehension4 인지, 점수가 기준
   * 이상(통과)인지로 나뉜다.
   * - 미통과(`isRc4Retest`): 진행 버튼이 "Try Again" 으로 바뀌고 재시험 실행.
   * - 통과(`isRc4Pass`): 틀린 문제의 학생 답/정답 리뷰(`rc4ReviewItems`)를 노출.
   */
  const isRc4Finish =
    pendingFinishStepId !== null &&
    (studyInfo.mappedStepActivity[pendingFinishStepId - 1] ?? '') ===
      ACTIVITY.READING_COMP_4

  const rc4Score =
    pendingFinishStepId !== null
      ? computeStepScore(stepProgressMap[pendingFinishStepId]?.attempts ?? [])
      : 0

  const rc4PassMark =
    isRc4Finish && pendingFinishStepId !== null
      ? resolveRc4PassMark(pendingFinishStepId)
      : RC4_RETEST_MIN_SCORE_FALLBACK

  // 리뷰 모드는 이미 학습을 마친 상태를 재열람하는 용도이므로 RC4 재시험을 요구하지 않는다.
  const isRc4Retest =
    isRc4Finish && !studyInfo.isReview && rc4Score < rc4PassMark
  const isRc4Pass =
    isRc4Finish && (studyInfo.isReview || rc4Score >= rc4PassMark)

  const rc4QuizList =
    isRc4Pass && pendingFinishStepId !== null
      ? ((
          legacyQuizManager.stepDataMap[pendingFinishStepId]?.quizData as
            IReadingComprehension4 | undefined
        )?.Quiz ?? [])
      : []

  const rc4ReviewItems =
    isRc4Pass && pendingFinishStepId !== null
      ? (legacyQuizManager.stepDataMap[pendingFinishStepId]?.recordedData ?? [])
          .filter((record) => record.OX !== '1')
          .map((record) => ({
            questionNo: record.CurrentQuizNo,
            questionText:
              rc4QuizList.find((quiz) => quiz.QuizNo === record.QuizNo)
                ?.Question.Text ?? '',
            studentAnswer: record.StudentAnswer,
            correctAnswer: record.Correct,
          }))
      : undefined

  return (
    <HeartContextProvider value={heart}>
      <StudyShell
        fitMobileViewport={isVocabularyActivity}
        character={CHARACTER}
        isVisible={isVisible}
        headerProps={{
          variant: 'study',
          engine: 'legacy',
          bookCode: bookInfo.BookCode,
          bookTitle: bookInfo.Title,
          keywords: bookInfo.Keywords,
          isBookTypePB: studyInfo.bookType === 'PB',
          changeCurrentView,
          shouldShowCenterInfo: true,
          currentHeart: heart.current,
          maxHeart: heart.max,
          time,
          formatTime,
          progress: currentStepSolvedCount,
          total: currentStepProgress?.quizCount ?? 1,
          /**
           * 헤더 Q 번호 — 활동 컴포넌트가 실제로 화면에 표시 중인 quiz 인덱스.
           * `onUpdateRecord` 로 solvedCount 가 먼저 증가해도 화면 전환 전까지는
           * `activeQuizIndex` 가 그대로 유지되어 헤더가 튀지 않는다.
           * 활동이 아직 값을 보고하지 않은 경우(Summary1 처럼 페이지 단일 활동
           * 또는 초기 렌더 순간) 는 `solvedCount + 1` 폴백을 사용.
           * quizCount 로 상한 캡핑 (활동이 마지막 문제에서 종료 시 초과 방지).
           */
          questionNumber: Math.min(
            activeQuizIndex ?? currentStepSolvedCount + 1,
            currentStepProgress?.quizCount ?? 1,
          ),
          openSteps: studyInfo.openSteps,
          currentStepId,
          stepProgressMap,
          mappedStepActivity: studyInfo.mappedStepActivity,
          showVocaCardsMenu: isBookTypePB && needsVocaPreview && hasVocaData,
          onOpenVocaCards: handleOpenVocaCardsFromMenu,
          onNavigateStep: canNavigateStep ? handleNavigateStep : undefined,
          statusLabel: isReviewPass
            ? t('study.reviewBadge')
            : currentActivity === ACTIVITY.WRITING_2
              ? (currentStepData?.quizData as IWritingActivity2 | undefined)
                  ?.Writing?.Type === 'No Revision'
                ? 'Writing Activity'
                : t(
                    writingRevisionModeLabelKey(
                      resolveWritingRevisionMode(
                        (
                          currentStepData?.quizData as
                            IWritingActivity2 | undefined
                        )?.Writing?.Mode,
                      ),
                    ),
                  )
              : undefined,
          reviewBadge: isReviewFail ? t('study.reviewBadge') : undefined,
        }}
      >
        {!isVocaCardsOpen && component && !isWaitingForAutomaticVocaCards ? (
          <ActivityStage
            key={`${currentStepId}:${stepRunNonce}`}
            fillMobileViewport={isVocabularyActivity}
          >
            <QuestionSoundSlotProvider>{component}</QuestionSoundSlotProvider>
          </ActivityStage>
        ) : null}
        {isWaitingForAutomaticVocaCards ? <CenteredLoading /> : null}
        {pendingFinishStepId !== null && (
          <ActivityResultPopup
            stepId={pendingFinishStepId}
            activity={
              studyInfo.mappedStepActivity[pendingFinishStepId - 1] ?? ''
            }
            stepProgress={stepProgressMap[pendingFinishStepId]}
            isLastStep={getNextStepId() === undefined}
            onProceed={isRc4Retest ? retryCurrentStep : proceedToNextStep}
            proceedLabel={isRc4Retest ? 'Try Again' : undefined}
            notice={
              isRc4Retest
                ? t('study.rc4RetestNotice', { score: rc4PassMark })
                : undefined
            }
            character={CHARACTER}
            reviewItems={rc4ReviewItems}
          />
        )}
        {isVocaCardsOpen ? (
          <VocaPreviewPopup
            bookLevel={bookInfo.BookLevel}
            bookType={studyInfo.bookType}
            onClose={handleCloseVocaCards}
            pauseBookAudio={() => {}}
            vocaData1={vocaData1}
            vocaData2={vocaData2}
            vocaData3={vocaData3}
            vocaData4={vocaData4}
          />
        ) : null}
      </StudyShell>
    </HeartContextProvider>
  )
}
