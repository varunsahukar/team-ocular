"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function SimulateTransaction() {
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const numericAmount = Number(amount);
  const merchantName = merchant.trim();
  const merchantGlyph = merchantName ? merchantName[0].toUpperCase() : "F";

  const handlePay = async () => {
    if (!numericAmount || !merchantName) return;

    setIsPaying(true);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/transactions`,
        {
          amount: numericAmount,
          merchant: merchantName,
          category: "Simulated",
        }
      );
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPaying(false);
    }
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
            <span className="section-label">Execution Unit</span>
          </div>

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]"
              >
                <section className="surface-panel p-10">
                  <p className="section-label">Command</p>
                  <h1 className="mt-6 text-[clamp(3rem,6vw,5.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
                    Calibrate your <br />
                    <span className="text-white/40 italic">burn rate.</span>
                  </h1>
                  <p className="mt-8 max-w-lg text-lg leading-relaxed text-white/50">
                    Submit a merchant transaction to the neural engine. Every entry triggers an immediate global re-simulation of your financial runway.
                  </p>

                  <div className="mt-12 grid gap-4 sm:grid-cols-2">
                    <InfoPanel label="Protocol" value="Direct Ledger" />
                    <InfoPanel label="Category" value="Live Assets" />
                  </div>
                </section>

                <section className="surface-panel p-10">
                  <div className="flex flex-col items-start">
                    <div className="flex size-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xl font-light text-white">
                      {merchantGlyph}
                    </div>
                    <p className="mt-8 text-[9px] uppercase tracking-[0.4em] text-white/20">
                      Entity
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                      {merchantName || "Awaiting input..."}
                    </h2>
                  </div>

                  <div className="mt-12 space-y-8">
                    <label className="block">
                      <span className="section-label">Allocation</span>
                      <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.015] p-6">
                        <Input
                          type="number"
                          value={amount}
                          onChange={(event) => setAmount(event.target.value)}
                          placeholder="0"
                          className="h-auto border-none bg-transparent p-0 text-5xl font-semibold tracking-tight text-white placeholder:text-white/5 focus-visible:ring-0 md:text-6xl"
                          autoFocus
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="section-label">Recipient</span>
                      <Input
                        value={merchant}
                        onChange={(event) => setMerchant(event.target.value)}
                        placeholder="Starbucks, Uber, Amazon..."
                        className="mt-4 h-16 rounded-[1.25rem] border-white/10 bg-white/[0.015] px-6 text-base text-white placeholder:text-white/10 focus:border-white/20"
                      />
                    </label>

                    <div className="rounded-[1.25rem] border border-white/5 bg-white/[0.01] p-6">
                      <p className="section-label">Recalibration Preview</p>
                      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                        {numericAmount > 0 ? currencyFormatter.format(numericAmount) : "---"}
                      </p>
                      <p className="mt-3 text-[11px] leading-relaxed text-white/30">
                        Balance will be adjusted across all connected nodes upon execution.
                      </p>
                    </div>
                  </div>

                  <div className="mt-10">
                    <Button
                      onClick={handlePay}
                      disabled={!numericAmount || !merchantName || isPaying}
                      className="h-16 w-full rounded-full bg-white text-[10px] font-semibold uppercase tracking-[0.3em] text-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      {isPaying ? "Processing..." : "Confirm Execution"}
                    </Button>
                  </div>
                </section>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="surface-panel flex min-h-[70vh] flex-col items-center justify-center px-6 py-10 text-center"
              >
                <div className="flex size-32 items-center justify-center rounded-full border border-[var(--stock-green-muted)] bg-[var(--stock-green-muted)]/10 shadow-[0_0_40px_rgba(0,255,136,0.1)]">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring", 
                      damping: 10, 
                      stiffness: 200, 
                      delay: 0.2 
                    }}
                  >
                    <CheckCircle2 className="size-16 text-[var(--stock-green)]" />
                  </motion.div>
                </div>
                <p className="section-label mt-10 text-[var(--stock-green)]">Execution Successful</p>
                <h2 className="mt-4 font-display text-5xl font-semibold tracking-tight text-white md:text-6xl">
                  {currencyFormatter.format(numericAmount)}
                </h2>
                <p className="mt-6 max-w-md text-sm leading-relaxed text-white/40">
                  Transaction ledger updated. The neural engine is currently recalibrating your runway and risk profiles.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

function InfoPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-card px-5 py-5">
      <p className="section-label">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-white">{value}</p>
    </div>
  );
}
