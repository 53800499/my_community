"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  Check,
  ArrowRight,
  ShieldCheck,
  Home,
  Coins,
  Sparkles,
  MapPin,
  Heart,
  ChevronRight,
  FileText,
  UserCheck,
  Building,
  Bell,
  CheckCircle2,
  Smartphone,
  Star,
  Lock,
  XCircle,
  Zap,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import LandingFaq from "@/components/public/LandingFaq";
import MobileSimulator from "@/components/public/MobileSimulator";
import LiveCitizenTicker from "@/components/public/LiveCitizenTicker";
import HeroAuroraMesh from "@/components/public/HeroAuroraMesh";
import SpotlightCard from "@/components/public/SpotlightCard";

export default function PublicLandingPage() {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuth();
  const [selectedSpace, setSelectedSpace] = useState<"CITIZEN" | "RESIDENCE" | "ASSOCIATION">("CITIZEN");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isUserAuthenticated = mounted && isAuthenticated;

  return (
    <div className="relative overflow-hidden pb-20 sm:pb-12">
      {/* Extraordinary Interactive Aurora Background & Topographic Mesh */}
      <HeroAuroraMesh initialTheme="TOPOGRAPHIC" showThemeSelector={true} />

      {/* Extraordinary Live Citizen Activity Marquee Ticker */}
      <LiveCitizenTicker />

      {/* ------------------------------------------------------------------ */}
      {/* 1. HERO SECTION (ULTRA-POLISHED, MOBILE-FIRST, HIGH CONVERSION)   */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative mx-auto max-w-6xl px-4 pt-8 pb-12 sm:px-6 sm:pt-14 sm:pb-20 text-center">
        {/* Soft Official Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200/90 bg-white/90 px-4 py-1.5 text-xs font-semibold text-gray-800 shadow-xs backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/90 dark:text-gray-200">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="tracking-wide">Plateforme Territoriale Officielle • République du Bénin</span>
        </div>

        {/* Hero Title */}
        <h1 className="mt-6 text-3xl font-black tracking-tight text-gray-950 sm:text-5xl lg:text-6xl dark:text-white leading-[1.12]">
          La vie de quartier réinventée.{" "}
          <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
            Vos logements &amp; baux sécurisés.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-300">
          L&apos;écosystème numérique unifié pour les résidents, étudiants et gestionnaires au Bénin. Retrouvez l&apos;entraide locale, suivez vos baux de résidence en toute clarté et participez aux initiatives de votre commune.
        </p>

        {/* Call To Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto sm:max-w-none">
          {isUserAuthenticated ? (
            <Link
              href="/feed"
              className="w-full sm:w-auto inline-flex h-13 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-8 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition hover:shadow-xl hover:scale-[1.01] active:scale-95"
            >
              <span>Accéder à Mon Espace Citoyen</span>
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex h-13 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-8 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition hover:shadow-xl hover:scale-[1.01] active:scale-95"
              >
                <Sparkles className="size-4 text-brand-200" />
                <span>Créer un compte citoyen gratuit</span>
              </Link>
              <Link
                href="#simulateur"
                className="w-full sm:w-auto inline-flex h-13 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-6 text-xs font-bold text-gray-800 shadow-xs backdrop-blur-md transition hover:bg-gray-50 active:scale-95 dark:border-gray-800 dark:bg-gray-900/90 dark:text-gray-200"
              >
                <Smartphone className="size-4 text-brand-600 dark:text-brand-400" />
                <span>Tester le simulateur mobile</span>
              </Link>
            </>
          )}
        </div>

        {/* Social Proof Stack (Avatars + Starlight) */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center -space-x-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-brand-600 text-[10px] font-black text-white ring-2 ring-white dark:ring-gray-950">
              KB
            </div>
            <div className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white ring-2 ring-white dark:ring-gray-950">
              AD
            </div>
            <div className="flex size-8 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white ring-2 ring-white dark:ring-gray-950">
              SM
            </div>
            <div className="flex size-8 items-center justify-center rounded-full bg-amber-600 text-[10px] font-black text-white ring-2 ring-white dark:ring-gray-950">
              FO
            </div>
            <div className="flex size-8 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-950">
              +12k
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              4.9/5 • Déjà +12 400 résidents &amp; étudiants connectés
            </span>
          </div>
        </div>

        {/* Micro Trust Indicators */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] font-medium text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5 rounded-full bg-gray-100/70 px-3 py-1 dark:bg-gray-800/60">
            <Check className="size-3.5 text-emerald-500 shrink-0" />
            <span>100% Gratuit pour les citoyens</span>
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-gray-100/70 px-3 py-1 dark:bg-gray-800/60">
            <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
            <span>Données souveraines &amp; chiffrées</span>
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-gray-100/70 px-3 py-1 dark:bg-gray-800/60">
            <Coins className="size-3.5 text-emerald-500 shrink-0" />
            <span>Paiements FCFA (MTN / Moov Money)</span>
          </span>
        </div>

        {/* Hero Visual Showcase Ribbon with Real Benin Photo */}
        <div className="mt-10 relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-gray-200/80 bg-white/70 p-2 sm:p-3 shadow-xl backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/60">
          <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
            <img
              src="/images/landing-community-hero.jpg"
              alt="Communauté citoyenne et résidences au Bénin"
              className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-950/25 to-transparent" />
            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-6 text-left text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex size-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-300">
                  En direct des 77 Communes du Bénin
                </span>
              </div>
              <h3 className="text-xs sm:text-lg font-black tracking-tight leading-tight">
                Citoyens, Étudiants &amp; Gestionnaires réunis sur une même plateforme
              </h3>
            </div>
            <div className="hidden sm:flex absolute top-3 right-4 items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md">
              <MapPin className="size-3 text-emerald-400" />
              <span>Cotonou • Calavi • Parakou • Porto-Novo</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. SECTION : LE SIMULATEUR MOBILE INTERACTIF (L'EFFET WOW PRO)     */}
      {/* ------------------------------------------------------------------ */}
      <section id="simulateur" className="scroll-mt-20 mx-auto max-w-6xl px-4 py-8 sm:py-16">
        <div className="rounded-3xl border border-gray-200/90 bg-gradient-to-b from-white via-gray-50/50 to-white p-6 sm:p-12 shadow-xl backdrop-blur-xl dark:border-gray-800 dark:from-gray-900/80 dark:via-gray-950 dark:to-gray-900/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Presentation Column */}
            <div className="lg:col-span-6 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                <Sparkles className="size-3.5" />
                <span>Simulateur d&apos;Expérience Réelle</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-gray-950 dark:text-white leading-tight">
                Une ergonomie pensée pour vos écrans mobiles.
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Pas besoin d&apos;installer une application lourde. My Community tourne instantanément sur n&apos;importe quel smartphone béninois avec une fluidité remarquable, même en connexion 3G/4G modeste.
              </p>

              {/* Interactive Features Points */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-gray-100 shadow-2xs dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 shrink-0">
                    <Users className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-950 dark:text-white">
                      Fil d&apos;entraide local sans faux profils
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-normal">
                      Chaque publication est rattachée à une commune ou quartier vérifié. Finies les arnaques des groupes informels.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-gray-100 shadow-2xs dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 shrink-0">
                    <FileText className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-950 dark:text-white">
                      Baux numérisés &amp; Quittances certifiées
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-normal">
                      Générez en 1 clic vos quittances horodatées conformes aux règles locatives de la République du Bénin.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-gray-100 shadow-2xs dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 shrink-0">
                    <Coins className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-950 dark:text-white">
                      Trésorerie associative &amp; Cotisations transparentes
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-normal">
                      Suivez chaque franc CFA collecté pour les lampadaires solaires, l&apos;assainissement et les fêtes de quartier.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: The Smartphone Simulator */}
            <div className="lg:col-span-6 flex justify-center">
              <MobileSimulator />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. NATIONAL METRICS BENTO STRIP (77 COMMUNES, 0F, 100% FCFA)       */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-4 sm:p-5 text-center shadow-xs backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/60">
            <span className="text-2xl sm:text-3xl font-black text-brand-600 dark:text-brand-400">
              77
            </span>
            <div className="text-xs font-bold text-gray-950 dark:text-white mt-1">
              Communes Référencées
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              12 Départements du Bénin
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-4 sm:p-5 text-center shadow-xs backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/60">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              100%
            </span>
            <div className="text-xs font-bold text-gray-950 dark:text-white mt-1">
              Franc CFA (XOF)
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              MTN &amp; Moov Money intégrés
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-4 sm:p-5 text-center shadow-xs backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/60">
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
              100%
            </span>
            <div className="text-xs font-bold text-gray-950 dark:text-white mt-1">
              Baux Horodatés
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              Quittances opposables
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-4 sm:p-5 text-center shadow-xs backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/60">
            <span className="text-2xl sm:text-3xl font-black text-amber-500">
              0 FCFA
            </span>
            <div className="text-xs font-bold text-gray-950 dark:text-white mt-1">
              Coût Citoyen
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              Inscription gratuite à vie
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. SECTION : LES 3 ESPACES DÉDIÉS (TACTILE BENTO EXPERIENCE)        */}
      {/* ------------------------------------------------------------------ */}
      <section id="espaces" className="scroll-mt-20 mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Une architecture pensée pour le Bénin
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white">
            3 Espaces Dédiés. Zéro Confusion.
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Une frontière étanche entre vos échanges citoyens, vos contrats de chambre et la gouvernance administrative.
          </p>
        </div>

        {/* Mobile Tab Selector for Fast Scanning */}
        <div className="mt-8 flex items-center justify-center gap-2 p-1 bg-gray-100/80 rounded-2xl max-w-md mx-auto dark:bg-gray-900/80 sm:hidden">
          <button
            type="button"
            onClick={() => setSelectedSpace("CITIZEN")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              selectedSpace === "CITIZEN"
                ? "bg-white text-brand-700 shadow-xs dark:bg-gray-800 dark:text-brand-300"
                : "text-gray-500"
            }`}
          >
            Fil Citoyen
          </button>
          <button
            type="button"
            onClick={() => setSelectedSpace("RESIDENCE")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              selectedSpace === "RESIDENCE"
                ? "bg-white text-indigo-700 shadow-xs dark:bg-gray-800 dark:text-indigo-300"
                : "text-gray-500"
            }`}
          >
            Résidences
          </button>
          <button
            type="button"
            onClick={() => setSelectedSpace("ASSOCIATION")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              selectedSpace === "ASSOCIATION"
                ? "bg-white text-emerald-700 shadow-xs dark:bg-gray-800 dark:text-emerald-300"
                : "text-gray-500"
            }`}
          >
            Associations
          </button>
        </div>

        {/* Bento Grid */}
        <div className="mt-6 sm:mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Fil Citoyen */}
          <SpotlightCard
            spotlightColor="rgba(16, 185, 129, 0.18)"
            className={`flex flex-col justify-between p-5 sm:p-6 ${
              selectedSpace === "CITIZEN" ? "block" : "hidden sm:flex"
            }`}
          >
            <div>
              {/* Authentic Benin Community Photo */}
              <div className="relative h-44 w-full overflow-hidden rounded-2xl mb-4 bg-gray-100 dark:bg-gray-800 shadow-2xs group">
                <img
                  src="/images/landing-community-hero.jpg"
                  alt="Fil citoyen et entraide locale à Cotonou"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-2.5 left-3 text-white">
                  <span className="text-[10px] font-semibold text-emerald-300 block">Quartier en action</span>
                  <span className="text-xs font-bold">Cotonou &amp; Calavi</span>
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-md">
                    77 Communes
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                    <Users className="size-4.5" />
                  </div>
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    Réservé aux membres vérifiés
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-950 dark:text-white">
                  Fil Citoyen de Quartier
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Échangez en toute confiance avec vos voisins réels. Entraides, alertes de voirie, dons de mobilier et annonces d&apos;arrondissement.
                </p>

                <ul className="space-y-2 pt-1 text-xs text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Publications géolocalisées par commune</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Numéro de téléphone masqué et protégé</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Réactions, soutiens &amp; commentaires citoyens</span>
                  </li>
                </ul>
              </div>
            </div>

            <Link
              href="/register"
              className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 text-xs font-bold text-white shadow-xs transition hover:bg-brand-700 active:scale-95"
            >
              <span>Rejoindre mon Voisinage</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </SpotlightCard>

          {/* Card 2: Résidences & Cité U */}
          <SpotlightCard
            spotlightColor="rgba(99, 102, 241, 0.22)"
            className={`relative flex flex-col justify-between border-2 border-indigo-500/80 p-5 sm:p-6 shadow-md ${
              selectedSpace === "RESIDENCE" ? "block" : "hidden sm:flex"
            }`}
          >
            <div className="absolute -top-3 right-5 z-10">
              <span className="rounded-full bg-indigo-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-xs">
                Logements &amp; Campus
              </span>
            </div>

            <div>
              {/* Authentic Student Residence Photo */}
              <div className="relative h-44 w-full overflow-hidden rounded-2xl mb-4 bg-gray-100 dark:bg-gray-800 shadow-2xs group">
                <img
                  src="/images/landing-residence-campus.jpg"
                  alt="Résidence et chambre étudiante UAC"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-2.5 left-3 text-white">
                  <span className="text-[10px] font-semibold text-indigo-300 block">Cités Universitaires &amp; Privées</span>
                  <span className="text-xs font-bold">Campus UAC &amp; Résidences</span>
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-md">
                    Devise FCFA
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <Home className="size-4.5" />
                  </div>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    Baux 100% Horodatés
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-950 dark:text-white">
                  Résidences &amp; Cités U
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Le module dédié aux cités universitaires (Calavi, Parakou) et résidences privées. Baux numérisés, états des lieux et quittances horodatées.
                </p>

                <ul className="space-y-2 pt-1 text-xs text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Cartographie des pavillons &amp; chambres</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Contrats d&apos;occupation clairs &amp; opposables</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Avis de coupure d&apos;eau/courant par bâtiment</span>
                  </li>
                </ul>
              </div>
            </div>

            <Link
              href="/register"
              className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95"
            >
              <span>Accéder aux Résidences</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </SpotlightCard>

          {/* Card 3: Associations & Gouvernance */}
          <SpotlightCard
            spotlightColor="rgba(16, 185, 129, 0.18)"
            className={`flex flex-col justify-between p-5 sm:p-6 ${
              selectedSpace === "ASSOCIATION" ? "block" : "hidden sm:flex"
            }`}
          >
            <div>
              {/* Authentic Civic Governance Photo */}
              <div className="relative h-44 w-full overflow-hidden rounded-2xl mb-4 bg-gray-100 dark:bg-gray-800 shadow-2xs group">
                <img
                  src="/images/landing-civic-governance.jpg"
                  alt="Conseil de quartier et gouvernance associative"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-2.5 left-3 text-white">
                  <span className="text-[10px] font-semibold text-emerald-300 block">Comités &amp; Associations</span>
                  <span className="text-xs font-bold">Conseil de Quartier Bénin</span>
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-md">
                    Audit Ouvert
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    <Building2 className="size-4.5" />
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Console Gestion Publique
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-950 dark:text-white">
                  Gouvernance &amp; Associations
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  L&apos;outil moderne pour les comités de quartier (CDQ) et syndics. Fichier des adhérents, cotisations limpides et audits certifiés.
                </p>

                <ul className="space-y-2 pt-1 text-xs text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Registre officiel des membres du bureau</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Suivi des cotisations sans contestation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Découpage territorial officiel (77 Communes)</span>
                  </li>
                </ul>
              </div>
            </div>

            <Link
              href="/register"
              className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 dark:border-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition"
            >
              <span>Découvrir la Vie Associative</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </SpotlightCard>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 5. COMPARISON MATRIX (AVANT VS AVEC MY COMMUNITY)                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-10 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
          <div className="text-center max-w-2xl mx-auto space-y-1.5 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              La clarté que vous attendiez
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white">
              Pourquoi abandonner les méthodes artisanales ?
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Fini le désordre des groupes informels et des reçus papier égarés.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Informal Ways */}
            <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-5 dark:border-rose-900/40 dark:bg-rose-950/20">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-700 dark:text-rose-400 mb-4">
                <XCircle className="size-5 shrink-0" />
                <span>Groupes WhatsApp &amp; Carnets Papiers</span>
              </div>
              <ul className="space-y-3 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Numéro de téléphone personnel exposé à des centaines d&apos;inconnus.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Quittances de loyer papier tachées, perdues ou contestées à la fin du bail.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Opacité sur les cotisations de quartier : qui a payé quoi ?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Avis importants noyés sous des dizaines de spams et messages inutiles.</span>
                </li>
              </ul>
            </div>

            {/* My Community */}
            <div className="rounded-2xl border border-emerald-300/80 bg-emerald-50/50 p-5 dark:border-emerald-800/60 dark:bg-emerald-950/30">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-800 dark:text-emerald-300 mb-4">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                <span>Avec My Community Bénin</span>
              </div>
              <ul className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Vie privée garantie :</strong> Votre numéro reste souverain et confidentiel.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Quittances PDF horodatées :</strong> Téléchargeables en 1 clic et reconnues.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Caisse publique transparente :</strong> Registre consultable par chaque membre.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Avis officiels épinglés :</strong> Électricité, eau, sécurité visibles d&apos;emblée.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Real Community Field Photo Spotlight */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/70 p-4 sm:p-5 dark:border-gray-800 dark:bg-gray-850">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-5 h-44 overflow-hidden rounded-xl shadow-2xs">
                <img
                  src="/images/feed-solidarity.jpg"
                  alt="Entraide citoyenne et éclairage public à Fidjrossè"
                  className="h-full w-full object-cover transition duration-300 hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="sm:col-span-7 text-left space-y-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Impact Concret sur le Terrain
                </span>
                <h4 className="text-sm sm:text-base font-bold text-gray-950 dark:text-white">
                  Des initiatives locales financées en toute clarté
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Grâce aux cotisations tracées en FCFA via MTN et Moov Money, les comités de quartier éclairent les rues, sécurisent les résidences et financent les travaux d&apos;assainissement sans aucune contestation financière.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 6. SECTION : COMMENT ÇA MARCHE (PARCOURS ÉPURÉ 01-02-03)           */}
      {/* ------------------------------------------------------------------ */}
      <section id="comment-ca-marche" className="scroll-mt-20 mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="rounded-3xl border border-gray-200/80 bg-gradient-to-b from-gray-50/50 via-white to-gray-50/30 p-6 sm:p-12 dark:border-gray-800 dark:from-gray-900/40 dark:via-gray-950 dark:to-gray-900">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Prise en main immédiate
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white">
              Comment ça marche ?
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Trois étapes simples pour rejoindre votre communauté locale.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
              <span className="font-black text-2xl text-brand-600">01</span>
              <h3 className="mt-3 font-bold text-sm text-gray-950 dark:text-white">
                Création en 30 secondes
              </h3>
              <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Renseignez votre numéro de téléphone béninois (MTN/Moov/Celtiis) ou votre email. Choisissez votre mot de passe souverain.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
              <span className="font-black text-2xl text-indigo-600">02</span>
              <h3 className="mt-3 font-bold text-sm text-gray-950 dark:text-white">
                Rattachement Territorial
              </h3>
              <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Sélectionnez votre commune ou quartier de résidence, ou laissez votre gestionnaire vous assigner votre chambre universitaire.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
              <span className="font-black text-2xl text-emerald-600">03</span>
              <h3 className="mt-3 font-bold text-sm text-gray-950 dark:text-white">
                Vivez votre communauté
              </h3>
              <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Participez aux échanges de votre fil, réglez vos cotisations ou quittances en FCFA et profitez d&apos;un cadre de confiance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 7. SECTION : FAQ (QUESTIONS ESSENTIELLES)                          */}
      {/* ------------------------------------------------------------------ */}
      <section id="faq" className="scroll-mt-20 mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <LandingFaq />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 8. BANNIÈRE FINALE HAUTE CONVERSION                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="rounded-3xl bg-gradient-to-tr from-brand-950 via-slate-900 to-emerald-950 p-8 sm:p-14 text-white text-center shadow-2xl relative overflow-hidden">
          <div className="pointer-events-none absolute -bottom-20 -right-20 size-60 rounded-full bg-emerald-500/20 blur-3xl" />
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Prêt à valoriser votre quartier et vos résidences ?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-gray-300 leading-relaxed">
            Rejoignez des milliers de citoyens, étudiants et gestionnaires qui bâtissent ensemble des communautés plus soudées et transparentes au Bénin.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-8 text-xs font-bold text-gray-950 shadow-lg transition hover:bg-gray-100 active:scale-95"
            >
              <Sparkles className="size-4 text-brand-600" />
              <span>Créer mon compte citoyen gratuit</span>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/20 px-8 text-xs font-bold text-white transition hover:bg-white/10 active:scale-95"
            >
              <span>Se connecter à mon compte</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 9. STICKY FLOATING BOTTOM QUICK-ACTION DOCK (MOBILE-ONLY)          */}
      {/* ------------------------------------------------------------------ */}
      <div className="fixed bottom-0 inset-x-0 z-30 sm:hidden border-t border-gray-200/80 bg-white/90 px-4 py-2.5 backdrop-blur-xl shadow-2xl dark:border-gray-800/80 dark:bg-gray-950/90">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
            <div className="text-left">
              <div className="text-[11px] font-bold text-gray-950 dark:text-white leading-tight">
                My Community Bénin
              </div>
              <div className="text-[9px] text-gray-400">100% Gratuit Citoyen</div>
            </div>
          </div>

          <Link
            href={isUserAuthenticated ? "/feed" : "/register"}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 text-xs font-bold text-white shadow-md shadow-brand-500/25 active:scale-95 transition"
          >
            <Sparkles className="size-3.5" />
            <span>{isUserAuthenticated ? "Mon Espace" : "Créer un compte"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
