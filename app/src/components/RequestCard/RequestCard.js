import React, { useCallback, useMemo } from 'react'
import { Card, GU, IconCheck, Tag, Timer, textStyle, theme, useTheme } from '@aragon/ui'

const RequestCard = ({ request }) => {
  const theme = useTheme()

  return (
    <Card
      css={`
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr auto auto;
        grid-gap: 8px;
        padding: ${3 * GU}px;
      `}
    >
      <div
        css={`
          display: flex;
          justify-content: space-between;
        `}
      ></div>
      <div
        css={`
          ${textStyle('body1')};
          /* lines per font size per line height */
          /* shorter texts align to the top */
          height: 84px;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
        `}
      >
        {'THIS IS A TEST'}
      </div>

      <div
        css={`
          margin-top: ${2 * GU}px;
        `}
      ></div>
    </Card>
  )
}

export default RequestCard
