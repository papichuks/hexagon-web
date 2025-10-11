# Hexagon Smart Contract

This folder contains the Solidity smart contract code for Hexagon. The smart contract is deployed on the Hedera Blockchain and provides functionalities for secure drug authentication.

## Cloning the Repo

Open up your terminal (or command prompt) and navigate to a directory you would like to store this code on. Once there type in the following command:

```
git clone https://github.com/hexdee/hexagon.git
cd hexagon/contract
npm install
```

## Get a Private Key

You can get a private key from a wallet provider [such as Metamask](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key).

## Add your Private Key as an Environment Variable

Add your private key as an environment variable by running this command:

```
export PRIVATE_KEY='abcdef'
```

If you use a .env file, don't commit and push any changes to .env files that may contain sensitive information, such as a private key! If this information reaches a public GitHub repository, someone can use it to check if you have any Mainnet funds in that wallet address, and steal them!

## Fund the Deployer Address

Go to the [Hedera faucet](https://portal.hedera.com/faucet), and paste in your Hedera EVM address from the previous step. This will send some calibration testnet FIL to the account.

## Run tests

```
npx hardhat test
```

## Deploy the Contracts

Type in the following command in the terminal to deploy the smart contract:

```
npx hardhat run scripts/deploy.js
```
