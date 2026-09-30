import { network } from "hardhat";

async function main() {
  const { ethers } = await network.getOrCreate();

  const FlashLoanTrader =
    await ethers.getContractFactory("FlashLoanTrader");

  const trader = await FlashLoanTrader.deploy(100);

  await trader.waitForDeployment();

  const address = await trader.getAddress();

  console.log("🤖 FlashLoanTrader deployed!");
  console.log("📍 Contract address:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});