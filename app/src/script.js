import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Aragon, { events } from '@aragon/api'
import { addressesEqual } from './lib/web3-utils'
import tokenAbi from './abi/token.json'
import tmAbi from './abi/tokenManager.json'
import retryEvery from './lib/retry-every'

const app = new Aragon()

app
  .call('tokenManager')
  .subscribe(initialize, err =>
    console.error(`Could not start background script execution due to the contract not loading token: ${err}`)
  )

async function initialize(tokenManagerAddress) {
  console.log('inittttt')
  console.log('tokenManagerAddress ', tokenManagerAddress)
  const tmContract = app.external(tokenManagerAddress, tmAbi)

  return createStore(tmContract)
}

async function createStore(tokenManagerContract) {
  return app.store(
    (state, { event, returnValues }) => {
      let nextState = {
        ...state,
      }

      switch (event) {
        case events.ACCOUNTS_TRIGGER:
          return updateConnectedAccount(nextState, returnValues)
        case events.SYNC_STATUS_SYNCING:
          return { ...nextState, isSyncing: true }
        case events.SYNC_STATUS_SYNCED:
          return { ...nextState, isSyncing: false }
        case 'TokenRequestCreated':
          return newTokenRequest(nextState, returnValues)
        case 'TokenRequestRefunded':
          return requestRefunded(nextState, returnValues)
        case 'TokenRequestFinalised':
          return requestFinalised(nextState, returnValues)
        default:
          return state
      }
    },
    {
      init: initializeState({}, tokenManagerContract),
    }
  )
}

/***********************
 *                     *
 *   Event Handlers    *
 *                     *
 ***********************/

function initializeState(state, tokenManagerContract) {
  console.log('initialize stateeee')
  return async cachedState => {
    try {
      console.log('insideeee')
      const minimeAddress = await tokenManagerContract.token().toPromise()
      console.log('minimeAddress ', minimeAddress)
      const minimeContract = app.external(minimeAddress, tokenAbi)
      const token = await getTokenData(minimeContract)

      console.log('token ', token)

      token && app.indentify(`token-request ${token.symbol}`)

      return {
        ...state,
        isSyncing: true,
        token,
      }
    } catch (error) {
      console.error('Error initializing state: ', error)
    }
  }
}

async function updateConnectedAccount(state, { account }) {
  const requests = []

  return {
    ...state,
    requests,
    account,
  }
}

async function newTokenRequest(state, { requestId, requesterAddress, depositToken, depositAmount, requestAmount }) {
  const { account, requests } = state
  const status = 'requested'

  if (!(account && addressesEqual(lockAddress, account))) return state

  return {
    ...state,
    requests: [...requests, { requestId, requesterAddress, depositToken, depositAmount, requestAmount, status }],
  }
}

async function requestRefunded(state, { requestId }) {
  return {
    ...state,
  }
}
async function requestFinalised(state, { requestId }) {
  return {
    ...state,
  }
}

/***********************
 *                     *
 *       Helpers       *
 *                     *
 ***********************/

async function getTokenData(contract) {
  try {
    //TODO: check for contracts that use bytes32 as symbol() return value (same for name)
    const [name, symbol, decimals] = await Promise.all([
      contract.name().toPromise(),
      contract.symbol().toPromise(),
      contract.decimals().toPromise(),
    ])

    return {
      name,
      symbol,
      decimals,
    }
  } catch (err) {
    console.error('Error loading token data: ', err)
    return {}
  }
}

function getBlockNumber() {
  return new Promise((resolve, reject) => app.web3Eth('getBlockNumber').subscribe(resolve, reject))
}
