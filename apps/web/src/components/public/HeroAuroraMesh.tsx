"use client";

import React, { useState } from "react";
import { Sparkles, Eye, Layers } from "lucide-react";

export type BackgroundTheme = "TWILIGHT" | "TOPOGRAPHIC" | "MINIMAL";

interface HeroAuroraMeshProps {
  initialTheme?: BackgroundTheme;
  showThemeSelector?: boolean;
}

export const HeroAuroraMesh: React.FC<HeroAuroraMeshProps> = ({
  initialTheme = "TOPOGRAPHIC",
  showThemeSelector = true,
}) => {
  const [theme, setTheme] = useState<BackgroundTheme>(initialTheme);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* ------------------------------------------------------------------ */}
      {/* 1. THEME 1 : TOPOGRAPHIC NEON MESH (RÉSEAU 77 COMMUNES DU BÉNIN)   */}
      {/* ------------------------------------------------------------------ */}
      {theme === "TOPOGRAPHIC" && (
        <div className="absolute inset-0 animate-in fade-in duration-700">
          {/* Background image with subtle blend and dark mask */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 dark:opacity-35 mix-blend-screen"
            style={{
              backgroundImage: "url('/images/landing-bg-topographic-mesh.jpg')",
            }}
          />
          {/* Radial mask to keep text readability crisp */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white dark:from-gray-950/90 dark:via-gray-950/70 dark:to-gray-950" />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. THEME 2 : COTONOU TWILIGHT LUMIÈRES DE LA CITÉ                  */}
      {/* ------------------------------------------------------------------ */}
      {theme === "TWILIGHT" && (
        <div className="absolute inset-0 animate-in fade-in duration-700">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-30 blur-[2px] scale-105"
            style={{
              backgroundImage: "url('/images/landing-bg-cotonou-twilight.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white dark:from-gray-950/90 dark:via-gray-950/80 dark:to-gray-950" />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 3. FLOATING AURORA ORBS (FLOATING GPU-ACCELERATED ACCENTS)         */}
      {/* ------------------------------------------------------------------ */}
      <div className="animate-aurora-drift absolute -top-40 left-1/2 -translate-x-1/2 size-[680px] rounded-full bg-gradient-to-tr from-brand-500/15 via-indigo-400/12 to-emerald-400/15 blur-[130px] dark:from-brand-600/20 dark:via-indigo-900/20 dark:to-emerald-900/20" />
      <div className="animate-aurora-drift absolute top-[750px] -left-32 size-[450px] rounded-full bg-emerald-500/10 blur-[120px] dark:bg-emerald-950/25" />
      <div className="animate-aurora-drift absolute top-[1400px] -right-32 size-[450px] rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-950/25" />

      {/* Subtle Dot Matrix Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:28px_28px] opacity-40 dark:opacity-30" />

      {/* ------------------------------------------------------------------ */}
      {/* FLOATING INTERACTIVE THEME SELECTOR PILL (EXTRAORDINARY & PRO)     */}
      {/* ------------------------------------------------------------------ */}
      {showThemeSelector && (
        <div className="pointer-events-auto fixed bottom-5 left-5 z-40 hidden sm:flex items-center gap-1 rounded-2xl border border-gray-200/90 bg-white/90 p-1.5 shadow-xl backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/90">
          <span className="flex size-6 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
            <Layers className="size-3.5" />
          </span>

          <button
            type="button"
            onClick={() => setTheme("TOPOGRAPHIC")}
            className={`rounded-xl px-2.5 py-1 text-[11px] font-bold transition ${
              theme === "TOPOGRAPHIC"
                ? "bg-brand-600 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            Maillage 77 Communes
          </button>

          <button
            type="button"
            onClick={() => setTheme("TWILIGHT")}
            className={`rounded-xl px-2.5 py-1 text-[11px] font-bold transition ${
              theme === "TWILIGHT"
                ? "bg-brand-600 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            Cotonou Nocturne
          </button>

          <button
            type="button"
            onClick={() => setTheme("MINIMAL")}
            className={`rounded-xl px-2.5 py-1 text-[11px] font-bold transition ${
              theme === "MINIMAL"
                ? "bg-brand-600 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            Épuré
          </button>
        </div>
      )}
    </div>
  );
};

export default HeroAuroraMesh;
