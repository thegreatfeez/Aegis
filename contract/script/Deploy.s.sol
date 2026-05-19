// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {AegisAgent} from "../src/AegisAgent.sol";
import {UserRiskProfile} from "../src/UserRiskProfile.sol";
import {RiskPolicy} from "../src/RiskPolicy.sol";
import {YieldVault} from "../src/YieldVault.sol";
import {AdviceCommitment} from "../src/AdviceCommitment.sol";
import {AutoRebalancer} from "../src/AutoRebalancer.sol";
import {PositionIntent} from "../src/PositionIntent.sol";

contract DeployScript is Script {
    struct Deployment {
        address aegisAgent;
        address userRiskProfile;
        address riskPolicy;
        address yieldVault;
        address adviceCommitment;
        address autoRebalancer;
        address positionIntent;
    }

    function run() external returns (Deployment memory d) {
        address usdy = vm.envAddress("USDY_ADDRESS");
        address meth = vm.envAddress("METH_ADDRESS");
        address router = vm.envAddress("MERCHANT_MOE_ROUTER_ADDRESS");

        // Optional: if OWNER_ADDRESS is missing, keep deployer as owner.
        address owner = _optionalOwner();

        vm.startBroadcast();

        AegisAgent agent = new AegisAgent();
        UserRiskProfile profile = new UserRiskProfile(address(agent));
        RiskPolicy policy = new RiskPolicy();
        YieldVault vault = new YieldVault(
            IERC20(usdy),
            "Aegis Yield Vault USDY",
            "aUSDY",
            address(policy),
            address(profile)
        );
        AdviceCommitment commitment = new AdviceCommitment(address(agent));
        AutoRebalancer rebalancer = new AutoRebalancer(
            address(commitment),
            router,
            usdy,
            meth
        );
        PositionIntent intent = new PositionIntent();

        // Post-deploy wiring
        agent.setAuthorizedContracts(address(profile), address(commitment));
        commitment.addAuthorizedExecutor(address(rebalancer));

        // Optional ownership transfer for ops/multisig control
        if (owner != address(0)) {
            agent.transferOwnership(owner);
            policy.transferOwnership(owner);
            commitment.transferOwnership(owner);
            vault.transferOwnership(owner);
        }

        vm.stopBroadcast();

        d = Deployment({
            aegisAgent: address(agent),
            userRiskProfile: address(profile),
            riskPolicy: address(policy),
            yieldVault: address(vault),
            adviceCommitment: address(commitment),
            autoRebalancer: address(rebalancer),
            positionIntent: address(intent)
        });

        console2.log("AegisAgent:", d.aegisAgent);
        console2.log("UserRiskProfile:", d.userRiskProfile);
        console2.log("RiskPolicy:", d.riskPolicy);
        console2.log("YieldVault:", d.yieldVault);
        console2.log("AdviceCommitment:", d.adviceCommitment);
        console2.log("AutoRebalancer:", d.autoRebalancer);
        console2.log("PositionIntent:", d.positionIntent);
    }

    function _optionalOwner() internal view returns (address) {
        try vm.envAddress("OWNER_ADDRESS") returns (address owner) {
            return owner;
        } catch {
            return address(0);
        }
    }
}
