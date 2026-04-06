const CACHE_TTL_MS = 5 * 60 * 1000;
const MOCK_STOCK_PRICES = {
    RELIANCE: 2942.45,
    TCS: 4125.6,
    INFY: 1498.35,
    HDFCBANK: 1665.2,
    ICICIBANK: 1238.4,
    SBIN: 818.15,
    LT: 3620.75,
    ITC: 432.4,
};
const priceCache = new Map();
const inFlightRequests = new Map();
function roundPrice(value) {
    return Math.round(value * 100) / 100;
}
function getBaseSymbol(symbol) {
    return symbol
        .trim()
        .toUpperCase()
        .replace(/[^A-Z.]/g, "")
        .replace(/\.(NS|BO)$/, "");
}
function getYahooSymbol(symbol) {
    const baseSymbol = getBaseSymbol(symbol);
    if (baseSymbol.includes(".")) {
        return baseSymbol;
    }
    return `${baseSymbol}.NS`;
}
function getFallbackPrice(symbol) {
    const baseSymbol = getBaseSymbol(symbol);
    const directMatch = MOCK_STOCK_PRICES[baseSymbol];
    if (typeof directMatch === "number") {
        return directMatch;
    }
    const hash = Array.from(baseSymbol).reduce((total, character) => total + character.charCodeAt(0), 0);
    return 250 + (hash % 3500);
}
async function fetchYahooPrice(symbol) {
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`, {
        headers: {
            "User-Agent": "finai-portfolio/1.0",
        },
    });
    if (!response.ok) {
        throw new Error(`Quote request failed with status ${response.status}`);
    }
    const data = (await response.json());
    const result = data.chart?.result?.[0];
    const priceFromMeta = result?.meta?.regularMarketPrice;
    const closes = result?.indicators?.quote?.[0]?.close ?? [];
    const priceFromClose = closes.findLast((value) => typeof value === "number" && Number.isFinite(value));
    const resolvedPrice = priceFromMeta ?? priceFromClose;
    if (typeof resolvedPrice !== "number" || !Number.isFinite(resolvedPrice)) {
        throw new Error("No valid price returned by quote provider");
    }
    return resolvedPrice;
}
export async function fetchStockPrice(symbol) {
    const baseSymbol = getBaseSymbol(symbol);
    const cached = priceCache.get(baseSymbol);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.price;
    }
    const existingRequest = inFlightRequests.get(baseSymbol);
    if (existingRequest) {
        return existingRequest;
    }
    const request = (async () => {
        try {
            const livePrice = await fetchYahooPrice(getYahooSymbol(symbol));
            const roundedPrice = roundPrice(livePrice);
            priceCache.set(baseSymbol, {
                expiresAt: Date.now() + CACHE_TTL_MS,
                price: roundedPrice,
            });
            return roundedPrice;
        }
        catch (error) {
            console.warn(`Falling back to mock quote for ${baseSymbol}`, error);
            const fallbackPrice = roundPrice(getFallbackPrice(baseSymbol));
            priceCache.set(baseSymbol, {
                expiresAt: Date.now() + CACHE_TTL_MS,
                price: fallbackPrice,
            });
            return fallbackPrice;
        }
        finally {
            inFlightRequests.delete(baseSymbol);
        }
    })();
    inFlightRequests.set(baseSymbol, request);
    return request;
}
//# sourceMappingURL=stock-price.js.map