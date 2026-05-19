// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";

import "../src/AegisAgent.sol";
import "../src/UserRiskProfile.sol";

contract UserRiskProfileTest is Test {
    AegisAgent internal agent;
    UserRiskProfile internal profile;

    address internal alice = address(0xA11CE);

    function setUp() public {
        agent = new AegisAgent();
        profile = new UserRiskProfile(address(agent));

        agent.setAuthorizedContracts(address(profile), address(0xCAFE));
    }

    function test_Initialize_MintsAgentAndStoresProfile() public {
        vm.prank(alice);
        profile.initialize(1, 6000, 7000);

        UserRiskProfile.Profile memory p = profile.getProfile(alice);
        assertEq(p.authority, alice);
        assertEq(p.riskMode, 1);
        assertEq(p.maxPositionBps, 6000);
        assertEq(p.maxConcentrationBps, 7000);
        assertGt(p.createdAt, 0);
        assertEq(agent.walletToAgentId(alice), 1);
    }

    function test_Initialize_RevertIfProfileExists() public {
        vm.startPrank(alice);
        profile.initialize(1, 6000, 7000);

        vm.expectRevert("Profile exists");
        profile.initialize(2, 5000, 5000);
        vm.stopPrank();
    }

    function test_Update_RevertIfNoProfile() public {
        vm.prank(alice);
        vm.expectRevert("No profile");
        profile.update(2, 5000, 5000);
    }

    function test_Update_Succeeds() public {
        vm.prank(alice);
        profile.initialize(1, 6000, 7000);

        vm.prank(alice);
        profile.update(2, 4000, 4500);

        UserRiskProfile.Profile memory p = profile.getProfile(alice);
        assertEq(p.riskMode, 2);
        assertEq(p.maxPositionBps, 4000);
        assertEq(p.maxConcentrationBps, 4500);
    }
}
