/**
 * Augment ID 상수 정의
 * 하드코딩된 문자열을 상수로 관리하여 타입 안정성과 유지보수성 향상
 */
export const AUGMENT_IDS = {
  WORD: {
    BLANC_MYSTERIOUS_EYE_DROP: "Blanc's Mysterious Eye Drop",
    FAIR_WIND: 'Fair Wind',
    BARO_TELESCOPE: "Baro's Telescope",
    TORI_STARRY_ASTROLOGY: "Tori's Starry Astrology",
  },

  KEYBOARD: {
    BASIC_KEYBOARD: 'Basic Keyboard',
    ADVANCED_KEYBOARD: 'Advanced Keyboard',
    CUSTOM_KEYBOARD: 'Custom Keyboard',
    MYSTERIOUS_KEYBOARD: 'Mystrious Keyboard',
  },

  // Audio-question 카테고리 (단일 문장용)
  AUDIO_QUESTION: {
    RABBIT_CHELLO_ROBOT: 'Rabbit Chello Robot',
    CHELLO_ROBOT: 'Chello Robot',
    TORTOISE_CHELLO_ROBOT: 'Tortoise Chello Robot',
    JACK_ONE_TIME_AMPLIFIER: "Jack's One-Time Amplifier",
  },

  // Audio-option 카테고리 (다중 문장용)
  AUDIO_OPTION: {
    CHELLO_FAST_RECORDING_TAPE: "Chello's Fast Recording Tape",
    CHELLO_RECORDING_TAPE: "Chello's Recording Tape",
    CHELLO_SLOW_RECORDING_TAPE: "Chello's Slow Recording Tape",
  },

  TIME: {
    EDMOND_SECRET_GARDEN: "Edmond's Secret Garden",
    GREENTHUMB_SECRET_GARDEN: "GreenThumb's Secret Garden",
    DODO_MAGIC_CLOCK: "Dodo's Magic Clock",
  },

  IMAGE: {
    GOMA_NOTE: "Goma's Note",
    GOMA_TORN_NOTE: "Goma's Torn Note",
  },

  // Sentence 카테고리 (ListeningActivity3, ListeningActivity4 음원 문장 노출)
  SENTENCE: {
    GOMA_NOTE: "Goma's Note",
    GOMA_TORN_NOTE: "Goma's Torn Note",
  },

  HEART: {
    BLANC_GROWTH_PILL: "Blanc's Growth Pill",
    HIRE_LEONI: 'Hire Leoni!',
    SHEILA_PANCAKE: "Sheila's Pancake",
    BLANC_BANDAGE: "Blanc's Bandage",
    GREENTHUMB_MAGIC_BEANS: "Greenthumb's Magic Beans",
    GINO_WINNING_HEADBAND: "Gino's Winning Headband",
  },

  SPECIAL: {
    RORO_BIRTHDAY_PARTY: "Roro's Birthday Party",
  },
} as const

/**
 * Augment 관련 상수 정의
 * 매직 넘버를 상수로 관리하여 가독성과 유지보수성 향상
 */
export const AUGMENT_CONSTANTS = {
  // 증강 개수
  AUGMENT_COUNT: 3,

  // 시간 간격 (밀리초)
  TIME_INTERVAL: {
    DEFAULT: 1000, // 기본값: 1초
    SLOW: 2000, // 시간 증강: 2초
  },

  // 오디오 재생 속도
  AUDIO_PLAYBACK: {
    SLOW: 0.75, // 느린 재생
    NORMAL: 1, // 일반 재생
    FAST: 1.25, // 빠른 재생
  },

  // 하트 기본값
  HEART: {
    DEFAULT_MAX: 5,
  },
} as const

/**
 * Audio-question augment ID → playback 속도 매핑
 * 새 audio-question augment 추가 시 이 맵에만 등록하면 됨
 */
export const AUDIO_QUESTION_PLAYBACK_MAP: Record<string, 0.75 | 1 | 1.25> = {
  [AUGMENT_IDS.AUDIO_QUESTION.RABBIT_CHELLO_ROBOT]:
    AUGMENT_CONSTANTS.AUDIO_PLAYBACK.FAST,
  [AUGMENT_IDS.AUDIO_QUESTION.CHELLO_ROBOT]:
    AUGMENT_CONSTANTS.AUDIO_PLAYBACK.NORMAL,
  [AUGMENT_IDS.AUDIO_QUESTION.TORTOISE_CHELLO_ROBOT]:
    AUGMENT_CONSTANTS.AUDIO_PLAYBACK.SLOW,
}

/**
 * Audio-option augment ID → playback 속도 매핑
 * 새 audio-option augment 추가 시 이 맵에만 등록하면 됨
 */
export const AUDIO_OPTION_PLAYBACK_MAP: Record<string, 0.75 | 1 | 1.25> = {
  [AUGMENT_IDS.AUDIO_OPTION.CHELLO_FAST_RECORDING_TAPE]:
    AUGMENT_CONSTANTS.AUDIO_PLAYBACK.FAST,
  [AUGMENT_IDS.AUDIO_OPTION.CHELLO_RECORDING_TAPE]:
    AUGMENT_CONSTANTS.AUDIO_PLAYBACK.NORMAL,
  [AUGMENT_IDS.AUDIO_OPTION.CHELLO_SLOW_RECORDING_TAPE]:
    AUGMENT_CONSTANTS.AUDIO_PLAYBACK.SLOW,
}

/**
 * Heart augment ID → maxHeart 증가량 매핑
 * 새 heart augment 추가 시 이 맵에만 등록하면 됨
 */
export const HEART_MAP: Record<string, number> = {
  [AUGMENT_IDS.HEART.BLANC_GROWTH_PILL]: 1,
}
