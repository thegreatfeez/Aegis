// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

import "./AegisAgent.sol";

contract UserRiskProfile is EIP712 {
    struct Profile {
        address authority;
        uint8 riskMode; // 0=conservative, 1=moderate, 2=aggressive
        uint16 maxPositionBps; // max single position, basis points of portfolio
        uint16 maxConcentrationBps; // max asset concentration
        uint64 createdAt;
        uint64 updatedAt;
    }

    mapping(address => Profile) public profiles;

    AegisAgent public agentNFT;

    event ProfileInitialized(address indexed authority, uint8 riskMode, uint256 agentId);
    event ProfileUpdated(address indexed authority, uint8 riskMode, uint16 maxPositionBps);

    constructor(address agentNFT_) EIP712("Aegis", "1") {
        agentNFT = AegisAgent(agentNFT_);
    }

    /// @notice Initialise profile and mint ERC-8004 agent NFT in one transaction.
    function initialize(uint8 riskMode, uint16 maxPositionBps, uint16 maxConcentrationBps) external {
        require(profiles[msg.sender].createdAt == 0, "Profile exists");
        require(maxPositionBps <= 10_000 && maxConcentrationBps <= 10_000, "Invalid bps");

        profiles[msg.sender] = Profile({
            authority: msg.sender,
            riskMode: riskMode,
            maxPositionBps: maxPositionBps,
            maxConcentrationBps: maxConcentrationBps,
            createdAt: uint64(block.timestamp),
            updatedAt: uint64(block.timestamp)
        });

        uint256 agentId = agentNFT.mint(msg.sender);
        emit ProfileInitialized(msg.sender, riskMode, agentId);
    }

    function update(uint8 riskMode, uint16 maxPositionBps, uint16 maxConcentrationBps) external {
        require(profiles[msg.sender].createdAt != 0, "No profile");
        require(maxPositionBps <= 10_000 && maxConcentrationBps <= 10_000, "Invalid bps");

        Profile storage p = profiles[msg.sender];
        p.riskMode = riskMode;
        p.maxPositionBps = maxPositionBps;
        p.maxConcentrationBps = maxConcentrationBps;
        p.updatedAt = uint64(block.timestamp);

        emit ProfileUpdated(msg.sender, riskMode, maxPositionBps);
    }

    function getProfile(address user) external view returns (Profile memory) {
        return profiles[user];
    }
}
