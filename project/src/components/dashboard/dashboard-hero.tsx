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
  isDashboard?: boolean;
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
  isDashboard = false,
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
    <section className="mx-auto max-w-5xl surface-panel overflow-hidden p-8 md:p-10">
      <div className="grid gap-10 xl:grid-cols-[1.1fr_0.9fr] xl:gap-12">
        <div className="space-y-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="section-label text-[9px]">Financial OS v1.0</span>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-3 py-1 text-[9px] uppercase tracking-[0.3em] text-white/40">
              <StatusIcon className="size-2.5" />
              <span>{isConnected ? "Active" : "Reconnecting"}</span>
            </div>
          </div>

          <div>
            <h1 className={cn(
              "text-balance max-w-[12ch] text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[0.95] tracking-tight text-white",
              !isDashboard && "font-display"
            )}>
              Clarity <br />
              <span className={cn(
                "text-white/40 italic text-[0.85em]",
                !isDashboard && "font-display"
              )}>Before Exposure.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/40">
              Your capital velocity and runway risk recalibrated in real-time. A minimalist engine for deliberate wealth management.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <HeroMetric 
              label="Net Liquidity" 
              value={currencyFormatter.format(balance)} 
              isDashboard={isDashboard} 
              className="text-[var(--stock-green)]"
            />
            <HeroMetric 
              label="Weekly Burn" 
              value={compactCurrencyFormatter.format(weeklySpend)} 
              isDashboard={isDashboard} 
              className="text-[var(--stock-red)]"
            />
            <HeroMetric label="Engine Stance" value={tone.label} isDashboard={isDashboard} />
          </div>

          <div className="flex flex-wrap gap-8 text-[9px] uppercase tracking-[0.3em] text-white/20">
            <Link href="/simulate" className="group inline-flex items-center gap-2 hover:text-white transition-colors">
              Execute <ArrowUpRight className="size-2.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link href="/decide" className="group inline-flex items-center gap-2 hover:text-white transition-colors">
              Predict <ArrowUpRight className="size-2.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.01]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-8 top-12 h-[45%] w-[60%] rounded-[1.5rem] border border-white/5 [transform:rotate(-6deg)] bg-white/[0.005]" />
            <div className="absolute right-10 top-20 h-[35%] w-[40%] rounded-[1.25rem] border border-white/10 bg-white/[0.02] [transform:rotate(10deg)] shadow-2xl" />
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.p
              className={cn(
                "text-[8rem] font-bold leading-none tracking-tighter text-white/5 md:text-[10rem]",
                !isDashboard && "font-display"
              )}
              style={{ x: displayValue }}
            >
              {days}
            </motion.p>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className={cn(
                "text-7xl font-semibold tracking-tighter text-white md:text-8xl",
                !isDashboard && "font-display"
              )}>
                {days}
              </p>
              <p className="mt-3 text-[9px] uppercase tracking-[0.5em] text-white/30">
                Days of Runway
              </p>
            </div>
          </div>

          <div className="absolute bottom-6 left-0 right-0 px-6">
            <div className="mx-auto max-w-xs rounded-[1rem] border border-white/10 bg-black/60 p-4 backdrop-blur-xl">
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/20">Intelligence</p>
              <p className="mt-2 text-xs leading-relaxed text-white/60">
                {tone.summary}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ label, value, isDashboard, className }: { label: string; value: string; isDashboard?: boolean; className?: string }) {
  return (
    <div className="space-y-3">
      <p className="text-[9px] uppercase tracking-[0.4em] text-white/20">{label}</p>
      <p className={cn(
        "text-xl font-medium tracking-tight text-white",
        !isDashboard && "font-display",
        className
      )}>{value}</p>
    </div>
  );
}
