import {
  IVocaQuestionBase,
  MeanLanguage,
} from '@src/interfaces/study/IVocabulary'

export function getMeaning(q: IVocaQuestionBase, lang: MeanLanguage): string {
  switch (lang.toLowerCase()) {
    case 'korean':
      return q.Korean
    case 'chinese':
      return q.Chinese
    case 'japanese':
      return q.Japanese
    case 'vietnamese':
      return q.Vietnamese
    case 'indonesian':
      return q.Indonesian
    case 'english':
      return q.Britannica ?? ''
    default:
      return ''
  }
}
