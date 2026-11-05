import { type Ref } from 'react'

import styled from 'styled-components'

import { IconImage } from '@components/atoms/common/icons/IconImage'
import { IconPrintGray } from '@components/atoms/common/icons/IconPrintGray'
import { IconSpeaker } from '@components/atoms/common/icons/IconSpeaker'
import SectionTitle from '@components/atoms/common/SectionTitle'
import useStoryAudioWord from '@hooks/story/useStoryAudioWord'
import type { StoryVocaKeywordRow } from '@utils/story/flattenVocabularyPracticeRows'

type StoryKeywordsSectionProps = {
  keywordList: string[]
  vocaRows: StoryVocaKeywordRow[]
  vocabularyPrintUrl?: string
  onVocaOpen?: () => void
  pauseBookAudio?: () => void
  vocaAnchorRef?: Ref<HTMLButtonElement>
}

export default function StoryKeywordsSection({
  keywordList,
  vocaRows,
  vocabularyPrintUrl,
  onVocaOpen,
  pauseBookAudio,
  vocaAnchorRef,
}: StoryKeywordsSectionProps) {
  const handlePrint = () => {
    if (!vocabularyPrintUrl) return
    window.open(vocabularyPrintUrl)
  }

  return (
    <KeywordsRoot>
      <KeywordsHead>
        <SectionTitle>Key Words</SectionTitle>
        <KeywordsActions>
          <IconButton
            ref={vocaAnchorRef}
            type='button'
            aria-label='Voca'
            onClick={() => onVocaOpen?.()}
          >
            <IconImage width={20} height={20} alt='' />
          </IconButton>
          <IconButton
            type='button'
            aria-label='Print'
            onClick={handlePrint}
            disabled={!vocabularyPrintUrl}
          >
            <IconPrintGray width={20} height={20} alt='' />
          </IconButton>
        </KeywordsActions>
      </KeywordsHead>
      <KeywordList>
        {vocaRows.length > 0 ? (
          <KeywordRowsWithAudio
            rows={vocaRows}
            pauseBookAudio={pauseBookAudio ?? (() => {})}
          />
        ) : keywordList.length === 0 ? (
          <KeywordHint>—</KeywordHint>
        ) : (
          keywordList.map((word) => (
            <KeywordRow key={word}>
              <SpeakerPlaceholder aria-hidden>
                <IconSpeaker width={32} height={32} />
              </SpeakerPlaceholder>
              <div className='word-container'>
                <span className='word'>{word}</span>
                <div className='meaning'>—</div>
              </div>
            </KeywordRow>
          ))
        )}
      </KeywordList>
    </KeywordsRoot>
  )
}

type KeywordRowsWithAudioProps = {
  rows: StoryVocaKeywordRow[]
  pauseBookAudio: () => void
}

function KeywordRowsWithAudio({
  rows,
  pauseBookAudio,
}: KeywordRowsWithAudioProps) {
  const { playAudio } = useStoryAudioWord({ pauseBookAudio })

  return (
    <>
      {rows.map((row) => (
        <KeywordRow key={row.id}>
          <SpeakerButton
            type='button'
            aria-label='발음 듣기'
            disabled={!row.soundUrl}
            onClick={() => row.soundUrl && playAudio(row.soundUrl)}
          >
            <IconSpeaker width={32} height={32} />
          </SpeakerButton>
          <div className='word-container'>
            <span className='word'>{row.word}</span>
            <div className='meaning'>
              {row.speechPart ? (
                <>
                  <i className='speech'>{row.speechPart}.</i> {row.meaning}
                </>
              ) : (
                row.meaning
              )}
            </div>
          </div>
        </KeywordRow>
      ))}
    </>
  )
}

const KeywordsRoot = styled.div``

const KeywordsHead = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`

const KeywordsActions = styled.div`
  display: flex;
  gap: 6px;
`

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const KeywordList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`

const KeywordRow = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;

  .word-container {
    display: flex;
    flex-direction: column;

    .word {
      font-family: 'Rg-B', sans-serif;
      font-size: 1.15rem;
      line-height: 1.35;
    }

    .meaning {
      font-family: 'Rg-M', sans-serif;
      font-size: 1em;
      color: #a2b1c4;

      .speech {
        font-style: italic;
        font-size: 0.92em;
        margin-right: 4px;
      }
    }
  }
`

const SpeakerButton = styled.button`
  flex-shrink: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  line-height: 0;

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  &:not(:disabled):active {
    opacity: 0.7;
  }
`

const SpeakerPlaceholder = styled.span`
  flex-shrink: 0;
  display: flex;
  opacity: 0.35;
  line-height: 0;
`

const KeywordHint = styled.li`
  padding: 8px 0;
  color: #9ca3af;
`
