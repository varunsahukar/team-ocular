"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, ShieldCheck, Wallet, ChevronDown, ChevronUp, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardHero from "@/components/dashboard/dashboard-hero";
import QuickInsight from "@/components/dashboard/quick-insight";
import RiskScoreCard from "@/components/dashboard/risk-score-card";
import SpendingChart from "@/components/dashboard/spending-chart";
import { useSocket } from "@/components/providers/socket-provider";
import { useState, useEffect } from "react";
import axios from "axios";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
});

type Transaction = {
  id: string;
  amount: number;
  merchant: string;
  category: string;
  timestamp: string;
};

export default function DashboardPage() {
  const { metrics, isConnected } = useSocket();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isHistoryMinimized, setIsHistoryMinimized] = useState(false);
  const [historyLimit, setHistoryLimit] = useState(5);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/transactions`
        );
        setTransactions(response.data);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, [metrics]); // Refresh when metrics change (e.g. after a new transaction)

  if (!metrics) {
    return (
      <main className="page-shell">
        <div className="page-gutter">
          <div className="mx-auto max-w-[1440px] space-y-6">
            <div className="surface-panel animate-pulse px-6 py-8 md:px-10 md:py-10">
              <div className="h-4 w-36 rounded-full bg-white/8" />
              <div className="mt-6 h-20 max-w-3xl rounded-[2rem] bg-white/8" />
              <div className="mt-5 h-5 max-w-xl rounded-full bg-white/6" />
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="h-32 rounded-[1.5rem] bg-white/6" />
                <div className="h-32 rounded-[1.5rem] bg-white/6" />
                <div className="h-32 rounded-[1.5rem] bg-white/6" />
              </div>
            </div>
            <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
              <div className="h-64 rounded-[2rem] bg-white/5" />
              <div className="h-64 rounded-[2rem] bg-white/5" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  const weeklySpend = metrics.spendingTrend.reduce((total, day) => total + day.amount, 0);
  const averageSpend = weeklySpend / Math.max(metrics.spendingTrend.length, 1);

  return (
    <main className="min-h-screen bg-background">
      <div className="page-shell relative">
        <div className="page-gutter relative">
          <div className="mx-auto max-w-[1440px] space-y-16 md:space-y-20 xl:space-y-24">
            <DashboardHero
              balance={metrics.balance}
              days={metrics.daysToZero}
              isConnected={isConnected}
              weeklySpend={weeklySpend}
              isDashboard={true}
            />

            <section className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
              <div className="space-y-6">
                <div className="surface-panel grid gap-8 p-8 sm:grid-cols-3">
                  <div className="space-y-4">
                    <div className="flex size-10 items-center justify-center rounded-full border border-white/10 text-white/40">
                      <Wallet className="size-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Current balance</p>
                      <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-[var(--stock-green)]">
                        {currencyFormatter.format(metrics.balance)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 border-white/5 sm:border-l sm:pl-8">
                    <div className="flex size-10 items-center justify-center rounded-full border border-white/10 text-white/40">
                      <CalendarDays className="size-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Average daily spend</p>
                      <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-[var(--stock-red)]">
                        {compactCurrencyFormatter.format(averageSpend)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 border-white/5 sm:border-l sm:pl-8">
                    <div className="flex size-10 items-center justify-center rounded-full border border-white/10 text-white/40">
                      <ShieldCheck className="size-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Risk score</p>
                      <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">
                        {metrics.riskScore}/100
                      </p>
                    </div>
                  </div>
                </div>

                <QuickInsight text={metrics.insight} isDashboard={true} />
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <ActionPanel
                  eyebrow="Pay"
                  href="/simulate"
                  title="Simulate a merchant payment before it hits your live dashboard."
                  detail="This writes through your existing backend flow and updates the dashboard in real time."
                />
                <ActionPanel
                  eyebrow="Decide"
                  href="/decide"
                  title="Preview the balance, runway, and risk impact of a purchase first."
                  detail="Use the scenario engine before committing to any non-essential spend this week."
                />
              </div>
            </section>

            <section className="grid gap-8 xl:grid-cols-[0.78fr_1.22fr] xl:items-start">
              <div className="max-w-xl space-y-5">
                <p className="section-label">Spending trend</p>
                <h2 className="text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.06em] text-white md:text-5xl">
                  A weekly pattern you can read in seconds.
                </h2>
                <p className="text-base leading-8 text-white/62">
                  The graph stays tied to your current transactions, so every payment changes the picture right away.
                </p>
              </div>

              <SpendingChart data={metrics.spendingTrend} />
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr] xl:items-start">
              <RiskScoreCard score={metrics.riskScore} isDashboard={true} />

              <div className="grid gap-4 sm:grid-cols-2">
                <DetailPanel
                  title="Runway outlook"
                  value={`${metrics.daysToZero} days`}
                  copy="Estimated duration before liquidity reaches zero."
                />
                <DetailPanel
                  title="Weekly velocity"
                  value={compactCurrencyFormatter.format(weeklySpend)}
                  copy="Total capital deployed over the last seven days."
                />
              </div>
            </section>

            {/* Recent Transactions Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="section-label text-white/20">Ledger</p>
                  <h2 className="text-2xl font-semibold tracking-tight text-white">Recent Transactions</h2>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setHistoryLimit(prev => prev === 5 ? 20 : 5)}
                    className="flex size-9 items-center justify-center rounded-full border border-white/5 bg-white/[0.02] text-white/30 transition-all hover:bg-white/5 hover:text-white"
                    title={historyLimit === 5 ? "Extend" : "Minimize"}
                  >
                    {historyLimit === 5 ? <Maximize2 className="size-3.5" /> : <Minimize2 className="size-3.5" />}
                  </button>
                  <button
                    onClick={() => setIsHistoryMinimized(!isHistoryMinimized)}
                    className="flex size-9 items-center justify-center rounded-full border border-white/5 bg-white/[0.02] text-white/30 transition-all hover:bg-white/5 hover:text-white"
                  >
                    {isHistoryMinimized ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {!isHistoryMinimized && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="surface-panel overflow-hidden glass-card"
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.01]">
                            <th className="px-8 py-4 text-[10px] uppercase tracking-[0.3em] text-white/30">Merchant</th>
                            <th className="px-8 py-4 text-[10px] uppercase tracking-[0.3em] text-white/30">Date</th>
                            <th className="px-8 py-4 text-right text-[10px] uppercase tracking-[0.3em] text-white/30">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {isLoadingTransactions ? (
                            [...Array(5)].map((_, i) => (
                              <tr key={i} className="animate-pulse">
                                <td className="px-8 py-6"><div className="h-4 w-32 rounded bg-white/5" /></td>
                                <td className="px-8 py-6"><div className="h-4 w-28 rounded bg-white/5" /></td>
                                <td className="px-8 py-6 text-right"><div className="ml-auto h-4 w-20 rounded bg-white/5" /></td>
                              </tr>
                            ))
                          ) : transactions.length > 0 ? (
                            transactions.slice(0, historyLimit).map((tx) => (
                              <tr key={tx.id} className="group hover:bg-white/[0.01] transition-colors">
                                <td className="px-8 py-6">
                                  <div className="font-medium text-white">{tx.merchant}</div>
                                  <div className="text-[10px] uppercase tracking-wider text-white/20">{tx.category}</div>
                                </td>
                                <td className="px-8 py-6 text-sm text-white/30">
                                  {new Date(tx.timestamp).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short'
                                  })}
                                </td>
                                <td className="px-8 py-6 text-right font-display text-lg font-medium text-[var(--stock-red)]">
                                  -{currencyFormatter.format(tx.amount)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-8 py-12 text-center text-white/20">
                                No transactions found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function ActionPanel({
  eyebrow,
  href,
  title,
  detail,
}: {
  eyebrow: string;
  href: string;
  title: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="surface-panel group flex min-h-[180px] flex-col justify-between p-8 transition-all hover:bg-white/[0.02]"
    >
      <div>
        <p className="section-label text-white/20">{eyebrow}</p>
        <h3 className="mt-5 font-display text-2xl font-semibold leading-tight tracking-tight text-white">
          {title}
        </h3>
        <p className="mt-3 max-w-sm text-xs leading-relaxed text-white/30">{detail}</p>
      </div>

      <span className="mt-8 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/40">
        Proceed <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function DetailPanel({
  title,
  value,
  copy,
}: {
  title: string;
  value: string;
  copy: string;
}) {
  return (
    <div className="surface-card min-h-[180px] p-8">
      <p className="section-label text-white/20">{title}</p>
      <p className="mt-5 font-display text-4xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-4 text-xs leading-relaxed text-white/30">{copy}</p>
    </div>
  );
}
