import React from 'react'
import { Text, useTheme, Box } from '@aragon/ui'

const EmptyState = text => {
  return (
    <Box style={{ textAlign: 'center' }}>
      {/* <BackgroundIcon>
          <img src={emptyIcon} alt="" height="70x" />
        </BackgroundIcon> */}
      <Text>{text}</Text>
    </Box>
  )
}

export default EmptyState
