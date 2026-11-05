import { HeaderSpeakProps } from '@interfaces/common/header/HeaderSpeakProps'
import { HeaderStoryProps } from '@interfaces/common/header/HeaderStoryProps'
import { HeaderStudyProps } from '@interfaces/common/header/HeaderStudyProps'

/**
 * 헤더 컴포넌트 최상위 props — variant 로 좁힌다.
 */
export type HeaderProps = HeaderStoryProps | HeaderStudyProps | HeaderSpeakProps
