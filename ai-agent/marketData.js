 const COINGECKO_URL =
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";

// ========================================
// MARKET DATA RESPONSE PARSER
// ========================================

function parseMarketData(data) {

    const currentPrice =
        data?.bitcoin?.usd;

    if (
        currentPrice === undefined ||
        currentPrice === null
    ) {
        throw new Error(
            "Bitcoin price not found"
        );
    }

    const numericPrice =
        Number(currentPrice);

    if (
        !Number.isFinite(numericPrice) ||
        numericPrice <= 0
    ) {
        throw new Error(
            "Bitcoin price must be a valid positive number"
        );
    }

    return {
        asset: "BTC",
        currentPrice: numericPrice,
        timestamp:
            new Date().toISOString()
    };
}

// ========================================
// FETCH MARKET DATA
// ========================================

async function fetchMarketData() {

    const response =
        await fetch(
            COINGECKO_URL
        );

    if (!response.ok) {
        throw new Error(
            `CoinGecko HTTP error: ${response.status}`
        );
    }

    const data =
        await response.json();

    return parseMarketData(
        data
    );
}

// ========================================
// EXPORTS
// ========================================

function getTestMarketData(
    currentPrice = 110,
    entryPrice = 100
) {
    if (
        !Number.isFinite(Number(currentPrice)) ||
        Number(currentPrice) <= 0
    ) {
        throw new Error(
            "Test current price must be a valid positive number"
        );
    }

    if (
        !Number.isFinite(Number(entryPrice)) ||
        Number(entryPrice) <= 0
    ) {
        throw new Error(
            "Test entry price must be a valid positive number"
        );
    }

    return {
        asset: "BTC",
        currentPrice: Number(currentPrice),
        entryPrice: Number(entryPrice),
        timestamp: new Date().toISOString(),
        source: "LOCAL_TEST"
    };
}

module.exports = {
    fetchMarketData,
    getTestMarketData,
    parseMarketData
};
