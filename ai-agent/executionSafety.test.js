const assert =
    require("assert");

// ========================================
// STAGE 12B — EXECUTION SAFETY TESTS
// ========================================

const REQUIRED_CHAIN_ID =
    31337n;

// ========================================
// CHAIN VALIDATION
// ========================================

function verifyChainId(
    chainId
) {

    if (
        chainId !== REQUIRED_CHAIN_ID
    ) {
        throw new Error(
            `EXECUTION SAFETY LOCK: Refusing transaction on chain ${chainId.toString()}. Expected local Hardhat chain ${REQUIRED_CHAIN_ID.toString()}.`
        );
    }

    return true;
}

// ========================================
// INPUT VALIDATION
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
// TEST HELPER
// ========================================

function test(
    name,
    fn
) {

    try {

        fn();

        console.log(
            `✔ ${name}`
        );

    } catch (error) {

        console.error(
            `✘ ${name}`
        );

        throw error;
    }
}

// ========================================
// TEST 1 — LOCAL CHAIN ACCEPTED
// ========================================

test(
    "Local Hardhat chain is accepted",
    () => {

        assert.strictEqual(
            verifyChainId(31337n),
            true
        );
    }
);

// ========================================
// TEST 2 — EXTERNAL CHAIN REJECTED
// ========================================

test(
    "External chain is rejected",
    () => {

        assert.throws(
            () => {
                verifyChainId(1n);
            },
            /EXECUTION SAFETY LOCK/
        );
    }
);

// ========================================
// TEST 3 — INVALID DIRECTION
// ========================================

test(
    "Invalid direction is rejected",
    () => {

        assert.throws(
            () => {

                validateTradeInput({
                    direction: "BUY",
                    entryPrice: 100,
                    exitPrice: 110,
                    positionSize: 10,
                    maxPositionSize: 100
                });

            },
            /Direction must be LONG or SHORT/
        );
    }
);

// ========================================
// TEST 4 — ZERO ENTRY PRICE
// ========================================

test(
    "Zero entry price is rejected",
    () => {

        assert.throws(
            () => {

                validateTradeInput({
                    direction: "LONG",
                    entryPrice: 0,
                    exitPrice: 110,
                    positionSize: 10,
                    maxPositionSize: 100
                });

            },
            /prices must be greater than zero/
        );
    }
);

// ========================================
// TEST 5 — ZERO EXIT PRICE
// ========================================

test(
    "Zero exit price is rejected",
    () => {

        assert.throws(
            () => {

                validateTradeInput({
                    direction: "LONG",
                    entryPrice: 100,
                    exitPrice: 0,
                    positionSize: 10,
                    maxPositionSize: 100
                });

            },
            /prices must be greater than zero/
        );
    }
);

// ========================================
// TEST 6 — ZERO POSITION
// ========================================

test(
    "Zero position size is rejected",
    () => {

        assert.throws(
            () => {

                validateTradeInput({
                    direction: "LONG",
                    entryPrice: 100,
                    exitPrice: 110,
                    positionSize: 0,
                    maxPositionSize: 100
                });

            },
            /Position size must be greater than zero/
        );
    }
);

// ========================================
// TEST 7 — POSITION LIMIT
// ========================================

test(
    "Position above maximum is rejected",
    () => {

        assert.throws(
            () => {

                validateTradeInput({
                    direction: "LONG",
                    entryPrice: 100,
                    exitPrice: 110,
                    positionSize: 101,
                    maxPositionSize: 100
                });

            },
            /exceeds contract maximum/
        );
    }
);

// ========================================
// TEST 8 — VALID LONG
// ========================================

test(
    "Valid LONG execution input is accepted",
    () => {

        assert.strictEqual(
            validateTradeInput({
                direction: "LONG",
                entryPrice: 100,
                exitPrice: 110,
                positionSize: 10,
                maxPositionSize: 100
            }),
            true
        );
    }
);

// ========================================
// TEST 9 — VALID SHORT
// ========================================

test(
    "Valid SHORT execution input is accepted",
    () => {

        assert.strictEqual(
            validateTradeInput({
                direction: "SHORT",
                entryPrice: 100,
                exitPrice: 90,
                positionSize: 10,
                maxPositionSize: 100
            }),
            true
        );
    }
);

// ========================================
// COMPLETE
// ========================================

console.log(
    "\nStage 12B execution safety tests passed."
);