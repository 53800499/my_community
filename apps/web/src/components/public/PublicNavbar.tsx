"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { useAuth } from "@/features/auth";
import {
  Sparkles,
  ArrowRight,
  LogOut,
  Menu,
  X,
  Compass,
} from "lucide-react";

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const userInitials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] || ""}`.toUpperCase()
    : "MC";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100/80 bg-white/80 backdrop-blur-md dark:border-gray-800/60 dark:bg-gray-950/80 transition-colors">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo - Minimal & Prestigious */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-xs transition group-hover:scale-105">
            <span className="font-extrabold text-sm tracking-wide">MC</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold text-sm tracking-tight text-gray-950 dark:text-white">
                My Community
              </span>
              <span className="size-1.5 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 leading-tight">
              Bénin
            </span>
          </div>
        </Link>

        {/* Center Navigation - Reduced to 3 Essential Links */}
        <nav className="hidden items-center gap-7 text-xs font-semibold text-gray-600 dark:text-gray-300 md:flex">
          <Link
            href="/#espaces"
            className="transition hover:text-brand-600 dark:hover:text-white"
          >
            Les 3 Espaces
          </Link>
          <Link
            href="/#comment-ca-marche"
            className="transition hover:text-brand-600 dark:hover:text-white"
          >
            Comment ça marche
          </Link>
          <Link
            href="/#faq"
            className="transition hover:text-brand-600 dark:hover:text-white"
          >
            FAQ
          </Link>
          <Link
            href="/communities"
            className="inline-flex items-center gap-1 text-gray-500 hover:text-brand-600 dark:hover:text-white transition"
          >
            <Compass className="size-3.5 text-brand-500" />
            <span>Territoires</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggleButton />

          {isAuthenticated ? (
            /* Logged in state */
            <div className="flex items-center gap-2">
              <Link
                href="/feed"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-brand-700"
              >
                <span>Mon Espace</span>
                <ArrowRight className="size-3.5" />
              </Link>

              <button
                type="button"
                onClick={logout}
                title="Se déconnecter"
                className="hidden sm:inline-flex size-8 items-center justify-center rounded-lg text-gray-400 hover:text-rose-600 transition"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          ) : (
            /* Visitor state */
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-gray-700 hover:text-brand-600 dark:text-gray-300 dark:hover:text-white px-2.5 py-1.5 transition"
              >
                Connexion
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-brand-700 hover:scale-[1.02]"
              >
                <Sparkles className="size-3.5" />
                <span>Rejoindre</span>
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            className="inline-flex size-9 items-center justify-center rounded-xl border border-gray-200/80 bg-white text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden ml-1"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Native App Feel, Soft & Clean) */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 z-30 bg-gray-950/40 backdrop-blur-xs md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-40 border-b border-gray-100 bg-white/95 px-5 py-5 backdrop-blur-xl shadow-xl dark:border-gray-800 dark:bg-gray-950/95 md:hidden animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col gap-2.5 text-sm font-semibold">
              <Link
                href="/#espaces"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-gray-800 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900"
              >
                <span>Les 3 Espaces Dédiés</span>
              </Link>
              <Link
                href="/#comment-ca-marche"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-gray-800 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900"
              >
                <span>Comment ça marche</span>
              </Link>
              <Link
                href="/#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-gray-800 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900"
              >
                <span>Foire Aux Questions</span>
              </Link>
              <Link
                href="/communities"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-gray-800 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900"
              >
                <span className="flex items-center gap-2">
                  <Compass className="size-4 text-brand-600" />
                  <span>Explorer Territoires</span>
                </span>
                <span className="text-[10px] font-bold text-gray-400">77 Communes</span>
              </Link>

              <div className="mt-2 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/feed"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 text-xs font-bold text-white shadow-xs"
                    >
                      <span>Accéder à Mon Espace Citoyen</span>
                      <ArrowRight className="size-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex h-9 items-center justify-center gap-2 text-xs font-semibold text-rose-600 hover:underline"
                    >
                      <LogOut className="size-3.5" />
                      <span>Se déconnecter</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 text-xs font-bold text-white shadow-xs"
                    >
                      <Sparkles className="size-4" />
                      <span>Créer un compte citoyen</span>
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex h-10 items-center justify-center rounded-xl border border-gray-200 text-xs font-bold text-gray-800 dark:border-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <span>Se connecter</span>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default PublicNavbar;
