"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/simulate", label: "Execute" },
  { href: "/decide", label: "Predict" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-background/92 backdrop-blur-xl">
      <div className="page-gutter">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-6">
          <Link href="/" className="font-display text-xl font-light tracking-[0.4em] text-white text-glow">
            HELIX
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-[10px] uppercase tracking-[0.3em] transition-all",
                    isActive ? "text-white" : "text-white/30 hover:text-white/70"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-6">
            <span className="hidden text-[9px] uppercase tracking-[0.4em] text-white/20 sm:inline-block">
              Neural Engine v1.0
            </span>
            <Link
              href="/simulate"
              className="group hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-[10px] uppercase tracking-[0.3em] text-white/80 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white md:inline-flex"
            >
              Initialize
              <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
