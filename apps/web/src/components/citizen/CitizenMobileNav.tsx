"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquareIcon,
  UsersIcon,
  GlobeIcon,
  BuildingIcon,
} from "@/components/icons";

interface NavItem {
  name: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
  badge?: string;
}

export default function CitizenMobileNav() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      name: "Fil",
      href: "/feed",
      icon: (active) => (
        <MessageSquareIcon
          className={`size-5 transition-transform duration-200 ${
            active ? "scale-110 text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-gray-400"
          }`}
        />
      ),
    },
    {
      name: "Espaces",
      href: "/communities",
      badge: "Live",
      icon: (active) => (
        <UsersIcon
          className={`size-5 transition-transform duration-200 ${
            active ? "scale-110 text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-gray-400"
          }`}
        />
      ),
    },
    {
      name: "Agenda",
      href: "/events",
      icon: (active) => (
        <GlobeIcon
          className={`size-5 transition-transform duration-200 ${
            active ? "scale-110 text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-gray-400"
          }`}
        />
      ),
    },
    {
      name: "Gestion",
      href: "/dashboard/associations",
      icon: (active) => (
        <BuildingIcon
          className={`size-5 transition-transform duration-200 ${
            active ? "scale-110 text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-gray-400"
          }`}
        />
      ),
    },
  ];

  return (
    <nav
      aria-label="Navigation mobile adaptative"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200/80 bg-white/95 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 backdrop-blur-md transition-colors dark:border-gray-800/80 dark:bg-gray-900/95 lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/feed" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-h-[48px] min-w-[64px] flex-col items-center justify-center rounded-2xl px-2 py-1 text-center transition-all duration-200 active:scale-95 ${
                isActive
                  ? "text-brand-600 dark:text-brand-400 font-bold"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {/* Active Indicator Top Pill */}
              {isActive && (
                <span className="absolute -top-1.5 h-1 w-6 rounded-full bg-brand-600 shadow-[0_0_8px_rgba(235,94,40,0.5)] dark:bg-brand-400" />
              )}

              {/* Icon with potential badge */}
              <div className="relative">
                {item.icon(isActive)}
                {item.badge && !isActive && (
                  <span className="absolute -right-2 -top-1 size-2 rounded-full bg-emerald-500" />
                )}
              </div>

              {/* Label */}
              <span className="mt-1 text-[11px] tracking-tight font-medium">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
