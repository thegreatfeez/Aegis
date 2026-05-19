// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./AegisAgent.sol";

contract AdviceCommitment is Ownable {
    struct Commitment {
        address authority;
        uint256 nonce;
        uint256 agentId; // ERC-8004 token ID
        bytes32 adviceHash; // keccak256(canonicalJSON(advice payload))
        bytes32 contextHash; // keccak256(canonicalJSON(context payload incl. sentiment))
        uint256 portfolioValueWei;
        uint8 riskScore;
        uint64 createdAt;
        bool executed;
    }

    // authority => nonce => Commitment
    mapping(address => mapping(uint256 => Commitment)) public commitments;
    // authority => ordered list of nonces (for history queries)
    mapping(address => uint256[]) public userNonces;
    // only explicitly authorised executors (i.e. AutoRebalancer) may mark executed
    mapping(address => bool) private _authorizedExecutors;

    AegisAgent public agentNFT;

    event CommitmentRecorded(
        address indexed authority,
        uint256 indexed nonce,
        uint256 indexed agentId,
        bytes32 adviceHash,
        bytes32 contextHash,
        uint8 riskScore
    );
    event CommitmentExecuted(address indexed authority, uint256 indexed nonce, uint256 indexed agentId);

    constructor(address agentNFT_) Ownable(msg.sender) {
        agentNFT = AegisAgent(agentNFT_);
    }

    function addAuthorizedExecutor(address executor) external onlyOwner {
        _authorizedExecutors[executor] = true;
    }

    function isAuthorizedExecutor(address addr) public view returns (bool) {
        return _authorizedExecutors[addr];
    }

    function record(
        uint256 nonce,
        bytes32 adviceHash,
        bytes32 contextHash,
        uint256 portfolioValueWei,
        uint8 riskScore
    ) external {
        require(commitments[msg.sender][nonce].createdAt == 0, "Nonce used");

        uint256 agentId = agentNFT.walletToAgentId(msg.sender);
        require(agentId != 0, "No agent NFT - initialize profile first");

        commitments[msg.sender][nonce] = Commitment({
            authority: msg.sender,
            nonce: nonce,
            agentId: agentId,
            adviceHash: adviceHash,
            contextHash: contextHash,
            portfolioValueWei: portfolioValueWei,
            riskScore: riskScore,
            createdAt: uint64(block.timestamp),
            executed: false
        });

        userNonces[msg.sender].push(nonce);
        agentNFT.recordCommitment(agentId);

        emit CommitmentRecorded(msg.sender, nonce, agentId, adviceHash, contextHash, riskScore);
    }

    function markExecuted(address authority, uint256 nonce) external {
        require(isAuthorizedExecutor(msg.sender), "Only authorized executor");
        Commitment storage c = commitments[authority][nonce];
        require(c.createdAt != 0, "Commitment not found");
        require(!c.executed, "Already executed");

        c.executed = true;
        agentNFT.recordExecution(c.agentId);

        emit CommitmentExecuted(authority, nonce, c.agentId);
    }

    function getCommitmentHistory(address user) external view returns (uint256[] memory) {
        return userNonces[user];
    }

    function getCommitment(address authority, uint256 nonce) external view returns (Commitment memory) {
        return commitments[authority][nonce];
    }
}
