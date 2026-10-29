"use client";

import React, { useState } from "react";
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
  Calendar,
  Heart,
  ChevronRight,
  FileText,
  UserCheck,
  Building,
  Bell,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import LandingFaq from "@/components/public/LandingFaq";

export default function PublicLandingPage() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"FEED" | "RESIDENCE" | "ASSOCIATION">("FEED");

  return (
    <div className="relative overflow-hidden">
      {/* Soft Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-gradient-to-tr from-brand-400/15 via-indigo-300/10 to-emerald-400/10 blur-[130px] dark:from-brand-600/10 dark:via-indigo-900/10 dark:to-emerald-950/10" />

      {/* ------------------------------------------------------------------ */}
      {/* 1. HERO SECTION (MODERNE, SOFT, PRO & MOBILE PREMIER)              */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative mx-auto max-w-6xl px-4 pt-12 pb-16 sm:px-6 sm:pt-20 sm:pb-24 text-center">
        {/* Soft Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200/80 bg-white/80 px-3.5 py-1 text-xs font-semibold text-gray-700 shadow-2xs backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80 dark:text-gray-300">
          <span className="flex size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
          <span>Plateforme Territoriale Officielle • République du Bénin</span>
        </div>

        {/* Hero Title */}
        <h1 className="mt-6 text-3xl font-black tracking-tight text-gray-950 sm:text-5xl lg:text-6xl dark:text-white leading-[1.15]">
          La vie de quartier réinventée.{" "}
          <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
            Vos logements sécurisés.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-300">
          L&apos;écosystème numérique unifié pour les résidents, étudiants et gestionnaires au Bénin. Retrouvez l&apos;entraide locale, suivez vos baux de résidence en toute clarté et participez aux initiatives de votre commune.
        </p>

        {/* Soft Ergonomic Call To Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/feed"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-600 px-7 text-xs font-bold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-700 hover:scale-[1.01]"
            >
              <span>Accéder à mon Espace</span>
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-600 px-7 text-xs font-bold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-700 hover:scale-[1.01]"
              >
                <Sparkles className="size-4" />
                <span>Créer un compte citoyen gratuit</span>
              </Link>
              <Link
                href="#espaces"
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-6 text-xs font-bold text-gray-800 shadow-2xs backdrop-blur-xs transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/90 dark:text-gray-200"
              >
                <span>Découvrir la plateforme</span>
              </Link>
            </>
          )}
        </div>

        {/* Micro Trust Indicators */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <Check className="size-3.5 text-emerald-500" />
            <span>Gratuit pour les citoyens</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="size-3.5 text-emerald-500" />
            <span>Zéro spam &amp; Données souveraines</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="size-3.5 text-emerald-500" />
            <span>Transactions en FCFA (XOF)</span>
          </span>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* INTERACTIVE BENTO SHOWCASE (LE COEUR VISUEL DU HERO)             */}
        {/* ---------------------------------------------------------------- */}
        <div className="mt-12 sm:mt-16 rounded-3xl border border-gray-200/90 bg-white/70 p-3 sm:p-6 shadow-xl backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/60">
          {/* Showcase Tabs */}
          <div className="flex items-center justify-center gap-1.5 pb-4 border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("FEED")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "FEED"
                  ? "bg-brand-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <Users className="size-3.5" />
              <span>Fil de Quartier</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("RESIDENCE")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "RESIDENCE"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <Home className="size-3.5" />
              <span>Résidence &amp; Bail</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ASSOCIATION")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "ASSOCIATION"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <Coins className="size-3.5" />
              <span>Vie Associative</span>
            </button>
          </div>

          {/* Interactive Preview Container */}
          <div className="pt-4 text-left">
            {activeTab === "FEED" && (
              <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-2xs dark:border-gray-800 dark:bg-gray-950 animate-in fade-in-50 duration-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 font-black text-brand-700 text-sm dark:bg-brand-950 dark:text-brand-300">
                      AJ
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-gray-950 dark:text-white">
                          Association Jeunesse Abomey-Calavi
                        </span>
                        <span className="hidden sm:inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          Vérifié
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        Quartier Bidossessi • Il y a 25 minutes
                      </span>
                    </div>
                  </div>
                  <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Action Citoyenne
                  </span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-gray-700 dark:text-gray-300 sm:text-sm">
                  Grande journée de salubrité ce samedi dès 07h30 dans le quartier Bidossessi ! Munissez-vous de vos gants et râteaux. Une collation fraternelle sera offerte par le bureau exécutif à l&apos;issue de l&apos;activité.
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800 text-xs">
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    42 voisins participent
                  </span>
                  <span className="text-gray-400">
                    Accessible uniquement aux membres connectés
                  </span>
                </div>
              </div>
            )}

            {activeTab === "RESIDENCE" && (
              <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-2xs dark:border-gray-800 dark:bg-gray-950 animate-in fade-in-50 duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Résidence Universitaire Tankpè • Pavillon Étoile
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-gray-950 dark:text-white mt-0.5">
                      Bail d&apos;Occupation Chambre 204
                    </h3>
                  </div>
                  <span className="inline-flex self-start sm:self-auto rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Bail Actif • Quittance Disponible
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-xl bg-gray-50/70 p-3 dark:bg-gray-900/60 text-xs">
                  <div>
                    <span className="block text-[10px] text-gray-400">Loyer mensuel</span>
                    <span className="font-bold text-gray-900 dark:text-white">25 000 FCFA</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400">Occupation</span>
                    <span className="font-bold text-gray-900 dark:text-white">2026 - 2027</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-[10px] text-gray-400">État des lieux</span>
                    <span className="font-bold text-emerald-600">Validé &amp; Horodaté</span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Avis maintenance : coupure préventive d&apos;eau demain de 10h à 13h pour réfection du réseau hydraulique.
                </p>
              </div>
            )}

            {activeTab === "ASSOCIATION" && (
              <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-2xs dark:border-gray-800 dark:bg-gray-950 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold dark:bg-emerald-950">
                      CD
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-gray-950 dark:text-white">
                        Comité de Développement du Quartier
                      </h4>
                      <span className="text-[11px] text-gray-400">
                        Association déclarée • Commune d&apos;Abomey-Calavi
                      </span>
                    </div>
                  </div>
                  <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950">
                    Trésorerie Ouverte
                  </span>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 dark:border-gray-800 dark:bg-gray-900/50">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      Cotisation mensuelle d&apos;assainissement
                    </span>
                    <span className="block text-[11px] text-gray-500">
                      Paiement sécurisé par Mobile Money (MTN / Moov)
                    </span>
                  </div>
                  <span className="font-black text-sm text-emerald-600">
                    2 000 FCFA / foyer
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. SECTION : LES 3 ESPACES (BENTO CARD SOFT & ERGONOMIQUE)         */}
      {/* ------------------------------------------------------------------ */}
      <section id="espaces" className="scroll-mt-24 mx-auto max-w-6xl px-4 sm:px-6 py-12">
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

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Fil Citoyen */}
          <div className="flex flex-col justify-between rounded-3xl border border-gray-200/90 bg-white p-6 shadow-xs transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
            <div className="space-y-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <Users className="size-5" />
              </div>

              <div>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  Réservé aux membres
                </span>
                <h3 className="mt-2 text-lg font-bold text-gray-950 dark:text-white">
                  Fil Citoyen de Quartier
                </h3>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Échangez en confiance avec vos voisins réels. Entraides, signalements de voirie, dons de meubles et alertes d&apos;arrondissement.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Publications géolocalisées par commune</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Aucun profil anonyme ni spam publicitaire</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Réactions, soutiens &amp; commentaires</span>
                </li>
              </ul>
            </div>

            <Link
              href="/feed"
              className="mt-6 flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 text-xs font-bold text-white shadow-xs transition hover:bg-brand-700"
            >
              <span>Accéder au Fil</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Card 2: Résidences & Baux (High Value) */}
          <div className="relative flex flex-col justify-between rounded-3xl border-2 border-indigo-500/80 bg-white p-6 shadow-md dark:border-indigo-500/60 dark:bg-gray-900">
            <div className="absolute -top-3 right-5">
              <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                Logements &amp; Campus
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Home className="size-5" />
              </div>

              <div>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Devise en FCFA (XOF)
                </span>
                <h3 className="mt-2 text-lg font-bold text-gray-950 dark:text-white">
                  Résidences &amp; Cités U
                </h3>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Le module dédié aux cités étudiantes et résidences privées. Baux numérisés, états des lieux et quittances horodatées.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Cartographie des chambres &amp; pavillons</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Contrats d&apos;occupation clairs et opposables</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Avis de maintenance par bâtiment</span>
                </li>
              </ul>
            </div>

            <Link
              href="/dashboard/residences"
              className="mt-6 flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700"
            >
              <span>Gérer les Résidences</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Card 3: Associations & Gouvernance */}
          <div className="flex flex-col justify-between rounded-3xl border border-gray-200/90 bg-white p-6 shadow-xs transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
            <div className="space-y-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Building2 className="size-5" />
              </div>

              <div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Console Gestion
                </span>
                <h3 className="mt-2 text-lg font-bold text-gray-950 dark:text-white">
                  Gouvernance &amp; Associations
                </h3>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  L&apos;outil moderne pour les comités de quartier et syndics. Fichier des adhérents, cotisations limpides et audits certifiés.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Registre officiel des membres du bureau</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Suivi des cotisations sans contestation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Découpage territorial officiel (77 Communes)</span>
                </li>
              </ul>
            </div>

            <Link
              href="/dashboard/associations"
              className="mt-6 flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 dark:border-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <span>Vie Associative</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. SECTION : COMMENT ÇA MARCHE (PARCOURS ÉPURÉ 01-02-03)           */}
      {/* ------------------------------------------------------------------ */}
      <section id="comment-ca-marche" className="scroll-mt-24 mx-auto max-w-6xl px-4 sm:px-6 py-12">
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
      {/* 4. SECTION : FAQ (QUESTIONS ESSENTIELLES)                          */}
      {/* ------------------------------------------------------------------ */}
      <section id="faq" className="scroll-mt-24 mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <LandingFaq />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 5. BANNIÈRE FINALE DOUCE & ENGAGEANTE                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="rounded-3xl bg-gradient-to-tr from-brand-900 via-indigo-950 to-gray-950 p-8 sm:p-12 text-white text-center shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Prêt à valoriser votre quartier et vos résidences ?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-gray-300 leading-relaxed">
            Rejoignez des milliers de citoyens, étudiants et gestionnaires qui bâtissent ensemble des communautés plus soudées et transparentes au Bénin.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-6 text-xs font-bold text-gray-950 shadow-md transition hover:bg-gray-100 hover:scale-105"
            >
              <Sparkles className="size-3.5 text-brand-600" />
              <span>Créer mon compte citoyen</span>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 px-6 text-xs font-bold text-white transition hover:bg-white/10"
            >
              <span>Se connecter</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
