import React, { useCallback } from 'react'
import styled from 'styled-components'
import {
  DataView,
  Text,
  ContextMenu,
  ContextMenuItem,
  IconCoin,
  theme,
  IconInfo,
  IconVote,
  Countdown,
  Timer,
} from '@aragon/ui'
import { formatTokenAmountSymbol } from '../lib/token-utils'
import { toHours } from '../lib/math-utils'
import { format, compareDesc } from 'date-fns'
import { requestStatus } from '../lib/constants'

const PAGINATION = 10

function RequestTable({ requests, token, timeToExpiry, onMoreInfo, onSubmit, onWithdraw }) {
  const handleOnMoreInfo = useCallback(
    requestId => {
      onMoreInfo(requestId)
    },
    [onMoreInfo]
  )

  const handleSubmit = useCallback(
    requestId => {
      onSubmit(requestId)
    },
    [onSubmit]
  )

  const handleWithdraw = useCallback(
    requestId => {
      onWithdraw(requestId)
    },
    [onWithdraw]
  )

  const renderExpirationTime = (date, timeToExpiry, status, actionDate) => {
    if (status === requestStatus.PENDING) {
      const now = new Date()
      const endDateMs = date + timeToExpiry * 60 * 1000
      const end = new Date(endDateMs)
      const removeDaysAndHours = toHours(end - now) < 1

      return <Countdown end={end} removeDaysAndHours={removeDaysAndHours} />
    } else {
      console.log('STATUSSSSSS ', status)
      console.log('action date ', date)
      return <time>{format(actionDate, 'dd/MM/yy')}</time>
    }
  }
  return (
    <>
      {requests && requests.length > 0 && (
        <DataView
          fields={['Request Date', 'Deposited', 'Requested', 'Expiry by', 'Status', 'Actions']}
          entries={requests
            .sort(({ date: dateLeft }, { date: dateRight }) =>
              // Sort by date descending
              compareDesc(dateLeft, dateRight)
            )
            .map(r => [
              r.requestId,
              r.date,
              r.depositAmount,
              r.depositSymbol,
              r.depositToken,
              r.depositName,
              r.depositDecimals,
              r.requestAmount,
              r.status,
              r.actionDate,
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
            actionDate,
            requestedSymbol,
            requestedDecimals,
          ]) => [
            <time>{format(date, 'dd/MM/yy')}</time>,
            <Text>{`${formatTokenAmountSymbol(depositSymbol, depositAmount, false, depositDecimals)} `}</Text>,
            <Text>{`${formatTokenAmountSymbol(requestedSymbol, requestedAmount, false, requestedDecimals)} `}</Text>,
            renderExpirationTime(date, timeToExpiry, status, actionDate),
            <Status status={status}>{`${status}`}</Status>,
            <ContextMenu>
              {status === requestStatus.PENDING && (
                <ContextMenuItem onClick={() => handleSubmit(requestId)}>
                  <IconWrapper>
                    <IconVote />
                  </IconWrapper>
                  <div css="margin-left: 15px">Submit</div>
                </ContextMenuItem>
              )}
              {(status === requestStatus.PENDING || status === requestStatus.EXPIRED) && (
                <ContextMenuItem onClick={() => handleWithdraw(requestId)}>
                  <IconWrapper>
                    <IconCoin />
                  </IconWrapper>
                  <div css="margin-left: 15px">Withdraw</div>
                </ContextMenuItem>
              )}
            </ContextMenu>,
          ]}
          mode="table"
          entriesPerPage={PAGINATION}
        />
      )}
    </>
  )
}
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
  color: ${({ status }) => {
    switch (status) {
      case requestStatus.PENDING:
        return theme.infoPermissionsIcon
      case requestStatus.REJECTED:
        return theme.negative
      case requestStatus.APPROVED:
        return theme.positive
      case requestStatus.EXPIRED:
        return theme.negative
      default:
        return theme.positive
    }
  }};
`

export default RequestTable
