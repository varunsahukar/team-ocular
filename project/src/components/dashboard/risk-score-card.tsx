"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskScoreCardProps {
  score: number;
  isDashboard?: boolean;
}

export default function RiskScoreCard({ score, isDashboard = false }: RiskScoreCardProps) {
  const riskBand =
    score < 30
      ? {
          description: "Your current spending pattern looks steady and manageable.",
          label: "Low risk",
          recommendation: "Keep doing what is working and watch for sudden category spikes.",
        }
      : score < 70
        ? {
            description: "You still have room, but the margin is starting to tighten.",
            label: "Medium risk",
            recommendation: "Pause before medium or large purchases and use the simulator first.",
          }
        : {
            description: "Recent activity is putting real pressure on your balance.",
            label: "High risk",
            recommendation: "Focus on essentials only until the runway starts improving again.",
          };

  const Icon = score < 30 ? ShieldCheck : score < 70 ? ShieldAlert : AlertTriangle;

  return (
    <div className="flex flex-col gap-10 glass-card p-8 rounded-[2rem] hover-glow">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-md">
          <p className="section-label">Neural Risk Model</p>
          <h2 className={cn(
            "mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-white md:text-5xl",
            !isDashboard && "font-display"
          )}>
            Fragility <br />
            <span className={cn(
              "text-white/40 italic",
              !isDashboard && "font-display"
            )}>Index.</span>
          </h2>
        </div>

        <div className="flex size-12 items-center justify-center rounded-full border border-white/5 bg-white/[0.02] text-white/30">
          <Icon className="size-4" />
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-end">
        <div>
          <p className={cn(
            "text-8xl font-semibold tracking-tighter text-white",
            !isDashboard && "font-display"
          )}>{score}</p>
          <p className="mt-3 text-[10px] uppercase tracking-[0.4em] text-white/20">
            {riskBand.label}
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-[1px] w-full bg-white/5">
              <motion.div
                animate={{ width: `${Math.max(2, score)}%` }}
                className="h-full bg-white/40 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <div className="flex justify-between text-[8px] uppercase tracking-[0.4em] text-white/10">
              <span>Stable</span>
              <span>Volatile</span>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-white/40 italic">
            &quot;{riskBand.description} {riskBand.recommendation}&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
