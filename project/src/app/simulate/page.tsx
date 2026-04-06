"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const numericAmount = Number(amount);
  const merchantName = merchant.trim();
  const merchantGlyph = merchantName ? merchantName[0].toUpperCase() : "F";

  const handlePay = async () => {
    if (!numericAmount || !merchantName) return;

    setErrorMessage(null);
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
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error(error);
      setErrorMessage("The payment engine could not submit this transaction. Please try again.");
    } finally {
      setIsPaying(false);
    }
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
            <span className="section-label">Payment simulator</span>
          </div>

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]"
              >
                <section className="surface-panel px-6 py-8 md:px-10 md:py-10">
                  <p className="section-label">Pay</p>
                  <h1 className="text-balance mt-5 max-w-[11ch] text-[clamp(3.2rem,7vw,6.4rem)] font-semibold leading-[0.94] tracking-[-0.08em] text-white">
                    Simulate a payment before it reshapes your week.
                  </h1>
                  <p className="mt-6 max-w-xl text-base leading-8 text-white/62">
                    This screen keeps your payment feature intact, but gives it a calmer product feel. Submit a merchant expense here and the dashboard will update through your existing backend flow.
                  </p>

                  <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    <InfoPanel label="Flow" value="UPI simulation" />
                    <InfoPanel label="Category" value="Simulated spend" />
                  </div>

                  <div className="mt-10 border-t border-white/10 pt-6">
                    <p className="text-sm leading-7 text-white/56">
                      Use this when you want to feel the exact impact of a merchant payment, then return to the dashboard to see the new runway and chart.
                    </p>
                  </div>
                </section>

                <section className="surface-panel px-6 py-8 md:px-8 md:py-10">
                  <div className="flex flex-col items-start">
                    <div className="flex size-[4.5rem] items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-2xl font-semibold text-white">
                      {merchantGlyph}
                    </div>
                    <p className="mt-6 text-[11px] uppercase tracking-[0.24em] text-white/42">
                      Merchant
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
                      {merchantName || "Enter merchant"}
                    </h2>
                    <p className="mt-2 text-sm text-white/52">Ready to post to the live engine</p>
                  </div>

                  <div className="mt-10 space-y-6">
                    <label className="block">
                      <span className="section-label">Amount</span>
                      <div className="mt-3 rounded-[1.75rem] border border-white/10 bg-white/[0.025] px-6 py-6">
                        <Input
                          type="number"
                          value={amount}
                          onChange={(event) => setAmount(event.target.value)}
                          placeholder="0"
                          className="h-auto border-none bg-transparent px-0 py-0 text-5xl font-semibold tracking-[-0.08em] text-white placeholder:text-white/18 focus-visible:ring-0 md:text-6xl"
                          autoFocus
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="section-label">Merchant name</span>
                      <Input
                        value={merchant}
                        onChange={(event) => setMerchant(event.target.value)}
                        placeholder="Starbucks, Swiggy, Uber..."
                        className="mt-3 h-16 rounded-[1.25rem] border-white/10 bg-white/[0.025] px-5 text-base text-white placeholder:text-white/30"
                      />
                    </label>

                    {errorMessage ? (
                      <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-5 py-4 text-sm leading-7 text-white/62">
                        {errorMessage}
                      </div>
                    ) : null}

                    <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-5 py-4">
                      <p className="section-label">Preview</p>
                      <p className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-white">
                        {numericAmount > 0 ? currencyFormatter.format(numericAmount) : "Enter an amount"}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-white/52">
                        The dashboard will refresh after submission and reflect the backend update.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button
                      onClick={handlePay}
                      disabled={!numericAmount || !merchantName || isPaying}
                      className="h-14 w-full rounded-full border border-white/10 bg-white px-6 text-[11px] font-medium uppercase tracking-[0.24em] text-black hover:bg-white/90"
                    >
                      {isPaying ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Processing
                        </>
                      ) : (
                        <>
                          Confirm payment
                          <ArrowUpRight className="size-4" />
                        </>
                      )}
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
                <div className="flex size-28 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                  >
                    <CheckCircle2 className="size-14 text-white" />
                  </motion.div>
                </div>
                <p className="section-label mt-8">Payment posted</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white md:text-5xl">
                  {currencyFormatter.format(numericAmount)}
                </h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-white/58">
                  The transaction was submitted successfully. You are being returned to the dashboard so the updated metrics can come into view.
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
