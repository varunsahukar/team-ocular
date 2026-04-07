"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface LuxuryHeroProps {
  balance: number;
  days: number;
  isConnected: boolean;
}

export default function LuxuryHero({ balance, days, isConnected }: LuxuryHeroProps) {
  const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  return (
    <section className="relative flex min-h-[90vh] w-full flex-col items-center justify-center overflow-hidden px-6 pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10 star-field" />
      <div className="absolute inset-0 luxury-gradient" />

      {/* Top Logo Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 mb-16"
      >
        <span className="font-display text-4xl font-light tracking-[0.4em] text-white/90 md:text-6xl text-glow">
          HELIX
        </span>
      </motion.div>

      {/* Main Headline Area */}
      <div className="z-10 flex max-w-5xl flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-balance font-display text-5xl font-semibold leading-[1.1] tracking-[-0.04em] text-white md:text-8xl"
        >
          The Future of <br />
          <span className="gold-glow italic">Predictive Finance</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1.5, delay: 0.6 }}
          className="mt-8 max-w-2xl text-lg font-light tracking-wide text-white md:text-xl"
        >
          A minimalist AI-driven engine designed to safeguard your wealth through real-time predictive intelligence and cinematic financial simulations.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-wrap justify-center gap-6"
        >
          <Link
            href="/simulate"
            className="group relative flex h-14 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition-all hover:scale-105 active:scale-95"
          >
            Start Simulation
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            href="/decide"
            className="group flex h-14 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 transition-all hover:bg-white/[0.08] hover:text-white"
          >
            Predict Runway
          </Link>
        </motion.div>
      </div>

      {/* Bottom Right Description */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-10 right-10 hidden max-w-[280px] text-right md:block"
      >
        <p className="text-[10px] uppercase tracking-[0.3em] text-white">
          System Status: {isConnected ? "Active & Syncing" : "Reconnecting"}
        </p>
        <p className="mt-4 text-[11px] leading-relaxed text-white/60">
          Your current runway stands at <span className="text-white">{days} days</span>. 
          Balance: {currencyFormatter.format(balance)}. 
          Web3-ready financial engine.
        </p>
      </motion.div>

      {/* Bottom Left Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="absolute bottom-10 left-10 hidden items-center gap-4 md:flex"
      >
        <div className="h-[1px] w-12 bg-white/20" />
        <span className="text-[10px] uppercase tracking-[0.4em] text-white">Scroll down</span>
      </motion.div>

      {/* Cinematic Flares */}
      <div className="pointer-events-none absolute top-0 left-1/4 h-1 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-1 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl" />
    </section>
  );
}
