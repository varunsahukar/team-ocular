"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickInsightProps {
  text: string;
  isDashboard?: boolean;
}

export default function QuickInsight({ text, isDashboard = false }: QuickInsightProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-panel p-8 glass-card hover-glow"
    >
      <div className="grid gap-8 md:grid-cols-[auto_1fr_auto] md:items-start">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/5 bg-white/[0.02] text-white/30">
          <Lightbulb className="size-[18px]" />
        </div>

        <div className="max-w-3xl">
          <p className="section-label">Engine Intelligence</p>
          <p className={cn(
            "mt-5 text-balance text-2xl leading-relaxed tracking-tight text-white/90 md:text-3xl",
            !isDashboard && "font-display"
          )}>
            {text}
          </p>
          <p className="mt-5 text-[13px] leading-relaxed text-white/40">
            Synthesized from current burn rate and neural pattern analysis. Run a prediction scenario to verify the impact of future capital allocation.
          </p>
        </div>

        <Link
          href="/decide"
          className="group inline-flex items-center gap-2 self-start text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors"
        >
          Predict
          <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </motion.section>
  );
}
