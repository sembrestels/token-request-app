import React, { useEffect } from 'react'
import styled from 'styled-components'
import { DataView, Text, Countdown, Box, useTheme, ContextMenu, ContextMenuItem, IconWallet, theme } from '@aragon/ui'
import { formatTokenAmount, toHours } from '../lib/math-utils'
import { formatTokenAmountSymbol } from '../lib/token-utils'
import { format } from 'date-fns'
import EmptyState from '../screens/EmptyState'
import { request } from 'https'

const PAGINATION = 10

function RequestTable({ requests, token }) {
  return (
    <>
      <Header>
        <Title>
          <span>Active Requests </span>
        </Title>
      </Header>
      {requests.length > 0 ? (
        <DataView
          fields={['Date', 'Deposited', 'Requested', 'Actions']}
          entries={requests.map(r => [
            r.requestId,
            r.date,
            r.depositAmount,
            r.depositSymbol,
            r.depositDecimals,
            r.requestAmount,
            token.symbol,
            token.decimals,
          ])}
          renderEntry={([
            requestId,
            date,
            depositAmount,
            depositSymbol,
            depositDecimals,
            requestedAmount,
            requestedSymbol,
            requestedDecimals,
          ]) => [
            <time>{format(date, 'dd/MM/yy')}</time>,
            <Text>{`${formatTokenAmountSymbol(depositSymbol, depositAmount, false, depositDecimals)} `}</Text>,
            <Text>{`${formatTokenAmountSymbol(requestedSymbol, requestedAmount, false, requestedDecimals)} `}</Text>,
            <ContextMenu>
              <ContextMenuItem
                onClick={() => {
                  console.log('requestId', requestId)
                }}
              >
                <IconWrapper>
                  <IconWallet />
                </IconWrapper>
                <div css="margin-left: 15px">Withdraw</div>
              </ContextMenuItem>
            </ContextMenu>,
          ]}
          mode="table"
          entriesPerPage={PAGINATION}
          // onSelectEntries={selected => console.log('selected', selected)}
        />
      ) : (
        <Box style={{ textAlign: 'center' }}>
          <Text>No requests</Text>
        </Box>
      )}
    </>
  )
}

const Wrap = styled.div`
  display: flex;
  justify-content: space-between;
`
const Title = styled.h1`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-weight: 600;
  margin: 30px 30px 20px 0;
`
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  margin-bottom: 10px;
`

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: ${theme.textSecondary};
`

export default RequestTable
