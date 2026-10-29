import React from "react";
import Badge from "@/components/ui/badge/Badge";
import {
  ShieldCheckIcon,
  ShieldAlertIcon,
  GlobeIcon,
  CheckIcon,
} from "@/components/icons";

export const RepublicanTrustSection: React.FC = () => {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="rounded-3xl border border-gray-200 bg-gradient-to-b from-white to-gray-50/70 p-8 shadow-xs dark:border-gray-800 dark:from-gray-900 dark:to-gray-950 sm:p-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          {/* Left Column: Text & Security Pillars */}
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <ShieldCheckIcon className="size-3.5" />
              <span>Souveraineté Numérique &amp; Confiance Républicaine</span>
            </div>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              Une Sécurité Intransigeante au Service des Citoyens
            </h2>

            <p className="mt-4 text-xs leading-relaxed text-gray-600 sm:text-sm dark:text-gray-300">
              La confiance est le fondement de toute démocratie locale. My Community est conçu dans le strict respect du Code du Numérique en République du Bénin et des recommandations de l&apos;APDP (Autorité de Protection des Données Personnelles).
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <CheckIcon className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Conformité APDP &amp; Protection de la Vie Privée
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Vos données personnelles restent confidentielles et ne sont jamais vendues ni exploitées à des fins publicitaires.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  <CheckIcon className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Garantie &quot;1 Citoyen = 1 Voix&quot; par le NPI
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    L&apos;identification certifiée empêche les doublons, les robots et garantit la légitimité démocratique des délibérations locales.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <CheckIcon className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Paiements Certifiés Mobile Money BCEAO
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Toutes les transactions en FCFA (XOF) transitent par des flux sécurisés et auditables avec quittances automatiques.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Trust Badges & Seal */}
          <div className="flex flex-col gap-4 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-md dark:border-gray-800 dark:bg-gray-900 sm:p-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-800 text-white font-black text-sm">
                  MC
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-900 dark:text-white">
                    Certificat de Conformité Bénin
                  </span>
                  <span className="block text-[10px] text-gray-500">
                    Réf : APDP-BJ-2026-MC
                  </span>
                </div>
              </div>
              <Badge variant="light" color="success" size="sm">
                Conforme APDP
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400">
                  100%
                </span>
                <span className="mt-1 block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                  Données Chiffrées
                </span>
                <span className="text-[10px] text-gray-400">AES-256 bits</span>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                <span className="block text-xl font-black text-brand-600 dark:text-brand-400">
                  0 Pub
                </span>
                <span className="mt-1 block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                  Zéro Traçage Tiers
                </span>
                <span className="text-[10px] text-gray-400">Respect de la vie privée</span>
              </div>
            </div>

            <div className="rounded-2xl bg-brand-50/70 p-4 text-xs text-brand-900 dark:bg-brand-950/40 dark:text-brand-200">
              <p className="font-semibold flex items-center gap-1.5">
                <ShieldCheckIcon className="size-4 text-brand-600 shrink-0" />
                <span>Engagement Républicain :</span>
              </p>
              <p className="mt-1 text-[11px] leading-relaxed">
                Les registres de vote, d&apos;attribution de baux et de comptabilité associative sont inviolables et protégés par signature cryptographique.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RepublicanTrustSection;
