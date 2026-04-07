"use client";

import { useSocket } from "@/components/providers/socket-provider";
import LuxuryHero from "@/components/dashboard/luxury-hero";
import { motion } from "framer-motion";
import { ArrowUpRight, Zap, Shield, Activity, Target, Cpu, LucideIcon } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const { metrics, isConnected } = useSocket();

  return (
    <main className="min-h-screen overflow-x-hidden relative">
      {/* 1. Hero Section */}
      <div className="relative z-10">
        <LuxuryHero
          balance={metrics?.balance ?? 0}
          days={metrics?.daysToZero ?? 0}
          isConnected={isConnected}
        />
      </div>

      {/* 2. Philosophy & Vision Section */}
      <section className="page-gutter py-32 md:py-48 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-white/20 to-transparent" />
        <div className="mx-auto max-w-4xl text-center space-y-12">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-label gold-glow"
          >
            The Philosophy
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-6xl font-light text-white leading-tight"
          >
            &quot;Complexity is the enemy of <span className="italic gold-glow">clarity</span>. Helix strips away the noise to focus on the only metric that matters: <span className="text-white/40">Time.</span>&quot;
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="h-px w-24 bg-white/20 mx-auto" 
          />
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-white/30 uppercase tracking-[0.5em] text-[10px]"
          >
            Founded on Precision
          </motion.p>
        </div>
      </section>

      {/* 3. Core Engine Descriptive Section */}
      <section className="page-gutter py-32 border-t border-white/5">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-24 lg:grid-cols-2 items-start">
            <div className="space-y-12 lg:sticky lg:top-32">
              <div className="space-y-6">
                <p className="section-label gold-glow">Core Engine</p>
                <h2 className="font-display text-5xl md:text-7xl font-semibold tracking-tight text-white leading-[1.1]">
                  Predictive <br />
                  <span className="gold-glow italic text-[0.8em]">Intelligence.</span>
                </h2>
                <p className="text-xl text-white/50 leading-relaxed max-w-xl">
                  Helix isn&apos;t just a dashboard. It&apos;s a high-performance financial operating system that simulates your future in real-time.
                </p>
              </div>
              
              <div className="flex gap-10">
                <StatItem label="Sync Speed" value="<100ms" />
                <StatItem label="Accuracy" value="99.9%" />
                <StatItem label="Uptime" value="100%" />
              </div>
            </div>
            
            <div className="grid gap-8">
              <DescriptiveCard 
                icon={Activity}
                title="Real-time Recalibration" 
                description="Every transaction triggers a global re-simulation of your liquidity. Our engine recalculates your burn rate and runway days instantly, ensuring you're never operating on stale data."
              />
              <DescriptiveCard 
                icon={Target}
                title="Predictive Scenario Engine" 
                description="Visualize the impact of any capital allocation before it happens. Use our 'what-if' simulator to compare different spending paths and protect your long-term runway."
              />
              <DescriptiveCard 
                icon={Shield}
                title="Neural Risk Indexing" 
                description="A sophisticated fragility score derived from behavioral velocity. We analyze the 'speed' of your spending to identify risk patterns before they become critical."
              />
              <DescriptiveCard 
                icon={Cpu}
                title="Helix Protocol" 
                description="Built on a high-concurrency architecture that synchronizes your execution units with the predictive backend, providing a seamless bridge between today's action and tomorrow's outcome."
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. UX/UI Focus Section */}
      <section className="page-gutter py-32 border-t border-white/5 overflow-hidden">
        <div className="mx-auto max-w-[1440px] grid gap-24 lg:grid-cols-[0.8fr_1.2fr] items-center">
          <div className="order-2 lg:order-1 relative min-h-[500px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-[3rem] border border-white/10" />
            <div className="relative z-10 p-12 text-center space-y-6">
              <div className="size-24 rounded-full border border-white/10 bg-black/40 flex items-center justify-center mx-auto backdrop-blur-xl">
                <Zap className="size-10 text-white/80" />
              </div>
              <p className="font-display text-3xl font-light text-white italic">&quot;Cinematic Finance&quot;</p>
              <p className="text-white/40 text-sm max-w-xs mx-auto leading-relaxed">
                A design language where data meets drama. Every metric is a performance, every insight a revelation.
              </p>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 space-y-10">
            <p className="section-label gold-glow">Experience Design</p>
            <h2 className="font-display text-5xl md:text-6xl font-semibold text-white leading-tight">
              Minimalist interface. <br />
              <span className="gold-glow italic">Maximalist insight.</span>
            </h2>
            <div className="space-y-8">
              <UXPoint 
                title="Dark Mode by Nature" 
                desc="A deep, high-contrast palette designed for focus and reduced eye strain during late-night strategic planning." 
              />
              <UXPoint 
                title="Zero Friction" 
                desc="Optimized for rapid execution. Submit transactions and run predictions with a single tap, removing the complexity of traditional banking." 
              />
              <UXPoint 
                title="Web3 Aesthetic" 
                desc="Clean typography and cosmic background effects bring the future of finance to your current workflow." 
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Call to Action Section */}
      <section className="page-gutter py-48 relative z-10 text-center border-t border-white/5">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_70%)]" />
        <div className="mx-auto max-w-3xl space-y-12 relative">
          <h2 className="font-display text-6xl md:text-8xl font-semibold text-white tracking-tight">Initialize Helix.</h2>
          <p className="text-white/40 text-xl max-w-xl mx-auto leading-relaxed">
            Stop reacting. Start predicting. Enter the terminal and take command of your financial velocity.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              href="/dashboard" 
              className="group relative inline-flex h-16 items-center px-12 rounded-full bg-white text-black text-[11px] font-bold uppercase tracking-[0.3em] overflow-hidden"
            >
              <span className="relative z-10">Enter Terminal</span>
              <motion.div 
                className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" 
              />
            </Link>
            <Link 
              href="/simulate" 
              className="inline-flex h-16 items-center px-10 rounded-full border border-white/10 text-white/60 text-[10px] uppercase tracking-[0.3em] hover:bg-white/5 hover:text-white transition-all"
            >
              Simulate First <ArrowUpRight className="ml-2 size-3" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="page-gutter py-12 border-t border-white/5 text-center">
        <p className="text-[10px] uppercase tracking-[0.5em] text-white/20">© 2026 Helix Engine. All systems operational.</p>
      </footer>
    </main>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <p className="text-[9px] uppercase tracking-[0.4em] text-[var(--gold-muted)]">{label}</p>
      <p className="font-display text-2xl font-medium text-white">{value}</p>
    </div>
  );
}

function DescriptiveCard({ icon: Icon, title, description }: { icon: LucideIcon, title: string; description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="surface-panel p-10 group hover:bg-white/[0.05] transition-all duration-500 border-white/5 hover:border-[var(--gold-muted)]"
    >
      <div className="flex items-center gap-6 mb-6">
        <div className="size-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 group-hover:text-[var(--gold)] transition-colors">
          <Icon className="size-6" />
        </div>
        <h3 className="font-display text-2xl font-medium text-white">{title}</h3>
      </div>
      <p className="text-sm text-white/40 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function UXPoint({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="space-y-2 border-l border-white/10 pl-8 relative">
      <div className="absolute left-0 top-0 w-px h-6 bg-[var(--gold)]" />
      <h4 className="text-white font-medium tracking-tight text-lg">{title}</h4>
      <p className="text-white/40 text-sm leading-relaxed max-w-md">{desc}</p>
    </div>
  );
}
