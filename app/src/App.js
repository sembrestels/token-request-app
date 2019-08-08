import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useAragonApi } from '@aragon/api-react'
import { Main, SidePanel, SyncIndicator, Badge, Header, Button } from '@aragon/ui'
import NewRequest from './components/Panels/NewRequest'
import { useAppLogic } from './hooks/app-hooks'
import requestIcon from './assets/icono.svg'

function App(props) {
  const { panelState, isSyncing, acceptedTokens, account, token, actions } = useAppLogic()
  console.log('token', token)
  return (
    <Main>
      <Header
        primary="Token Request"
        secondary={
          <Button mode="strong" onClick={panelState.requestOpen} icon={<img src={requestIcon} height="30px" alt="" />}>
            {'New Request'}
          </Button>
        }
      />

      <SidePanel
        title="New request"
        opened={panelState.visible}
        onClose={panelState.requestClose}
        onTransitionEnd={panelState.endTransition}
      >
        <NewRequest panelOpened={panelState.opened} tokens={acceptedTokens} request={actions.request}></NewRequest>
      </SidePanel>
    </Main>
  )
}

export default () => {
  const { api, appState } = useAragonApi()
  return <App api={api} {...appState} />
}

App.propTypes = {
  api: PropTypes.object,
  appState: PropTypes.object,
}
