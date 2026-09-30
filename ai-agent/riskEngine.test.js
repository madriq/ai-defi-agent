const assert = require("assert");

const {
    calculateRiskScore,
    determineFinalDecision,
    calculatePositionSize
} = require("./riskEngine");

// ========================================
// RISK ENGINE TESTS
// ========================================

console.log("\n================================");
console.log("🧪 RISK ENGINE UNIT TESTS");
console.log("================================");

// ========================================
// TEST 1 — Risk Score
// ========================================

{
    const score =
        calculateRiskScore(
            120,
            100,
            1,
            30
        );

    assert.strictEqual(
        score,
        60,
        "Expected risk score to be 60"
    );

    console.log("✅ Test 1 — Risk score calculation");
}

// ========================================
// TEST 2 — Bullish LONG
// ========================================

{
    const decision =
        determineFinalDecision(
            "LONG",
            120,
            100,
            1,
            30,
            60
        );

    assert.strictEqual(
        decision.signal,
        "LONG",
        "Expected LONG decision"
    );

    console.log("✅ Test 2 — Bullish LONG confirmation");
}

// ========================================
// TEST 3 — Bullish but AI disagrees
// ========================================

{
    const decision =
        determineFinalDecision(
            "SHORT",
            120,
            100,
            1,
            30,
            60
        );

    assert.strictEqual(
        decision.signal,
        "HOLD",
        "Expected HOLD when AI does not confirm LONG"
    );

    console.log("✅ Test 3 — AI disagreement produces HOLD");
}

// ========================================
// TEST 4 — Bearish SHORT
// ========================================

{
    const decision =
        determineFinalDecision(
            "SHORT",
            80,
            100,
            -1,
            30,
            60
        );

    assert.strictEqual(
        decision.signal,
        "SHORT",
        "Expected SHORT decision"
    );

    console.log("✅ Test 4 — Bearish SHORT confirmation");
}

// ========================================
// TEST 5 — Bearish but AI disagrees
// ========================================

{
    const decision =
        determineFinalDecision(
            "LONG",
            80,
            100,
            -1,
            30,
            60
        );

    assert.strictEqual(
        decision.signal,
        "HOLD",
        "Expected HOLD when AI does not confirm SHORT"
    );

    console.log("✅ Test 5 — Bearish AI disagreement produces HOLD");
}

// ========================================
// TEST 6 — High Risk
// ========================================

{
    const decision =
        determineFinalDecision(
            "LONG",
            120,
            100,
            1,
            80,
            60
        );

    assert.strictEqual(
        decision.signal,
        "HOLD",
        "Expected HOLD at risk level 80"
    );

    console.log("✅ Test 6 — High risk produces HOLD");
}

// ========================================
// TEST 7 — Low Risk Score
// ========================================

{
    const decision =
        determineFinalDecision(
            "LONG",
            120,
            100,
            1,
            30,
            30
        );

    assert.strictEqual(
        decision.signal,
        "HOLD",
        "Expected HOLD below risk score threshold"
    );

    console.log("✅ Test 7 — Low risk score produces HOLD");
}

// ========================================
// TEST 8 — Position Size 10
// ========================================

{
    const positionSize =
        calculatePositionSize(
            100,
            30,
            60,
            "LONG"
        );

    assert.strictEqual(
        positionSize,
        10,
        "Expected position size of 10"
    );

    console.log("✅ Test 8 — High score position size");
}

// ========================================
// TEST 9 — Position Size 5
// ========================================

{
    const positionSize =
        calculatePositionSize(
            100,
            30,
            50,
            "LONG"
        );

    assert.strictEqual(
        positionSize,
        5,
        "Expected position size of 5"
    );

    console.log("✅ Test 9 — Medium score position size");
}

// ========================================
// TEST 10 — HOLD Position Size
// ========================================

{
    const positionSize =
        calculatePositionSize(
            100,
            30,
            60,
            "HOLD"
        );

    assert.strictEqual(
        positionSize,
        0,
        "Expected zero position size for HOLD"
    );

    console.log("✅ Test 10 — HOLD position size is zero");
}

// ========================================
// TEST 11 — Low Risk Score Position Size
// ========================================

{
    const positionSize =
        calculatePositionSize(
            100,
            30,
            30,
            "LONG"
        );

    assert.strictEqual(
        positionSize,
        0,
        "Expected zero position size for low risk score"
    );

    console.log(
        "✅ Test 11 — Low risk score position size is zero"
    );
}

// ========================================
// COMPLETE
// ========================================

console.log("\n================================");
console.log("🎉 ALL RISK ENGINE TESTS PASSED");
console.log("================================");