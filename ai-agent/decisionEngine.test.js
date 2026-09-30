const {
    evaluateDecision
} = require("./decisionEngine");

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(
            `${message}: expected ${expected}, got ${actual}`
        );
    }
}

function test(name, fn) {
    try {
        fn();
        console.log(`✔ ${name}`);
    } catch (error) {
        console.error(`✘ ${name}`);
        throw error;
    }
}

// Test 1: Bullish AI LONG should produce LONG
test("Bullish LONG decision", () => {
    const result = evaluateDecision({
        currentPrice: 110,
        entryPrice: 100,
        marketTrend: 1,
        riskLevel: 30,
        aiSignal: "LONG",
        maxPositionSize: 100
    });

    assertEqual(result.riskScore, 60, "Risk score");
    assertEqual(result.signal, "LONG", "Signal");
    assertEqual(result.positionSize, 10, "Position size");
});

// Test 2: Bullish market but AI disagrees
test("Bullish AI disagreement produces HOLD", () => {
    const result = evaluateDecision({
        currentPrice: 110,
        entryPrice: 100,
        marketTrend: 1,
        riskLevel: 30,
        aiSignal: "SHORT",
        maxPositionSize: 100
    });

    assertEqual(result.signal, "HOLD", "Signal");
    assertEqual(result.positionSize, 0, "Position size");
});

// Test 3: High risk must always produce HOLD
test("High risk produces HOLD", () => {
    const result = evaluateDecision({
        currentPrice: 110,
        entryPrice: 100,
        marketTrend: 1,
        riskLevel: 90,
        aiSignal: "LONG",
        maxPositionSize: 100
    });

    assertEqual(result.signal, "HOLD", "Signal");
    assertEqual(result.positionSize, 0, "Position size");
});

// Test 4: Bearish AI SHORT should produce SHORT
test("Bearish SHORT decision", () => {
    const result = evaluateDecision({
        currentPrice: 90,
        entryPrice: 100,
        marketTrend: -1,
        riskLevel: 30,
        aiSignal: "SHORT",
        maxPositionSize: 100
    });

    assertEqual(result.riskScore, 60, "Risk score");
    assertEqual(result.signal, "SHORT", "Signal");
    assertEqual(result.positionSize, 10, "Position size");
});

// Test 5: Low risk score must prevent a trade
test("Low risk score produces HOLD", () => {
    const result = evaluateDecision({
        currentPrice: 110,
        entryPrice: 100,
        marketTrend: 0,
        riskLevel: 90,
        aiSignal: "LONG",
        maxPositionSize: 100
    });

    assertEqual(result.signal, "HOLD", "Signal");
    assertEqual(result.positionSize, 0, "Position size");
});

// Test 6: Position size respects contract maximum
test("Position size respects maximum", () => {
    const result = evaluateDecision({
        currentPrice: 110,
        entryPrice: 100,
        marketTrend: 1,
        riskLevel: 30,
        aiSignal: "LONG",
        maxPositionSize: 5
    });

    assertEqual(result.signal, "LONG", "Signal");
    assertEqual(result.positionSize, 5, "Position size");
});

console.log("\nStage 8 decision pipeline tests passed.");

// Test 7: Invalid AI signal must produce HOLD
test("Invalid AI signal produces HOLD", () => {
    const result = evaluateDecision({
        currentPrice: 110,
        entryPrice: 100,
        marketTrend: 1,
        riskLevel: 30,
        aiSignal: "INVALID",
        maxPositionSize: 100
    });

    assertEqual(result.signal, "HOLD", "Signal");
    assertEqual(result.positionSize, 0, "Position size");
});

// Test 8: Empty AI signal must produce HOLD
test("Empty AI signal produces HOLD", () => {
    const result = evaluateDecision({
        currentPrice: 110,
        entryPrice: 100,
        marketTrend: 1,
        riskLevel: 30,
        aiSignal: "",
        maxPositionSize: 100
    });

    assertEqual(result.signal, "HOLD", "Signal");
    assertEqual(result.positionSize, 0, "Position size");
});

console.log("\nStage 9 AI safety tests passed.");