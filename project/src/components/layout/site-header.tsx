"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/simulate", label: "Pay" },
  { href: "/decide", label: "Decide" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-background/92 backdrop-blur-xl">
      <div className="page-gutter">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-6">
          <Link href="/" className="text-lg font-semibold tracking-[0.28em] text-white">
            FINAI
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-[11px] uppercase tracking-[0.24em] transition-colors",
                    isActive ? "text-white" : "text-white/46 hover:text-white/80"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-[11px] uppercase tracking-[0.24em] text-white/38 sm:inline-block">
              Live finance engine
            </span>
            <Link
              href="/simulate"
              className="hidden items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/70 transition-colors hover:border-white/20 hover:text-white md:inline-flex"
            >
              Open pay
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
