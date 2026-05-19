include .env

.PHONY: verify

# Change only these two per contract verification
VERIFY_ADDRESS ?= 0xef571ecd58ee26e3c4ca6be8cab6a88abc58a6a7
VERIFY_CONTRACT ?= src/AegisAgent.sol:AegisAgent

# Mantle Sepolia (Etherscan V2)
CHAIN_ID ?= 5003
ETHERSCAN_V2_URL ?= https://api.etherscan.io/v2/api?chainid=$(CHAIN_ID)

verify:
	forge verify-contract \
		$(VERIFY_ADDRESS) \
		$(VERIFY_CONTRACT) \
		--chain-id $(CHAIN_ID) \
		--verifier etherscan \
		--verifier-url "$(ETHERSCAN_V2_URL)" \
		--etherscan-api-key "$(ETHERSCAN_API_KEY)" \
		--watch
