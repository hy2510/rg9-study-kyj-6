import styled from 'styled-components'

/** 헤더 하단 콘텐츠 영역 */
const HeaderBody = styled.div<{ $headerExpanded?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding-top: 8px;
  overflow-y: auto;
  overflow: hidden;
  background: transparent;
`

export default HeaderBody
