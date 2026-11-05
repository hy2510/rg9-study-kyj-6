export function formatActivityLabel(activity: string): string {
  const label = activity
    .replace(/\d+$/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim()

  return label === 'Vocabulary' ? 'Vocabulary Test' : label
}
