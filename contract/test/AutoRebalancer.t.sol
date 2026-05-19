// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "../src/AegisAgent.sol";
import "../src/AdviceCommitment.sol";
import "../src/AutoRebalancer.sol";
import "../src/interfaces/IMerchantMoeRouter.sol";

contract MockERC20 is ERC20 {
    constructor(string memory n, string memory s) ERC20(n, s) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MockMerchantMoeRouter is IMerchantMoeRouter {
    uint256 public constant RATE_NUM = 2;
    uint256 public constant RATE_DEN = 1;

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256 amountOut) {
        require(block.timestamp <= deadline, "expired");
        require(path.length == 2, "path");

        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        amountOut = (amountIn * RATE_NUM) / RATE_DEN;
        require(amountOut >= amountOutMin, "slippage");
        IERC20(path[1]).transfer(to, amountOut);
    }

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external
        pure
        returns (uint256[] memory amounts)
    {
        require(path.length == 2, "path");
        amounts = new uint256[](2);
        amounts[0] = amountIn;
        amounts[1] = amountIn * RATE_NUM;
    }
}

contract AutoRebalancerTest is Test {
    MockERC20 internal usdy;
    MockERC20 internal meth;
    MockMerchantMoeRouter internal router;

    AegisAgent internal agent;
    AdviceCommitment internal commitment;
    AutoRebalancer internal rebalancer;

    address internal alice = address(0xA11CE);

    function setUp() public {
        usdy = new MockERC20("USDY", "USDY");
        meth = new MockERC20("mETH", "mETH");
        router = new MockMerchantMoeRouter();

        agent = new AegisAgent();
        commitment = new AdviceCommitment(address(agent));
        rebalancer =
            new AutoRebalancer(address(commitment), address(router), address(usdy), address(meth));

        agent.setAuthorizedContracts(address(this), address(commitment));
        agent.mint(alice);

        commitment.addAuthorizedExecutor(address(rebalancer));

        usdy.mint(alice, 1_000e18);
        meth.mint(address(router), 10_000e18);

        vm.prank(alice);
        usdy.approve(address(rebalancer), type(uint256).max);
    }

    function test_Execute_SucceedsAndMarksCommitmentExecuted() public {
        bytes32 adviceHash = keccak256("advice-1");

        vm.prank(alice);
        commitment.record(1, adviceHash, keccak256("ctx"), 100e18, 30);

        uint256 usdyBefore = usdy.balanceOf(alice);
        uint256 methBefore = meth.balanceOf(alice);

        vm.prank(alice);
        rebalancer.execute(
            1,
            adviceHash,
            address(usdy),
            address(meth),
            100e18,
            150e18,
            block.timestamp + 1 hours
        );

        AdviceCommitment.Commitment memory c = commitment.getCommitment(alice, 1);
        assertTrue(c.executed);
        assertEq(usdy.balanceOf(alice), usdyBefore - 100e18);
        assertEq(meth.balanceOf(alice), methBefore + 200e18);
    }

    function test_Execute_RevertOnHashMismatch() public {
        bytes32 adviceHash = keccak256("advice-1");

        vm.prank(alice);
        commitment.record(1, adviceHash, keccak256("ctx"), 100e18, 30);

        vm.prank(alice);
        vm.expectRevert("Hash mismatch");
        rebalancer.execute(
            1,
            keccak256("wrong"),
            address(usdy),
            address(meth),
            100e18,
            150e18,
            block.timestamp + 1 hours
        );
    }

    function test_Execute_RevertOnInvalidAssetPair() public {
        bytes32 adviceHash = keccak256("advice-2");

        vm.prank(alice);
        commitment.record(2, adviceHash, keccak256("ctx"), 100e18, 30);

        address fakeAsset = address(0xDEAD);
        vm.prank(alice);
        vm.expectRevert("Invalid asset");
        rebalancer.execute(
            2,
            adviceHash,
            fakeAsset,
            address(meth),
            100e18,
            100e18,
            block.timestamp + 1 hours
        );
    }

    function test_Execute_RevertOnSameAsset() public {
        bytes32 adviceHash = keccak256("advice-3");

        vm.prank(alice);
        commitment.record(3, adviceHash, keccak256("ctx"), 100e18, 30);

        vm.prank(alice);
        vm.expectRevert("Same asset");
        rebalancer.execute(
            3,
            adviceHash,
            address(usdy),
            address(usdy),
            100e18,
            100e18,
            block.timestamp + 1 hours
        );
    }

    function test_Execute_RevertOnExpiredDeadline() public {
        bytes32 adviceHash = keccak256("advice-4");

        vm.prank(alice);
        commitment.record(4, adviceHash, keccak256("ctx"), 100e18, 30);

        vm.prank(alice);
        vm.expectRevert("expired");
        rebalancer.execute(
            4,
            adviceHash,
            address(usdy),
            address(meth),
            100e18,
            150e18,
            block.timestamp - 1
        );
    }

    function test_Execute_RevertOnReplayAfterExecution() public {
        bytes32 adviceHash = keccak256("advice-5");

        vm.prank(alice);
        commitment.record(5, adviceHash, keccak256("ctx"), 100e18, 30);

        vm.prank(alice);
        rebalancer.execute(
            5,
            adviceHash,
            address(usdy),
            address(meth),
            100e18,
            150e18,
            block.timestamp + 1 hours
        );

        vm.prank(alice);
        vm.expectRevert("Already executed");
        rebalancer.execute(
            5,
            adviceHash,
            address(usdy),
            address(meth),
            100e18,
            150e18,
            block.timestamp + 1 hours
        );
    }
}
