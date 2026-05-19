// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";

import "../src/PositionIntent.sol";

contract PositionIntentTest is Test {
    PositionIntent internal intent;
    address internal alice = address(0xA11CE);

    function setUp() public {
        intent = new PositionIntent();
    }

    function test_Record_SavesIntentAndHistory() public {
        vm.prank(alice);
        intent.record(1, address(0x1234), 0, 10 ether, 100);

        (address authority, uint256 nonce,,,,,) = intent.intents(alice, 1);
        assertEq(authority, alice);
        assertEq(nonce, 1);

        uint256[] memory nonces = intent.getUserIntents(alice);
        assertEq(nonces.length, 1);
        assertEq(nonces[0], 1);
    }

    function test_Record_RevertIfNonceUsed() public {
        vm.startPrank(alice);
        intent.record(1, address(0x1234), 0, 10 ether, 100);

        vm.expectRevert("Nonce used");
        intent.record(1, address(0x1234), 0, 20 ether, 100);
        vm.stopPrank();
    }

    function test_Record_RevertIfInvalidSide() public {
        vm.prank(alice);
        vm.expectRevert("Invalid side");
        intent.record(1, address(0x1234), 2, 10 ether, 100);
    }
}
