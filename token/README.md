# MaidSafe ERC20 token

Based on OpenZeppelin Mintable ERC20 token

## Setup

`yarn install`

## Build

`yarn build`

## Deploy

1. Set private key and RPC url in .env
2. Make sure the address has sufficient ETH for gas
3. Check token name and symbol in `scripts/deploy.js`
4. `yarn deploy --network [rinkeby|mainnet]`



# Etherscan verification

```shell
hardhat run --network ropsten scripts/deploy.js
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS "Hello, Hardhat!"

```

# Upgrades

The smart contract is upgradeable, as it is deployed with the [OpenZeppelin proxy upgrade pattern](https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies).

It can be upgraded by the proxy admin address, set during deployment.

## Executing an upgrade

1. Set configuration in (`scripts/prepare-upgrade.js`)
2. Run `yarn prepare-upgrade`. This will deploy a new implementation of the smart contract, however this does not activate the upgrade, as the proxy is still pointing to the old implementation
3. To finalize the upgrade, use the ABI-encoded transaction output by the `prepare-upgrade` script in Gnosis safe to switch the proxy to the new implementation

# Other Scripts

Other scripts are provided for convenience. Configuration is done by changing variables in the script file. Output is ABI-encoded transaction data to be used in Gnosis Safe.

Exevute scripts with  `yarn scripts scripts/{script-filename}`

## Scripts

* (scripts/prepare-mint.js)
* (scripts/prepare-pause.js)
* (scripts/prepare-unpause.js)
* (scripts/prepare-grant-role.js)
* (scripts/prepare-revoke-role.js)