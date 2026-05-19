// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/console2.sol";

import {MockERC20} from "../src/mocks/MockERC20.sol";
import {MockLBRouter} from "../src/mocks/MockLBRouter.sol";

contract DeployMocksScript is Script {
    function run() external {
        vm.startBroadcast();

        MockERC20 mockUsdy = new MockERC20("Mock USDY", "mUSDY");
        MockERC20 mockMeth = new MockERC20("Mock mETH", "mmETH");
        MockLBRouter mockRouter = new MockLBRouter();

        // Seed router with mock mETH so swaps can succeed in demo flows.
        mockMeth.mint(address(mockRouter), 1_000_000 ether);

        vm.stopBroadcast();

        console2.log("MOCK_USDY_ADDRESS=", address(mockUsdy));
        console2.log("MOCK_METH_ADDRESS=", address(mockMeth));
        console2.log("MOCK_MERCHANT_MOE_ROUTER_ADDRESS=", address(mockRouter));
    }
}
