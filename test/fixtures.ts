import { ethers, upgrades } from "hardhat";
import { BaseERC20 } from "../typechain-types";

export async function deployBaseERC20() {
    const Factory = await ethers.getContractFactory("BaseERC20");
    const token = (await upgrades.deployProxy(Factory, [], {
        initializer: false,
    })) as unknown as BaseERC20;

    return { token };
}
