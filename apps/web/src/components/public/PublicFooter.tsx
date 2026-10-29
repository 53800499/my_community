import React from "react";
import Link from "next/link";
import { ShieldCheck, HeartHandshake, MapPin } from "lucide-react";

export const PublicFooter: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Col 1: Platform Overview */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-800 font-bold text-white shadow-xs">
                MC
              </div>
              <span className="font-black text-base text-gray-900 dark:text-white">
                My Community
              </span>
            </div>
            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              Système d&apos;information territorial citoyen, gestion des résidences et dynamisation associative pour la République du Bénin.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] text-gray-500">
              <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cotonou • Abomey-Calavi • Parakou • Porto-Novo</span>
            </div>
          </div>

          {/* Col 2: Navigation & Sections */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Découvrir la Plateforme
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/#pourquoi" className="hover:text-brand-600 dark:hover:text-white transition">
                  Pourquoi My Community
                </Link>
              </li>
              <li>
                <Link href="/#comment-ca-marche" className="hover:text-brand-600 dark:hover:text-white transition">
                  Comment ça marche (3 étapes)
                </Link>
              </li>
              <li>
                <Link href="/#espaces" className="hover:text-brand-600 dark:hover:text-white transition">
                  Les 3 Espaces Dédiés
                </Link>
              </li>
              <li>
                <Link href="/#profils" className="hover:text-brand-600 dark:hover:text-white transition">
                  Cas d&apos;usage &amp; Profils
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-brand-600 dark:hover:text-white transition">
                  Foire Aux Questions (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/communities" className="hover:text-brand-600 dark:hover:text-white transition">
                  Explorer les Espaces Territoriaux
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Territoire Bénin */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Territoires du Bénin
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <MapPin className="size-3.5 text-brand-600 shrink-0" />
                <span>12 Départements officiels</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-3.5 text-brand-600 shrink-0" />
                <span>77 Communes référencées</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-3.5 text-brand-600 shrink-0" />
                <span>546 Arrondissements &amp; Quartiers</span>
              </li>
              <li className="flex items-center gap-2">
                <HeartHandshake className="size-3.5 text-emerald-500 shrink-0" />
                <span>Devise : Franc CFA (FCFA / XOF)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Sécurité & Souveraineté */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Sécurité &amp; Confiance
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
                <span>Données souveraines cryptées</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
                <span>Traçabilité des baux &amp; logements</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
                <span>Trésorerie associative transparente</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
                <span>Zéro spam commercial</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-gray-100 pt-6 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:flex-row">
          <p>© 2026 My Community Bénin. Système d&apos;Information Citoyen &amp; Territorial.</p>
          <p className="mt-2 sm:mt-0 font-medium">Développé pour rapprocher les résidents et valoriser nos quartiers.</p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
