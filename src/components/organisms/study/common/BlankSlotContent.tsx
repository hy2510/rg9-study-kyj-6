import BlankFilledText from '@components/atoms/study/blanks/BlankFilledText'
import BlankSlot from '@components/atoms/study/blanks/BlankSlot'
import MaskCharSlot from '@components/molecules/study/blanks/MaskCharSlot'
import NonMaskCharSlot from '@components/molecules/study/blanks/NonMaskCharSlot'
import { AugmentOptions } from '@hooks/study/remix/useAugmentManager'
import { buildDisplayText } from '@utils/spellingUtils'

export type BlankSlotContentProps = {
  augmentOptions: AugmentOptions
  input: string
  answer: string
  isChecked: boolean
  isCurrent: boolean
  onBlankClick: () => void
  isInputCorrect: (input: string, answer: string) => boolean
  /** nonmaskslot일 때 input 직접 입력 시 호출 */
  onInputChange?: (value: string) => void
}

/** 블랭크 입력 상태에 따라 CharSlot(Mask/NonMask) 또는 FilledText 렌더링 */
export default function BlankSlotContent({
  augmentOptions,
  input,
  answer,
  isChecked,
  isCurrent,
  onBlankClick,
  isInputCorrect,
  onInputChange,
}: BlankSlotContentProps) {
  const thisBlankCorrect = isInputCorrect(input, answer)

  if (thisBlankCorrect) {
    return <BlankFilledText>{buildDisplayText(answer, input)}</BlankFilledText>
  }

  const slotIncorrect = isChecked && !thisBlankCorrect

  const showFirst = augmentOptions.word.showFirst
  const showLast = augmentOptions.word.showLast

  return (
    <BlankSlot onClick={onBlankClick}>
      {augmentOptions.word.showMask ? (
        <MaskCharSlot
          answer={answer}
          input={input}
          isCurrent={isCurrent}
          slotIncorrect={slotIncorrect}
          showFirst={showFirst}
          showLast={showLast}
        />
      ) : (
        <NonMaskCharSlot
          answer={answer}
          input={input}
          isCurrent={isCurrent}
          slotIncorrect={slotIncorrect}
          onInputChange={onInputChange ?? (() => {})}
          disabled={isChecked}
        />
      )}
    </BlankSlot>
  )
}
