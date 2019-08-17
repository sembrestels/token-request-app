import React, { useEffect, useCallback } from 'react'
import styled from 'styled-components'
import {
  DataView,
  Text,
  Countdown,
  Box,
  useTheme,
  ContextMenu,
  ContextMenuItem,
  IconCoin,
  theme,
  IconInfo,
  IconVote,
} from '@aragon/ui'
import { formatTokenAmount, toHours } from '../lib/math-utils'
import { formatTokenAmountSymbol } from '../lib/token-utils'
import { format } from 'date-fns'
import EmptyState from '../screens/EmptyState'
import { request } from 'https'
import { requestStatus } from '../lib/constants'

const PAGINATION = 10

function RequestTable({ requests, token, onMoreInfo, onSubmit }) {
  console.log('requests ', requests)

  const handleOnMoreInfo = useCallback(
    requestId => {
      onMoreInfo(requestId)
      console.log('requessssssst info', requestId)
    },
    [onMoreInfo]
  )

  const handleSubmit = useCallback(
    requestId => {
      onSubmit(requestId)
    },
    [onSubmit]
  )

  return (
    <>
      {requests.length > 0 ? (
        <DataView
          fields={['Date', 'Deposited', 'Requested', 'Status', 'Actions']}
          entries={requests.map(r => [
            r.requestId,
            r.date,
            r.depositAmount,
            r.depositSymbol,
            r.depositToken,
            r.depositName,
            r.depositDecimals,
            r.requestAmount,
            r.status,
            token.symbol,
            token.decimals,
          ])}
          renderEntry={([
            requestId,
            date,
            depositAmount,
            depositSymbol,
            depositTokenAddress,
            depositName,
            depositDecimals,
            requestedAmount,
            status,
            requestedSymbol,
            requestedDecimals,
          ]) => [
            <time>{format(date, 'dd/MM/yy')}</time>,
            <Text>{`${formatTokenAmountSymbol(depositSymbol, depositAmount, false, depositDecimals)} `}</Text>,
            <Text>{`${formatTokenAmountSymbol(requestedSymbol, requestedAmount, false, requestedDecimals)} `}</Text>,
            <Status positive={true}>{`${status}`}</Status>,
            <ContextMenu>
              <ContextMenuItem onClick={() => handleOnMoreInfo(requestId)}>
                <IconWrapper>
                  <IconInfo />
                </IconWrapper>
                <div css="margin-left: 15px">Info</div>
              </ContextMenuItem>
              {status === requestStatus.PENDING && (
                <ContextMenuItem onClick={() => handleSubmit(requestId)}>
                  <IconWrapper>
                    <IconVote />
                  </IconWrapper>
                  <div css="margin-left: 15px">Submit</div>
                </ContextMenuItem>
              )}
              <ContextMenuItem
                onClick={() => {
                  console.log('requestId', requestId)
                }}
              >
                <IconWrapper>
                  <IconCoin />
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

const Status = styled(Text)`
  font-weight: 600;
  color: ${({ positive }) => (positive ? theme.infoPermissionsIcon : theme.negative)};
`

export default RequestTable
