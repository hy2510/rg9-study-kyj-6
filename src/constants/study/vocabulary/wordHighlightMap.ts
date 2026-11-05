export type HighlightTarget = {
  text: string
  baseOnly?: string
}

export type HighlightConfig = {
  sentence: string
  targets: HighlightTarget[]
}

/**
 * Vocabulary Practice 2 의 BookCode 별 문장 하이라이트 설정.
 * 서버 데이터에는 포함되어 있지 않은 **클라이언트 하드코딩** 예외처리로,
 * 특정 책의 특정 문장에서 지정된 단어들을 빨간색으로 강조한다.
 *
 * - `text` : 하이라이트 대상 regex 패턴 (대소문자 무시, 모든 매치)
 * - `baseOnly` : 매치 안에서 어근만 빨강 처리 (예: "pecks" 매치 중 "peck" 만 빨강)
 */
export const WORD_HIGHLIGHT_MAP: Record<string, HighlightConfig[]> = {
  'EB-1A-507': [
    {
      sentence: 'Anchovies are tiny fish that taste salty.',
      targets: [{ text: 'Anchovies' }],
    },
  ],
  'EB-1B-334': [
    {
      sentence: 'The woodpecker pecks on the tree.',
      targets: [{ text: 'pecks', baseOnly: 'peck' }],
    },
  ],
  'EB-1B-518': [
    {
      sentence: 'Lily ties up her hair with a hairband.',
      targets: [{ text: 'ties', baseOnly: 'tie' }, { text: 'up' }],
    },
  ],
  'EB-1C-303': [
    {
      sentence: 'He practices acting to be an actor.',
      targets: [{ text: 'acting', baseOnly: 'act' }],
    },
  ],
  'EB-1C-312': [
    { sentence: 'Jenny cries out loud.', targets: [{ text: 'cries' }] },
  ],
  'EB-1C-347': [
    {
      sentence: 'The street is covered with leaves.',
      targets: [{ text: 'leaves' }],
    },
  ],
  'EB-1C-522': [
    {
      sentence: 'The firefighter puts out the fire.',
      targets: [{ text: 'fire' }],
    },
  ],
}

export const VOCA_HIGHLIGHT_COLOR = '#f15144'
