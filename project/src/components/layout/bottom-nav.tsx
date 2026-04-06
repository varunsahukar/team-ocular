"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/simulate", label: "Pay", icon: PlusCircle },
  { href: "/decide", label: "Decide", icon: Zap },
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
                "flex w-full flex-col items-center justify-center rounded-[1.25rem] border px-3 py-2 transition-all duration-200",
                isActive
                  ? "border-white/16 bg-white/[0.05] text-white"
                  : "border-transparent text-white/46 hover:border-white/10 hover:bg-white/[0.03] hover:text-white/80"
              )}
            >
              <Icon className="size-[18px]" />
              <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
