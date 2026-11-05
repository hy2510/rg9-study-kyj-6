import { HeaderLegacyStudyProps } from '@interfaces/common/header/HeaderLegacyStudyProps'
import { HeaderRemixStudyProps } from '@interfaces/common/header/HeaderRemixStudyProps'

/**
 * Study variant 헤더 props.
 * `engine` discriminator 로 Legacy / Remix 를 좁힐 수 있다.
 */
export type HeaderStudyProps = HeaderLegacyStudyProps | HeaderRemixStudyProps
