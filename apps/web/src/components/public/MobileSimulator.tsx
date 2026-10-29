"use client";

import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Building,
  Home,
  Users,
  Coins,
  ShieldCheck,
  Sparkles,
  Wifi,
  Battery,
  MapPin,
  Clock,
  ArrowUpRight,
} from "lucide-react";

type SimulatorTab = "FEED" | "RESIDENCE" | "ASSOCIATION";

export const MobileSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SimulatorTab>("FEED");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(42);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [voteSubmitted, setVoteSubmitted] = useState(false);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikeCount((prev) => prev + 1);
    } else {
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    }
  };

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

  const handleVote = () => {
    setVoteSubmitted(true);
    setTimeout(() => setVoteSubmitted(false), 3500);
  };

  return (
    <div className="relative mx-auto w-full max-w-sm sm:max-w-md">
      {/* Decorative Outer Aura Glow */}
      <div className="pointer-events-none absolute -inset-4 rounded-[60px] bg-gradient-to-tr from-brand-500/20 via-indigo-500/15 to-emerald-500/20 blur-2xl dark:from-brand-600/30 dark:via-indigo-600/20 dark:to-emerald-600/30" />

      {/* Floating Badges (Visible on larger mobile / desktop) */}
      <div className="hidden sm:flex absolute -left-10 top-20 z-20 items-center gap-2 rounded-2xl border border-white/60 bg-white/90 px-3.5 py-2 shadow-lg backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/90 animate-bounce duration-1000">
        <span className="flex size-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <ShieldCheck className="size-4" />
        </span>
        <div className="text-left">
          <div className="text-[11px] font-bold text-gray-900 dark:text-white leading-tight">
            Baux Sécurisés
          </div>
          <div className="text-[9px] text-gray-500">100% légal &amp; horodaté</div>
        </div>
      </div>

      <div className="hidden sm:flex absolute -right-8 bottom-28 z-20 items-center gap-2 rounded-2xl border border-white/60 bg-white/90 px-3.5 py-2 shadow-lg backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/90">
        <span className="flex size-7 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          <Coins className="size-4" />
        </span>
        <div className="text-left">
          <div className="text-[11px] font-bold text-gray-900 dark:text-white leading-tight">
            Paiements FCFA
          </div>
          <div className="text-[9px] text-gray-500">MTN &amp; Moov Money</div>
        </div>
      </div>

      {/* Realistic Smartphone Shell */}
      <div className="relative rounded-[44px] sm:rounded-[48px] border-[8px] sm:border-[10px] border-gray-900 bg-gray-950 p-2 sm:p-2.5 shadow-2xl ring-1 ring-white/10 dark:border-gray-800">
        {/* Dynamic Island / Speaker Pill */}
        <div className="relative mx-auto flex h-6 w-28 items-center justify-center rounded-full bg-black">
          <div className="size-2 rounded-full bg-gray-900 ring-1 ring-gray-800" />
          <div className="ml-3 size-2.5 rounded-full bg-emerald-500/80 animate-pulse" />
        </div>

        {/* Screen Bezel & Container */}
        <div className="relative mt-2 flex flex-col overflow-hidden rounded-[34px] sm:rounded-[36px] bg-slate-50 text-slate-900 dark:bg-gray-950 dark:text-slate-100 h-[520px] sm:h-[560px]">
          {/* iOS / Android Status Bar */}
          <div className="flex h-8 items-center justify-between px-5 pt-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 select-none">
            <span>09:41</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold">5G</span>
              <Wifi className="size-3" />
              <Battery className="size-3.5 text-emerald-500" />
            </div>
          </div>

          {/* App Header Inside Simulator */}
          <div className="flex items-center justify-between border-b border-gray-200/70 bg-white/80 px-4 py-2.5 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-900/80">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 text-[10px] font-black text-white">
                MC
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold leading-tight text-gray-900 dark:text-white">
                    My Community
                  </span>
                  <CheckCircle2 className="size-3 text-emerald-500" />
                </div>
                <span className="text-[9px] text-gray-400">Bénin • Calavi / Cotonou</span>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
              En direct
            </span>
          </div>

          {/* Tactile Navigation Tabs (Interactive Switcher) */}
          <div className="grid grid-cols-3 gap-1 bg-gray-100/80 p-1.5 dark:bg-gray-900/80">
            <button
              type="button"
              onClick={() => setActiveTab("FEED")}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-bold transition-all ${
                activeTab === "FEED"
                  ? "bg-white text-brand-700 shadow-xs dark:bg-gray-800 dark:text-brand-300"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Users className="size-3.5" />
              <span>Voisinage</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("RESIDENCE")}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-bold transition-all ${
                activeTab === "RESIDENCE"
                  ? "bg-white text-indigo-700 shadow-xs dark:bg-gray-800 dark:text-indigo-300"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Home className="size-3.5" />
              <span>Mon Bail</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ASSOCIATION")}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-bold transition-all ${
                activeTab === "ASSOCIATION"
                  ? "bg-white text-emerald-700 shadow-xs dark:bg-gray-800 dark:text-emerald-300"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Coins className="size-3.5" />
              <span>Caisse</span>
            </button>
          </div>

          {/* Interactive Screen Content Body */}
          <div className="flex-1 overflow-y-auto p-3 text-left space-y-3">
            {/* ------------------------------------------------------------- */}
            {/* VIEW 1: FIL DE VOISINAGE (SOCIAL CITOYEN)                     */}
            {/* ------------------------------------------------------------- */}
            {activeTab === "FEED" && (
              <div className="space-y-2.5 animate-in fade-in duration-200">
                {/* Main Interactive Post */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700 text-xs dark:bg-brand-950 dark:text-brand-300">
                        AD
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                          Aline Dossou
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Haie-Vive, Cotonou • Il y a 18 min
                        </div>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Entraide
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    🌿 <strong>Journée Salubrité &amp; Caniveaux</strong> ce samedi dès 08h rue 42. Les pelles et sacs poubelles sont fournis par le comité de quartier. Venez nombreux !
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 dark:border-gray-800 text-xs">
                    <button
                      type="button"
                      onClick={handleLike}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all active:scale-95 ${
                        liked
                          ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                          : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Heart
                        className={`size-3.5 transition-transform ${
                          liked ? "fill-rose-500 text-rose-500 scale-110" : ""
                        }`}
                      />
                      <span>{likeCount} soutiens</span>
                    </button>

                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <MessageCircle className="size-3.5" />
                      <span>9 réponses</span>
                    </div>
                  </div>
                </div>

                {/* Secondary Mini Notice */}
                <div className="rounded-2xl border border-amber-200/60 bg-amber-50/70 p-3 dark:border-amber-900/60 dark:bg-amber-950/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] font-bold text-amber-900 dark:text-amber-200">
                        Avis SBEE • Quartier Haie-Vive
                      </div>
                      <p className="text-[10px] text-amber-700 dark:text-amber-300/90 leading-normal mt-0.5">
                        Travaux d&apos;entretien du transformateur ce jeudi de 12h à 15h.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Micro hint */}
                <div className="text-center text-[10px] text-gray-400 pt-1">
                  💡 Touchez le bouton ❤️ pour tester l&apos;ergonomie
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* VIEW 2: LOGEMENT & BAIL (CITÉ U / RÉSIDENCES)                 */}
            {/* ------------------------------------------------------------- */}
            {activeTab === "RESIDENCE" && (
              <div className="space-y-2.5 animate-in fade-in duration-200">
                {/* Lease Card with Gradient */}
                <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 via-white to-indigo-50/30 p-3.5 dark:border-indigo-900/60 dark:from-indigo-950/40 dark:via-gray-900 dark:to-indigo-950/20 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Contrat de Résidence n° BJ-2026-089
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Bail Actif
                    </span>
                  </div>

                  <div className="mt-1.5 font-bold text-xs text-gray-950 dark:text-white">
                    Cité U Tankpè • Pavillon Étoile
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    Chambre 204 • 1er Étage • 1 Lit / Salle d&apos;eau
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-white/80 p-2.5 border border-indigo-100 dark:bg-gray-900/80 dark:border-gray-800 text-[10px]">
                    <div>
                      <span className="text-gray-400 block">Loyer Mensuel</span>
                      <span className="font-extrabold text-xs text-gray-900 dark:text-white">
                        25 000 FCFA
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Prochaine Échéance</span>
                      <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        05 Nov 2026
                      </span>
                    </div>
                  </div>

                  {/* Interactive Quittance Button */}
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2 text-[11px] font-bold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95"
                  >
                    <Download className="size-3.5" />
                    <span>Télécharger Quittance Horodatée</span>
                  </button>

                  {downloadSuccess && (
                    <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-50 p-2 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 animate-in fade-in duration-200">
                      <CheckCircle2 className="size-3.5 shrink-0" />
                      <span>Quittance PDF certifiée générée avec succès !</span>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-2.5 dark:border-gray-800 dark:bg-gray-900 text-[10px] text-gray-500">
                  <div className="font-bold text-gray-800 dark:text-gray-200">État des lieux d&apos;entrée</div>
                  <div className="text-emerald-600 font-semibold mt-0.5">Certifié et archivé sans contestation possible</div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* VIEW 3: ASSOCIATIONS & CAISSE (TRANSPARENCE FINANCIÈRE)       */}
            {/* ------------------------------------------------------------- */}
            {activeTab === "ASSOCIATION" && (
              <div className="space-y-2.5 animate-in fade-in duration-200">
                {/* Financial Balance Card */}
                <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 p-3.5 dark:border-emerald-900/60 dark:from-emerald-950/40 dark:via-gray-900 dark:to-emerald-950/20 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Trésorerie Transparente
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600">
                      Audit Ouvert
                    </span>
                  </div>

                  <div className="mt-1 text-xs font-bold text-gray-900 dark:text-white">
                    Comité de Développement du Quartier (CDQ)
                  </div>
                  <div className="mt-2">
                    <span className="text-[10px] text-gray-500 block">Solde Caisse Actuel</span>
                    <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                      1 450 000 FCFA
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-1 text-[10px]">
                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                      <span>Cotisations collectées (MTN/Moov)</span>
                      <span className="font-bold text-emerald-600">+120 000 FCFA</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                      <span>Éclairage public lampadaires</span>
                      <span className="font-bold text-rose-500">-45 000 FCFA</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleVote}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-[11px] font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
                  >
                    <span>Participer au Vote de la Caisse</span>
                    <ArrowUpRight className="size-3.5" />
                  </button>

                  {voteSubmitted && (
                    <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-50 p-2 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 animate-in fade-in duration-200">
                      <CheckCircle2 className="size-3.5 shrink-0" />
                      <span>Votre voix citoyenne a été prise en compte !</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Dock / Home Bar */}
          <div className="border-t border-gray-200/80 bg-white/90 px-4 py-2 text-center backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-900/90">
            <div className="mx-auto h-1 w-24 rounded-full bg-gray-300 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSimulator;
