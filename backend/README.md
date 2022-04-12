# MaidSafe OMNI-to-ERC20 migration backend

## Setup

### Requirements

* Node v14
* yarn

### Install dependencies
`yarn install`

### Create a Gnosis wallet

### Fill .env

## Running

### Dry Run

Use the `--dryRun` flag to simulate execution without committing any changes

`yarn start-ts mint --token MAID --dryRun`

### Execute

`yarn start-ts mint --token MAID`

### Gnosis Safe Co-signer

This service will automatically sign any transactions that have been submitted to a Gnosis Safe before a specifiable time delay. It uses [OpenZeppelin Relay](https://docs.openzeppelin.com/defender/relay) to manage transaction execution.

Execution:
`yarn start-ts cosign [--dryRun]`

Required environment variables:
COSIGN_DELAY_IN_HOURS=[float]
TOKEN_NETWORK=[mainnet/rinkeby]
SAFE_ADDRESS=
OPENZEPPELIN_RELAYER_API_KEY=
OPENZEPPELIN_RELAYER_API_SECRET=

### Logging

Debug output is logged to [/logs]

## Testing

Only works on Unix-based systems

`yarn test-ts`

or

`yarn build`
`yarn test`


