// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @title AegisAgent — ERC-8004 compliant agent identity NFT
/// @notice One NFT per wallet. Minted on first UserRiskProfile initialization.
///         Accumulates on-chain reputation via AdviceCommitment events.
contract AegisAgent is ERC721, Ownable {
    uint256 private _tokenIdCounter;

    // wallet address -> agent token ID (0 = no agent yet)
    mapping(address => uint256) public walletToAgentId;
    // agent token ID -> total commitments made
    mapping(uint256 => uint256) public commitmentCount;
    // agent token ID -> total executions completed
    mapping(uint256 => uint256) public executionCount;

    address public profileRegistry; // UserRiskProfile - authorized to mint
    address public commitmentContract; // AdviceCommitment - authorized to record stats

    event AgentMinted(address indexed wallet, uint256 indexed agentId);
    event AgentStatUpdated(uint256 indexed agentId, uint256 commitments, uint256 executions);

    modifier onlyAuthorized() {
        require(
            msg.sender == profileRegistry || msg.sender == commitmentContract,
            "Not authorized"
        );
        _;
    }

    constructor() ERC721("Aegis Agent", "RWAPA") Ownable(msg.sender) {}

    function setAuthorizedContracts(
        address profileRegistry_,
        address commitmentContract_
    ) external onlyOwner {
        profileRegistry = profileRegistry_;
        commitmentContract = commitmentContract_;
    }

    /// @notice Mint an agent NFT for a wallet. Called by UserRiskProfile.initialize().
    function mint(address to) external onlyAuthorized returns (uint256 agentId) {
        require(walletToAgentId[to] == 0, "Agent already exists");
        agentId = ++_tokenIdCounter;
        _safeMint(to, agentId);
        walletToAgentId[to] = agentId;
        emit AgentMinted(to, agentId);
    }

    /// @notice Increment reputation counters. Called by AdviceCommitment.
    function recordCommitment(uint256 agentId) external onlyAuthorized {
        commitmentCount[agentId]++;
        emit AgentStatUpdated(agentId, commitmentCount[agentId], executionCount[agentId]);
    }

    function recordExecution(uint256 agentId) external onlyAuthorized {
        executionCount[agentId]++;
        emit AgentStatUpdated(agentId, commitmentCount[agentId], executionCount[agentId]);
    }

    function getAgentStats(uint256 agentId)
        external
        view
        returns (uint256 commitments, uint256 executions)
    {
        return (commitmentCount[agentId], executionCount[agentId]);
    }
}
