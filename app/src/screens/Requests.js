import React, { useState, useCallback } from 'react'
import { Box, GU, Split } from '@aragon/ui'
import EmptyState from './EmptyState'
import RequestTable from '../components/RequestTable'
import { requestStatus } from '../lib/constants'
import RequestInfo from '../components/RequestInfo'
import { useAppState, useApi } from '@aragon/api-react'

const useRequests = requests => {
  const pendingRequests = requests.filter(request => request.status === requestStatus.PENDING)
  const rejectedRequests = requests.filter(request => request.status === requestStatus.REJECTED)
  const approvedRequests = requests.filter(request => request.status === requestStatus.APPROVED)
  return { pendingRequests, rejectedRequests, approvedRequests }
}

const Requests = React.memo(({ requests, token, selectRequest, selectedRequest, onSubmit }) => {
  console.log('selectedRequest ', selectedRequest)
  const { ready } = useAppState()

  console.log('readyyyy ', ready)
  const { pendingRequests, rejectedRequests, approvedRequests } = useRequests(requests)

  return (
    <Split
      primary={
        <>
          <RequestTable requests={pendingRequests} token={token} onMoreInfo={selectRequest} onSubmit={onSubmit} />
        </>
      }
      secondary={selectedRequest ? <RequestInfo request={selectedRequest} token={token} /> : null}
    />
  )
})
export default Requests
