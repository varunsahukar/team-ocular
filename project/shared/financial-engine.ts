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
};

export type FinancialScenario = DashboardMetrics & {
  amount: number;
  projectedBalance: number;
  daysLost: number;
  riskDelta: number;
};

const TREND_WINDOW_DAYS = 7;
const AVERAGE_WINDOW_DAYS = 30;
const MIN_DAILY_SPEND = 100;

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function startOfDay(date: Date): Date {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getTransactionsWithinWindow(
  transactions: TransactionLike[],
  now: Date,
  windowDays: number
): TransactionLike[] {
  const cutoff = startOfDay(addDays(now, -(windowDays - 1)));
  return transactions.filter((transaction) => toDate(transaction.timestamp) >= cutoff);
}

function buildDailySpendSeries(
  transactions: TransactionLike[],
  now: Date,
  windowDays: number
): SpendingTrendPoint[] {
  const totalsByDay = new Map<string, number>();

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

function calculateVolatilityRisk(transactions: TransactionLike[], now: Date): number {
  const series = buildDailySpendSeries(transactions, now, AVERAGE_WINDOW_DAYS).map(
    (entry) => entry.amount
  );
  const mean = series.reduce((sum, value) => sum + value, 0) / Math.max(series.length, 1);

  if (mean === 0) {
    return 0;
  }

  const variance =
    series.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(series.length, 1);
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / mean;

  return clamp(coefficientOfVariation * 9, 0, 14);
}

function buildInsight(metrics: DashboardMetrics): string {
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

  return "Survival metrics are now live. Connect your accounts to track your runway and market risk in real-time.";
}

type CalculateMetricsInput = {
  balance: number;
  portfolioValue?: number;
  transactions: TransactionLike[];
  now?: Date;
};

export function calculateMetrics({
  balance,
  portfolioValue = 0,
  transactions,
  now = new Date(),
}: CalculateMetricsInput): DashboardMetrics {
  const recent30 = getTransactionsWithinWindow(transactions, now, AVERAGE_WINDOW_DAYS);
  const totalSpent30 = recent30.reduce((sum, t) => sum + t.amount, 0);
  const avgDailySpend = Math.max(totalSpent30 / AVERAGE_WINDOW_DAYS, MIN_DAILY_SPEND);

  const daysToZero = Math.max(Math.floor(balance / avgDailySpend), 0);

  const weeklyTransactions = getTransactionsWithinWindow(transactions, now, TREND_WINDOW_DAYS);
  const weeklySpend = weeklyTransactions.reduce((sum, t) => sum + t.amount, 0);

  const totalAssets = balance + portfolioValue;
  const stockExposure = totalAssets > 0 ? portfolioValue / totalAssets : 0;
  const cashAllocation = totalAssets > 0 ? balance / totalAssets : 1;

  const spendingTrend = buildDailySpendSeries(transactions, now, TREND_WINDOW_DAYS);

  const riskScore = calculateRiskScore({
    balance,
    stockExposure,
    daysToZero,
    avgDailySpend,
    transactions,
    spendingTrend,
    now,
  });

  const metrics: DashboardMetrics = {
    balance: roundCurrency(balance),
    portfolioValue: roundCurrency(portfolioValue),
    totalAssets: roundCurrency(totalAssets),
    stockExposure: roundCurrency(stockExposure),
    cashAllocation: roundCurrency(cashAllocation),
    daysToZero,
    riskScore,
    avgDailySpend: roundCurrency(avgDailySpend),
    weeklySpend: roundCurrency(weeklySpend),
    spendingTrend,
    insight: "",
  };

  metrics.insight = buildInsight(metrics);
  return metrics;
}

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

function calculateRiskScore({
  balance,
  stockExposure,
  daysToZero,
  avgDailySpend,
  transactions,
  spendingTrend,
  now = new Date(),
}: Omit<CalculateRiskScoreInput, "portfolioValue">): number {
  let score = 0;

  // 1. Runway risk (0-35 points)
  if (daysToZero < 7) score += 35;
  else if (daysToZero < 14) score += 25;
  else if (daysToZero < 30) score += 15;
  else if (daysToZero < 60) score += 5;

  // 2. Market exposure risk (0-15 points)
  score += clamp(stockExposure * 15, 0, 15);

  // 3. Volatility risk (0-14 points)
  score += calculateVolatilityRisk(transactions, now);

  // 4. Frequency risk (0-10 points)
  const recent7 = getTransactionsWithinWindow(transactions, now, TREND_WINDOW_DAYS);
  score += clamp(recent7.length * 1.5, 0, 10);

  // 5. Burn rate risk (0-16 points)
  const recent7Total = spendingTrend.reduce((sum, p) => sum + p.amount, 0);
  const burnRateRatio = recent7Total / Math.max(avgDailySpend * 7, 1);
  score += clamp((burnRateRatio - 1) * 8, 0, 16);

  // 6. Balance critical risk (0-10 points)
  if (balance < avgDailySpend * 3) score += 10;

  return Math.round(clamp(score, 0, 100));
}

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

export function simulateScenario({
  amount,
  balance,
  portfolioValue = 0,
  transactions,
  merchant = "Simulated Purchase",
  category = "Simulation",
  now = new Date(),
  baselineMetrics,
}: SimulateScenarioInput): FinancialScenario {
  const simulatedTransaction: TransactionLike = {
    amount,
    merchant,
    category,
    timestamp: now,
  };

  const updatedTransactions = [...transactions, simulatedTransaction];
  const updatedBalance = balance - amount;

  const baseline =
    baselineMetrics ?? calculateMetrics({ balance, portfolioValue, transactions, now });
  const projected = calculateMetrics({
    balance: updatedBalance,
    portfolioValue,
    transactions: updatedTransactions,
    now,
  });

  return {
    ...projected,
    amount,
    projectedBalance: roundCurrency(updatedBalance),
    daysLost: Math.max(baseline.daysToZero - projected.daysToZero, 0),
    riskDelta: roundCurrency(projected.riskScore - baseline.riskScore),
  };
}

export function serializeDashboardTransaction(
  transaction: TransactionLike & { id: string }
): DashboardTransaction {
  return {
    id: transaction.id,
    amount: transaction.amount,
    merchant: transaction.merchant,
    category: transaction.category,
    timestamp: toDate(transaction.timestamp).toISOString(),
  };
}
