// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "../src/AegisAgent.sol";
import "../src/RiskPolicy.sol";
import "../src/UserRiskProfile.sol";
import "../src/YieldVault.sol";

contract MockVaultAsset is ERC20 {
    constructor() ERC20("Vault Asset", "VAST") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract YieldVaultTest is Test {
    MockVaultAsset internal asset;
    AegisAgent internal agent;
    UserRiskProfile internal profile;
    RiskPolicy internal policy;
    YieldVault internal vault;

    address internal alice = address(0xA11CE);

    function setUp() public {
        asset = new MockVaultAsset();
        agent = new AegisAgent();
        profile = new UserRiskProfile(address(agent));
        policy = new RiskPolicy();
        vault = new YieldVault(
            IERC20(address(asset)),
            "Aegis Vault",
            "aUSDY",
            address(policy),
            address(profile)
        );

        agent.setAuthorizedContracts(address(profile), address(0xCAFE));

        asset.mint(alice, 1_000e18);

        vm.prank(alice);
        asset.approve(address(vault), type(uint256).max);
    }

    function test_Deposit_RespectsProfileMaxPositionBps() public {
        vm.prank(alice);
        profile.initialize(1, 1_000, 8_000); // 10%

        vm.prank(alice);
        vault.deposit(100e18, alice); // allowed when current position is zero

        vm.prank(alice);
        vm.expectRevert("Exceeds max position bps");
        vault.deposit(100e18, alice);
    }

    function test_Withdraw_Succeeds() public {
        vm.prank(alice);
        profile.initialize(1, 10_000, 10_000);

        vm.prank(alice);
        vault.deposit(100e18, alice);

        vm.prank(alice);
        vault.withdraw(40e18, alice, alice);

        assertEq(asset.balanceOf(alice), 940e18);
    }
}
