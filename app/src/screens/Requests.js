import React, { useState } from 'react'
import { Box, GU, Split } from '@aragon/ui'
import EmptyState from './EmptyState'
import RequestCardGroup from '../components/RequestCard/RequestCardGroup'
import RequestCard from '../components/RequestCard/RequestCard'
import RequestTable from '../components/RequestTable'

const Requests = React.memo(({ requests, token }) => {
  console.log('REQQQQQ ', requests)
  return <Split primary={<RequestTable requests={requests} token={token} />} secondary={<span />} />
})
export default Requests
