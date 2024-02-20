import { IBaseERC20 } from "../../typechain-types/contracts/BaseERC20";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

export function _config(
    cfg: Partial<IBaseERC20.ERC20ConfigStruct> = {},
): IBaseERC20.ERC20ConfigStruct {
    return {
        name: "BaseERC20",
        symbol: "B20",
        decimals: 18,
        ...cfg,
    };
}

export function _features(
    cfg: Partial<IBaseERC20.FeaturesStruct> = {},
): IBaseERC20.FeaturesStruct {
    return {
        initialSupply: 0,
        initialSupplyHolder: ethers.ZeroAddress,
        ...cfg,
    };
}

export function _roles(
    cfg: Partial<IBaseERC20.RolesStruct> = {},
): IBaseERC20.RolesStruct {
    return {
        admin: ethers.ZeroAddress,
        adminChangeDelay: time.duration.days(3),
        upgrader: ethers.ZeroAddress,
        ...cfg,
    };
}
