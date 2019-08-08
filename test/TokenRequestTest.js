const { encodeCallScript } = require('@aragon/test-helpers/evmScript')
const getBalanceFn = require('@aragon/test-helpers/balance')

import DaoDeployment from './helpers/DaoDeployment'
import { deployedContract, assertRevert } from './helpers/helpers'
const ForwarderMock = artifacts.require('ForwarderMock')
const MiniMeToken = artifacts.require('MiniMeToken')
const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory')
const MockErc20 = artifacts.require('TokenMock')
const TokenManager = artifacts.require('TokenManager')
const TokenRequest = artifacts.require('TokenRequest')
const Vault = artifacts.require('Vault')

contract('TokenRequest', ([rootAccount, ...accounts]) => {
  let daoDeployment = new DaoDeployment()
  let requestableToken, tokenRequestBase, tokenRequest, tokenManager, tokenManagerBase, mockErc20, vaultBase, vault

  let FINALISE_TOKEN_REQUEST_ROLE, MINT_ROLE, SET_TOKEN_MANAGER_ROLE, SET_VAULT_ROLE
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
  let MOCK_TOKEN_BALANCE, ROOT_TOKEN_AMOUNT, ROOT_ETHER_AMOUNT

  const getBalance = getBalanceFn(web3)

  before(async () => {
    await daoDeployment.deployBefore()

    tokenRequestBase = await TokenRequest.new()
    FINALISE_TOKEN_REQUEST_ROLE = await tokenRequestBase.FINALISE_TOKEN_REQUEST_ROLE()
    SET_TOKEN_MANAGER_ROLE = await tokenRequestBase.SET_TOKEN_MANAGER_ROLE()
    SET_VAULT_ROLE = await tokenRequestBase.SET_VAULT_ROLE()

    tokenManagerBase = await TokenManager.new()
    MINT_ROLE = await tokenManagerBase.MINT_ROLE()

    vaultBase = await Vault.new()
  })

  beforeEach(async () => {
    ROOT_ETHER_AMOUNT = 2000
    ROOT_TOKEN_AMOUNT = 100
    MOCK_TOKEN_BALANCE = 100

    await daoDeployment.deployBeforeEach(rootAccount)
    const miniMeTokenFactory = await MiniMeTokenFactory.new()
    requestableToken = await MiniMeToken.new(
      miniMeTokenFactory.address,
      ZERO_ADDRESS,
      0,
      'RequestableToken',
      18,
      'RQT',
      true
    )

    const newTokenRequestAppReceipt = await daoDeployment.kernel.newAppInstance(
      '0x1234',
      tokenRequestBase.address,
      '0x',
      false,
      { from: rootAccount }
    )
    tokenRequest = await TokenRequest.at(deployedContract(newTokenRequestAppReceipt))

    const newTokenManagerAppReceipt = await daoDeployment.kernel.newAppInstance(
      '0x5678',
      tokenManagerBase.address,
      '0x',
      false,
      { from: rootAccount }
    )
    tokenManager = await TokenManager.at(deployedContract(newTokenManagerAppReceipt))
    await requestableToken.changeController(tokenManager.address)

    const newVaultAppReceipt = await daoDeployment.kernel.newAppInstance('0x7878', vaultBase.address, '0x', false, {
      from: rootAccount,
    })
    vault = await Vault.at(deployedContract(newVaultAppReceipt))

    await vault.initialize()
    await tokenManager.initialize(requestableToken.address, false, 0)
    await tokenRequest.initialize(tokenManager.address, vault.address)

    mockErc20 = await MockErc20.new(rootAccount, MOCK_TOKEN_BALANCE)
    await mockErc20.transfer(rootAccount, ROOT_TOKEN_AMOUNT)
  })

  describe('initialize(address _tokenManager, address _vault)', () => {
    it('sets correct variables', async () => {
      const actualTokenManager = await tokenRequest.tokenManager()
      const actualVault = await tokenRequest.vault()

      assert.strictEqual(actualTokenManager, tokenManager.address)
      assert.strictEqual(actualVault, vault.address)
    })
  })

  describe('setTokenManager(address _tokenManager)', () => {
    let tokenManager2
    beforeEach(async () => {
      const newTokenManagerAppReceipt2 = await daoDeployment.kernel.newAppInstance(
        '0x5555',
        tokenManagerBase.address,
        '0x',
        false,
        { from: rootAccount }
      )
      tokenManager2 = await TokenManager.at(deployedContract(newTokenManagerAppReceipt2))
      await daoDeployment.acl.createPermission(accounts[1], tokenRequest.address, SET_TOKEN_MANAGER_ROLE, rootAccount)
    })
    it('sets a token manager', async () => {
      await tokenRequest.setTokenManager(tokenManager2.address, { from: accounts[1] })

      const actualTokenManager = await tokenRequest.tokenManager()
      assert.strictEqual(actualTokenManager, tokenManager2.address)
    })
  })

  describe('setVault(address _vault)', () => {
    let vault2
    beforeEach(async () => {
      const newVaultAppReceipt2 = await daoDeployment.kernel.newAppInstance('0x8889', vaultBase.address, '0x', false, {
        from: rootAccount,
      })
      vault2 = await Vault.at(deployedContract(newVaultAppReceipt2))
      await daoDeployment.acl.createPermission(accounts[1], tokenRequest.address, SET_VAULT_ROLE, rootAccount)
    })

    it('sets a vault', async () => {
      await tokenRequest.setVault(vault2.address, { from: accounts[1] })

      const actualVault = await tokenRequest.vault()
      assert.strictEqual(actualVault, vault2.address)
    })
  })

  describe('createTokenRequest(address _depositToken, uint256 _depositAmount, uint256 _requestAmount)', () => {
    it('creates a new token request on exchange for Ether', async () => {
      const expectedEtherBalance = 2000
      const expectedNextTokenRequestId = 1

      await tokenRequest.createTokenRequest(ZERO_ADDRESS, ROOT_ETHER_AMOUNT, 1, {
        value: ROOT_ETHER_AMOUNT,
      })

      const actualEtherBalance = (await getBalance(tokenRequest.address)).valueOf()
      const actualNextTokenRequestId = await tokenRequest.nextTokenRequestId()

      assert.equal(actualEtherBalance, expectedEtherBalance)
      assert.equal(actualNextTokenRequestId, expectedNextTokenRequestId)
    })

    it('should not create a new request for 0 Ether', async () => {
      await assertRevert(
        tokenRequest.createTokenRequest(ZERO_ADDRESS, 0, 1, {
          value: 0,
        }),
        'TOKEN_REQUEST_NO_AMOUNT'
      )
    })

    it('should not create a new request with different _depositAmount and value', async () => {
      await assertRevert(
        tokenRequest.createTokenRequest(ZERO_ADDRESS, 100, 1, {
          value: 50,
        }),
        'TOKEN_REQUEST_ETH_VALUE_MISMATCH'
      )
    })

    it('creates a new token request on exchange for TokenMock', async () => {
      const expectedTRBalance = ROOT_TOKEN_AMOUNT
      const expectedNextTokenRequestId = 1

      await mockErc20.approve(tokenRequest.address, ROOT_TOKEN_AMOUNT, {
        from: rootAccount,
      })

      await tokenRequest.createTokenRequest(mockErc20.address, ROOT_TOKEN_AMOUNT, 300)

      const actualTRBalance = await mockErc20.balanceOf(tokenRequest.address)

      const actualNextTokenRequestId = await tokenRequest.nextTokenRequestId()

      assert.equal(actualTRBalance, expectedTRBalance)
      assert.equal(actualNextTokenRequestId, expectedNextTokenRequestId)
    })

    it('should not create a new request without token apporove', async () => {
      await assertRevert(
        tokenRequest.createTokenRequest(mockErc20.address, 100, 1),
        'TOKEN_REQUEST_TOKEN_TRANSFER_REVERTED'
      )
    })
  })

  describe('finaliseTokenRequest(uint256 _tokenRequestId)', () => {
    let script, forwarderMock, forwarderMockBase
    beforeEach(async () => {
      forwarderMockBase = await ForwarderMock.new()
      const newForwarderMockReceipt = await daoDeployment.kernel.newAppInstance(
        '0x9876',
        forwarderMockBase.address,
        '0x',
        false,
        { from: rootAccount }
      )
      forwarderMock = await ForwarderMock.at(deployedContract(newForwarderMockReceipt))

      await forwarderMock.initialize()

      await daoDeployment.acl.createPermission(tokenRequest.address, tokenManager.address, MINT_ROLE, rootAccount)
      await daoDeployment.acl.createPermission(
        forwarderMock.address,
        tokenRequest.address,
        FINALISE_TOKEN_REQUEST_ROLE,
        rootAccount
      )

      const action = {
        to: tokenRequest.address,
        calldata: tokenRequest.contract.methods.finaliseTokenRequest(0).encodeABI(),
      }
      script = encodeCallScript([action])
    })

    it('finalise token request (ERC20)', async () => {
      const expectedUserMiniMeBalance = 300
      const expectedVaultBalance = ROOT_TOKEN_AMOUNT

      await mockErc20.approve(tokenRequest.address, ROOT_TOKEN_AMOUNT, {
        from: rootAccount,
      })
      await tokenRequest.createTokenRequest(mockErc20.address, expectedVaultBalance, expectedUserMiniMeBalance, {
        from: rootAccount,
      })

      await forwarderMock.forward(script, { from: rootAccount })

      const actualUserMiniMeBalance = await tokenManager.spendableBalanceOf(rootAccount)
      const actualVaultBalance = await vault.balance(mockErc20.address)

      assert.equal(actualUserMiniMeBalance, expectedUserMiniMeBalance)
      assert.equal(actualVaultBalance, expectedVaultBalance)
    })

    it('finalise token request (ETH)', async () => {
      const expectedUserMiniMeBalance = 300
      const expectedVaultBalance = 200

      await tokenRequest.createTokenRequest(ZERO_ADDRESS, expectedVaultBalance, expectedUserMiniMeBalance, {
        from: rootAccount,
        value: expectedVaultBalance,
      })

      await forwarderMock.forward(script, { from: rootAccount })

      const actualUserMiniMeBalance = await tokenManager.spendableBalanceOf(rootAccount)
      const actualVaultBalance = await vault.balance(ZERO_ADDRESS)

      assert.equal(actualUserMiniMeBalance, expectedUserMiniMeBalance)
      assert.equal(actualVaultBalance, expectedVaultBalance)
    })
  })

  describe('refundTokenRequest(uint256 _tokenRequestId) ', () => {
    it('refund token (ERC20)', async () => {
      const expectedRefundAmount = ROOT_TOKEN_AMOUNT

      await mockErc20.approve(tokenRequest.address, expectedRefundAmount, {
        from: rootAccount,
      })
      await tokenRequest.createTokenRequest(mockErc20.address, expectedRefundAmount, 1, {
        from: rootAccount,
      })

      await tokenRequest.refundTokenRequest(0, { from: rootAccount })

      const actualAmounAfterRefund = await mockErc20.balanceOf(rootAccount)
      assert.equal(actualAmounAfterRefund, expectedRefundAmount)
    })

    it('should not refund a a token request from other user', async () => {
      await mockErc20.approve(tokenRequest.address, ROOT_TOKEN_AMOUNT, {
        from: rootAccount,
      })
      await tokenRequest.createTokenRequest(mockErc20.address, ROOT_TOKEN_AMOUNT, 1, {
        from: rootAccount,
      })

      await assertRevert(tokenRequest.refundTokenRequest(0, { from: accounts[1] }), 'TOKEN_REQUEST_NOT_OWNER')
    })
  })
})