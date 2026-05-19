// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./RiskPolicy.sol";
import "./UserRiskProfile.sol";

contract YieldVault is ERC4626, Ownable, ReentrancyGuard {
    RiskPolicy public riskPolicy;
    UserRiskProfile public riskProfileRegistry;

    constructor(
        IERC20 asset_,
        string memory name_,
        string memory symbol_,
        address riskPolicy_,
        address profileRegistry_
    ) ERC4626(asset_) ERC20(name_, symbol_) Ownable(msg.sender) {
        riskPolicy = RiskPolicy(riskPolicy_);
        riskProfileRegistry = UserRiskProfile(profileRegistry_);
    }

    /// @notice Override deposit to enforce per-wallet risk policy constraints.
    /// @dev Uses the depositor's own share value, not the vault's totalAssets().
    function deposit(uint256 assets, address receiver)
        public
        override
        nonReentrant
        returns (uint256)
    {
        UserRiskProfile.Profile memory profile = riskProfileRegistry.getProfile(msg.sender);

        if (profile.createdAt != 0) {
            uint256 userShares = balanceOf(msg.sender);
            uint256 userCurrentValue = convertToAssets(userShares);
            uint256 projectedValue = userCurrentValue + assets;
            uint256 maxAllowed = (projectedValue * profile.maxPositionBps) / 10_000;

            require(assets <= maxAllowed || userCurrentValue == 0, "Exceeds max position bps");
        }

        return super.deposit(assets, receiver);
    }

    function withdraw(uint256 assets, address receiver, address owner_)
        public
        override
        nonReentrant
        returns (uint256)
    {
        return super.withdraw(assets, receiver, owner_);
    }
}
