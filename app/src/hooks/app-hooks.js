import { useState, useMemo, useCallback } from 'react'
import { useAppState, useApi } from '@aragon/api-react'
import { useSidePanel } from './utils-hooks'

export function useRequestAction(onDone) {
  const api = useApi()

  return useCallback(
    (depositTokenAddress, depositAmount, requestAmount, intentParams) => {
      api.createTokenRequest(depositTokenAddress, depositAmount, requestAmount, intentParams).toPromise()
      onDone()
    },
    [api, onDone]
  )
}

export function useAppLogic() {
  const { acceptedTokens, account, token, isSyncing, ready, requests, userRequests } = useAppState()

  const panelState = useSidePanel()

  const actions = {
    request: useRequestAction(panelState.requestClose),
  }

  return {
    panelState,
    isSyncing: isSyncing || !ready,
    acceptedTokens,
    account,
    token,
    actions,
    requests,
  }
}
