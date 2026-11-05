import ASSETS from '@utils/Assets'

/**
 * 캐릭터 코드별 사용 가능한 배경 이미지 세트.
 * `InfoContainer` 진입 시 랜덤으로 하나를 골라 전체 배경에 사용한다.
 * 캐릭터 코드가 매핑에 없으면 기본값(`gino`) 로 fallback 한다.
 */
export const CHAR_BACKGROUNDS: Record<string, string[]> = {
  baro: [ASSETS.Baro.bg01, ASSETS.Baro.bg02, ASSETS.Baro.bg03],
  chello: [ASSETS.Chello.bg01, ASSETS.Chello.bg02, ASSETS.Chello.bg03],
  millo: [ASSETS.Millo.bg01, ASSETS.Millo.bg02, ASSETS.Millo.bg03],
  jack: [ASSETS.Jack.bg01, ASSETS.Jack.bg02, ASSETS.Jack.bg03],
  blanc: [ASSETS.Blanc.bg01, ASSETS.Blanc.bg02, ASSETS.Blanc.bg03],
  sheila: [ASSETS.Sheila.bg01, ASSETS.Sheila.bg02, ASSETS.Sheila.bg03],
  tori: [ASSETS.Tori.bg01, ASSETS.Tori.bg02, ASSETS.Tori.bg03],
  roro: [ASSETS.Roro.bg01, ASSETS.Roro.bg02, ASSETS.Roro.bg03],
  greenthumb: [
    ASSETS.Greenthumb.bg01,
    ASSETS.Greenthumb.bg02,
    ASSETS.Greenthumb.bg03,
  ],
  leoni: [
    ASSETS.Leoni.bg01,
    ASSETS.Leoni.bg02,
    ASSETS.Leoni.bg03,
    ASSETS.Leoni.bg04,
  ],
  goma: [
    ASSETS.Goma.bg01,
    ASSETS.Goma.bg02,
    ASSETS.Goma.bg03,
    ASSETS.Goma.bg04,
  ],
  gino: [
    ASSETS.Gino.bg01,
    ASSETS.Gino.bg02,
    ASSETS.Gino.bg03,
    ASSETS.Gino.bg04,
  ],
  edmond: [
    ASSETS.Edmond.bg01,
    ASSETS.Edmond.bg02,
    ASSETS.Edmond.bg03,
    ASSETS.Edmond.bg04,
  ],
}
