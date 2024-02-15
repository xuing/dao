import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import "hardhat-deploy";
import { parseVestingAddresses } from "../utils/utils";
import { YEAR, HOURS, MINUTES } from "../utils/time";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  console.log("\nDeploying Investors Vesting #1...");
  const deployer = (await ethers.getSigners())[0].address;

  const { accounts, amounts, totalAmount } =
    await parseVestingAddresses("./teamVesting.csv");

  const token = await hre.deployments.get("FluenceToken");

  const deployResult = await hre.deployments.deploy("TeamVesting", {
    from: deployer,
    contract: "VestingWithVoting",
    args: [
      token.address,
      "Fluence Investors Vesting #1",
      "IVFLT#1",
      10 * MINUTES,
      1 * HOURS,
      accounts,
      amounts,
    ],
    waitConfirmations: 1,
  });

  console.log(`Team Vesting deployed to ${deployResult.address}\n`);

  await hre.deployments.execute(
    "FluenceToken",
    { from: deployer, log: true },
    "transfer",
    deployResult.address,
    totalAmount
  );
};

export default func;
func.tags = ["TeamVesting"];
func.dependencies = ["FluenceToken"];
