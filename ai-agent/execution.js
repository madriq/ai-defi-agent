const { ethers } = require("ethers");

require("dotenv").config();

 const {
    RPC_URL,
    CONTRACT_ADDRESS
} = require("./config");

const PRIVATE_KEY =
    process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
    throw new Error(
        "PRIVATE_KEY is not configured. Set it in .env for local testing."
    );
}

// ========================================
// STAGE 12 — EXECUTION SAFETY
// ========================================

const REQUIRED_CHAIN_ID =
    31337n;

// ========================================
// PROVIDER & WALLET
// ========================================

const provider =
    new ethers.JsonRpcProvider(
        RPC_URL
    );

const baseWallet =
    new ethers.Wallet(
        PRIVATE_KEY,
        provider
    );

const wallet =
    new ethers.NonceManager(
        baseWallet
    );

// ========================================
// CONTRACT ABI
// ========================================

const ABI = [
    "function maxPositionSize() view returns (uint256)",
    "function simulateTrade(string,uint256,uint256,uint256)",
    "function getStats() view returns (uint256,int256)"
];

const trader =
    new ethers.Contract(
        CONTRACT_ADDRESS,
        ABI,
        wallet
    );

// ========================================
// CHAIN SAFETY
// ========================================

async function verifyExecutionChain() {

    const network =
        await provider.getNetwork();

    console.log(
        "\n🔒 EXECUTION CHAIN SAFETY CHECK"
    );

    console.log(
        "Connected chain ID:",
        network.chainId.toString()
    );

    console.log(
        "Required chain ID:",
        REQUIRED_CHAIN_ID.toString()
    );

    if (
        network.chainId !== REQUIRED_CHAIN_ID
    ) {
        throw new Error(
            `EXECUTION SAFETY LOCK: Refusing transaction on chain ${network.chainId.toString()}. Expected local Hardhat chain ${REQUIRED_CHAIN_ID.toString()}.`
        );
    }

    console.log(
        "✅ Execution restricted to local Hardhat chain"
    );

    return true;
}

// ========================================
// TRADE INPUT VALIDATION
// ========================================

function validateTradeInput({
    direction,
    entryPrice,
    exitPrice,
    positionSize,
    maxPositionSize
}) {

    if (
        direction !== "LONG" &&
        direction !== "SHORT"
    ) {
        throw new Error(
            "Direction must be LONG or SHORT"
        );
    }

    if (
        entryPrice <= 0 ||
        exitPrice <= 0
    ) {
        throw new Error(
            "Entry and exit prices must be greater than zero"
        );
    }

    if (
        positionSize <= 0
    ) {
        throw new Error(
            "Position size must be greater than zero"
        );
    }

    if (
        BigInt(positionSize) >
        BigInt(maxPositionSize)
    ) {
        throw new Error(
            `Position size ${positionSize} exceeds contract maximum ${maxPositionSize}`
        );
    }

    return true;
}

// ========================================
// LOCAL TRADE EXECUTION
// ========================================

async function executeLocalTrade({
    direction,
    entryPrice,
    exitPrice,
    positionSize
}) {

    // ========================================
    // CHAIN SAFETY
    // ========================================

    await verifyExecutionChain();

    // ========================================
    // CONTRACT POSITION LIMIT
    // ========================================

    const maxPositionSize =
        await trader.maxPositionSize();

    // ========================================
    // INPUT VALIDATION
    // ========================================

    validateTradeInput({
        direction,
        entryPrice,
        exitPrice,
        positionSize,
        maxPositionSize
    });

    // ========================================
    // EXECUTION LOG
    // ========================================

    console.log(
        "\n⛓️ LOCAL EXECUTION"
    );

    console.log(
        "Direction:",
        direction
    );

    console.log(
        "Entry Price:",
        entryPrice
    );

    console.log(
        "Exit Price:",
        exitPrice
    );

    console.log(
        "Position Size:",
        positionSize
    );

    console.log(
        "Maximum Position Size:",
        maxPositionSize.toString()
    );

    // ========================================
    // LOCAL SIMULATED TRADE
    // ========================================

    const tx =
        await trader.simulateTrade(
            direction,
            entryPrice,
            exitPrice,
            positionSize
        );

    console.log(
        "📤 Transaction:",
        tx.hash
    );

    const receipt =
        await tx.wait();

    // ========================================
    // UPDATED CONTRACT STATS
    // ========================================

    const stats =
        await trader.getStats();

    return {
        transactionHash:
            tx.hash,

        blockNumber:
            receipt.blockNumber,

        totalLoans:
            stats[0].toString(),

        totalProfitLoss:
            stats[1].toString()
    };
}

// ========================================
// EXPORTS
// ========================================

module.exports = {
    executeLocalTrade,
    verifyExecutionChain,
    validateTradeInput
};