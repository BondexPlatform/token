import { deployBaseERC20 } from "./fixtures";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { _config, _features, _roles } from "./helpers/structs";

describe("BaseERC20", () => {
    describe("initialize", () => {
        it("sets name and symbol", async () => {
            const { token } = await loadFixture(deployBaseERC20);

            const [deployer] = await ethers.getSigners();

            await token.initialize(
                _config({ decimals: 23 }),
                _features({
                    initialSupply: 1000,
                    initialSupplyHolder: deployer.address,
                }),
                _roles({
                    admin: deployer.address,
                }),
            );

            expect(await token.name()).to.equal("BaseERC20");
            expect(await token.symbol()).to.equal("B20");
            expect(await token.decimals()).to.equal(23);
        });

        it("mints initial supply", async () => {
            const { token } = await loadFixture(deployBaseERC20);

            const [deployer] = await ethers.getSigners();

            await token.initialize(
                _config(),
                _features({
                    initialSupply: 1000,
                    initialSupplyHolder: deployer.address,
                }),
                _roles({ admin: deployer.address }),
            );

            expect(await token.totalSupply()).to.equal(1000);
            expect(await token.balanceOf(deployer.address)).to.equal(1000);
        });

        it("reverts if initial supply is 0 and not mintable", async () => {
            const { token } = await loadFixture(deployBaseERC20);

            const [deployer] = await ethers.getSigners();

            await expect(
                token.initialize(
                    _config(),
                    _features({
                        initialSupply: 0,
                        initialSupplyHolder: deployer.address,
                    }),
                    _roles({
                        admin: deployer.address,
                    }),
                ),
            ).to.be.revertedWithCustomError(token, "BaseERC20ZeroLockedSupply");
        });

        it("reverts if initial supply holder is zero address", async () => {
            const { token } = await loadFixture(deployBaseERC20);

            const [deployer] = await ethers.getSigners();

            await expect(
                token.initialize(
                    _config(),
                    _features({
                        initialSupply: 1000,
                        initialSupplyHolder: ethers.ZeroAddress,
                    }),
                    _roles({
                        admin: deployer.address,
                    }),
                ),
            ).to.be.revertedWithCustomError(
                token,
                "BaseERC20InvalidInitialSupplyHolder",
            );
        });

        it("grants roles if set", async () => {
            const { token } = await loadFixture(deployBaseERC20);

            const [deployer] = await ethers.getSigners();

            await token.initialize(
                _config(),
                _features({
                    initialSupply: 1000,
                    initialSupplyHolder: deployer.address,
                }),
                _roles({
                    admin: deployer.address,
                    upgrader: deployer.address,
                }),
            );

            expect(
                await token.hasRole(
                    await token.DEFAULT_ADMIN_ROLE(),
                    deployer.address,
                ),
            ).to.equal(true);
            expect(
                await token.hasRole(
                    await token.UPGRADER_ROLE(),
                    deployer.address,
                ),
            ).to.equal(true);
        });

        it("reverts if initializer already called", async () => {
            const { token } = await loadFixture(deployBaseERC20);

            const [deployer] = await ethers.getSigners();

            await token.initialize(
                _config(),
                _features({
                    initialSupply: 1000,
                    initialSupplyHolder: deployer.address,
                }),
                _roles({
                    admin: deployer.address,
                }),
            );

            await expect(
                token.initialize(
                    _config(),
                    _features(),
                    _roles({
                        admin: deployer.address,
                    }),
                ),
            ).to.be.revertedWithCustomError(token, "InvalidInitialization");
        });
    });

    describe("upgrade", () => {
        it("reverts if not called by upgrader", async () => {
            const { token } = await loadFixture(deployBaseERC20);

            const [deployer] = await ethers.getSigners();

            await token.initialize(
                _config(),
                _features({
                    initialSupply: 1000,
                    initialSupplyHolder: deployer.address,
                }),
                _roles({
                    admin: deployer.address,
                }),
            );

            await expect(
                token.upgradeToAndCall(deployer.address, "0x"),
            ).to.be.revertedWithCustomError(
                token,
                "AccessControlUnauthorizedAccount",
            );

            await token.grantRole(
                await token.UPGRADER_ROLE(),
                deployer.address,
            );

            const newImpl = await ethers.deployContract("BaseERC20Upgrade");

            await expect(
                token.upgradeToAndCall(await newImpl.getAddress(), "0x"),
            ).to.not.be.reverted;
        });
    });
});
