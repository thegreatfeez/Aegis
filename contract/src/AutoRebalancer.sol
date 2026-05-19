// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./AdviceCommitment.sol";
import "./interfaces/IMerchantMoeRouter.sol";

contract AutoRebalancer is ReentrancyGuard {
    using SafeERC20 for IERC20;

    AdviceCommitment public immutable commitmentRegistry;
    IMerchantMoeRouter public immutable merchantMoeRouter;

    address public immutable USDY;
    address public immutable mETH;

    event RebalanceExecuted(
        address indexed user,
        uint256 indexed nonce,
        uint256 indexed agentId,
        address fromAsset,
        address toAsset,
        uint256 amountIn,
        uint256 amountOut
    );

    constructor(address commitmentRegistry_, address router_, address usdy_, address meth_) {
        commitmentRegistry = AdviceCommitment(commitmentRegistry_);
        merchantMoeRouter = IMerchantMoeRouter(router_);
        USDY = usdy_;
        mETH = meth_;
    }

    function execute(
        uint256 commitmentNonce,
        bytes32 expectedAdviceHash,
        address fromAsset,
        address toAsset,
        uint256 amountIn,
        uint256 amountOutMin,
        uint256 deadline
    ) external nonReentrant {
        AdviceCommitment.Commitment memory c =
            commitmentRegistry.getCommitment(msg.sender, commitmentNonce);

        require(c.authority == msg.sender, "Wrong authority");
        require(c.adviceHash == expectedAdviceHash, "Hash mismatch");
        require(!c.executed, "Already executed");
        require(fromAsset == USDY || fromAsset == mETH, "Invalid asset");
        require(toAsset == USDY || toAsset == mETH, "Invalid asset");
        require(fromAsset != toAsset, "Same asset");

        IERC20(fromAsset).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(fromAsset).forceApprove(address(merchantMoeRouter), amountIn);

        uint256 amountOut = merchantMoeRouter.swapExactTokensForTokens(
            amountIn, amountOutMin, _buildPath(fromAsset, toAsset), msg.sender, deadline
        );

        commitmentRegistry.markExecuted(msg.sender, commitmentNonce);

        emit RebalanceExecuted(
            msg.sender, commitmentNonce, c.agentId, fromAsset, toAsset, amountIn, amountOut
        );
    }

    function _buildPath(address from, address to) internal pure returns (address[] memory path) {
        path = new address[](2);
        path[0] = from;
        path[1] = to;
    }
}
