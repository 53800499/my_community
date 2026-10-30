"use client";

import React, { useState, useEffect } from "react";
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
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

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
          {mounted && isAuthenticated ? (
            <Link
              href="/communities"
              className="inline-flex items-center gap-1 text-gray-500 hover:text-brand-600 dark:hover:text-white transition"
            >
              <Compass className="size-3.5 text-brand-500" />
              <span>Territoires</span>
            </Link>
          ) : (
            <Link
              href="/#espaces"
              className="inline-flex items-center gap-1 text-gray-500 hover:text-brand-600 dark:hover:text-white transition"
            >
              <Compass className="size-3.5 text-brand-500" />
              <span>Découvrir</span>
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Desktop-only Theme Toggle (on mobile, moved to the drawer submenu) */}
          <div className="hidden md:flex">
            <ThemeToggleButton />
          </div>

          {mounted && isAuthenticated ? (
            /* Logged in state */
            <div className="flex items-center gap-2">
              <Link
                href="/feed"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-brand-700"
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
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-gray-700 hover:text-brand-600 dark:text-gray-300 dark:hover:text-white px-2 py-1.5 transition"
              >
                Connexion
              </Link>

              {/* Desktop-only "Rejoindre" button (on mobile, placed in the drawer submenu) */}
              <Link
                href="/register"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-brand-700 hover:scale-[1.02]"
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
            className="inline-flex size-9 items-center justify-center rounded-xl border border-gray-200/80 bg-white text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden ml-0.5"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Native App Feel, Frosted Glass & Tactile Ergonomics) */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 z-30 bg-gray-950/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 top-16 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-gray-200/80 bg-white/95 px-5 py-6 backdrop-blur-2xl shadow-2xl dark:border-gray-800 dark:bg-gray-950/95 md:hidden animate-in slide-in-from-top-4 duration-200 rounded-b-3xl">
            {/* Top Territory Badge in Drawer */}
            <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-3 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800/60 mb-4">
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  République du Bénin
                </span>
              </div>
              <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                77 Communes
              </span>
            </div>

            <nav className="flex flex-col gap-1.5 text-sm font-semibold">
              <Link
                href="/#espaces"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-gray-800 hover:bg-gray-100/80 dark:text-gray-200 dark:hover:bg-gray-900 transition-colors"
              >
                <span>Les 3 Espaces Dédiés</span>
                <span className="text-xs text-gray-400">→</span>
              </Link>
              <Link
                href="/#simulateur"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-gray-800 hover:bg-gray-100/80 dark:text-gray-200 dark:hover:bg-gray-900 transition-colors"
              >
                <span>Simulateur d&apos;Application</span>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                  Interactif
                </span>
              </Link>
              <Link
                href="/#comment-ca-marche"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-gray-800 hover:bg-gray-100/80 dark:text-gray-200 dark:hover:bg-gray-900 transition-colors"
              >
                <span>Comment ça marche</span>
                <span className="text-xs text-gray-400">→</span>
              </Link>
              <Link
                href="/#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-gray-800 hover:bg-gray-100/80 dark:text-gray-200 dark:hover:bg-gray-900 transition-colors"
              >
                <span>Foire Aux Questions (FAQ)</span>
                <span className="text-xs text-gray-400">→</span>
              </Link>
              <Link
                href={mounted && isAuthenticated ? "/communities" : "/#espaces"}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-gray-800 hover:bg-gray-100/80 dark:text-gray-200 dark:hover:bg-gray-900 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Compass className="size-4 text-brand-600" />
                  <span>{mounted && isAuthenticated ? "Explorer les Territoires" : "Découvrir la Plateforme"}</span>
                </span>
                <span className="text-[10px] font-bold text-gray-400">Bénin</span>
              </Link>

              {/* Mobile Theme Toggle Row (Requested in drawer submenu) */}
              <div className="flex items-center justify-between rounded-xl bg-gray-50/80 px-3.5 py-2.5 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800/60 my-1">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Mode Sombre / Clair
                </span>
                <ThemeToggleButton />
              </div>

              <div className="mt-2 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex flex-col gap-2.5">
                {mounted && isAuthenticated ? (
                  <>
                    <Link
                      href="/feed"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-600 text-xs font-bold text-white shadow-md shadow-brand-500/25 active:scale-95 transition"
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
                      className="flex h-10 items-center justify-center gap-2 text-xs font-semibold text-rose-600 hover:underline"
                    >
                      <LogOut className="size-3.5" />
                      <span>Se déconnecter</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Primary "Rejoindre" Button inside Mobile Submenu */}
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-xs font-bold text-white shadow-md shadow-brand-500/25 active:scale-95 transition"
                    >
                      <Sparkles className="size-4" />
                      <span>Rejoindre My Community Bénin</span>
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex h-11 items-center justify-center rounded-2xl border border-gray-200 text-xs font-bold text-gray-800 dark:border-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 active:scale-95 transition"
                    >
                      <span>Se connecter à mon compte</span>
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
