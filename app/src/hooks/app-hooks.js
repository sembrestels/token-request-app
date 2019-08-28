import { useState, useMemo, useCallback } from 'react'
import { useAppState, useApi, useAragonApi } from '@aragon/api-react'
import { useSidePanel, useNow } from './utils-hooks'
import { hasExpired } from '../lib/token-request-utils'
import { requestStatus } from '../lib/constants'

export function useRequestAction(onDone) {
  const { api } = useAragonApi()

  return useCallback(
    (depositTokenAddress, depositAmount, requestAmount, intentParams) => {
      try {
        api.createTokenRequest(depositTokenAddress, depositAmount, requestAmount, intentParams).toPromise()

        onDone()
      } catch (error) {
        console.error(error)
      }
    },
    [api, onDone]
  )
}

export function useSubmitAction(onDone) {
  const { api } = useAragonApi()

  return useCallback(
    requestId => {
      try {
        api.finaliseTokenRequest(requestId).toPromise()

        onDone()
      } catch (error) {
        console.error(error)
      }
    },
    [api, onDone]
  )
}

export function useWithdrawAction(onDone) {
  const { api } = useAragonApi()

  return useCallback(
    requestId => {
      try {
        api.refundTokenRequest(requestId).toPromise()

        onDone()
      } catch (error) {
        console.error(error)
      }
    },
    [api, onDone]
  )
}

// Get the request currently selected, or null otherwise.
export function useSelectedRequest(requests) {
  const [selectedRequestId, setSelectedRequestId] = useState('-1')

  const { ready } = useAppState()
  // The memoized vote currently selected.
  const selectedRequest = useMemo(() => {
    // The `ready` check prevents a request to be selected
    // until the app state is fully ready.
    if (selectedRequestId === '-1') {
      return null
    }
    return requests.find(request => request.requestId === selectedRequestId) || null
  }, [selectedRequestId, requests])

  return [
    selectedRequest,

    // setSelectedRequestId() is exported directly: since `selectedRequestId` is
    // set in the `selectedRequest` dependencies, it means that the useMemo()
    // will be updated every time `selectedRequestId` changes.
    setSelectedRequestId,
  ]
}

const useRequests = () => {
  const { requests, timeToExpiry } = useAppState()
  const now = useNow()
  const requestsExpired = (requests || []).map(request => {
    return hasExpired(request.date, now, timeToExpiry)
  })

  const requestStatusKey = requestsExpired.join('')
  return useMemo(
    () =>
      (requests || []).map((request, index) => ({
        ...request,
        status:
          requests[index].status === requestStatus.PENDING && requestsExpired[index]
            ? requestStatus.EXPIRED
            : requests[index].status,
        actionDate:
          requests[index].status === requestStatus.PENDING && requestsExpired[index]
            ? requests[index].date + timeToExpiry * 60 * 1000
            : requests[index].actionDate,
      })),
    [requests, requestStatusKey]
  )
}

export function useAppLogic() {
  const { acceptedTokens, account, token, isSyncing, ready, timeToExpiry } = useAppState()
  const requests = useRequests()
  const [selectedRequest, selectRequest] = useSelectedRequest(requests)
  const panelState = useSidePanel()

  const actions = {
    request: useRequestAction(panelState.requestClose),
    submit: useSubmitAction(panelState.requestClose),
    withdraw: useWithdrawAction(panelState.requestClose),
  }

  return {
    panelState,
    isSyncing: isSyncing || !ready,
    acceptedTokens,
    account,
    token,
    timeToExpiry,
    actions,
    requests,
    selectedRequest,
    selectRequest,
  }
}
