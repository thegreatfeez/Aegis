import { parseAbi } from 'viem';

export const CHAIN_ID = 5003 as const;

export const CONTRACT_ADDRESSES = {
  AegisAgent: '0xef571ecd58ee26e3c4ca6be8cab6a88abc58a6a7',
  UserRiskProfile: '0xe7fa28e17be54a8a1c30d8f6638f8c42bbc5fad2',
  RiskPolicy: '0xc9cfdd1150f6048ce90d215d971ed327bc45d45a',
  YieldVault: '0x1ae32dfd7f063a13134cdcd5c194631843e158c0',
  AdviceCommitment: '0x41271490144e382b51457f2e09f6ad3edefc1fb8',
  AutoRebalancer: '0xf5caec80ab327b5d0988974d938f29db66eff8d7',
  PositionIntent: '0xb3efe937539b09979a75d119441ed3869e899aef',
} as const;

export const EXTERNAL_ADDRESSES = {
  USDY: '0x376bDf7EF380D2868E80F570559a211A82061a9F',
  mETH: '0x6e6742bA7C02214C2B798954f1084d94E7f02b0C',
  MerchantMoeRouter: '0x9A20C36A7ADE62E50C682707D2e8278Daf805C',
} as const;

export const AEGIS_AGENT_ABI = parseAbi([
  'function walletToAgentId(address) view returns (uint256)',
  'function commitmentCount(uint256) view returns (uint256)',
  'function executionCount(uint256) view returns (uint256)',
  'function profileRegistry() view returns (address)',
  'function commitmentContract() view returns (address)',
  'function setAuthorizedContracts(address profileRegistry_, address commitmentContract_)',
  'function mint(address to) returns (uint256 agentId)',
  'function getAgentStats(uint256 agentId) view returns (uint256 commitments, uint256 executions)',
  'event AgentMinted(address indexed wallet, uint256 indexed agentId)',
  'event AgentStatUpdated(uint256 indexed agentId, uint256 commitments, uint256 executions)',
]);

export const USER_RISK_PROFILE_ABI = parseAbi([
  'function profiles(address) view returns (address authority, uint8 riskMode, uint16 maxPositionBps, uint16 maxConcentrationBps, uint64 createdAt, uint64 updatedAt)',
  'function initialize(uint8 riskMode, uint16 maxPositionBps, uint16 maxConcentrationBps)',
  'function update(uint8 riskMode, uint16 maxPositionBps, uint16 maxConcentrationBps)',
  'function getProfile(address user) view returns ((address authority, uint8 riskMode, uint16 maxPositionBps, uint16 maxConcentrationBps, uint64 createdAt, uint64 updatedAt))',
  'event ProfileInitialized(address indexed authority, uint8 riskMode, uint256 agentId)',
  'event ProfileUpdated(address indexed authority, uint8 riskMode, uint16 maxPositionBps)',
]);

export const ADVICE_COMMITMENT_ABI = parseAbi([
  'function addAuthorizedExecutor(address executor)',
  'function isAuthorizedExecutor(address addr) view returns (bool)',
  'function record(uint256 nonce, bytes32 adviceHash, bytes32 contextHash, uint256 portfolioValueWei, uint8 riskScore)',
  'function markExecuted(address authority, uint256 nonce)',
  'function commitments(address, uint256) view returns (address authority, uint256 nonce, uint256 agentId, bytes32 adviceHash, bytes32 contextHash, uint256 portfolioValueWei, uint8 riskScore, uint64 createdAt, bool executed)',
  'function getCommitmentHistory(address user) view returns (uint256[])',
  'function getCommitment(address authority, uint256 nonce) view returns ((address authority, uint256 nonce, uint256 agentId, bytes32 adviceHash, bytes32 contextHash, uint256 portfolioValueWei, uint8 riskScore, uint64 createdAt, bool executed))',
  'event CommitmentRecorded(address indexed authority, uint256 indexed nonce, uint256 indexed agentId, bytes32 adviceHash, bytes32 contextHash, uint8 riskScore)',
  'event CommitmentExecuted(address indexed authority, uint256 indexed nonce, uint256 indexed agentId)',
]);

export const AUTO_REBALANCER_ABI = parseAbi([
  'function USDY() view returns (address)',
  'function mETH() view returns (address)',
  'function commitmentRegistry() view returns (address)',
  'function merchantMoeRouter() view returns (address)',
  'function execute(uint256 commitmentNonce, bytes32 expectedAdviceHash, address fromAsset, address toAsset, uint256 amountIn, uint256 amountOutMin, uint256 deadline)',
  'event RebalanceExecuted(address indexed user, uint256 indexed nonce, uint256 indexed agentId, address fromAsset, address toAsset, uint256 amountIn, uint256 amountOut)',
]);

export const YIELD_VAULT_ABI = parseAbi([
  'function deposit(uint256 assets, address receiver) returns (uint256 shares)',
  'function withdraw(uint256 assets, address receiver, address owner) returns (uint256 shares)',
  'function balanceOf(address account) view returns (uint256)',
  'function convertToAssets(uint256 shares) view returns (uint256 assets)',
  'function totalAssets() view returns (uint256)',
]);

export const RISK_POLICY_ABI = parseAbi([
  'function globalPolicy() view returns (uint256 minPortfolioWei, uint256 maxPortfolioWei, uint16 maxPositionBps, uint16 maxConcentrationBps, uint16 volatilityScaleBps, uint64 updatedAt)',
  'function update(uint256 minPortfolioWei, uint256 maxPortfolioWei, uint16 maxPositionBps, uint16 maxConcentrationBps, uint16 volatilityScaleBps)',
  'event PolicyUpdated(uint16 maxPositionBps, uint16 maxConcentrationBps)',
]);

export const POSITION_INTENT_ABI = parseAbi([
  'function record(uint256 nonce, address tokenAsset, uint8 side, uint256 amountWei, uint16 expectedSlippageBps)',
  'function intents(address, uint256) view returns (address authority, uint256 nonce, address tokenAsset, uint8 side, uint256 amountWei, uint16 expectedSlippageBps, uint64 createdAt)',
  'function getUserIntents(address user) view returns (uint256[])',
  'event IntentRecorded(address indexed authority, uint256 indexed nonce, address tokenAsset, uint8 side)',
]);

export const MERCHANT_MOE_ROUTER_ABI = parseAbi([
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256 amountOut)',
  'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)',
]);

export const ERC20_ABI = parseAbi([
  'function balanceOf(address account) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
]);
