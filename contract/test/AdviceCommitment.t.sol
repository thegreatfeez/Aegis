// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";

import "../src/AegisAgent.sol";
import "../src/AdviceCommitment.sol";

contract AdviceCommitmentTest is Test {
    AegisAgent internal agent;
    AdviceCommitment internal commitment;

    address internal alice = address(0xA11CE);
    address internal executor = address(0xE1);

    function setUp() public {
        agent = new AegisAgent();
        commitment = new AdviceCommitment(address(agent));

        agent.setAuthorizedContracts(address(this), address(commitment));
        agent.mint(alice);
    }

    function test_Record_SavesCommitmentAndHistory() public {
        vm.prank(alice);
        commitment.record(1, keccak256("advice"), keccak256("context"), 10 ether, 42);

        AdviceCommitment.Commitment memory c = commitment.getCommitment(alice, 1);
        assertEq(c.authority, alice);
        assertEq(c.nonce, 1);
        assertEq(c.riskScore, 42);
        assertFalse(c.executed);

        uint256[] memory history = commitment.getCommitmentHistory(alice);
        assertEq(history.length, 1);
        assertEq(history[0], 1);

        (uint256 commitmentsCount,) = agent.getAgentStats(c.agentId);
        assertEq(commitmentsCount, 1);
    }

    function test_Record_RevertIfNonceUsed() public {
        vm.startPrank(alice);
        commitment.record(1, keccak256("a"), keccak256("c"), 1 ether, 10);

        vm.expectRevert("Nonce used");
        commitment.record(1, keccak256("a2"), keccak256("c2"), 1 ether, 10);
        vm.stopPrank();
    }

    function test_Record_RevertIfNoAgent() public {
        address bob = address(0xB0B);

        vm.prank(bob);
        vm.expectRevert("No agent NFT - initialize profile first");
        commitment.record(1, keccak256("a"), keccak256("c"), 1 ether, 10);
    }

    function test_MarkExecuted_OnlyAuthorizedExecutor() public {
        vm.prank(alice);
        commitment.record(1, keccak256("a"), keccak256("c"), 1 ether, 10);

        vm.prank(alice);
        vm.expectRevert("Only authorized executor");
        commitment.markExecuted(alice, 1);

        commitment.addAuthorizedExecutor(executor);

        vm.prank(executor);
        commitment.markExecuted(alice, 1);

        AdviceCommitment.Commitment memory c = commitment.getCommitment(alice, 1);
        assertTrue(c.executed);

        (, uint256 executionsCount) = agent.getAgentStats(c.agentId);
        assertEq(executionsCount, 1);
    }

    function test_MarkExecuted_RevertIfAlreadyExecuted() public {
        vm.prank(alice);
        commitment.record(2, keccak256("a"), keccak256("c"), 1 ether, 10);

        commitment.addAuthorizedExecutor(executor);

        vm.prank(executor);
        commitment.markExecuted(alice, 2);

        vm.prank(executor);
        vm.expectRevert("Already executed");
        commitment.markExecuted(alice, 2);
    }
}
