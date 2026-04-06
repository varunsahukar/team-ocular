const TREND_WINDOW_DAYS = 7;
const AVERAGE_WINDOW_DAYS = 30;
const MIN_DAILY_SPEND = 100;
const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
});
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function roundCurrency(value) {
    return Math.round(value * 100) / 100;
}
function pad(value) {
    return String(value).padStart(2, "0");
}
function getDateKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function toDate(value) {
    return value instanceof Date ? value : new Date(value);
}
function startOfDay(date) {
    const nextDate = new Date(date);
    nextDate.setHours(0, 0, 0, 0);
    return nextDate;
}
function addDays(date, days) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
}
function getTransactionsWithinWindow(transactions, now, windowDays) {
    const cutoff = startOfDay(addDays(now, -(windowDays - 1)));
    return transactions.filter((transaction) => toDate(transaction.timestamp) >= cutoff);
}
function buildDailySpendSeries(transactions, now, windowDays) {
    const totalsByDay = new Map();
    for (const transaction of getTransactionsWithinWindow(transactions, now, windowDays)) {
        const timestamp = toDate(transaction.timestamp);
        const key = getDateKey(timestamp);
        totalsByDay.set(key, (totalsByDay.get(key) ?? 0) + transaction.amount);
    }
    return Array.from({ length: windowDays }, (_, index) => {
        const date = startOfDay(addDays(now, -(windowDays - 1 - index)));
        const isoDate = getDateKey(date);
        return {
            date: weekdayFormatter.format(date),
            isoDate,
            amount: roundCurrency(totalsByDay.get(isoDate) ?? 0),
        };
    });
}
function calculateVolatilityRisk(transactions, now) {
    const series = buildDailySpendSeries(transactions, now, AVERAGE_WINDOW_DAYS).map((entry) => entry.amount);
    const mean = series.reduce((sum, value) => sum + value, 0) / Math.max(series.length, 1);
    if (mean === 0) {
        return 0;
    }
    const variance = series.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(series.length, 1);
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;
    return clamp(coefficientOfVariation * 9, 0, 14);
}
function buildPortfolioInsight(summary) {
    const exposurePercent = Math.round(summary.stockExposure * 100);
    if (!summary.holdingsCount) {
        return "No stocks tracked yet. Add holdings to see how market exposure changes your financial survival outlook.";
    }
    if (summary.stockExposure >= 0.6) {
        return `${exposurePercent}% of your assets are in stocks. Market swings could meaningfully change your runway.`;
    }
    if (summary.profitLoss >= 0) {
        return `Stocks represent ${exposurePercent}% of your assets and are currently helping your net position.`;
    }
    return `Stocks represent ${exposurePercent}% of your assets and are currently pressuring your net worth.`;
}
function buildInsight(metrics) {
    const { balance, daysToZero, riskScore, avgDailySpend, weeklySpend, stockExposure } = metrics;
    const exposurePercent = Math.round(stockExposure * 100);
    if (balance <= 0) {
        return "Critical: Your cash balance is already at or below zero. Pause all non-essential spend immediately.";
    }
    if (daysToZero <= 7 || riskScore >= 80) {
        return "High alert: At the current burn rate, your runway is measured in days. Protect essentials and delay discretionary payments.";
    }
    if (stockExposure >= 0.6) {
        return `Market-sensitive: ${exposurePercent}% of your assets sit in stocks, so volatility could move your survival runway faster than usual.`;
    }
    if (daysToZero <= 14 || riskScore >= 65) {
        return "Warning: Your cushion is thinning fast. A couple of larger payments could materially shorten your runway.";
    }
    if (weeklySpend > balance * 0.25) {
        return "Pressure is building: Recent spending already consumes a large share of your remaining cash. Simulate the next purchase before committing.";
    }
    if (riskScore <= 25 && daysToZero >= 60) {
        return "Stable: Your current pace leaves healthy breathing room. Keep monitoring for sudden spikes rather than steady spend.";
    }
    if (avgDailySpend > 0) {
        return "Balanced: The engine sees manageable risk right now, but the next few payments and any market move will decide whether that margin holds.";
    }
    return "Quiet signal: There is not enough recent spending history yet, so risk is conservative until more activity arrives.";
}
export function serializeDashboardTransaction(transaction) {
    return {
        id: transaction.id,
        amount: transaction.amount,
        merchant: transaction.merchant,
        category: transaction.category,
        timestamp: toDate(transaction.timestamp).toISOString(),
    };
}
export function createPortfolioPosition(portfolio, currentPrice) {
    const investedValue = roundCurrency(portfolio.quantity * portfolio.buyPrice);
    const currentValue = roundCurrency(portfolio.quantity * currentPrice);
    return {
        id: portfolio.id,
        symbol: portfolio.symbol,
        quantity: portfolio.quantity,
        buyPrice: roundCurrency(portfolio.buyPrice),
        currentPrice: roundCurrency(currentPrice),
        investedValue,
        currentValue,
        profitLoss: roundCurrency(currentValue - investedValue),
        createdAt: toDate(portfolio.createdAt ?? new Date()).toISOString(),
    };
}
export function calculatePortfolioSummary({ cashBalance, positions, }) {
    const totalInvested = roundCurrency(positions.reduce((sum, position) => sum + position.investedValue, 0));
    const currentValue = roundCurrency(positions.reduce((sum, position) => sum + position.currentValue, 0));
    const totalAssets = Math.max(cashBalance + currentValue, 0);
    const stockExposure = totalAssets > 0 ? currentValue / totalAssets : 0;
    const summary = {
        totalInvested,
        currentValue,
        profitLoss: roundCurrency(currentValue - totalInvested),
        stockExposure,
        cashAllocation: totalAssets > 0 ? cashBalance / totalAssets : 0,
        holdingsCount: positions.length,
        insight: "",
    };
    return {
        ...summary,
        insight: buildPortfolioInsight(summary),
    };
}
export function calculateAverageDailySpend(transactions, now = new Date(), windowDays = AVERAGE_WINDOW_DAYS) {
    const recentTransactions = getTransactionsWithinWindow(transactions, now, windowDays);
    const totalSpent = recentTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    return Math.max(roundCurrency(totalSpent / windowDays), MIN_DAILY_SPEND);
}
export function calculateRiskScore({ balance, portfolioValue, stockExposure, daysToZero, avgDailySpend, transactions, spendingTrend, now = new Date(), }) {
    const totalAssets = Math.max(balance + portfolioValue, 0);
    const recentTransactions = getTransactionsWithinWindow(transactions, now, AVERAGE_WINDOW_DAYS);
    const weeklySpend = spendingTrend.reduce((sum, point) => sum + point.amount, 0);
    let runwayRisk = clamp(46 - daysToZero * 0.55, 0, 36);
    if (daysToZero < 14) {
        runwayRisk += 10;
    }
    if (daysToZero < 7) {
        runwayRisk += 8;
    }
    const liquidityRisk = clamp((weeklySpend / Math.max(balance, 1)) * 14, 0, 14);
    const frequencyRisk = clamp(recentTransactions.length * 0.75, 0, 14);
    const volatilityRisk = calculateVolatilityRisk(transactions, now);
    const burnRateRisk = clamp((avgDailySpend / Math.max(totalAssets / 60, 1)) * 7, 0, 10);
    let exposureRisk = clamp(stockExposure * 10, 0, 7);
    if (stockExposure >= 0.55) {
        exposureRisk += 5;
    }
    if (stockExposure >= 0.75) {
        exposureRisk += 4;
    }
    if (balance < avgDailySpend * 14 && stockExposure > 0.45) {
        exposureRisk += 5;
    }
    return Math.round(clamp(runwayRisk + liquidityRisk + frequencyRisk + volatilityRisk + burnRateRisk + exposureRisk, 0, 100));
}
export function calculateDashboardMetrics({ balance, portfolioValue = 0, transactions, now = new Date(), }) {
    const spendingTrend = buildDailySpendSeries(transactions, now, TREND_WINDOW_DAYS);
    const avgDailySpend = calculateAverageDailySpend(transactions, now);
    const totalAssets = roundCurrency(balance + portfolioValue);
    const weeklySpend = spendingTrend.reduce((sum, point) => sum + point.amount, 0);
    const daysToZero = Math.max(Math.floor(totalAssets / Math.max(avgDailySpend, 1)), 0);
    const stockExposure = totalAssets > 0 ? portfolioValue / totalAssets : 0;
    const cashAllocation = totalAssets > 0 ? balance / totalAssets : 0;
    const riskScore = calculateRiskScore({
        balance,
        portfolioValue,
        stockExposure,
        daysToZero,
        avgDailySpend,
        transactions,
        spendingTrend,
        now,
    });
    const baseMetrics = {
        balance: roundCurrency(balance),
        portfolioValue: roundCurrency(portfolioValue),
        totalAssets,
        stockExposure,
        cashAllocation,
        daysToZero,
        riskScore,
        avgDailySpend,
        weeklySpend,
        spendingTrend,
        insight: "",
    };
    return {
        ...baseMetrics,
        insight: buildInsight(baseMetrics),
    };
}
export function simulateFinancialScenario({ amount, balance, portfolioValue = 0, transactions, merchant = "Scenario purchase", category = "Simulation", now = new Date(), baselineMetrics, }) {
    const sanitizedAmount = Math.max(0, roundCurrency(amount));
    const projectedBalance = roundCurrency(balance - sanitizedAmount);
    const scenarioTransactions = sanitizedAmount > 0
        ? [
            {
                amount: sanitizedAmount,
                merchant,
                category,
                timestamp: now,
            },
            ...transactions,
        ]
        : transactions;
    const scenarioMetrics = calculateDashboardMetrics({
        balance: projectedBalance,
        portfolioValue,
        transactions: scenarioTransactions,
        now,
    });
    const sourceMetrics = baselineMetrics ??
        calculateDashboardMetrics({
            balance,
            portfolioValue,
            transactions,
            now,
        });
    return {
        ...scenarioMetrics,
        amount: sanitizedAmount,
        projectedBalance,
        daysLost: Math.max(0, sourceMetrics.daysToZero - scenarioMetrics.daysToZero),
        riskDelta: scenarioMetrics.riskScore - sourceMetrics.riskScore,
    };
}
//# sourceMappingURL=financial-engine.js.map