// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PositionIntent {
    struct Intent {
        address authority;
        uint256 nonce;
        address tokenAsset;
        uint8 side; // 0 = deposit, 1 = withdraw
        uint256 amountWei;
        uint16 expectedSlippageBps;
        uint64 createdAt;
    }

    mapping(address => mapping(uint256 => Intent)) public intents;
    mapping(address => uint256[]) public userNonces;

    event IntentRecorded(
        address indexed authority, uint256 indexed nonce, address tokenAsset, uint8 side
    );

    function record(
        uint256 nonce,
        address tokenAsset,
        uint8 side,
        uint256 amountWei,
        uint16 expectedSlippageBps
    ) external {
        require(intents[msg.sender][nonce].createdAt == 0, "Nonce used");
        require(side <= 1, "Invalid side");
        require(expectedSlippageBps <= 10_000, "Invalid slippage");

        intents[msg.sender][nonce] = Intent({
            authority: msg.sender,
            nonce: nonce,
            tokenAsset: tokenAsset,
            side: side,
            amountWei: amountWei,
            expectedSlippageBps: expectedSlippageBps,
            createdAt: uint64(block.timestamp)
        });

        userNonces[msg.sender].push(nonce);
        emit IntentRecorded(msg.sender, nonce, tokenAsset, side);
    }

    function getUserIntents(address user) external view returns (uint256[] memory) {
        return userNonces[user];
    }
}
