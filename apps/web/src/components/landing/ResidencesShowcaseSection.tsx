import React from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import {
  BuildingIcon,
  BedIcon,
  FileTextIcon,
  BanknoteIcon,
  CheckIcon,
  SmartphoneIcon,
  ShieldCheckIcon,
} from "@/components/icons";

export const ResidencesShowcaseSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gray-50/70 py-20 transition-colors dark:bg-gray-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
              <BuildingIcon className="size-3.5" />
              <span>Gestion Locative &amp; Résidences</span>
            </div>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-5xl dark:text-white">
              Gestion Moderne des Résidences &amp; Cités Universitaires
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Fini les litiges locatifs, les quittances manuscrites perdues et les arriérés de loyers. My Community digitalise l&apos;intégralité du cycle locatif au Bénin, de la réservation de chambre au paiement Mobile Money.
            </p>
          </div>

          <Link
            href="/dashboard/residences"
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            <BuildingIcon className="size-4" />
            <span>Explorer la Console Résidences &rarr;</span>
          </Link>
        </div>

        {/* Feature Grid with Realistic Visual Blocks */}
        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Feature 1: Digital Room Inventory */}
          <div className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <BedIcon className="size-6" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900 dark:text-white">
                Inventaire &amp; Disponibilité des Chambres
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                Cartographie complète des pavillons et des chambres individuelles ou partagées. Visibilité en direct sur les taux d&apos;occupation des campus (UAC, Parakou) et cités privées.
              </p>

              {/* Mini visual mockup */}
              <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-3.5 dark:border-gray-800 dark:bg-gray-800/50">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200">
                  <span>Pavillon Hibiscus (Tankpè)</span>
                  <Badge variant="light" color="success" size="sm">
                    48 lits
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                  <div className="rounded-lg bg-emerald-100 py-1.5 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Ch. 101<span className="block text-[8px] font-normal">Dispo</span>
                  </div>
                  <div className="rounded-lg bg-indigo-100 py-1.5 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                    Ch. 102<span className="block text-[8px] font-normal">Occupée</span>
                  </div>
                  <div className="rounded-lg bg-indigo-100 py-1.5 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                    Ch. 103<span className="block text-[8px] font-normal">Occupée</span>
                  </div>
                  <div className="rounded-lg bg-amber-100 py-1.5 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    Ch. 104<span className="block text-[8px] font-normal">Travaux</span>
                  </div>
                </div>
              </div>
            </div>

            <ul className="mt-6 space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <CheckIcon className="size-3.5 text-emerald-600" />
                <span>Gestion multi-bâtiments &amp; complexes universitaires</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-3.5 text-emerald-600" />
                <span>Statuts en temps réel sans doublons de réservation</span>
              </li>
            </ul>
          </div>

          {/* Feature 2: Digital Leases & NPI Contracts */}
          <div className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
                <FileTextIcon className="size-6" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900 dark:text-white">
                Baux Numériques &amp; Signature Électronique
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                Génération automatique du contrat d&apos;occupation conforme à la réglementation républicaine. Chaque partie signe avec son NPI certifié.
              </p>

              {/* Mini visual mockup */}
              <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-3.5 dark:border-gray-800 dark:bg-gray-800/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    Contrat de Bail Conforme
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                    <CheckIcon className="size-3" />
                    <span>Validé APDP</span>
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-[11px] text-gray-600 dark:text-gray-400">
                  <p>• Bailleur : Résidence UAC Tankpè</p>
                  <p>• Preneur : Étudiant validé NPI #739281</p>
                  <p>• Caution &amp; Loyer : 35 000 FCFA / mois</p>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-white p-2 text-[10px] dark:bg-gray-900">
                  <span className="font-mono text-gray-500">Hash : 0x4f8a...92b</span>
                  <span className="font-bold text-brand-600">Certifié &amp; Scellé</span>
                </div>
              </div>
            </div>

            <ul className="mt-6 space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <CheckIcon className="size-3.5 text-emerald-600" />
                <span>Élimination des faux baux et des escroqueries</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-3.5 text-emerald-600" />
                <span>Téléchargement PDF avec QR Code infalsifiable</span>
              </li>
            </ul>
          </div>

          {/* Feature 3: Mobile Money & Instant Receipts */}
          <div className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <SmartphoneIcon className="size-6" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900 dark:text-white">
                Paiements Mobile Money MTN &amp; Moov
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                Intégration directe des passerelles Mobile Money béninoises. Le locataire règle depuis son téléphone, le gestionnaire perçoit les fonds avec rapprochement instantané.
              </p>

              {/* Mini visual mockup */}
              <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-3.5 dark:border-gray-800 dark:bg-gray-800/50">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200">
                  <span>Reçu de Paiement Numérique</span>
                  <span className="text-[10px] font-mono text-emerald-600">MTN-MOMO</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xl font-black text-gray-900 dark:text-white">
                    35 000 <span className="text-xs font-normal">FCFA</span>
                  </span>
                  <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Réussi
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-gray-500">
                  Quittance émise et envoyée par SMS / WhatsApp au résident
                </p>
              </div>
            </div>

            <ul className="mt-6 space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <CheckIcon className="size-3.5 text-emerald-600" />
                <span>Zéro retard de loyer grâce aux rappels programmés</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="size-3.5 text-emerald-600" />
                <span>Trésorerie consolidée et export comptable Excel</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Real User Testimonial Banner */}
        <div className="mt-12 rounded-3xl border border-indigo-200/80 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                <ShieldCheckIcon className="size-4" />
                <span>Témoignage vérifié • Cité Universitaire d&apos;Abomey-Calavi</span>
              </div>
              <p className="mt-3 text-sm italic leading-relaxed text-indigo-100 sm:text-base">
                « Avant My Community, nous passions deux semaines chaque début de semestre à collecter manuellement les loyers des 120 chambres et à signer des reçus papier. Aujourd&apos;hui, 95% des étudiants paient par MTN MoMo dès le premier jour et le taux d&apos;occupation est de 100%. »
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-700 font-bold text-xs">
                  BG
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Barnabé Gnonlonfoun</h4>
                  <p className="text-[11px] text-indigo-300">Gestionnaire du Complexe Universitaire Tankpè</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-bold text-indigo-950 shadow-md transition hover:bg-gray-100"
              >
                <span>Enregistrer ma Résidence</span>
                <span>&rarr;</span>
              </Link>
              <Link
                href="/dashboard/residences"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-700 bg-indigo-900/40 px-5 py-3 text-xs font-bold text-white transition hover:bg-indigo-900/70"
              >
                <span>Découvrir la Gestion des Baux</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResidencesShowcaseSection;
