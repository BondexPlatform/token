// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IBaseERC20 {
    struct ERC20Config {
        string name;
        string symbol;
        uint8 decimals;
    }

    struct Features {
        uint256 initialSupply;
        address initialSupplyHolder;
    }

    struct Roles {
        address admin;
        uint48 adminChangeDelay;
        address upgrader;
    }

    error BaseERC20InvalidInitialSupplyHolder();
    error BaseERC20ZeroLockedSupply();
}
