 function calculateRiskScore(
    currentPrice,
    entryPrice,
    marketTrend,
    riskLevel
) {
    let score = 0;

    if (riskLevel <= 20) {
        score += 30;
    } else if (riskLevel <= 40) {
        score += 20;
    } else if (riskLevel <= 60) {
        score += 10;
    } else if (riskLevel < 80) {
        score += 5;
    } else {
        score += 0;
    }

    if (marketTrend !== 0) {
        score += 20;
    }

    if (currentPrice > entryPrice) {
        score += 20;
    } else if (currentPrice < entryPrice) {
        score += 20;
    }

    return Math.min(
        score,
        70
    );
}

function determineFinalDecision(
    aiSignal,
    currentPrice,
    entryPrice,
    marketTrend,
    riskLevel,
    riskScore
) {
    if (riskLevel >= 80) {
        return {
            signal: "HOLD",
            reason: "Risk level >= 80"
        };
    }

    if (riskScore < 40) {
        return {
            signal: "HOLD",
            reason:
                "Deterministic risk score below threshold"
        };
    }

    if (
        marketTrend > 0 &&
        currentPrice > entryPrice
    ) {
        if (aiSignal === "LONG") {
            return {
                signal: "LONG",
                reason:
                    "AI LONG confirmed by deterministic bullish conditions"
            };
        }

        return {
            signal: "HOLD",
            reason:
                "Bullish conditions exist but AI did not confirm LONG"
        };
    }

    if (
        marketTrend < 0 &&
        currentPrice < entryPrice
    ) {
        if (aiSignal === "SHORT") {
            return {
                signal: "SHORT",
                reason:
                    "AI SHORT confirmed by deterministic bearish conditions"
            };
        }

        return {
            signal: "HOLD",
            reason:
                "Bearish conditions exist but AI did not confirm SHORT"
        };
    }

    return {
        signal: "HOLD",
        reason:
            "Market conditions are not sufficiently directional"
    };
}

function calculatePositionSize(
    maxPositionSize,
    riskLevel,
    riskScore,
    finalSignal
) {
    if (
        finalSignal === "HOLD"
    ) {
        return 0;
    }

    if (
        riskLevel >= 80
    ) {
        return 0;
    }

    if (
        riskScore >= 60
    ) {
        return Math.min(
            10,
            Number(maxPositionSize)
        );
    }

    if (
        riskScore >= 40
    ) {
        return Math.min(
            5,
            Number(maxPositionSize)
        );
    }

    return 0;
}

module.exports = {
    calculateRiskScore,
    determineFinalDecision,
    calculatePositionSize
};