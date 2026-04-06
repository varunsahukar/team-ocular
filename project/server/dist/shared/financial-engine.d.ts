export type TransactionLike = {
    id?: string;
    amount: number;
    merchant: string;
    category: string;
    timestamp: Date | string;
};
export type PortfolioLike = {
    id?: string;
    symbol: string;
    quantity: number;
    buyPrice: number;
    createdAt?: Date | string;
};
export type DashboardTransaction = {
    id: string;
    amount: number;
    merchant: string;
    category: string;
    timestamp: string;
};
export type SpendingTrendPoint = {
    date: string;
    isoDate: string;
    amount: number;
};
export type PortfolioPosition = {
    id: string;
    symbol: string;
    quantity: number;
    buyPrice: number;
    currentPrice: number;
    investedValue: number;
    currentValue: number;
    profitLoss: number;
    createdAt: string;
};
export type PortfolioSummary = {
    totalInvested: number;
    currentValue: number;
    profitLoss: number;
    stockExposure: number;
    cashAllocation: number;
    holdingsCount: number;
    insight: string;
};
export type DashboardMetrics = {
    balance: number;
    portfolioValue: number;
    totalAssets: number;
    stockExposure: number;
    cashAllocation: number;
    daysToZero: number;
    riskScore: number;
    avgDailySpend: number;
    weeklySpend: number;
    spendingTrend: SpendingTrendPoint[];
    insight: string;
};
export type DashboardSnapshot = {
    metrics: DashboardMetrics;
    transactions: DashboardTransaction[];
    portfolio: {
        positions: PortfolioPosition[];
        summary: PortfolioSummary;
    };
};
export type FinancialScenario = DashboardMetrics & {
    amount: number;
    projectedBalance: number;
    daysLost: number;
    riskDelta: number;
};
type CalculateMetricsInput = {
    balance: number;
    portfolioValue?: number;
    transactions: TransactionLike[];
    now?: Date;
};
type SimulateScenarioInput = {
    amount: number;
    balance: number;
    portfolioValue?: number;
    transactions: TransactionLike[];
    merchant?: string;
    category?: string;
    now?: Date;
    baselineMetrics?: DashboardMetrics;
};
type CalculateRiskScoreInput = {
    balance: number;
    portfolioValue: number;
    stockExposure: number;
    daysToZero: number;
    avgDailySpend: number;
    transactions: TransactionLike[];
    spendingTrend: SpendingTrendPoint[];
    now?: Date;
};
export declare function serializeDashboardTransaction(transaction: TransactionLike & {
    id: string;
}): DashboardTransaction;
export declare function createPortfolioPosition(portfolio: PortfolioLike & {
    id: string;
}, currentPrice: number): PortfolioPosition;
export declare function calculatePortfolioSummary({ cashBalance, positions, }: {
    cashBalance: number;
    positions: PortfolioPosition[];
}): PortfolioSummary;
export declare function calculateAverageDailySpend(transactions: TransactionLike[], now?: Date, windowDays?: number): number;
export declare function calculateRiskScore({ balance, portfolioValue, stockExposure, daysToZero, avgDailySpend, transactions, spendingTrend, now, }: CalculateRiskScoreInput): number;
export declare function calculateDashboardMetrics({ balance, portfolioValue, transactions, now, }: CalculateMetricsInput): DashboardMetrics;
export declare function simulateFinancialScenario({ amount, balance, portfolioValue, transactions, merchant, category, now, baselineMetrics, }: SimulateScenarioInput): FinancialScenario;
export {};
//# sourceMappingURL=financial-engine.d.ts.map