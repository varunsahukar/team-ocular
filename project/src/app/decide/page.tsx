"use client";

import { useState, useMemo } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ArrowUpRight, AlertCircle, Calendar, Wallet } from "lucide-react";
import Link from "next/link";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function DecisionSimulator() {
  const [hypotheticalAmount, setHypotheticalAmount] = useState([5000]);
  const { metrics } = useSocket();

  const scenario = useMemo(() => {
    if (!metrics) return null;

    const amount = hypotheticalAmount[0];
    const newBalance = Math.max(0, metrics.balance - amount);
    const recentAverageSpend =
      metrics.spendingTrend.reduce((total, day) => total + day.amount, 0) /
      Math.max(metrics.spendingTrend.length, 1);
    const dailyRate =
      metrics.daysToZero > 0
        ? metrics.balance / metrics.daysToZero
        : Math.max(recentAverageSpend, 1);
    const newDaysToZero = Math.max(0, Math.floor(newBalance / Math.max(dailyRate, 1)));

    let newRiskScore = metrics.riskScore;
    if (amount > metrics.balance * 0.1) newRiskScore += 10;
    if (amount > recentAverageSpend * 2) newRiskScore += 8;
    if (newDaysToZero < 15) newRiskScore += 20;
    if (newDaysToZero < 7) newRiskScore += 10;
    newRiskScore = Math.min(newRiskScore, 100);

    return {
      newBalance,
      newDaysToZero,
      newRiskScore,
      daysLost: Math.max(0, metrics.daysToZero - newDaysToZero),
      riskIncrease: newRiskScore - metrics.riskScore,
    };
  }, [metrics, hypotheticalAmount]);

  if (!metrics || !scenario) {
    return (
      <main className="page-shell">
        <div className="page-gutter">
          <div className="mx-auto flex min-h-[70vh] max-w-[1440px] items-center justify-center">
            <p className="text-sm uppercase tracking-[0.24em] text-white/42 animate-pulse">
              Analyzing scenarios
            </p>
          </div>
        </div>
      </main>
    );
  }

  const recommendation =
    scenario.newDaysToZero < 10
      ? {
          title: "Defer if you can.",
          copy: "This purchase would bring your projected balance uncomfortably close to zero. Leave more room for essentials first.",
        }
      : scenario.riskIncrease > 15
        ? {
            title: "Proceed carefully.",
            copy: "The purchase is still possible, but it noticeably changes the stability of the next few days.",
          }
        : {
            title: "The runway still holds.",
            copy: "Your balance remains relatively stable after this purchase, so the decision stays manageable.",
          };

  return (
    <main className="page-shell">
      <div className="page-gutter">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/58 hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Back to dashboard
            </Link>
            <span className="section-label">Decision simulator</span>
          </div>

          <div className="grid gap-8 xl:grid-cols-[0.94fr_1.06fr]">
            <section className="surface-panel px-6 py-8 md:px-10 md:py-10">
              <p className="section-label">Decide</p>
              <h1 className="text-balance mt-5 max-w-[10ch] text-[clamp(3.2rem,7vw,6.4rem)] font-semibold leading-[0.94] tracking-[-0.08em] text-white">
                See the cost before you commit.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/62">
                The simulator compares a hypothetical purchase against your current metrics, so you can understand the runway impact first and only then decide whether to move ahead.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <ScenarioInfo
                  icon={Wallet}
                  label="Current balance"
                  value={currencyFormatter.format(metrics.balance)}
                />
                <ScenarioInfo
                  icon={Calendar}
                  label="Current runway"
                  value={`${metrics.daysToZero} days`}
                />
              </div>
            </section>

            <section className="surface-panel px-6 py-8 md:px-8 md:py-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="section-label">Hypothetical purchase</p>
                  <p className="mt-4 text-5xl font-semibold tracking-[-0.08em] text-white md:text-6xl">
                    {currencyFormatter.format(hypotheticalAmount[0])}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/48">
                  Max {currencyFormatter.format(metrics.balance)}
                </span>
              </div>

              <div className="mt-8">
                <Slider
                  value={hypotheticalAmount}
                  onValueChange={setHypotheticalAmount}
                  max={Math.max(metrics.balance, 500)}
                  step={500}
                  className="py-4"
                />
                <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.24em] text-white/36">
                  <span>{currencyFormatter.format(0)}</span>
                  <span>{currencyFormatter.format(metrics.balance)}</span>
                </div>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                <ScenarioCard
                  icon={Wallet}
                  label="New balance"
                  value={currencyFormatter.format(scenario.newBalance)}
                  detail="after purchase"
                />
                <ScenarioCard
                  icon={Calendar}
                  label="New runway"
                  value={`${scenario.newDaysToZero} days`}
                  detail={`-${scenario.daysLost} days`}
                />
                <ScenarioCard
                  icon={AlertCircle}
                  label="Risk score"
                  value={`${scenario.newRiskScore}/100`}
                  detail={`+${scenario.riskIncrease} increase`}
                />
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 px-6 py-6">
                <p className="section-label">Recommendation</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">
                  {recommendation.title}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58">
                  {recommendation.copy}
                </p>
                <Link
                  href="/simulate"
                  className="mt-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/60 hover:text-white"
                >
                  Move to pay
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function ScenarioInfo({
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
      <div className="flex size-10 items-center justify-center rounded-full border border-white/10 text-white/70">
        <Icon className="size-4" />
      </div>
      <p className="mt-5 text-[11px] uppercase tracking-[0.24em] text-white/40">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-white">{value}</p>
    </div>
  );
}

function ScenarioCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="surface-card px-5 py-5">
      <div className="flex size-10 items-center justify-center rounded-full border border-white/10 text-white/70">
        <Icon className="size-4" />
      </div>
      <p className="mt-5 text-[11px] uppercase tracking-[0.24em] text-white/40">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-white">{value}</p>
      <p className="mt-2 text-sm text-white/52">{detail}</p>
    </div>
  );
}
