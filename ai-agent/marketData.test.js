const assert =
    require("assert");

const {
    parseMarketData
} = require("./marketData");

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
// TEST 1 — VALID PRICE
// ========================================

test(
    "Valid Bitcoin price is accepted",
    () => {

        const result =
            parseMarketData({
                bitcoin: {
                    usd: 85000
                }
            });

        assert.strictEqual(
            result.asset,
            "BTC"
        );

        assert.strictEqual(
            result.currentPrice,
            85000
        );

        assert.ok(
            result.timestamp
        );
    }
);

// ========================================
// TEST 2 — DECIMAL PRICE
// ========================================

test(
    "Decimal Bitcoin price is accepted",
    () => {

        const result =
            parseMarketData({
                bitcoin: {
                    usd: 83995.25
                }
            });

        assert.strictEqual(
            result.currentPrice,
            83995.25
        );
    }
);

// ========================================
// TEST 3 — MISSING BITCOIN
// ========================================

test(
    "Missing Bitcoin data is rejected",
    () => {

        assert.throws(
            () => {
                parseMarketData({});
            },
            /Bitcoin price not found/
        );
    }
);

// ========================================
// TEST 4 — MISSING USD PRICE
// ========================================

test(
    "Missing USD price is rejected",
    () => {

        assert.throws(
            () => {
                parseMarketData({
                    bitcoin: {}
                });
            },
            /Bitcoin price not found/
        );
    }
);

// ========================================
// TEST 5 — ZERO PRICE
// ========================================

test(
    "Zero Bitcoin price is rejected",
    () => {

        assert.throws(
            () => {
                parseMarketData({
                    bitcoin: {
                        usd: 0
                    }
                });
            },
            /valid positive number/
        );
    }
);

// ========================================
// TEST 6 — NEGATIVE PRICE
// ========================================

test(
    "Negative Bitcoin price is rejected",
    () => {

        assert.throws(
            () => {
                parseMarketData({
                    bitcoin: {
                        usd: -100
                    }
                });
            },
            /valid positive number/
        );
    }
);

// ========================================
// TEST 7 — INVALID STRING
// ========================================

test(
    "Invalid price string is rejected",
    () => {

        assert.throws(
            () => {
                parseMarketData({
                    bitcoin: {
                        usd: "not-a-price"
                    }
                });
            },
            /valid positive number/
        );
    }
);

// ========================================
// TEST 8 — NULL PRICE
// ========================================

test(
    "Null price is rejected",
    () => {

        assert.throws(
            () => {
                parseMarketData({
                    bitcoin: {
                        usd: null
                    }
                });
            },
            /Bitcoin price not found/
        );
    }
);

// ========================================
// TEST 9 — INFINITY
// ========================================

test(
    "Infinite price is rejected",
    () => {

        assert.throws(
            () => {
                parseMarketData({
                    bitcoin: {
                        usd: Infinity
                    }
                });
            },
            /valid positive number/
        );
    }
);

// ========================================
// COMPLETE
// ========================================

console.log(
    "\nStage 11B market data safety tests passed."
);	