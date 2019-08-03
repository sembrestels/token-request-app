import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useAragonApi } from '@aragon/api-react'
import { Main, SidePanel, SyncIndicator, Badge, Header, Button } from '@aragon/ui'

function App(props) {
  const [newRequestOpened, setNewRequestOpened] = useState(false)
  const { compactMode } = props
  console.log('props', props)

  return (
    <Main>
      <Header
        primary="Token Request"
        secondary={
          <Button
            mode="strong"
            onClick={() => setNewRequestOpened(true)}
            css={`
              ${compactMode &&
                `
                        min-width: 40px;
                        padding: 0;
                      `}
            `}
          >
            {compactMode ? <IconPlus /> : 'New Request'}
          </Button>
        }
      />

      <SidePanel opened={newRequestOpened} onClose={() => {}} title="New transfer"></SidePanel>
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
