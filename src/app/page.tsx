"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, ShieldCheck, Wallet } from "lucide-react";
import DashboardHero from "@/components/dashboard/dashboard-hero";
import QuickInsight from "@/components/dashboard/quick-insight";
import RiskScoreCard from "@/components/dashboard/risk-score-card";
import SpendingChart from "@/components/dashboard/spending-chart";
import { useSocket } from "@/components/providers/socket-provider";

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

export default function Home() {
  const { metrics, isConnected } = useSocket();

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
    <main className="page-shell">
      <div className="page-gutter">
        <div className="mx-auto max-w-[1440px] space-y-16 md:space-y-20 xl:space-y-24">
          <DashboardHero
            balance={metrics.balance}
            days={metrics.daysToZero}
            isConnected={isConnected}
            weeklySpend={weeklySpend}
          />

          <section className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricPanel
                  icon={Wallet}
                  label="Current balance"
                  value={currencyFormatter.format(metrics.balance)}
                />
                <MetricPanel
                  icon={CalendarDays}
                  label="Average daily spend"
                  value={compactCurrencyFormatter.format(averageSpend)}
                />
                <MetricPanel
                  icon={ShieldCheck}
                  label="Risk score"
                  value={`${metrics.riskScore}/100`}
                />
              </div>

              <QuickInsight text={metrics.insight} />
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
            <RiskScoreCard score={metrics.riskScore} />

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailPanel
                title="Runway outlook"
                value={`${metrics.daysToZero} days`}
                copy="Calculated from your recent pace so you can see how quickly your balance could run down."
              />
              <DetailPanel
                title="This week"
                value={compactCurrencyFormatter.format(weeklySpend)}
                copy="A compact view of the last 7 days, useful for spotting heavier-than-usual spending bursts."
              />
              <DetailPanel
                title="Connection"
                value={isConnected ? "Live sync" : "Retrying"}
                copy="The dashboard listens for backend updates and refreshes the metrics when the engine reconnects."
              />
              <DetailPanel
                title="Next step"
                value="Pay or decide"
                copy="Use the pay flow to simulate a real transaction, or move to Decide when you want a safer preview first."
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function MetricPanel({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
}) {
  return (
    <div className="surface-card px-5 py-5">
      <div className="flex size-10 items-center justify-center rounded-full border border-white/10 text-white/72">
        <Icon className="size-4" />
      </div>
      <p className="mt-5 text-[11px] uppercase tracking-[0.24em] text-white/42">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-white">{value}</p>
    </div>
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
      className="surface-panel flex min-h-[220px] flex-col justify-between px-6 py-6 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.045] md:px-7 md:py-7"
    >
      <div>
        <p className="section-label">{eyebrow}</p>
        <h3 className="mt-4 max-w-[14ch] text-3xl font-semibold leading-[1.04] tracking-[-0.05em] text-white">
          {title}
        </h3>
        <p className="mt-5 max-w-md text-sm leading-7 text-white/58">{detail}</p>
      </div>

      <span className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/60">
        Open {eyebrow}
        <ArrowRight className="size-4" />
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
    <div className="surface-card min-h-[220px] px-5 py-6 md:px-6">
      <p className="section-label">{title}</p>
      <p className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white">{value}</p>
      <p className="mt-5 text-sm leading-7 text-white/58">{copy}</p>
      <span className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/50">
        Live finance engine
        <ArrowUpRight className="size-4" />
      </span>
    </div>
  );
}
