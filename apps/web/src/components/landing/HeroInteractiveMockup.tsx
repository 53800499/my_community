"use client";

import React, { useState } from "react";
import Badge from "@/components/ui/badge/Badge";
import {
  UsersIcon,
  BuildingIcon,
  CheckIcon,
  HeartIcon,
  ThumbsUpIcon,
  ShieldCheckIcon,
  BanknoteIcon,
  MapPinIcon,
} from "@/components/icons";
import { Vote, Check } from "lucide-react";

export const HeroInteractiveMockup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"citizen" | "residence">("citizen");
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(142);

  const handleVote = () => {
    if (!hasVoted) {
      setVoteCount((prev) => prev + 1);
      setHasVoted(true);
    }
  };

  return (
    <div className="relative mx-auto mt-12 w-full max-w-5xl">
      {/* Decorative ambient glow */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-500 opacity-20 blur-2xl transition duration-1000 dark:opacity-30" />

      {/* Main Container */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/90 bg-white/95 p-4 shadow-2xl backdrop-blur-xl sm:p-6 dark:border-gray-800/90 dark:bg-gray-900/95">
        {/* Top Control Bar with Tab Switcher */}
        <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="size-3 rounded-full bg-rose-400/80" />
              <span className="size-3 rounded-full bg-amber-400/80" />
              <span className="size-3 rounded-full bg-emerald-400/80" />
            </div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Aperçu immersif de l&apos;application en direct
            </span>
          </div>

          {/* Interactive Mode Toggle */}
          <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setActiveTab("citizen")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === "citizen"
                  ? "bg-white text-brand-700 shadow-xs dark:bg-gray-900 dark:text-brand-300"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <UsersIcon className="size-3.5" />
              <span>Démocratie de Quartier</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("residence")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === "residence"
                  ? "bg-white text-indigo-700 shadow-xs dark:bg-gray-900 dark:text-indigo-300"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <BuildingIcon className="size-3.5" />
              <span>Résidences &amp; Baux</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Mode Citoyen & Démocratie de Quartier */}
        {activeTab === "citizen" && (
          <div className="mt-5 space-y-4 text-left">
            {/* Header of post */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-600 font-bold text-white shadow-xs">
                  AJ
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                      Association des Jeunes de Bidossessi (Abomey-Calavi)
                    </h4>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <ShieldCheckIcon className="size-3" />
                      Certifié NPI
                    </span>
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <MapPinIcon className="size-3 text-brand-600" />
                    <span>Arrondissement d&apos;Abomey-Calavi • Délibération citoyenne</span>
                  </p>
                </div>
              </div>

              <Badge variant="light" color="primary" size="sm">
                Concertation Locale
              </Badge>
            </div>

            {/* Post Content */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800/80 dark:bg-gray-800/40">
              <h5 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                <Vote className="size-4.5 text-brand-600 shrink-0" />
                <span>Projet Participatif 2026 : Installation de 6 lampadaires solaires au Carrefour Bidossessi</span>
              </h5>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                Chers voisins et résidents, suite aux échanges lors de l&apos;assemblée de quartier, nous soumettons au vote des habitants l&apos;affectation prioritaire d&apos;une partie du fonds citoyen pour sécuriser la traverse pavée. Votre vote compte pour transmission à la Mairie.
              </p>

              {/* Live Interactive Voting Poll */}
              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-800 dark:text-gray-200">
                    Résultat provisoire des votes certifiés
                  </span>
                  <span className="text-brand-600 dark:text-brand-400 font-bold">
                    {voteCount} citoyens votants
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-500 transition-all duration-500"
                    style={{ width: "84%" }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    84% Favorable (119 voix)
                  </span>
                  <span>16% Réserves (23 voix)</span>
                </div>

                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleVote}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                      hasVoted
                        ? "bg-emerald-600 text-white"
                        : "bg-brand-600 text-white hover:bg-brand-700"
                    }`}
                  >
                    <CheckIcon className="size-3.5" />
                    <span>{hasVoted ? "Vote Citoyen Enregistré !" : "Voter 'Pour' avec mon NPI"}</span>
                  </button>
                  <span className="text-[11px] text-gray-400">
                    Vote anonymisé &amp; inviolable selon la loi numérique du Bénin.
                  </span>
                </div>
              </div>
            </div>

            {/* Reaction Bar */}
            <div className="flex items-center justify-between pt-1 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1 text-rose-500 font-semibold">
                  <HeartIcon className="size-4 fill-rose-500" />
                  <span>58 soutiens</span>
                </span>
                <span className="inline-flex items-center gap-1 text-brand-600 font-semibold">
                  <ThumbsUpIcon className="size-4" />
                  <span>34 avis utiles</span>
                </span>
              </div>
              <span className="text-[11px]">Dernière signature il y a 4 min par un résident du quartier</span>
            </div>
          </div>
        )}

        {/* Tab 2: Mode Résidence & Baux */}
        {activeTab === "residence" && (
          <div className="mt-5 space-y-4 text-left">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-brand-700 font-bold text-white shadow-xs">
                  RU
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                      Résidence Universitaire Tankpè (Campus UAC)
                    </h4>
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                      Baux Numériques
                    </span>
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <MapPinIcon className="size-3 text-indigo-600" />
                    <span>Pavillon A • 48 Chambres Étudiantes • Abomey-Calavi</span>
                  </p>
                </div>
              </div>

              <Badge variant="light" color="success" size="sm">
                92% Occupé
              </Badge>
            </div>

            {/* Residence Detail Cards Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-gray-800/80 dark:bg-gray-800/40">
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  Statut d&apos;Occupation
                </span>
                <p className="mt-1 text-lg font-black text-gray-900 dark:text-white">
                  44 / 48 <span className="text-xs font-normal text-gray-500">chambres</span>
                </p>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                  <Check className="size-3 shrink-0" />
                  <span>4 chambres disponibles pour la rentrée</span>
                </span>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-gray-800/80 dark:bg-gray-800/40">
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  Loyer Moyen Étudiant
                </span>
                <p className="mt-1 text-lg font-black text-indigo-600 dark:text-indigo-400">
                  35 000 <span className="text-xs font-bold text-gray-700 dark:text-gray-300">FCFA / mois</span>
                </p>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-gray-500">
                  Eau &amp; Wi-Fi communautaire inclus
                </span>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-gray-800/80 dark:bg-gray-800/40">
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  Mode de Règlement
                </span>
                <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                  MTN MoMo &amp; Moov Flooz
                </p>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                  <Check className="size-3 shrink-0" />
                  <span>Quittance certifiée instantanée</span>
                </span>
              </div>
            </div>

            {/* Active digital lease sample */}
            <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-mono text-xs font-bold">
                  #204
                </div>
                <div>
                  <h6 className="text-xs font-bold text-gray-900 dark:text-white">
                    Bail Numérique • Chambre 204 (Solo Étudiant)
                  </h6>
                  <p className="text-[11px] text-gray-500">
                    Locataire : Koffi Mensah • NPI validé • Contrat signé électroniquement
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <BanknoteIcon className="size-3.5" />
                  <span>35 000 FCFA Payé</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroInteractiveMockup;
