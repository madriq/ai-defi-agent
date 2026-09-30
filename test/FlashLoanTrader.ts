import { expect } from "chai";
import { network } from "hardhat";

describe("FlashLoanTrader", function () {
  const INITIAL_MAX_POSITION_SIZE = 100;

  async function deployTrader(maxPositionSize = INITIAL_MAX_POSITION_SIZE) {
    const { ethers } = await network.getOrCreate();
    const [owner, otherAccount] = await ethers.getSigners();

    const FlashLoanTrader =
      await ethers.getContractFactory("FlashLoanTrader");

    const trader = await FlashLoanTrader.deploy(maxPositionSize);

    await trader.waitForDeployment();

    return { trader, owner, otherAccount };
  }

  it("should calculate LONG profit", async function () {
    const { trader } = await deployTrader();

    await trader.simulateTrade("LONG", 2000, 2500, 2);

    const [, profitLoss] = await trader.getStats();

    expect(profitLoss).to.equal(1000);
  });

  it("should calculate LONG loss", async function () {
    const { trader } = await deployTrader();

    await trader.simulateTrade("LONG", 2000, 1500, 2);

    const [, profitLoss] = await trader.getStats();

    expect(profitLoss).to.equal(-1000);
  });

  it("should calculate SHORT profit", async function () {
    const { trader } = await deployTrader();

    await trader.simulateTrade("SHORT", 2000, 1500, 2);

    const [, profitLoss] = await trader.getStats();

    expect(profitLoss).to.equal(1000);
  });

  it("should reject an invalid direction", async function () {
    const { trader } = await deployTrader();

    await expect(
      trader.simulateTrade("INVALID", 2000, 2500, 2)
    ).to.be.revertedWith("Direction must be LONG or SHORT");
  });

  it("should detect LONG liquidation", async function () {
    const { trader } = await deployTrader();

    const liquidated = await trader.checkLiquidation(
      "LONG",
      1500,
      1600
    );

    expect(liquidated).to.equal(true);
  });

  it("should detect when LONG is safe", async function () {
    const { trader } = await deployTrader();

    const liquidated = await trader.checkLiquidation(
      "LONG",
      1800,
      1600
    );

    expect(liquidated).to.equal(false);
  });

  it("should detect SHORT liquidation", async function () {
    const { trader } = await deployTrader();

    const liquidated = await trader.checkLiquidation(
      "SHORT",
      2500,
      2400
    );

    expect(liquidated).to.equal(true);
  });

  it("should detect when SHORT is safe", async function () {
    const { trader } = await deployTrader();

    const liquidated = await trader.checkLiquidation(
      "SHORT",
      2200,
      2400
    );

    expect(liquidated).to.equal(false);
  });

  it("should initialize the owner and position limit", async function () {
    const { trader, owner } = await deployTrader(25);

    expect(await trader.owner()).to.equal(owner.address);
    expect(await trader.maxPositionSize()).to.equal(25);
    expect(await trader.tradingPaused()).to.equal(false);
  });

  it("should reject a zero initial position limit", async function () {
    const { ethers } = await network.getOrCreate();
    const FlashLoanTrader =
      await ethers.getContractFactory("FlashLoanTrader");

    await expect(FlashLoanTrader.deploy(0)).to.be.revertedWith(
      "Max position size must be greater than zero"
    );
  });

  it("should let only the owner pause trading", async function () {
    const { trader, otherAccount } = await deployTrader();

    await expect(
      trader.connect(otherAccount).setTradingPaused(true)
    ).to.be.revertedWith("Only owner can call this function");
  });

  it("should prevent trades while paused and allow them after unpausing", async function () {
    const { trader } = await deployTrader();

    await trader.setTradingPaused(true);

    await expect(
      trader.simulateTrade("LONG", 2_000, 2_500, 2)
    ).to.be.revertedWith("Trading is paused");

    await trader.setTradingPaused(false);
    await trader.simulateTrade("LONG", 2_000, 2_500, 2);

    const [, profitLoss] = await trader.getStats();
    expect(profitLoss).to.equal(1_000);
  });

  it("should enforce the maximum position size", async function () {
    const { trader } = await deployTrader(2);

    await expect(
      trader.simulateTrade("LONG", 2_000, 2_500, 3)
    ).to.be.revertedWith(
      "Position size exceeds the allowed maximum"
    );
  });

  it("should allow the owner to update the position limit", async function () {
    const { trader } = await deployTrader(2);

    await expect(trader.setMaxPositionSize(5))
      .to.emit(trader, "MaxPositionSizeUpdated")
      .withArgs(2, 5);

    await trader.simulateTrade("LONG", 2_000, 2_500, 5);

    expect(await trader.maxPositionSize()).to.equal(5);
  });

  it("should reject a zero position limit update", async function () {
    const { trader } = await deployTrader();

    await expect(
      trader.setMaxPositionSize(0)
    ).to.be.revertedWith(
      "Max position size must be greater than zero"
    );
  });

  it("should transfer ownership only to a valid new owner", async function () {
    const { trader, owner, otherAccount } = await deployTrader();

    await expect(
      trader.transferOwnership(otherAccount.address)
    )
      .to.emit(trader, "OwnershipTransferred")
      .withArgs(owner.address, otherAccount.address);

    expect(await trader.owner()).to.equal(otherAccount.address);

    await expect(
      trader.setTradingPaused(true)
    ).to.be.revertedWith(
      "Only owner can call this function"
    );
  });

  // Position size and leverage tests

  it("should calculate position size with 1x leverage", async function () {
    const { trader } = await deployTrader();

    const positionSize =
      await trader.calculatePositionSize(1000, 1);

    expect(positionSize).to.equal(1000);
  });

  it("should calculate position size with 5x leverage", async function () {
    const { trader } = await deployTrader();

    const positionSize =
      await trader.calculatePositionSize(1000, 5);

    expect(positionSize).to.equal(5000);
  });

  it("should allow the maximum 10x leverage", async function () {
    const { trader } = await deployTrader();

    const positionSize =
      await trader.calculatePositionSize(1000, 10);

    expect(positionSize).to.equal(10000);
  });

  it("should reject leverage above 10x", async function () {
    const { trader } = await deployTrader();

    await expect(
      trader.calculatePositionSize(1000, 11)
    ).to.be.revertedWith(
      "Leverage exceeds maximum"
    );
  });

  it("should reject zero capital", async function () {
    const { trader } = await deployTrader();

    await expect(
      trader.calculatePositionSize(0, 5)
    ).to.be.revertedWith(
      "Capital must be greater than zero"
    );
  });

  it("should reject zero leverage", async function () {
    const { trader } = await deployTrader();

    await expect(
      trader.calculatePositionSize(1000, 0)
    ).to.be.revertedWith(
      "Leverage must be greater than zero"
    );
  });

  // AI trading signal tests

  it("should return LONG for a positive market trend", async function () {
    const { trader } = await deployTrader();

    const signal = await trader.getTradingSignal(
      2500,
      2000,
      1,
      30
    );

    expect(signal).to.equal("LONG");
  });

  it("should return SHORT for a negative market trend", async function () {
    const { trader } = await deployTrader();

    const signal = await trader.getTradingSignal(
      1500,
      2000,
      -1,
      30
    );

    expect(signal).to.equal("SHORT");
  });

  it("should return HOLD when there is no clear signal", async function () {
    const { trader } = await deployTrader();

    const signal = await trader.getTradingSignal(
      2000,
      2000,
      0,
      30
    );

    expect(signal).to.equal("HOLD");
  });

  it("should return HOLD when risk is too high", async function () {
    const { trader } = await deployTrader();

    const signal = await trader.getTradingSignal(
      2500,
      2000,
      1,
      80
    );

    expect(signal).to.equal("HOLD");
  });
});