import type { ReactNode } from 'react'

import QuestionContentLayout from '@components/atoms/study/question/QuestionContentLayout'

type QuestionContentRowProps = {
  children: ReactNode
}

export default function QuestionContentRow({
  children,
}: QuestionContentRowProps) {
  return <QuestionContentLayout>{children}</QuestionContentLayout>
}
