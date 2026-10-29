"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, Search, Sparkles } from "lucide-react";
import Link from "next/link";

interface FaqItem {
  question: string;
  answer: string;
  category: "GENERAL" | "RESIDENCES" | "ASSOCIATIONS" | "SECURITY";
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: "GENERAL",
    question: "Qu'est-ce que la plateforme My Community ?",
    answer:
      "My Community est la plateforme souveraine béninoise conçue pour reconnecter les citoyens de chaque quartier, digitaliser la gestion des résidences et campus universitaires, et apporter une transparence absolue dans la gouvernance des associations locales. Elle s'appuie sur la découpe territoriale officielle de la République du Bénin (12 départements, 77 communes, 546 arrondissements).",
  },
  {
    category: "GENERAL",
    question: "L'inscription est-elle gratuite pour les citoyens ?",
    answer:
      "Oui, l'inscription est 100% gratuite pour tous les citoyens et résidents. Vous pouvez vous inscrire en quelques secondes avec votre numéro de téléphone béninois (MTN, Moov, Celtiis) ou votre adresse email, sans aucun frais d'abonnement.",
  },
  {
    category: "GENERAL",
    question: "Pourquoi dois-je être connecté pour accéder au fil d'actualité ?",
    answer:
      "Afin de garantir un environnement sain, respectueux et digne de confiance, le fil d'actualité communautaire est réservé aux résidents authentifiés. Cela élimine les faux comptes, le spam commercial indésirable, l'anonymat toxique et garantit que chaque publication ou appel à l'entraide provient d'un citoyen vérifié de votre localité.",
  },
  {
    category: "RESIDENCES",
    question: "Comment fonctionne la gestion des résidences et cités universitaires ?",
    answer:
      "Les gestionnaires et syndics disposent d'une console dédiée pour cartographier leurs bâtiments, pavillons et chambres (ex: Campus d'Abomey-Calavi ou résidences privées). Ils peuvent émettre des contrats de bail transparents, suivre les états des lieux, gérer le calendrier des occupations et notifier les résidents en temps réel de toute coupure d'eau ou maintenance préventive.",
  },
  {
    category: "RESIDENCES",
    question: "Comment un locataire ou étudiant accède-t-il à son bail ?",
    answer:
      "Dès qu'un gestionnaire vous assigne une chambre ou un logement, votre contrat d'occupation apparaît dans votre espace personnel. Vous pouvez consulter les dates d'effet, le montant du loyer mensuel en FCFA (XOF), et l'historique complet de vos quittances de paiement.",
  },
  {
    category: "ASSOCIATIONS",
    question: "Comment My Community aide-t-elle les associations et comités de développement ?",
    answer:
      "La plateforme permet aux bureaux associatifs de tenir leur registre des membres à jour, de planifier les assemblées générales, de diffuser des avis officiels et surtout de gérer la trésorerie et la collecte des cotisations avec une traçabilité irréprochable consultable par tous les adhérents à jour.",
  },
  {
    category: "ASSOCIATIONS",
    question: "Quelles devises et moyens de paiement sont supportés ?",
    answer:
      "Toutes les transactions (cotisations associatives, loyers, cautions) sont libellées en Francs CFA (FCFA / XOF). Le système intègre nativement les passerelles de paiement par Mobile Money (MTN Moov Money, Celtiis Cash) parfaitement adaptées aux usages quotidiens au Bénin.",
  },
  {
    category: "SECURITY",
    question: "Mes données personnelles sont-elles protégées ?",
    answer:
      "Absolument. Vos données sont cryptées, hébergées conformément aux exigences de souveraineté numérique et ne sont jamais revendues à des régies publicitaires tierces. Vous conservez le contrôle total sur les informations visibles par vos voisins (votre numéro de téléphone n'est jamais divulgué publiquement sans votre consentement).",
  },
  {
    category: "SECURITY",
    question: "Comment proposer une nouvelle communauté citoyenne dans mon quartier ?",
    answer:
      "Une fois connecté, rendez-vous dans l'onglet 'Espaces Citoyens' et cliquez sur 'Proposer un Espace Citoyen'. Précisez le nom, la commune de rattachement et la mission du collectif. Votre proposition est soumise au bureau de modération territorial pour validation rapide.",
  },
];

export const LandingFaq: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<
    "ALL" | "GENERAL" | "RESIDENCES" | "ASSOCIATIONS" | "SECURITY"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndices, setOpenIndices] = useState<number[]>([0, 1]); // Expand first two by default

  const toggleIndex = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory =
      activeCategory === "ALL" || item.category === activeCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Transparence &amp; Réponses
        </span>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white">
          Foire Aux Questions
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Tout comprendre sur le fonctionnement de My Community, la gestion des logements et la sécurité de vos données.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center gap-1.5 justify-center">
          <button
            type="button"
            onClick={() => setActiveCategory("ALL")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeCategory === "ALL"
                ? "bg-brand-600 text-white shadow-xs"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
            }`}
          >
            Toutes ({FAQ_ITEMS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("GENERAL")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeCategory === "GENERAL"
                ? "bg-brand-600 text-white shadow-xs"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
            }`}
          >
            Plateforme &amp; Accès
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("RESIDENCES")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeCategory === "RESIDENCES"
                ? "bg-brand-600 text-white shadow-xs"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
            }`}
          >
            Résidences &amp; Baux
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("ASSOCIATIONS")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeCategory === "ASSOCIATIONS"
                ? "bg-brand-600 text-white shadow-xs"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
            }`}
          >
            Associations &amp; Trésorerie
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("SECURITY")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeCategory === "SECURITY"
                ? "bg-brand-600 text-white shadow-xs"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
            }`}
          >
            Sécurité &amp; Données
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="size-3.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une réponse..."
            className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-8 pr-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Accordion List */}
      <div className="max-w-4xl mx-auto space-y-3">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openIndices.includes(idx);
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-gray-200/90 bg-white transition shadow-2xs hover:border-brand-300 dark:border-gray-800 dark:bg-gray-900"
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className="flex w-full items-center justify-between p-5 text-left font-bold text-sm text-gray-900 dark:text-white"
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-brand-600 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-gray-100 px-5 pb-5 pt-3 text-xs leading-relaxed text-gray-600 dark:border-gray-800 dark:text-gray-300 animate-in fade-in-50 duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500">
              Aucune question ne correspond à votre recherche.
            </p>
          </div>
        )}
      </div>

      {/* CTA Box if question remains */}
      <div className="max-w-4xl mx-auto rounded-3xl border border-brand-200/60 bg-gradient-to-r from-brand-50/80 via-white to-indigo-50/50 p-6 dark:border-brand-900/40 dark:from-brand-950/40 dark:via-gray-900 dark:to-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-bold text-gray-950 dark:text-white">
            Une question spécifique sur votre commune ou résidence ?
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Rejoignez l&apos;espace citoyen dès aujourd&apos;hui ou échangez avec un gestionnaire territorial.
          </p>
        </div>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-700 shrink-0 transition"
        >
          <Sparkles className="size-3.5" />
          <span>Créer mon compte citoyen</span>
        </Link>
      </div>
    </div>
  );
};

export default LandingFaq;
