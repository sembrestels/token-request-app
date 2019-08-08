import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { Button, Field, Info, Text, TextInput, theme } from '@aragon/ui'
import { useAppState } from '@aragon/api-react'
import { useAragonApi, useApi } from '@aragon/api-react'
import TokenSelector from '../TokenSelector'
import { addressesEqual, isAddress } from '../../lib/web3-utils'
import { fromDecimals, toDecimals } from '../../lib/math-utils'
import { ETHER_TOKEN_FAKE_ADDRESS, tokenDataFallback, getTokenSymbol } from '../../lib/token-utils'
import tokenBalanceOfAbi from '../../abi/token-balanceof.json'
import tokenDecimalsAbi from '../../abi/token-decimals.json'
import tokenSymbolAbi from '../../abi/token-symbol.json'

const NO_ERROR = Symbol('NO_ERROR')
const BALANCE_NOT_ENOUGH_ERROR = Symbol('BALANCE_NOT_ENOUGH_ERROR')
const DECIMALS_TOO_MANY_ERROR = Symbol('DECIMALS_TOO_MANY_ERROR')
const tokenAbi = [].concat(tokenBalanceOfAbi, tokenDecimalsAbi, tokenSymbolAbi)

function NewRequest({ network, panelOpened, request }) {
  const { acceptedTokens, account, token } = useAppState()
  const api = useApi()

  const [amount, setAmount] = useState(0)
  const [selectedToken, setSelectedToken] = useState({
    coerced: false, // whether the token was coerced from a symbol to an address
    error: NO_ERROR,
    index: -1,
    value: '',
  })

  const [selectedTokenData, setSelectedTokenData] = useState()
  const [requestedAmount, setRequestedAmount] = useState(0)
  const [tokenBalanceMessage, setTokenBalanceMessage] = useState('')

  useEffect(() => {
    async function getSelectedTokenData() {
      const tokenData = await loadTokenData(selectedToken.value)
      setSelectedTokenData(tokenData)
      setTokenBalanceMessage(renderBalanceForSelectedToken(tokenData))
    }
    if (selectedToken.index != -1) {
      getSelectedTokenData()
    }
  }, [selectedToken.index])

  useEffect(() => {
    console.log('selected token data ', selectedTokenData)
    // const tokenBalanceMessage = renderBalanceForSelectedToken(selectedToken)
  }, [selectedTokenData])

  const renderBalanceForSelectedToken = selectedToken => {
    const { decimals, loading, symbol, userBalance } = selectedToken

    if (loading || !userBalance) {
      return ''
    }
    return userBalance === '-1'
      ? `Your balance could not be found for ${symbol}`
      : `You have ${userBalance === '0' ? 'no' : fromDecimals(userBalance, decimals)} ${symbol} available`
  }

  const handleFormSubmit = useCallback(
    e => {
      e.preventDefault()
      console.log('selected token ', selectedToken.value)
      console.log('selected decimals ', selectedTokenData.decimals)
      console.log('selected amount ', amount)
      console.log('selected requestedAmount ', requestedAmount)
      const formatedamount = toDecimals(amount, selectedTokenData.decimals)
      const decimals = toDecimals(requestedAmount, selectedTokenData.decimals)
      request(selectedToken.value, formatedamount, decimals)
    },
    [request, selectedTokenData, amount, requestedAmount]
  )

  const handleRequestedAmountUpdate = useCallback(e => {
    console.log('requested change ', e.target.value)
    setRequestedAmount(e.target.value)
  })

  const handleAmountUpdate = useCallback(e => {
    setAmount(e.target.value)
  })

  const handleSelectedToken = useCallback(({ address, index, value }) => {
    const tokenIsAddress = isAddress(address)
    const token = {
      index,
      coerced: tokenIsAddress && address !== value,
      value: address,
    }
    if (!tokenIsAddress) {
      return
    }
    setSelectedToken(token)
  })

  const loadTokenData = async address => {
    // ETH
    if (addressesEqual(address, ETHER_TOKEN_FAKE_ADDRESS)) {
      const userBalance = await api
        .web3Eth('getBalance', account)
        .toPromise()
        .catch(() => '-1')

      return {
        decimals: 18,
        loading: false,
        symbol: 'ETH',
        userBalance,
      }
    }

    // Tokens
    const token = api.external(address, tokenAbi)

    const userBalance = await token
      .balanceOf(account)
      .toPromise()
      .catch(() => '-1')

    const decimalsFallback = tokenDataFallback(address, 'decimals', network.type) || '0'
    const symbolFallback = tokenDataFallback(address, 'symbol', network.type) || ''

    const tokenData = {
      userBalance,
      decimals: parseInt(decimalsFallback, 10),
      loading: false,
      symbol: symbolFallback,
    }

    const [tokenSymbol, tokenDecimals] = await Promise.all([
      getTokenSymbol(api, address).catch(() => ''),
      token
        .decimals()
        .toPromise()
        .then(decimals => parseInt(decimals, 10))
        .catch(() => ''),
    ])

    // If symbol or decimals are resolved, overwrite the fallbacks
    if (tokenSymbol) {
      tokenData.symbol = tokenSymbol
    }
    if (tokenDecimals) {
      tokenData.decimals = tokenDecimals
    }

    return tokenData
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <TokenSelector activeIndex={selectedToken.index} onChange={handleSelectedToken} tokens={acceptedTokens} wide />
      {/* {showTokenBadge && <TokenBadge address={selectedToken.value} symbol={selectedToken.data.symbol} />} */}
      <TokenBalance>
        <Text size="small" color={theme.textSecondary}>
          {tokenBalanceMessage}
        </Text>
      </TokenBalance>
      <Field label="Amount">
        <TextInput.Number value={amount.value} onChange={handleAmountUpdate} min={0} step="any" required wide />
      </Field>
      <Field label="Requested Amount">
        <TextInput value={requestedAmount} onChange={handleRequestedAmountUpdate} wide />
      </Field>
      <ButtonWrapper>
        <Button wide mode="strong" type="submit" disabled={false}>
          Submit request
        </Button>
      </ButtonWrapper>
    </form>
  )
}

const ButtonWrapper = styled.div`
  padding-top: 10px;
`

const TokenBalance = styled.div`
  margin: 10px 0 20px;
`

const VSpace = styled.div`
  height: ${p => (p.size || 1) * 5}px;
`

const ValidationError = ({ message }) => (
  <div>
    <VSpace size={3} />
    <p>
      <IconCross />
      <Text size="small" style={{ marginLeft: '10px' }}>
        {message}
      </Text>
    </p>
  </div>
)

export default props => {
  const { api, connectedAccount, network } = useAragonApi()
  return network && api ? (
    <NewRequest api={api} connectedAccount={connectedAccount} network={network} {...props} />
  ) : null
}