import { useState, useMemo, useCallback } from 'react'
import { useAppState, useApi } from '@aragon/api-react'
import { useSidePanel } from './utils-hooks'

export function useAppLogic() {
  const { acceptedTokens, account, token, isSyncing, ready } = useAppState()

  const panelState = useSidePanel()

  return {
    panelState,
    isSyncing: isSyncing || !ready,
    acceptedTokens,
    account,
    token,
  }
}
