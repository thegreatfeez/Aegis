// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract RiskPolicy is Ownable {
    struct Policy {
        uint256 minPortfolioWei;
        uint256 maxPortfolioWei;
        uint16 maxPositionBps;
        uint16 maxConcentrationBps;
        uint16 volatilityScaleBps;
        uint64 updatedAt;
    }

    Policy public globalPolicy;

    event PolicyUpdated(uint16 maxPositionBps, uint16 maxConcentrationBps);

    constructor() Ownable(msg.sender) {}

    function update(
        uint256 minPortfolioWei,
        uint256 maxPortfolioWei,
        uint16 maxPositionBps,
        uint16 maxConcentrationBps,
        uint16 volatilityScaleBps
    ) external onlyOwner {
        require(maxPositionBps <= 10_000, "Invalid bps");
        require(maxConcentrationBps <= 10_000, "Invalid bps");
        require(minPortfolioWei <= maxPortfolioWei, "Invalid range");

        globalPolicy = Policy({
            minPortfolioWei: minPortfolioWei,
            maxPortfolioWei: maxPortfolioWei,
            maxPositionBps: maxPositionBps,
            maxConcentrationBps: maxConcentrationBps,
            volatilityScaleBps: volatilityScaleBps,
            updatedAt: uint64(block.timestamp)
        });

        emit PolicyUpdated(maxPositionBps, maxConcentrationBps);
    }
}
