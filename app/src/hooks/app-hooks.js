import { useState, useMemo, useCallback } from 'react'
import { useAppState, useApi, useAragonApi } from '@aragon/api-react'
import { useSidePanel } from './utils-hooks'
import { getEventArgument, getLog } from '../lib/web3-utils'
import { TextEncoder } from 'util'
var Web3EthAbi = require('web3-eth-abi')

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
    console.log('selectedRequestId ', selectedRequestId)
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

export function useAppLogic() {
  const { acceptedTokens, account, token, isSyncing, ready, requests, userRequests } = useAppState()
  const [selectedRequest, selectRequest] = useSelectedRequest(requests)
  const panelState = useSidePanel()

  const actions = {
    request: useRequestAction(panelState.requestClose),
    submit: useSubmitAction(panelState.requestClose),
  }

  return {
    panelState,
    isSyncing: isSyncing || !ready,
    acceptedTokens,
    account,
    token,
    actions,
    requests,
    selectedRequest,
    selectRequest,
  }
}
