import { ListeningActivity1Card } from '@components/molecules/study/activities/listening-activity-01/ListeningActivity1Card'
import CardsWrapCenter from '@components/molecules/study/layout/CardsWrapCenter'
import { BaseQuiz } from '@hooks/study/remix/useQuizManager'

type ListeningActivity1CardsSectionProps = {
  quizData: BaseQuiz[]
  selectedIndex: number | null
  currentQuizNo: number
  solvedIndices: Set<number>
  onCardClick: (index: number) => void
}

export default function ListeningActivity1CardsSection({
  quizData,
  selectedIndex,
  currentQuizNo,
  solvedIndices,
  onCardClick,
}: ListeningActivity1CardsSectionProps) {
  return (
    <CardsWrapCenter mobileLayout='grid' mobileColumns={2}>
      {quizData.map((quiz, index) => (
        <ListeningActivity1Card
          key={quiz.QuizId}
          image={quiz.Question.Image}
          text={quiz.Question.Text}
          index={index}
          selectedIndex={selectedIndex}
          isCorrectAnswer={quiz.QuizNo === currentQuizNo}
          isSolved={solvedIndices.has(index)}
          onCardClick={onCardClick}
        />
      ))}
    </CardsWrapCenter>
  )
}
