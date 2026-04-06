"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";

interface RiskScoreCardProps {
  score: number;
}

export default function RiskScoreCard({ score }: RiskScoreCardProps) {
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
    <section className="surface-panel px-6 py-6 md:px-8 md:py-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-xl">
          <p className="section-label">Risk model</p>
          <h2 className="text-balance mt-4 text-4xl font-semibold leading-[1.02] tracking-[-0.06em] text-white md:text-5xl">
            A simple read on how fragile your next week looks.
          </h2>
        </div>

        <div className="flex size-14 items-center justify-center rounded-full border border-white/10 text-white/70">
          <Icon className="size-5" />
        </div>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-[0.72fr_1.28fr] md:items-end">
        <div>
          <p className="text-7xl font-semibold tracking-[-0.08em] text-white">{score}</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-white/42">
            {riskBand.label}
          </p>
        </div>

        <div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
            <motion.div
              animate={{ width: `${Math.max(6, score)}%` }}
              className="h-full rounded-full bg-white/80"
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="mt-3 flex justify-between text-[11px] uppercase tracking-[0.2em] text-white/35">
            <span>Lower risk</span>
            <span>Higher risk</span>
          </div>

          <p className="mt-6 text-base leading-8 text-white/62">
            {riskBand.description} {riskBand.recommendation}
          </p>
        </div>
      </div>
    </section>
  );
}
