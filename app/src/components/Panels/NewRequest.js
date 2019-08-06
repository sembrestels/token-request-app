import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Button, Field, Info, Text, TextInput, theme } from '@aragon/ui'
import { useAragonApi } from '@aragon/api-react'
import TokenSelector from '../TokenSelector'
import { addressesEqual, isAddress } from '../../lib/web3-utils'

const NO_ERROR = Symbol('NO_ERROR')
const BALANCE_NOT_ENOUGH_ERROR = Symbol('BALANCE_NOT_ENOUGH_ERROR')
const DECIMALS_TOO_MANY_ERROR = Symbol('DECIMALS_TOO_MANY_ERROR')

function NewRequest({ api, tokens, network, connectedAccount }) {
  const [amount, setAmount] = useState({
    error: NO_ERROR,
    value: '',
  })
  const [selectedToken, setSelectedToken] = useState({
    coerced: false, // whether the token was coerced from a symbol to an address
    error: NO_ERROR,
    index: -1,
    value: '',
  })
  const [requestedAmount, setRequestedAmount] = useState(0)

  const renderBalanceForSelectedToken = selectedToken => {
    const { decimals, loading, symbol, userBalance } = selectedToken.data
    if (loading || !userBalance) {
      return ''
    }
  }

  const handleFormSubmit = e => {
    e.preventDefault()
    console.log('submit')
  }

  const handleRequestedAmountUpdate = e => {
    setRequestedAmount(e.target.value)
  }

  const handleAmountUpdate = e => {
    setAmount(e.target.value)
  }

  const handleSelectedToken = ({ address, index, value }) => {
    const tokenIsAddress = isAddress(address)
    const token = {
      index,
      coerced: tokenIsAddress && address !== value,
      value: address,
    }
    console.log('tokeeeen ', token)
    if (!tokenIsAddress) {
      return
    }

    // const tokenData = await loadTokenData(address)
    setSelectedToken(token)
  }

  const loadTokenData = async address => {
    console.log('load token data')
    // ETH
    if (addressesEqual(address, ETHER_TOKEN_FAKE_ADDRESS)) {
      const userBalance = await api
        .web3Eth('getBalance', connectedAccount)
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
      .balanceOf(connectedAccount)
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
  console.log('active token ', selectedToken)

  return (
    <form onSubmit={handleFormSubmit}>
      <TokenSelector activeIndex={selectedToken.index} onChange={handleSelectedToken} tokens={tokens} />
      {/* {showTokenBadge && <TokenBadge address={selectedToken.value} symbol={selectedToken.data.symbol} />} */}
      {/* <TokenBalance>
        <Text size="small" color={theme.textSecondary}>
          {tokenBalanceMessage}
        </Text>
      </TokenBalance> */}
      <Field label="Amount">
        <TextInput.Number value={amount} onChange={handleAmountUpdate} min={0} step="any" required wide />
      </Field>
      <Field label="Requested Amount">
        <TextInput value={requestedAmount} onChange={handleRequestedAmountUpdate} wide />
      </Field>
      <ButtonWrapper>
        <Button wide mode="strong" type="submit" disabled={false}>
          Submit request
        </Button>
      </ButtonWrapper>
      {/* {errorMessage && <ValidationError message={errorMessage} />} */}

      {/* <VSpace size={6} />
      <Info.Action title="Depositing funds to your organization">
        {isMainnet && (
          <React.Fragment>
            <p>
              Remember, Mainnet organizations use real (not test) funds.{' '}
              <StyledSafeLink href={MAINNET_RISKS_BLOG_POST} target="_blank">
                Learn more
              </StyledSafeLink>{' '}
              about the risks and what's been done to mitigate them here.
            </p>
            <VSpace size={2} />
          </React.Fragment>
        )}
        <p>
          Configure your deposit above, and sign the transaction with your wallet after clicking “Submit Transfer”. It
          will then show up in your Finance app once processed.
        </p>
        {tokenSelected && (
          <React.Fragment>
            <VSpace size={2} />
            <p>
              Tokens may require a pretransaction to approve the Finance app for your deposit.{' '}
              <StyledSafeLink href={TOKEN_ALLOWANCE_WEBSITE} target="_blank">
                Find out why.
              </StyledSafeLink>{' '}
            </p>
          </React.Fragment>
        )}
      </Info.Action> */}
    </form>
  )
}

const ButtonWrapper = styled.div`
  padding-top: 10px;
`

const TokenBalance = styled.div`
  margin: 10px 0 20px;
`

// const StyledSafeLink = styled(SafeLink)`
//   text-decoration-color: ${theme.accent};
//   color: ${theme.accent};
// `

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
