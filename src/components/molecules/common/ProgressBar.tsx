import styled from 'styled-components'

type ProgressBarProps = {
  progress: number
  total: number
}

export default function ProgressBar({ progress, total }: ProgressBarProps) {
  const width = total > 0 ? `${(progress / total) * 100}%` : '0%'
  return (
    <ProgressRoot>
      <div className='track'>
        <div className='fill' style={{ width }} />
      </div>
    </ProgressRoot>
  )
}

const ProgressRoot = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99;
  height: 8px;
  pointer-events: none;

  .track {
    width: 100%;
    height: 8px;
    background: #e9edf3;
  }

  .fill {
    height: 8px;
    background: #ffca2b;
    border-radius: 0 8px 8px 0;
    transition: width 0.3s ease;
  }
`
