import React from "react";
import Badge from "@/components/ui/badge/Badge";
import {
  UsersIcon,
  MapPinIcon,
  BanknoteIcon,
  HandHeartIcon,
  ShieldCheckIcon,
  MessageSquareIcon,
} from "@/components/icons";
import { Check } from "lucide-react";

interface PillarItem {
  id: string;
  icon: React.ReactNode;
  badge: string;
  title: string;
  description: string;
  features: string[];
  gradient: string;
  quote: { text: string; author: string; role: string };
}

const pillars: PillarItem[] = [
  {
    id: "deliberation",
    icon: <UsersIcon className="size-6 text-brand-600 dark:text-brand-400" />,
    badge: "Pouvoir Citoyen",
    title: "Délibération & Concertations Locales",
    description:
      "Redonnez vie aux assemblées de quartier. Chaque citoyen identifié par son NPI participe aux consultations publiques, vote les priorités d'aménagement et dialogue avec ses élus et chefs de village.",
    features: [
      "Consultations et sondages certifiés anti-fraude",
      "Dépôt de propositions citoyennes avec seuil de soutien",
      "Comptes-rendus d'assemblées téléchargeables en PDF",
      "Échanges constructifs modérés par la charte républicaine",
    ],
    gradient: "from-brand-500/10 to-indigo-500/10 dark:from-brand-500/20 dark:to-indigo-500/20",
    quote: {
      text: "« My Community nous permet enfin de voter les priorités du quartier sans perdre des dimanches entiers en réunions stériles. »",
      author: "M. Gandonou",
      role: "Chef de Quartier, Cotonou",
    },
  },
  {
    id: "signaling",
    icon: <MapPinIcon className="size-6 text-amber-600 dark:text-amber-400" />,
    badge: "Cadre de Vie",
    title: "Signalements Urbains & Salubrité",
    description:
      "Transformez votre smartphone en capteur civique. Photographiez et géolocalisez les anomalies de voirie, les dépôts sauvages ou les coupures pour déclencher l'action immédiate des comités de salubrité.",
    features: [
      "Géolocalisation automatique précise sur les 77 communes",
      "Catégorisation intelligente (Eau, Électricité, Voirie, Déchets)",
      "Suivi de résolution avec photos avant / après",
      "Organisation des journées mensuelles de salubrité citoyenne",
    ],
    gradient: "from-amber-500/10 to-rose-500/10 dark:from-amber-500/20 dark:to-rose-500/20",
    quote: {
      text: "« Le nid-de-poule devant l'école a été signalé le mardi, rebouché le vendredi grâce à la mobilisation des riverains. »",
      author: "Dr. Armand Gbaguidi",
      role: "Parent d'élèves, Abomey-Calavi",
    },
  },
  {
    id: "finance",
    icon: <BanknoteIcon className="size-6 text-emerald-600 dark:text-emerald-400" />,
    badge: "Transparence Totale",
    title: "Budgets Participatifs & Cotisations XOF",
    description:
      "Enrayez la méfiance financière. Collectez les cotisations associatives et les contributions de quartier en Francs CFA via Mobile Money, avec un livre de comptes auditable ouvert à chaque adhérent.",
    features: [
      "Paiements directs via MTN MoMo et Moov Flooz",
      "Quittances numériques automatiques avec QR code",
      "Tableau de bord financier en temps réel accessible à tous",
      "Historique inaltérable garantissant l'intégrité comptable",
    ],
    gradient: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20",
    quote: {
      text: "« Pour la première fois en 10 ans, chaque membre de notre association voit le solde exact de la trésorerie sur son téléphone. »",
      author: "Séfiatou Bio",
      role: "Trésorière d'Association, Parakou",
    },
  },
  {
    id: "solidarity",
    icon: <HandHeartIcon className="size-6 text-rose-600 dark:text-rose-400" />,
    badge: "Entraide de Proximité",
    title: "Solidarité & Vie de Voisinage",
    description:
      "Recréez le tissu chaleureux de nos cités et villages. Favorisez le don d'objets scolaires, l'entraide entre étudiants de l'UAC, le covoiturage et la vigilance bienveillante entre voisins.",
    features: [
      "Petites annonces citoyennes gratuites et de confiance",
      "Réseau d'entraide pour étudiants primo-arrivants",
      "Groupes de vigilance et d'alerte sécurité bienveillante",
      "Bourse d'échange de manuels et matériels d'études",
    ],
    gradient: "from-rose-500/10 to-purple-500/10 dark:from-rose-500/20 dark:to-purple-500/20",
    quote: {
      text: "« J'ai pu équiper ma chambre universitaire grâce aux dons bienveillants de voisins du quartier Tankpè. »",
      author: "Sylvie Dossou",
      role: "Étudiante en Agronomie, UAC",
    },
  },
];

export const DemocracyPillarsSection: React.FC = () => {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      {/* Section Header */}
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50/70 px-3.5 py-1 text-xs font-semibold text-brand-700 dark:border-brand-800 dark:bg-brand-950/60 dark:text-brand-300">
          <ShieldCheckIcon className="size-3.5" />
          <span>Le Renouveau Démocratique Béninois</span>
        </div>

        <h2 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-5xl dark:text-white">
          La Démocratie Locale à Portée de Main
        </h2>

        <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-300">
          Une plateforme moderne conçue pour redonner la parole aux citoyens, revitaliser les quartiers et bâtir une gouvernance de proximité transparente et inclusive.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
        {pillars.map((pillar) => (
          <div
            key={pillar.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
          >
            {/* Top accent gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${pillar.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 shadow-xs dark:border-gray-800 dark:bg-gray-800">
                  {pillar.icon}
                </div>
                <Badge variant="light" color="primary" size="sm">
                  {pillar.badge}
                </Badge>
              </div>

              <h3 className="mt-6 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                {pillar.title}
              </h3>

              <p className="mt-2.5 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                {pillar.description}
              </p>

              {/* Checklist */}
              <ul className="mt-5 space-y-2.5">
                {pillar.features.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/80 dark:text-brand-400">
                      <Check className="size-2.5" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Testimonial Quote */}
            <div className="relative z-10 mt-6 rounded-2xl border border-gray-100 bg-gray-50/80 p-3.5 dark:border-gray-800/80 dark:bg-gray-800/60">
              <p className="text-[11px] italic text-gray-700 dark:text-gray-300">
                {pillar.quote.text}
              </p>
              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span className="font-bold text-gray-900 dark:text-white">
                  {pillar.quote.author}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {pillar.quote.role}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DemocracyPillarsSection;
