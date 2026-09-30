const {
    parseAIResponse
} = require("./aiEngine");

// ========================================
// TEST HELPERS
// ========================================

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

// ========================================
// TEST 1 — VALID LONG
// ========================================

test("Valid LONG response", () => {

    const result =
        parseAIResponse(
            '{"signal":"LONG","reason":"Bullish trend"}'
        );

    assertEqual(
        result.signal,
        "LONG",
        "Signal"
    );

    assertEqual(
        result.reason,
        "Bullish trend",
        "Reason"
    );
});

// ========================================
// TEST 2 — VALID SHORT
// ========================================

test("Valid SHORT response", () => {

    const result =
        parseAIResponse(
            '{"signal":"SHORT","reason":"Bearish trend"}'
        );

    assertEqual(
        result.signal,
        "SHORT",
        "Signal"
    );
});

// ========================================
// TEST 3 — VALID HOLD
// ========================================

test("Valid HOLD response", () => {

    const result =
        parseAIResponse(
            '{"signal":"HOLD","reason":"Unclear market"}'
        );

    assertEqual(
        result.signal,
        "HOLD",
        "Signal"
    );
});

// ========================================
// TEST 4 — EMPTY RESPONSE
// ========================================

test("Empty response produces HOLD", () => {

    const result =
        parseAIResponse("");

    assertEqual(
        result.signal,
        "HOLD",
        "Signal"
    );

    assertEqual(
        result.reason,
        "AI returned an empty response",
        "Reason"
    );
});

// ========================================
// TEST 5 — INVALID JSON
// ========================================

test("Invalid JSON produces HOLD", () => {

    const result =
        parseAIResponse(
            "this is not valid JSON"
        );

    assertEqual(
        result.signal,
        "HOLD",
        "Signal"
    );

    assertEqual(
        result.reason,
        "Invalid AI JSON",
        "Reason"
    );
});

// ========================================
// TEST 6 — INVALID SIGNAL
// ========================================

test("Invalid signal produces HOLD", () => {

    const result =
        parseAIResponse(
            '{"signal":"BUY","reason":"Test"}'
        );

    assertEqual(
        result.signal,
        "HOLD",
        "Signal"
    );

    assertEqual(
        result.reason,
        "Invalid AI signal",
        "Reason"
    );
});

// ========================================
// TEST 7 — MISSING SIGNAL
// ========================================

test("Missing signal defaults to HOLD", () => {

    const result =
        parseAIResponse(
            '{"reason":"No signal provided"}'
        );

    assertEqual(
        result.signal,
        "HOLD",
        "Signal"
    );
});

// ========================================
// TEST 8 — LOWERCASE SIGNAL
// ========================================

test("Lowercase signal is normalized", () => {

    const result =
        parseAIResponse(
            '{"signal":"long","reason":"Bullish"}'
        );

    assertEqual(
        result.signal,
        "LONG",
        "Signal"
    );
});

// ========================================
// TEST 9 — NULL RESPONSE
// ========================================

test("Null response produces HOLD", () => {

    const result =
        parseAIResponse(null);

    assertEqual(
        result.signal,
        "HOLD",
        "Signal"
    );
});

// ========================================
// TEST 10 — MISSING REASON
// ========================================

test("Missing reason gets default message", () => {

    const result =
        parseAIResponse(
            '{"signal":"LONG"}'
        );

    assertEqual(
        result.signal,
        "LONG",
        "Signal"
    );

    assertEqual(
        result.reason,
        "No reason provided",
        "Reason"
    );
});

// ========================================
// COMPLETE
// ========================================

console.log(
    "\nStage 9B AI Engine safety tests passed."
);