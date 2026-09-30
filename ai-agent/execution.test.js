const assert = require("assert");

const {
    executeLocalTrade
} = require("./execution");

async function expectError(
    testName,
    operation,
    expectedMessage
) {
    try {
        await operation();

        throw new Error(
            `Expected error was not thrown: ${expectedMessage}`
        );

    } catch (error) {
        assert.strictEqual(
            error.message,
            expectedMessage,
            `${testName}: unexpected error`
        );

        console.log(
            `✅ ${testName}`
        );
    }
}

async function main() {

    console.log("\n================================");
    console.log("🧪 EXECUTION ENGINE TESTS");
    console.log("================================");

    // ========================================
    // TEST 1 — Invalid Direction
    // ========================================

    await expectError(
        "Test 1 — Invalid direction",
        () =>
            executeLocalTrade({
                direction: "INVALID",
                entryPrice: 100,
                exitPrice: 110,
                positionSize: 1
            }),
        "Direction must be LONG or SHORT"
    );

    // ========================================
    // TEST 2 — Zero Entry Price
    // ========================================

    await expectError(
        "Test 2 — Invalid entry price",
        () =>
            executeLocalTrade({
                direction: "LONG",
                entryPrice: 0,
                exitPrice: 110,
                positionSize: 1
            }),
        "Entry and exit prices must be greater than zero"
    );

    // ========================================
    // TEST 3 — Zero Exit Price
    // ========================================

    await expectError(
        "Test 3 — Invalid exit price",
        () =>
            executeLocalTrade({
                direction: "LONG",
                entryPrice: 100,
                exitPrice: 0,
                positionSize: 1
            }),
        "Entry and exit prices must be greater than zero"
    );

    // ========================================
    // TEST 4 — Zero Position Size
    // ========================================

    await expectError(
        "Test 4 — Invalid position size",
        () =>
            executeLocalTrade({
                direction: "LONG",
                entryPrice: 100,
                exitPrice: 110,
                positionSize: 0
            }),
        "Position size must be greater than zero"
    );

    // ========================================
    // TEST 5 — Position Above Contract Limit
    // ========================================

    await expectError(
        "Test 5 — Position exceeds contract maximum",
        () =>
            executeLocalTrade({
                direction: "LONG",
                entryPrice: 100,
                exitPrice: 110,
                positionSize: 101
            }),
        "Position size 101 exceeds contract maximum 100"
    );

    // ========================================
    // TEST 6 — Valid LONG Execution
    // ========================================

    const longResult =
        await executeLocalTrade({
            direction: "LONG",
            entryPrice: 100,
            exitPrice: 110,
            positionSize: 1
        });

    assert.ok(
        longResult.transactionHash,
        "Expected transaction hash"
    );

    assert.ok(
        longResult.blockNumber > 0,
        "Expected confirmed block number"
    );

    console.log(
        "✅ Test 6 — Valid LONG execution"
    );

    // ========================================
    // TEST 7 — Valid SHORT Execution
    // ========================================

    const shortResult =
        await executeLocalTrade({
            direction: "SHORT",
            entryPrice: 110,
            exitPrice: 100,
            positionSize: 1
        });

    assert.ok(
        shortResult.transactionHash,
        "Expected transaction hash"
    );

    assert.ok(
        shortResult.blockNumber >
        longResult.blockNumber,
        "Expected second transaction to be in a later block"
    );

    console.log(
        "✅ Test 7 — Valid SHORT execution"
    );

    // ========================================
    // COMPLETE
    // ========================================

    console.log("\n================================");
    console.log("🎉 ALL EXECUTION TESTS PASSED");
    console.log("================================");
}

main().catch(
    (error) => {
        console.error(
            "\n❌ Execution test failure:"
        );

        console.error(error);

        process.exitCode = 1;
    }
);