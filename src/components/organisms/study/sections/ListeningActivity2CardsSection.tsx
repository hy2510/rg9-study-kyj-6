import { ListeningActivity2Card } from '@components/molecules/study/activities/listening-activity-02/ListeningActivity2Card'
import CardsWrapCenter from '@components/molecules/study/layout/CardsWrapCenter'
import { BaseQuiz } from '@hooks/study/remix/useQuizManager'

type ListeningActivity2CardsSectionProps = {
  quizData: BaseQuiz[]
  selectedIndex: number | null
  currentQuizNo: number
  /** 이미 정답 처리된 카드의 QuizNo 집합 (셔플과 무관하게 안정) */
  solvedQuizNos: Set<number>
  onCardClick: (index: number) => void
}

export default function ListeningActivity2CardsSection({
  quizData,
  selectedIndex,
  currentQuizNo,
  solvedQuizNos,
  onCardClick,
}: ListeningActivity2CardsSectionProps) {
  return (
    <CardsWrapCenter mobileLayout='grid' mobileColumns={2}>
      {quizData.map((quiz, index) => (
        <ListeningActivity2Card
          key={quiz.QuizId}
          text={quiz.Question.Text}
          index={index}
          selectedIndex={selectedIndex}
          isCorrectAnswer={quiz.QuizNo === currentQuizNo}
          isSolved={solvedQuizNos.has(quiz.QuizNo)}
          onCardClick={onCardClick}
        />
      ))}
    </CardsWrapCenter>
  )
}
