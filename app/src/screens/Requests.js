import React, { useState, useCallback } from 'react'
import { Box, GU, Split } from '@aragon/ui'
import EmptyState from './EmptyState'
import RequestTable from '../components/RequestTable'
import { requestStatus } from '../lib/constants'
import RequestInfo from '../components/RequestInfo'
import { useAppState, useApi } from '@aragon/api-react'

const useRequests = (requests, connectedAccount) => {
  const pendingRequests = requests.filter(request => request.status === requestStatus.PENDING)
  const rejectedRequests = requests.filter(request => request.status === requestStatus.REJECTED)
  const approvedRequests = requests.filter(request => request.status === requestStatus.APPROVED)
  const userRequests = requests.filter(request => request.requesterAddress === connectedAccount)
  return { pendingRequests, rejectedRequests, approvedRequests, userRequests }
}

const Requests = React.memo(({ connectedAccount, requests, token, selectRequest, selectedRequest, onSubmit }) => {
  console.log('selectedRequest ', selectedRequest)
  const { ready } = useAppState()

  console.log('readyyyy ', ready)
  const { pendingRequests, rejectedRequests, approvedRequests, userRequests } = useRequests(requests, connectedAccount)

  return (
    <Split
      primary={
        <>
          <RequestTable requests={userRequests} token={token} onMoreInfo={selectRequest} onSubmit={onSubmit} />
        </>
      }
      secondary={selectedRequest ? <RequestInfo request={selectedRequest} token={token} /> : null}
    />
  )
})
export default Requests
