// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IMerchantMoeRouter} from "../interfaces/IMerchantMoeRouter.sol";

/// @notice Testnet/dev mock for Merchant Moe router. Uses a 1:1 quote/swap model.
contract MockLBRouter is IMerchantMoeRouter {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256 amountOut) {
        require(block.timestamp <= deadline, "Swap expired");
        require(path.length == 2, "Invalid path");
        require(path[0] != path[1], "Same asset");

        amountOut = amountIn;
        require(amountOut >= amountOutMin, "Insufficient output");

        require(
            IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn),
            "Input transfer failed"
        );
        require(IERC20(path[1]).transfer(to, amountOut), "Output transfer failed");
    }

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external
        pure
        returns (uint256[] memory amounts)
    {
        require(path.length == 2, "Invalid path");
        amounts = new uint256[](2);
        amounts[0] = amountIn;
        amounts[1] = amountIn;
    }
}
