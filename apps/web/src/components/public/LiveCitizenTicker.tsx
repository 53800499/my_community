"use client";

import React from "react";
import { Sparkles, MapPin, CheckCircle2, ShieldCheck, Heart } from "lucide-react";

interface TickerItem {
  id: string;
  quarter: string;
  commune: string;
  activity: string;
  badge: string;
  badgeColor: string;
  timeAgo: string;
}

const TICKER_ITEMS: TickerItem[] = [
  {
    id: "1",
    commune: "Cotonou",
    quarter: "Haie-Vive",
    activity: "34 voisins inscrits pour la matinée salubrité",
    badge: "Action Citoyenne",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    timeAgo: "Il y a 4 min",
  },
  {
    id: "2",
    commune: "Abomey-Calavi",
    quarter: "Tankpè (UAC)",
    activity: "Quittance de loyer horodatée générée en FCFA",
    badge: "Résidence Étudiante",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    timeAgo: "Il y a 9 min",
  },
  {
    id: "3",
    commune: "Cotonou",
    quarter: "Fidjrossè",
    activity: "2 lampadaires solaires financés via Mobile Money",
    badge: "Trésorerie Ouverte",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    timeAgo: "Il y a 14 min",
  },
  {
    id: "4",
    commune: "Parakou",
    quarter: "Banikanni",
    activity: "Entraide fournitures scolaires pour 12 familles",
    badge: "Entraide Locale",
    badgeColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    timeAgo: "Il y a 22 min",
  },
  {
    id: "5",
    commune: "Porto-Novo",
    quarter: "Avakpa",
    activity: "Assemblée Générale du Comité de Quartier convoquée",
    badge: "Gouvernance",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    timeAgo: "Il y a 31 min",
  },
  {
    id: "6",
    commune: "Ouidah",
    quarter: "Pahou",
    activity: "Nouvel état des lieux d'entrée certifié",
    badge: "Bail Sécurisé",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    timeAgo: "Il y a 45 min",
  },
];

export const LiveCitizenTicker: React.FC = () => {
  return (
    <div className="relative w-full overflow-hidden border-y border-gray-200/80 bg-white/70 py-2.5 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-950/70 select-none">
      {/* Side Fade Gradients for Seamless Infinity Look */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white dark:from-gray-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white dark:from-gray-950 to-transparent" />

      {/* Marquee Track */}
      <div className="animate-marquee flex items-center gap-6">
        {/* First Loop */}
        {TICKER_ITEMS.map((item) => (
          <div
            key={`a-${item.id}`}
            className="flex items-center gap-3 shrink-0 rounded-full border border-gray-200/80 bg-white/80 px-3.5 py-1 text-xs shadow-2xs backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>

            <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
              <MapPin className="size-3 text-brand-500" />
              <span>{item.commune}</span>
              <span className="text-gray-400 font-normal">({item.quarter})</span>
            </span>

            <span className="text-gray-400">•</span>

            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {item.activity}
            </span>

            <span className={`rounded-full border px-2 py-0.2 text-[10px] font-bold ${item.badgeColor}`}>
              {item.badge}
            </span>

            <span className="text-[10px] text-gray-400">{item.timeAgo}</span>
          </div>
        ))}

        {/* Duplicate Loop for Infinite Scroll */}
        {TICKER_ITEMS.map((item) => (
          <div
            key={`b-${item.id}`}
            className="flex items-center gap-3 shrink-0 rounded-full border border-gray-200/80 bg-white/80 px-3.5 py-1 text-xs shadow-2xs backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>

            <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
              <MapPin className="size-3 text-brand-500" />
              <span>{item.commune}</span>
              <span className="text-gray-400 font-normal">({item.quarter})</span>
            </span>

            <span className="text-gray-400">•</span>

            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {item.activity}
            </span>

            <span className={`rounded-full border px-2 py-0.2 text-[10px] font-bold ${item.badgeColor}`}>
              {item.badge}
            </span>

            <span className="text-[10px] text-gray-400">{item.timeAgo}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveCitizenTicker;
