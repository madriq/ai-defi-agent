const {
    calculateRiskScore,
    determineFinalDecision,
    calculatePositionSize
} = require("./riskEngine");

function evaluateDecision({
    currentPrice,
    entryPrice,
    marketTrend,
    riskLevel,
    aiSignal,
    maxPositionSize
}) {
    const riskScore =
        calculateRiskScore(
            currentPrice,
            entryPrice,
            marketTrend,
            riskLevel
        );

    const decision =
        determineFinalDecision(
            aiSignal,
            currentPrice,
            entryPrice,
            marketTrend,
            riskLevel,
            riskScore
        );

    const positionSize =
        calculatePositionSize(
            maxPositionSize,
            riskLevel,
            riskScore,
            decision.signal
        );

    return {
        riskScore,
        signal: decision.signal,
        reason: decision.reason,
        positionSize
    };
}

module.exports = {
    evaluateDecision
};