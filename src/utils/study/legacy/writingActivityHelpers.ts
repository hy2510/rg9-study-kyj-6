import { IWritingActivity2 } from '@src/interfaces/study/IWritingActivity'

export function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

export function buildWritingActivity2DefaultAnswers(
  data: IWritingActivity2 | undefined,
): string[] {
  const count = data?.Writing?.Question?.length ?? 0
  const base = Array<string>(count).fill('')

  switch (data?.Writing?.Activity) {
    case 'Book Report':
      if (count > 0) base[0] = `The Title is ${data.Title}`
      if (count > 1) base[1] = `The author is ${data.Author}`
      break
    case 'Book Review':
      if (count > 0)
        base[0] = 'Describe briefly what happens in the book or the main idea.'
      if (count > 1) base[1] = 'What are interesting features of the book?'
      if (count > 2)
        base[2] =
          "Describe some morals or new knowledge you've learnt from the book."
      break
    case 'KWL Chart':
      if (count > 0) base[0] = 'What I know'
      if (count > 1) base[1] = 'What I want to know'
      if (count > 2) base[2] = 'What I learned'
      break
    case 'Story Map':
      if (count > 0) base[0] = 'What happened first?'
      if (count > 1) base[1] = 'What happened next?'
      if (count > 2) base[2] = 'What happened last?'
      break
  }

  return base
}
