# ERC20 token

This repo is home to an upgradeable ERC20 token implemented using OpenZeppelin's v5 contracts. It user Namespaced Storage Layout for safer storage during upgrades.

Features: 
- ERC20 standard
- Permit
- Burnable
- fixed supply
  - mints an initial supply to a specified holder on initialization
- Upgradeable
  - leverages AccessControl to permit those with the UPGRADER_ROLE to upgrade the contract

## Running tests

After cloning this repo, run the following commands to install dependencies and run tests:

```bash
npm install
npm run test
```

## Deploying

Deployment can be done using the available hardhat tasks. The tasks use the `settings` specified in `./settings/[network]/settings.json` to generate the contract configuration.

See [./settings/sepolia/settings.json](./settings/sepolia/settings.json) for an example of the settings file.

To deploy to another network, a new directory matching the name of the network (e.g. "mainnet" for Ethereum Mainnet; the network name must be the same as the one in hardhat.config.ts) must be created inside the `settings` directory and a `settings.json` file must be created inside it. 

Once the settings file exists, you can run the following command to deploy the token:
```bash
npx hardhat deploy token --network mainnet
```

Once the script execution is complete, the resulting contract address will be saved to a file named `addresses.json` inside the network directory in settings.
