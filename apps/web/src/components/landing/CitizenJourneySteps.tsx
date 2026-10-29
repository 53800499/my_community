import React from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import {
  SmartphoneIcon,
  MapPinIcon,
  UsersIcon,
  CheckIcon,
  ShieldCheckIcon,
} from "@/components/icons";

interface StepItem {
  number: string;
  icon: React.ReactNode;
  badge: string;
  title: string;
  description: string;
  detail: string;
}

const steps: StepItem[] = [
  {
    number: "01",
    icon: <SmartphoneIcon className="size-6 text-brand-600 dark:text-brand-400" />,
    badge: "30 secondes",
    title: "Identification Citoyenne & NPI",
    description:
      "Inscrivez-vous simplement avec votre numéro béninois (+229). Liez votre NPI (Numéro Personnel d'Identification) pour débloquer votre droit de vote citoyen certifié et vos baux officiels.",
    detail: "Vérification OTP instantanée par SMS sur réseaux MTN & Moov.",
  },
  {
    number: "02",
    icon: <MapPinIcon className="size-6 text-indigo-600 dark:text-indigo-400" />,
    badge: "Géolocalisé",
    title: "Rattachement à votre Quartier ou Campus",
    description:
      "Sélectionnez votre commune parmi les 77 du Bénin, puis votre arrondissement et quartier. Si vous êtes étudiant ou locataire, rattachez directement votre chambre ou résidence.",
    detail: "Accès automatique aux comités de quartier et syndics certifiés.",
  },
  {
    number: "03",
    icon: <UsersIcon className="size-6 text-emerald-600 dark:text-emerald-400" />,
    badge: "Acteur de Proximité",
    title: "Participez, Votez et Transformez",
    description:
      "Accédez immédiatement au fil d'actualité civique, votez pour les projets prioritaires de votre quartier, signalez un problème de salubrité et payez vos loyers et cotisations sans friction.",
    detail: "Quittances et reçus officiels téléchargeables en PDF.",
  },
];

export const CitizenJourneySteps: React.FC = () => {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="light" color="primary" size="md">
          Simple &amp; Inclusif
        </Badge>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-900 sm:text-5xl dark:text-white">
          Comment Rejoindre la Communauté ?
        </h2>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          Trois étapes rapides pour devenir un citoyen engagé et connecté à son territoire.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
        {steps.map((step, idx) => (
          <div
            key={step.number}
            className="relative flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-7 shadow-xs transition hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
          >
            {/* Step Number Watermark */}
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-gray-200 dark:text-gray-800">
                {step.number}
              </span>
              <Badge variant="light" color="primary" size="sm">
                {step.badge}
              </Badge>
            </div>

            <div className="mt-6">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 dark:border-gray-800 dark:bg-gray-800">
                {step.icon}
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900 dark:text-white">
                {step.title}
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                {step.description}
              </p>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-3 text-[11px] text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <span className="font-semibold text-brand-600 dark:text-brand-400">Garantie : </span>
              {step.detail}
            </div>
          </div>
        ))}
      </div>

      {/* Direct CTA */}
      <div className="mt-12 text-center">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-700"
        >
          <ShieldCheckIcon className="size-5" />
          <span>Créer mon Compte Citoyen Gratuitement</span>
          <span>&rarr;</span>
        </Link>
        <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
          Aucun frais d&apos;inscription • Compatible tout smartphone et ordinateur
        </p>
      </div>
    </section>
  );
};

export default CitizenJourneySteps;
