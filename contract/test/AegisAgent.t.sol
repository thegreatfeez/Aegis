// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";

import "../src/AegisAgent.sol";

contract AegisAgentTest is Test {
    AegisAgent internal agent;

    address internal alice = address(0xA11CE);
    address internal profileRegistry = address(0xBEEF);
    address internal commitmentContract = address(0xCAFE);

    function setUp() public {
        agent = new AegisAgent();
    }

    function test_SetAuthorizedContracts_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        agent.setAuthorizedContracts(profileRegistry, commitmentContract);

        agent.setAuthorizedContracts(profileRegistry, commitmentContract);
        assertEq(agent.profileRegistry(), profileRegistry);
        assertEq(agent.commitmentContract(), commitmentContract);
    }

    function test_Mint_ByAuthorizedRegistry() public {
        agent.setAuthorizedContracts(address(this), commitmentContract);

        uint256 agentId = agent.mint(alice);

        assertEq(agentId, 1);
        assertEq(agent.walletToAgentId(alice), 1);
        assertEq(agent.ownerOf(1), alice);
    }

    function test_Mint_RevertIfAlreadyMinted() public {
        agent.setAuthorizedContracts(address(this), commitmentContract);

        agent.mint(alice);

        vm.expectRevert("Agent already exists");
        agent.mint(alice);
    }

    function test_RecordStats_ByAuthorized() public {
        agent.setAuthorizedContracts(address(this), commitmentContract);

        uint256 agentId = agent.mint(alice);
        agent.recordCommitment(agentId);
        agent.recordExecution(agentId);

        (uint256 commitments, uint256 executions) = agent.getAgentStats(agentId);
        assertEq(commitments, 1);
        assertEq(executions, 1);
    }
}
