import { scope } from "hardhat/config";
import { eX } from "../test/helpers/scale";
import { Settings } from "deploy-settings-manager";
import { ethers } from "ethers";
import { IBaseERC20 } from "../typechain-types/contracts/BaseERC20";

const deployScope = scope("deploy", "Deploy contracts");

deployScope
    .task("implementations", "Deploy implementations")
    .addVariadicPositionalParam(
        "contracts",
        "Name of contracts to deploy implementation for",
        [],
    )
    .addFlag("dry", "Do not deploy")
    .setAction(async (taskArgs: { contracts: string[]; dry: boolean }, hre) => {
        await hre.run("compile", { quiet: true });

        if (taskArgs.dry) {
            console.log(
                `Want to deploy ${taskArgs.contracts.join(
                    ", ",
                )} but "dry" is enabled`,
            );
            return;
        }

        const implementations = new Settings("implementations");

        for (const contract of taskArgs.contracts) {
            console.log(`Deploying implementation for contract: ${contract}`);

            const ctrFactory = await hre.ethers.getContractFactory(contract);
            const tx = (await hre.upgrades.deployImplementation(ctrFactory, {
                getTxResponse: true,
            })) as ethers.TransactionResponse;

            const receipt = await tx.wait();
            if (receipt != null) {
                console.log(
                    `implementation:${contract} deployed to: ${receipt.contractAddress}.Gas used: ${receipt.gasUsed}`,
                );
                implementations.set(contract, receipt.contractAddress!);
            } else {
                console.log("Could not get receipt");
            }
        }
    });

deployScope
    .task("token", "Deploy the BaseERC20 contract")
    .addFlag("dry", "Just print config and exit")
    .setAction(async (args: { dry: boolean }, hre) => {
        await hre.run(
            {
                scope: "deploy",
                task: "implementations",
            },
            {
                contracts: ["BaseERC20"],
                dry: args.dry,
            },
        );

        const settings = new Settings();

        const decimals = settings.mustGet("decimals");

        let initialSupply = BigInt(settings.mustGet("initialSupply"));
        if (initialSupply / eX(1, decimals) === 0n) {
            initialSupply = eX(Number(initialSupply), decimals);
        }

        // @ts-ignore
        BigInt.prototype.toJSON = function () {
            return this.toString();
        };

        let delay = settings.get("adminChangeDelaySeconds");
        if (!delay) {
            delay = 0;
        }

        const params = [
            <IBaseERC20.ERC20ConfigStruct>{
                name: settings.mustGet("name"),
                symbol: settings.mustGet("symbol"),
                decimals: decimals,
            },
            <IBaseERC20.FeaturesStruct>{
                initialSupply: initialSupply,
                initialSupplyHolder: settings.mustGet("initialSupplyHolder"),
            },
            <IBaseERC20.RolesStruct>{
                admin: settings.mustGet("admin"),
                adminChangeDelay: delay,
                upgrader: settings.mustGet("upgrader"),
            },
        ];
        console.log(
            `Deploying token (proxy) with settings:\n${JSON.stringify(params, null, 4)}`,
        );

        if (args.dry) {
            return;
        }

        const BaseERC20Factory =
            await hre.ethers.getContractFactory("BaseERC20");
        const ctr = await hre.upgrades.deployProxy(BaseERC20Factory, params);

        await ctr.waitForDeployment();

        const addr = await ctr.getAddress();

        new Settings("addresses").set("token", addr);

        console.log(`Token (proxy) deployed to: ${addr}`);
    });
