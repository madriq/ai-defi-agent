 require("dotenv").config();

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const { fetchMarketData, getTestMarketData } = require("./marketData");
const { askAI } = require("./aiEngine");
const { executeLocalTrade } = require("./execution");
const { evaluateDecision } = require("./decisionEngine");
const { writeAuditLog } = require("./auditLogger");
const { runHealthCheck } = require("./health-check");

console.log(
    "ðŸ¤– AI DeFi Agent â€” LIVE MARKET RISK ENGINE"
);

// ========================================
// CONFIGURATION
// ========================================

const {
    RPC_URL,
    CONTRACT_ADDRESS
} = require("./config");

// Stage 16 — local deterministic market-data test switch
const USE_LOCAL_TEST_DATA = process.env.USE_LOCAL_TEST_DATA !== "false";

// ========================================
// STAGE 10 â€” LOCAL CHAIN SAFETY LOCK
// ========================================

const REQUIRED_CHAIN_ID = 31337n;

async function verifyLocalChain() {

    const network =
        await provider.getNetwork();

    console.log(
        "\nðŸ”’ LOCAL CHAIN SAFETY CHECK"
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
            `SAFETY LOCK: Refusing execution on chain ${network.chainId.toString()}. Expected local Hardhat chain ${REQUIRED_CHAIN_ID.toString()}.`
        );
    }

    console.log(
        "âœ… Local Hardhat chain verified"
    );
}

const provider =
    new ethers.JsonRpcProvider(
        RPC_URL
    );

const artifactPath =
    path.join(
        __dirname,
        "..",
        "artifacts",
        "contracts",
        "FlashLoanTrader.sol",
        "FlashLoanTrader.json"
    );

const artifact =
    JSON.parse(
        fs.readFileSync(
            artifactPath,
            "utf8"
        )
    );

const trader =
    new ethers.Contract(
        CONTRACT_ADDRESS,
        artifact.abi,
        provider
    );

// ========================================
// LIVE MARKET ANALYSIS
// ========================================

async function runLiveMarketAnalysis() {

    console.log(
        "\n================================"
    );

    console.log(
        "ðŸŒ LIVE MARKET DATA"
    );

    console.log(
        "================================"
    );

    let market;

    try {
        market =
            USE_LOCAL_TEST_DATA
                ? getTestMarketData()
                : await fetchMarketData();
    } catch (error) {
        writeAuditLog({
            event: "AGENT_ERROR",
            stage: "MARKET_DATA",
            errorName: error.name || "Error",
            errorMessage: error.message || String(error),
            chainId: REQUIRED_CHAIN_ID.toString(),
            contractAddress: CONTRACT_ADDRESS,
            dryRun: true
        });

        throw error;
    }

    console.log(
        "Asset:",
        market.asset
    );

    console.log(
        "Current Price: $",
        market.currentPrice
    );

    console.log(
        "Timestamp:",
        market.timestamp
    );

    // ========================================
    // ANALYSIS PARAMETERS
    // ========================================

    const entryPrice =
        market.currentPrice * 0.98;

    const marketTrend = 1;

    const riskLevel = 30;

    console.log(
        "\nðŸ“Š ANALYSIS INPUTS"
    );

    console.log(
        "Entry Price: $",
        entryPrice.toFixed(2)
    );

    console.log(
        "Market Trend:",
        marketTrend > 0
            ? "BULLISH"
            : marketTrend < 0
                ? "BEARISH"
                : "NEUTRAL"
    );

    console.log(
        "Risk Level:",
        riskLevel,
        "/ 100"
    );

    // ========================================
    // AI ANALYSIS
    // ========================================

    const ai =
        await askAI(
            market.currentPrice,
            entryPrice,
            marketTrend,
            riskLevel
        );

    console.log(
        "\nðŸ¤– AI Signal:",
        ai.signal
    );

    console.log(
        "ðŸ’¬ AI Reason:",
        ai.reason
    );

    // ========================================
    // DECISION ENGINE
    // ========================================

    const maxPositionSize =
        await trader.maxPositionSize();

    const decisionResult =
        evaluateDecision({
            currentPrice:
                market.currentPrice,

            entryPrice,

            marketTrend,

            riskLevel,

            aiSignal:
                ai.signal,

            maxPositionSize
        });

    const riskScore =
        decisionResult.riskScore;

    const decision = {
        signal:
            decisionResult.signal,

        reason:
            decisionResult.reason
    };

    const positionSize =
        decisionResult.positionSize;

    console.log(
        "\nðŸ›¡ï¸ Deterministic Risk Score:",
        riskScore,
        "/ 70"
    );

    console.log(
        "ðŸŽ¯ FINAL SIGNAL:",
        decision.signal
    );

    console.log(
        "ðŸ“‹ Decision:",
        decision.reason
    );

    console.log(
        "ðŸ“ Position Size:",
        positionSize
    );

    // ========================================
    // STAGE 15 — STRUCTURED AUDIT LOG
    // ========================================

    writeAuditLog({
        event: "AI_DECISION",
        stage: "DECISION_ENGINE",
        asset: market.asset,
        currentPrice: market.currentPrice,
        entryPrice,
        marketTrend,
        riskLevel,
        aiSignal: ai.signal,
        aiReason: ai.reason,
        riskScore,
        finalSignal: decision.signal,
        decisionReason: decision.reason,
        positionSize,
        dryRun: true,
        chainId: REQUIRED_CHAIN_ID.toString(),
        contractAddress: CONTRACT_ADDRESS
    });
    // SAFETY CHECKS
    // ========================================

    if (
        decision.signal === "HOLD"
    ) {

        console.log(
            "â¸ï¸ HOLD"
        );

        console.log(
            "ðŸš« No blockchain transaction"
        );

        return;
    }

    if (
        positionSize <= 0
    ) {

        console.log(
            "ðŸ›‘ Position size is zero"
        );

        console.log(
            "ðŸš« No blockchain transaction"
        );

        return;
    }

    // ========================================
    // STAGE 5D â€” CONTROLLED ON-CHAIN EXECUTION
    // ========================================

     const DRY_RUN = process.env.DRY_RUN !== "false";

    if (DRY_RUN) {

        console.log(
            `ðŸ§ª DRY RUN: Would execute ${decision.signal}`
        );

        console.log(
            "ðŸš« Blockchain transaction NOT sent"
        );

        return;
    }

    // ========================================
    // LOCAL DEMO EXIT PRICE
    // ========================================

    const entryPriceOnChain =
        Math.floor(
            market.currentPrice
        );

    const exitPrice =
        decision.signal === "LONG"
            ? Math.floor(
                market.currentPrice * 1.01
            )
            : Math.floor(
                market.currentPrice * 0.99
            );

    console.log(
        "\nâ›“ï¸ EXECUTING LOCAL BLOCKCHAIN TRADE"
    );

    console.log(
        "Direction:",
        decision.signal
    );

    console.log(
        "Entry Price:",
        entryPriceOnChain
    );

    console.log(
        "Exit Price:",
        exitPrice
    );

    console.log(
        "Position Size:",
        positionSize
    );

    // ========================================
    // EXECUTE LOCAL TRADE
    // ========================================

    const result =
        await executeLocalTrade({
            direction:
                decision.signal,

            entryPrice:
                entryPriceOnChain,

            exitPrice:
                exitPrice,

            positionSize
        });

    console.log(
        "Transaction confirmed in block:",
        result.blockNumber
    );

    // ========================================
    // EXECUTION RESULT
    // ========================================

    console.log(
        "\nExecution result"
    );

    console.log(
        "Transaction:",
        result.transactionHash
    );

    console.log(
        "Total Loans:",
        result.totalLoans
    );

    console.log(
        "Total Profit/Loss:",
        result.totalProfitLoss
    );
}

// ========================================
// MAIN
// ========================================

  async function main() {

    const health = await runHealthCheck();

    console.log(
        "\n🏥 AGENT HEALTH CHECK:",
        health.status
    );

    if (health.status !== "HEALTHY") {
        writeAuditLog({
            event: "AGENT_ERROR",
            stage: "HEALTH_CHECK",
            errorName: "HealthCheckFailed",
            errorMessage: "Agent startup health check failed",
            chainId: REQUIRED_CHAIN_ID.toString(),
            contractAddress: CONTRACT_ADDRESS,
            dryRun: true,
            health
        });

        throw new Error(
            "Agent startup health check failed"
        );
    }

    await verifyLocalChain();

    console.log(
        "📜 Contract:",
        CONTRACT_ADDRESS
    );

    const maxPositionSize =
        await trader.maxPositionSize();

    console.log(
        "📏 Max position size:",
        maxPositionSize.toString()
    );

    console.log(
        "\n🧪 LIVE MARKET ANALYSIS TEST"
    );

    await runLiveMarketAnalysis();

    console.log(
        "\n================================"
    );

    console.log(
        "✅ LIVE MARKET TEST COMPLETE"
    );

    console.log(
        "🔒 Local blockchain execution pipeline completed safely."
    );
}

// ========================================
// ERROR HANDLING
// ========================================

main().catch(
    (error) => {

        console.error(
            "\nâŒ Agent error:",
            error
        );

        process.exitCode = 1;
    }
);








