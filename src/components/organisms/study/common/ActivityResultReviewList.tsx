import styled from 'styled-components'

export type ActivityResultReviewItem = {
  /** 문제 순번 (표시용) */
  questionNo: number
  /** 문제 텍스트 (HTML 가능) */
  questionText: string
  /** 학생이 선택한 답 (HTML 가능) */
  studentAnswer: string
  /** 정답 (HTML 가능) */
  correctAnswer: string
}

/**
 * 오답 리뷰 리스트 — RC4 통과 시 틀린 문제의 학생 답/정답을 카드 형태로 나열한다.
 */
export function ActivityResultReviewList({
  items,
}: {
  items: ActivityResultReviewItem[]
}) {
  return (
    <ReviewScroll>
      {items.map((item, i) => (
        <ReviewCard key={i}>
          <ReviewQno>{`Q${item.questionNo}`}</ReviewQno>
          <ReviewQuestion
            dangerouslySetInnerHTML={{ __html: item.questionText }}
          />
          <ReviewLine>
            <ReviewLabel>My Answer</ReviewLabel>
            <ReviewWrong
              dangerouslySetInnerHTML={{ __html: item.studentAnswer }}
            />
          </ReviewLine>
          <ReviewLine>
            <ReviewLabel>Answer</ReviewLabel>
            <ReviewCorrect
              dangerouslySetInnerHTML={{ __html: item.correctAnswer }}
            />
          </ReviewLine>
        </ReviewCard>
      ))}
    </ReviewScroll>
  )
}

const ReviewScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const ReviewCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border: 1.5px solid #e9edf3;
  border-radius: 20px;
  background-color: rgb(250, 251, 253);
`

const ReviewQno = styled.div`
  font-family: 'Rg-B', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #a2b1c4;
`

const ReviewQuestion = styled.div`
  font-family: 'Rg-B', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #3c4b62;
`

const ReviewLine = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-family: 'Rg-B', sans-serif;
  font-size: 1rem;
`

const ReviewLabel = styled.span`
  flex-shrink: 0;
  width: 84px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #a2b1c4;
`

const ReviewWrong = styled.span`
  font-weight: 700;
  color: #ef3d64;
`

const ReviewCorrect = styled.span`
  font-weight: 700;
  color: #20ad75;
`
