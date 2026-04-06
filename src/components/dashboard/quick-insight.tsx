"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Lightbulb } from "lucide-react";

interface QuickInsightProps {
  text: string;
}

export default function QuickInsight({ text }: QuickInsightProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-panel px-6 py-6 md:px-8 md:py-8"
    >
      <div className="grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-start">
        <div className="mt-1 flex size-12 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/70">
          <Lightbulb className="size-[18px]" />
        </div>

        <div className="max-w-3xl">
          <p className="section-label">Engine insight</p>
          <p className="mt-4 text-balance text-2xl leading-[1.2] tracking-[-0.05em] text-white/88 md:text-3xl">
            {text}
          </p>
          <p className="mt-4 text-sm leading-7 text-white/56">
            Read this alongside the trend graph and risk meter, then move to Decide before you commit to any discretionary spend.
          </p>
        </div>

        <Link
          href="/decide"
          className="inline-flex items-center gap-2 self-start text-sm uppercase tracking-[0.2em] text-white/60 hover:text-white"
        >
          Run scenario
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </motion.section>
  );
}
