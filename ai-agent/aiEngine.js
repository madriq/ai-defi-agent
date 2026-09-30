const OLLAMA_URL =
    "http://localhost:11434/api/generate";

const AI_MODEL =
    "llama3.2";

// ========================================
// AI RESPONSE PARSER
// ========================================

function parseAIResponse(response) {

    if (
        typeof response !== "string" ||
        response.trim() === ""
    ) {
        return {
            signal: "HOLD",
            reason: "AI returned an empty response"
        };
    }

    try {

        const parsed =
            JSON.parse(response);

        const signal =
            String(
                parsed.signal || "HOLD"
            )
                .trim()
                .toUpperCase();

        if (
            ![
                "LONG",
                "SHORT",
                "HOLD"
            ].includes(signal)
        ) {
            return {
                signal: "HOLD",
                reason: "Invalid AI signal"
            };
        }

        return {
            signal: signal,
            reason:
                String(
                    parsed.reason ||
                    "No reason provided"
                )
        };

    } catch (error) {

        return {
            signal: "HOLD",
            reason: "Invalid AI JSON"
        };
    }
}

// ========================================
// ASK LOCAL OLLAMA AI
// ========================================

async function askAI(
    currentPrice,
    entryPrice,
    marketTrend,
    riskLevel
) {

    const trendText =
        marketTrend > 0
            ? "BULLISH"
            : marketTrend < 0
                ? "BEARISH"
                : "NEUTRAL";

    const prompt = `
Analyze this market data.

Current price: ${currentPrice}
Entry price: ${entryPrice}
Trend: ${trendText}
Risk level: ${riskLevel}/100

Return ONLY valid JSON:

{
  "signal": "LONG",
  "reason": "short explanation"
}

signal must be exactly LONG, SHORT, or HOLD.

Do not use markdown.
`;

    const response =
        await fetch(
            OLLAMA_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    model: AI_MODEL,
                    prompt: prompt,
                    stream: false,
                    format: "json"
                })
            }
        );

    if (!response.ok) {
        throw new Error(
            `Ollama HTTP error: ${response.status}`
        );
    }

    const data =
        await response.json();

    console.log(
        "\n🧠 Raw AI Response:"
    );

    console.log(
        data.response
    );

    return parseAIResponse(
        data.response
    );
}

// ========================================
// EXPORTS
// ========================================

module.exports = {
    askAI,
    parseAIResponse
};