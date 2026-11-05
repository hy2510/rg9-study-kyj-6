import BARO from '@utils/Assets/themes/baro'
import BLANC from '@utils/Assets/themes/blanc'
import CHELLO from '@utils/Assets/themes/chello'
import COMMON from '@utils/Assets/themes/common'
import EDMOND from '@utils/Assets/themes/edmond'
import GINO from '@utils/Assets/themes/gino'
import GOMA from '@utils/Assets/themes/goma'
import GREENTHUMB from '@utils/Assets/themes/greenthumb'
import JACK from '@utils/Assets/themes/jack'
import LEONI from '@utils/Assets/themes/leoni'
import MILLO from '@utils/Assets/themes/millo'
import RORO from '@utils/Assets/themes/roro'
import SHEILA from '@utils/Assets/themes/sheila'
import TORI from '@utils/Assets/themes/tori'

const ASSETS = {
  Common: COMMON,
  Baro: BARO,
  Chello: CHELLO,
  Millo: MILLO,
  Jack: JACK,
  Blanc: BLANC,
  Sheila: SHEILA,
  Tori: TORI,
  Roro: RORO,
  Greenthumb: GREENTHUMB,
  Leoni: LEONI,
  Goma: GOMA,
  Gino: GINO,
  Edmond: EDMOND,
}

export type QuizCorrectionCharacterMarks = {
  correct: string
  incorrect: string
}

/** `useCharacter()` 소문자 키 → 테마별 quiz 정·오답 캐릭터 마크 */
export function getQuizCorrectionCharacterMarks(
  character: string,
): QuizCorrectionCharacterMarks {
  const theme =
    {
      baro: ASSETS.Baro,
      chello: ASSETS.Chello,
      millo: ASSETS.Millo,
      jack: ASSETS.Jack,
      blanc: ASSETS.Blanc,
      sheila: ASSETS.Sheila,
      tori: ASSETS.Tori,
      roro: ASSETS.Roro,
      greenthumb: ASSETS.Greenthumb,
      leoni: ASSETS.Leoni,
      goma: ASSETS.Goma,
      gino: ASSETS.Gino,
      edmond: ASSETS.Edmond,
    }[character] ?? ASSETS.Chello

  return {
    correct: theme.quizCorrectionCorrect,
    incorrect: theme.quizCorrectionIncorrect,
  }
}

export default ASSETS
