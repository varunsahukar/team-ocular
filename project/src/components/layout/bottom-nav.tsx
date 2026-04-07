"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Zap, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: Zap },
  { href: "/simulate", label: "Execute", icon: PlusCircle },
  { href: "/decide", label: "Predict", icon: MousePointer2 },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-background/92 px-4 py-3 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex w-full flex-col items-center justify-center rounded-[1.25rem] border px-3 py-3 transition-all duration-300",
                isActive
                  ? "border-white/10 bg-white/[0.05] text-white"
                  : "border-transparent text-white/20 hover:text-white/40"
              )}
            >
              <Icon className="size-[16px]" />
              <span className="mt-1.5 text-[9px] uppercase tracking-[0.3em]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
