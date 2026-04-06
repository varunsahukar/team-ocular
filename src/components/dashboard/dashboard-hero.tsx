"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardHeroProps {
  balance: number;
  days: number;
  isConnected: boolean;
  weeklySpend: number;
}

const compactCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
});

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function DashboardHero({
  balance,
  days,
  isConnected,
  weeklySpend,
}: DashboardHeroProps) {
  const springValue = useSpring(0, { stiffness: 40, damping: 20 });
  const displayValue = useTransform(springValue, (latest) => Math.floor(latest));
  const tone =
    days > 45
      ? {
          label: "Comfortable pace",
          summary: "Your recent spending pattern still leaves useful room to move.",
        }
      : days > 14
        ? {
            label: "Needs attention",
            summary: "You still have room, but a few larger payments could tighten the week quickly.",
          }
        : {
            label: "Tight runway",
            summary: "Your cushion is thin right now, so every purchase deserves a quick check first.",
          };
  const StatusIcon = isConnected ? Wifi : WifiOff;

  useEffect(() => {
    springValue.set(days);
  }, [days, springValue]);

  return (
    <section className="surface-panel overflow-hidden px-6 py-7 sm:px-8 md:px-10 md:py-10">
      <div className="grid gap-10 xl:grid-cols-[1.08fr_0.92fr] xl:gap-12">
        <div className="space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="section-label">Financial operating system</span>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/58">
              <StatusIcon className="size-3.5" />
              <span>{isConnected ? "Live sync" : "Reconnecting"}</span>
            </div>
          </div>

          <div>
            <h1 className="text-balance max-w-[11ch] text-[clamp(3.4rem,8vw,7.4rem)] font-semibold leading-[0.92] tracking-[-0.08em] text-white">
              Clarity before every rupee leaves your account.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/62 md:text-lg">
              Your balance, runway, and weekly spend stay together in one quieter dashboard, so the next move feels more deliberate and less reactive.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <HeroMetric label="Live balance" value={currencyFormatter.format(balance)} />
            <HeroMetric label="This week" value={compactCurrencyFormatter.format(weeklySpend)} />
            <HeroMetric label="Current stance" value={tone.label} />
          </div>

          <div className="flex flex-wrap gap-6 text-sm uppercase tracking-[0.2em] text-white/58">
            <Link href="/simulate" className="inline-flex items-center gap-2 hover:text-white">
              Open pay
              <ArrowUpRight className="size-4" />
            </Link>
            <Link href="/decide" className="inline-flex items-center gap-2 hover:text-white">
              Run decision check
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] border border-white/10 bg-black/20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-6 top-10 h-[42%] w-[58%] rounded-[1.5rem] border border-white/8 [transform:rotate(-8deg)]" />
            <div className="absolute right-8 top-16 h-[32%] w-[34%] rounded-[1.25rem] border border-white/10 bg-white/[0.025] [transform:rotate(8deg)]" />
            <div className="absolute bottom-10 left-[18%] h-[26%] w-[30%] rounded-[1.25rem] border border-white/10 bg-white/[0.02] [transform:rotate(7deg)]" />
          </div>

          <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
            <div className="max-w-sm rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
              <p className="section-label">Runway outlook</p>
              <div className="mt-4 flex items-end gap-2">
                <motion.span className="text-7xl font-semibold tracking-[-0.08em] text-white tabular-nums">
                  {displayValue}
                </motion.span>
                <span className="pb-3 text-[11px] uppercase tracking-[0.24em] text-white/45">
                  days
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-white/58">{tone.summary}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="section-label">Balance</p>
                <p className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">
                  {compactCurrencyFormatter.format(balance)}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="section-label">Weekly spend</p>
                <p className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">
                  {compactCurrencyFormatter.format(weeklySpend)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("rounded-[1.5rem] border border-white/10 bg-white/[0.025] px-5 py-5")}>
      <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-white">{value}</p>
    </div>
  );
}
