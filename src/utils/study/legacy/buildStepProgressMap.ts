import type { LegacyQuizMark } from '@interfaces/common/header/LegacyQuizMark'
import type { LegacyStepProgress } from '@interfaces/common/header/LegacyStepProgress'
import { LegacyStepData } from '@interfaces/study/legacy/LegacyStepData'
import { ACTIVITY } from '@src/constants/study/studyConstants'
import { IRecordAnswerType } from '@src/interfaces/common/Common'

/**
 * 빈칸(blank) 단위 표시용 활동의 분리자.
 * - Summary2   : ',' (예: "1,2,1")
 * - ClozeTest3 : '/' (예: "1/2/1")  — blank 당 최종 결과 1글자만 저장
 *
 * `recordedData[].StudentAnswer` 가 빈칸별 시도 history 문자열을 이 분리자로 join 한 형태.
 * 각 history 문자는 `'1'`=O, `'2'`=X 의미.
 */
const BLANK_HISTORY_SEPARATOR: Record<string, string | undefined> = {
  [ACTIVITY.SUMMARY_2]: ',',
  [ACTIVITY.CLOZE_3]: '/',
}

type BlankQuizShape = {
  Quiz?: { QuizNo: number; Examples: { Text: string }[] }[]
}

type DefaultQuizShape = {
  Quiz?: { QuizNo: number }[]
}

/**
 * `quizAnswerCount` 만큼 빈 칸으로 채워진 한 행을 만든다.
 */
function emptyRow(quizAnswerCount: number): LegacyQuizMark[] {
  return Array.from({ length: quizAnswerCount }, () => '' as LegacyQuizMark)
}

/**
 * Summary2 처럼 한 문제(QuizNo) 당 *빈칸 N개* 를 각각 한 행으로 표시하는
 * 활동의 attempts 행렬을 만든다. 각 빈칸의 시도 history 문자열을 `'1'/'2'` 단위로
 * 풀어 `'O'/'X'` 로 변환한다.
 *
 * 7차 모델: **푼 순서 = 행 순서**.
 * `recordedData` 를 그 순서대로 펼치고, 마지막에 미시도 sentence 의 빈칸을 빈 칸으로 채운다.
 */
function buildBlankAttempts(
  data: LegacyStepData,
  quizAnswerCount: number,
  splitChar: string,
): LegacyQuizMark[][] {
  const partialQuizArr =
    (data.quizData as BlankQuizShape | null | undefined)?.Quiz ?? []

  const blankRows: LegacyQuizMark[][] = []
  const handledQuizNos = new Set<number>()

  for (const record of data.recordedData) {
    handledQuizNos.add(record.QuizNo)
    const sentenceMeta = partialQuizArr.find((q) => q.QuizNo === record.QuizNo)
    const tokens = record.StudentAnswer.split(splitChar)
    const examplesLen = sentenceMeta?.Examples.length ?? tokens.length

    for (let i = 0; i < examplesLen; i++) {
      const history = tokens[i] ?? ''
      const row = emptyRow(quizAnswerCount)
      if (quizAnswerCount > 0) {
        const lim = Math.min(history.length, quizAnswerCount)
        for (let j = 0; j < lim; j++) {
          row[j] = history[j] === '1' ? 'O' : 'X'
        }
      }
      blankRows.push(row)
    }
  }

  // 미시도 sentence 의 빈칸은 끝에 빈 칸으로 채움
  for (const q of partialQuizArr) {
    if (handledQuizNos.has(q.QuizNo)) continue
    for (let i = 0; i < q.Examples.length; i++) {
      blankRows.push(emptyRow(quizAnswerCount))
    }
  }
  return blankRows
}

/**
 * 한 record(누적 AnswerCount + 마지막 OX) 를 표시 행으로 변환.
 * - 마지막 시도 직전까지는 모두 오답(X) — 정답이면 retry 자체가 없으므로
 * - 마지막 시도 칸은 record.OX 로 결정
 */
function recordToRow(
  record: IRecordAnswerType | undefined,
  quizAnswerCount: number,
): LegacyQuizMark[] {
  const row = emptyRow(quizAnswerCount)
  if (quizAnswerCount <= 0 || !record) return row

  const tried = Math.min(record.AnswerCount, quizAnswerCount)
  if (tried <= 0) return row

  for (let i = 0; i < tried - 1; i++) row[i] = 'X'
  row[tried - 1] = record.OX === '1' ? 'O' : 'X'
  return row
}

/**
 * 기본 활동 — 1 record per quizNo, 누적 AnswerCount 와 마지막 OX 를 사용.
 *
 * 7차 모델: **푼 순서 = 행 순서**.
 * `recordedData` 가 들어온 순서대로 행을 채우고, 남는 자리는 미시도(빈 칸).
 * `quizArr` 의 인덱스 / QuizNo 정렬과 무관하므로 활동의 quiz 순서가
 * 어떻든 사용자가 푸는 순서대로 사이드바에 표시된다.
 */
function buildDefaultAttempts(
  data: LegacyStepData,
  quizAnswerCount: number,
): LegacyQuizMark[][] {
  const quizCount =
    (data.quizData as DefaultQuizShape | null | undefined)?.Quiz?.length ?? 0

  const rows: LegacyQuizMark[][] = []
  for (const record of data.recordedData) {
    rows.push(recordToRow(record, quizAnswerCount))
  }
  for (let i = rows.length; i < quizCount; i++) {
    rows.push(emptyRow(quizAnswerCount))
  }
  return rows
}

/**
 * 사이드바 카드용 step 진행 정보 빌드.
 *
 * 데이터 소스
 * - `quizCount`       : prefetch 된 `quizData.Quiz.length`
 * - `quizAnswerCount` : prefetch 된 `quizData.QuizAnswerCount` (= 한 문제당 시도 횟수)
 * - `attempts`        : 같은 step 의 `recordedData` 를 QuizNo 단위로 매칭해 만든
 *                       시도별 결과 행렬. `[quizIndex][attemptIndex]`.
 *
 * `recordedData` 의 의미 (useStudentAnswer 와 동일 모델)
 * - 한 QuizNo 당 record 는 최대 1개로 upsert 된다
 * - `AnswerCount`: 그 문제에 들어간 *누적 시도 횟수* (시도 차수가 아님)
 * - `OX`         : *마지막 시도*의 결과 ('1'=정답 / '0'=오답)
 *
 * 표시 규칙 (예: quizAnswerCount=3)
 * - record 없음                  → ['', '', '']         (미시도)
 * - AnswerCount=1, OX='1'        → ['O', '', '']        (1번째 정답)
 * - AnswerCount=2, OX='1'        → ['X', 'O', '']       (1번째 X → 2번째 정답)
 * - AnswerCount=2, OX='0'        → ['X', 'X', '']       (2번 모두 오답, retry 가능)
 * - AnswerCount=3, OX='0'        → ['X', 'X', 'X']      (모두 소진, 강제 진행)
 *
 * 활동의 quizData 는 활동마다 형태가 다르므로 unknown 으로 보관되며,
 * 여기서는 사이드바가 필요한 최소 형태로만 좁힌다.
 * Quiz 배열이 없는 활동(WritingActivity2 등)은 quizCount === 0 으로 떨어져
 * 사이드바가 placeholder 만 표시한다.
 */
export function buildStepProgressMap(
  stepDataMap: Record<number, LegacyStepData | undefined>,
): Record<number, LegacyStepProgress> {
  const map: Record<number, LegacyStepProgress> = {}

  for (const stepIdStr of Object.keys(stepDataMap)) {
    const stepId = Number(stepIdStr)
    const data = stepDataMap[stepId]
    if (!data) continue

    const quizAnswerCount = data.quizAnswerCount
    const splitChar = BLANK_HISTORY_SEPARATOR[data.activity]

    const attempts = splitChar
      ? buildBlankAttempts(data, quizAnswerCount, splitChar)
      : buildDefaultAttempts(data, quizAnswerCount)

    map[stepId] = {
      quizCount: attempts.length,
      quizAnswerCount,
      attempts,
    }
  }

  return map
}
