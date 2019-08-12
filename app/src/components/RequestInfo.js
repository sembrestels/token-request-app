import React from 'react'
import styled from 'styled-components'

import { TokenBadge, Text, theme, Box, IconAttention } from '@aragon/ui'
import { useNetwork } from '@aragon/api-react'
import { formatTokenAmount, formatTime } from '../lib/math-utils'
import { formatTokenAmountSymbol } from '../lib/token-utils'

function RequestInfo({ request, token, network }) {
  const { requestId, depositToken, depositName, depositSymbol } = request
  return (
    <>
      <Box heading="Request info">
        <ul>
          <InfoRow>
            <Text>Deposited</Text>
            {network && depositSymbol && (
              <TokenBadge address={depositToken} name={depositName} symbol={depositSymbol} networkType={network.type} />
            )}
          </InfoRow>
          <InfoRow>
            <Title>Requested</Title>
            {network && depositSymbol && (
              <TokenBadge address={token.address} name={token.name} symbol={token.symbol} networkType={network.type} />
            )}
          </InfoRow>
        </ul>
      </Box>
    </>
  )
}

const InfoRow = styled.li`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  list-style: none;

  > span:nth-child(1) {
    font-weight: 400;
    color: ${theme.textSecondary};
  }
`

const Duration = styled.div`
  display: flex;
  align-items: center;
`

const Wrap = styled.div`
  display: flex;
`
const Header = styled.div`
  display: flex;
  margin-top: 82px;
`

const Title = styled(Text)`
  margin-right: 5px;
`

export default props => {
  const network = useNetwork()
  return <RequestInfo network={network} {...props} />
}
