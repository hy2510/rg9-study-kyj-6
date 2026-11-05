const STUDY_API_PATH_BOOK_READING = 'api/study/book-reading'

/** UI·채점 임계값 (기획값) */
export const SCORE_SPEAK_PASS = 30
export const SCORE_SPEAK_ORANGE = 10
export const SCORE_SPEAK_GREEN = 30

/** Speak e-book 문항 데이터 */
export const GET_SPEAK_DATA_PATH = `${STUDY_API_PATH_BOOK_READING}/speak/e-book`

/** Speak 답안 기록 조회 */
export const GET_SPEAK_RECORD_PATH = `${STUDY_API_PATH_BOOK_READING}/speak/record`

/** Speak 답안 저장 */
export const SAVE_SPEAK_DATA_PATH = `${STUDY_API_PATH_BOOK_READING}/speak/save`

/** Speak 결과(통계) 저장 */
export const SAVE_STATISTICS_PATH = `${STUDY_API_PATH_BOOK_READING}/speak/statistics`

/** Speak 녹음 파일 업로드 */
export const SPEAK_FILE_UPLOAD_URL = 'https://fservice1.readinggate.com:3033/upload'
