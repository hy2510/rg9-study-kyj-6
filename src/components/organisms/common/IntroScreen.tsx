import MovieBookIntroPanel from './intro/MovieBookIntroPanel'
import QuizIntroPanel from './intro/QuizIntroPanel'
import SimpleIntro from './intro/SimpleIntro'
import SpeakIntroPanel from './intro/SpeakIntroPanel'
import StoryIntroPanel from './intro/StoryIntroPanel'
import StudyReviewIntroPanel from './intro/StudyReviewIntroPanel'
import WordPracticeIntroPanel from './intro/WordPracticeIntroPanel'

type IntroScreenProps = {
  variant:
    | 'story'
    | 'moviebook'
    | 'study'
    | 'studyReview'
    | 'review'
    | 'speak'
    | 'wordPractice'
  coverSrc?: string
  onStart: () => void
  onClose?: () => void
  /** PB 스토리 음원 URL — study variant 에서만 사용 */
  soundSrc?: string
  quizReward?: {
    tier: 'full' | 'half' | 'none'
    point: number
  }
}

export default function IntroScreen({
  variant,
  coverSrc = '',
  onStart,
  onClose,
  soundSrc,
  quizReward,
}: IntroScreenProps) {
  if (variant === 'story') {
    return <StoryIntroPanel coverSrc={coverSrc} onStart={onStart} />
  }

  if (variant === 'moviebook') {
    return <MovieBookIntroPanel coverSrc={coverSrc} onStart={onStart} />
  }

  if (variant === 'speak') {
    return (
      <SpeakIntroPanel
        coverSrc={coverSrc}
        onStart={onStart}
        onClose={onClose ?? onStart}
      />
    )
  }

  if (variant === 'wordPractice') {
    return <WordPracticeIntroPanel onStart={onStart} />
  }

  if (variant === 'study') {
    return (
      <QuizIntroPanel
        coverSrc={coverSrc}
        onStart={onStart}
        onClose={onClose ?? onStart}
        soundSrc={soundSrc}
        quizReward={quizReward}
      />
    )
  }

  if (variant === 'studyReview') {
    return <StudyReviewIntroPanel coverSrc={coverSrc} onStart={onStart} />
  }

  return <SimpleIntro variant={variant} onStart={onStart} />
}
