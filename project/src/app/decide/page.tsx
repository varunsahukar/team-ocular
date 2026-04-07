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
          <div className="mb-12 flex items-center justify-between gap-4">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/30 hover:text-white"
            >
              <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-1" />
              Terminal
            </Link>
            <span className="section-label">Prediction Unit</span>
          </div>

          <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="surface-panel p-10">
              <p className="section-label">Neural Scenario</p>
              <h1 className="mt-6 text-[clamp(3rem,6vw,5.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
                Visualize the <br />
                <span className="text-white/40 italic">financial delta.</span>
              </h1>
              <p className="mt-8 max-w-lg text-lg leading-relaxed text-white/50">
                Simulate a hypothetical capital deployment to see how it affects your global runway and risk profile before committing to the ledger.
              </p>

              <div className="mt-12 grid gap-4 sm:grid-cols-2">
                <ScenarioInfo
                  icon={Wallet}
                  label="Available Liquidity"
                  value={currencyFormatter.format(metrics.balance)}
                />
                <ScenarioInfo
                  icon={Calendar}
                  label="Current Runway"
                  value={`${metrics.daysToZero} days`}
                />
              </div>
            </section>

            <section className="surface-panel p-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="section-label">Hypothetical Allocation</p>
                  <p className="mt-5 text-5xl font-semibold tracking-tight text-white md:text-6xl">
                    {currencyFormatter.format(hypotheticalAmount[0])}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-[9px] uppercase tracking-[0.4em] text-white/40">
                  Max Limit
                </span>
              </div>

              <div className="mt-12">
                <Slider
                  value={hypotheticalAmount}
                  onValueChange={setHypotheticalAmount}
                  max={Math.max(metrics.balance, 500)}
                  step={500}
                  className="py-6"
                />
                <div className="mt-4 flex justify-between text-[9px] uppercase tracking-[0.4em] text-white/10">
                  <span>{currencyFormatter.format(0)}</span>
                  <span>{currencyFormatter.format(metrics.balance)}</span>
                </div>
              </div>

              <div className="mt-12 grid gap-4 md:grid-cols-3">
                <ScenarioCard
                  icon={Wallet}
                  label="Projected"
                  value={currencyFormatter.format(scenario.newBalance)}
                  detail="Post-Allocation"
                  valueClassName="text-[var(--stock-green)]"
                />
                <ScenarioCard
                  icon={Calendar}
                  label="Delta"
                  value={`${scenario.newDaysToZero} days`}
                  detail={`-${scenario.daysLost} lost`}
                  valueClassName={scenario.daysLost > 0 ? "text-[var(--stock-red)]" : ""}
                />
                <ScenarioCard
                  icon={AlertCircle}
                  label="Risk Factor"
                  value={`${scenario.newRiskScore}/100`}
                  detail={`+${scenario.riskIncrease} delta`}
                  valueClassName={scenario.riskIncrease > 0 ? "text-[var(--stock-red)]" : ""}
                />
              </div>

              <div className="mt-10 rounded-[1.5rem] border border-white/5 bg-white/[0.01] p-8">
                <p className="section-label">Engine Recommendation</p>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white">
                  {recommendation.title}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/40">
                  {recommendation.copy}
                </p>
                <Link
                  href="/simulate"
                  className="group mt-8 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-white"
                >
                  Proceed to Execution
                  <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
  valueClassName,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  detail: string;
  valueClassName?: string;
}) {
  return (
    <div className="surface-card px-5 py-5">
      <div className="flex size-10 items-center justify-center rounded-full border border-white/10 text-white/70">
        <Icon className="size-4" />
      </div>
      <p className="mt-5 text-[11px] uppercase tracking-[0.24em] text-white/40">{label}</p>
      <p className={`mt-3 text-2xl font-semibold tracking-[-0.05em] ${valueClassName || "text-white"}`}>
        {value}
      </p>
      <p className="mt-2 text-sm text-white/52">{detail}</p>
    </div>
  );
}
