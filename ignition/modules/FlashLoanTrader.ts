import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FlashLoanTraderModule = buildModule(
  "FlashLoanTraderModule",
  (m) => {
    const flashLoanTrader = m.contract(
      "FlashLoanTrader",
      [100]
    );

    return {
      flashLoanTrader,
    };
  }
);

export default FlashLoanTraderModule;