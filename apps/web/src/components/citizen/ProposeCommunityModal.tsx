"use client";

import React from "react";
import { UsersIcon, GlobeIcon, CheckIcon, MapPinIcon } from "@/components/icons";
import { X } from "lucide-react";
import { Select2 } from "@/components/ui/Select2";
import { ApiCommunityProposal } from "@/features/communities";
import { useProposeCommunity } from "@/features/communities";

interface ProposeCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (proposal: ApiCommunityProposal) => void;
}

export const ProposeCommunityModal: React.FC<ProposeCommunityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    departments,
    name,
    setName,
    territoryId,
    setTerritoryId,
    type,
    setType,
    description,
    setDescription,
    justification,
    setJustification,
    isSubmitting,
    error,
    isSuccess,
    submitProposal,
    resetForm,
  } = useProposeCommunity(isOpen);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const selectedDept = departments.find((d) => d.id === territoryId);
      const proposal = await submitProposal();

      if (selectedDept) {
        proposal.territoryName = selectedDept.name;
      }

      setTimeout(() => {
        resetForm();
        onSuccess(proposal);
        onClose();
      }, 1400);
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 animate-in slide-in-from-bottom duration-200 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        {/* Mobile Tactile Drag Handle */}
        <div className="mx-auto my-2.5 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700 sm:hidden" />

        {/* Banner Header */}
        <div className="relative bg-gradient-to-r from-brand-700 via-indigo-700 to-indigo-900 p-5 sm:p-6 text-white">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-4 right-4 flex size-9 sm:size-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition active:scale-95"
          >
            <X className="size-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md font-bold text-white shadow-inner">
              <UsersIcon className="size-6 text-brand-200" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Proposer un Nouvel Espace Citoyen</h3>
              <p className="text-xs text-brand-200 mt-0.5">
                Instruction citoyenne &amp; validation territoriale officielle
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {isSuccess ? (
            <div className="my-8 flex flex-col items-center justify-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 animate-bounce">
                <CheckIcon className="size-8" />
              </div>
              <h4 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                Initiative Soumise avec Succès !
              </h4>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 max-w-md">
                Votre proposition pour <strong className="text-gray-900 dark:text-white">&laquo; {name} &raquo;</strong> a été enregistrée en état <span className="font-semibold text-amber-600 dark:text-amber-400">EN ATTENTE D&apos;INSTRUCTION (PENDING)</span>. Elle est transmise aux autorités locales pour vérification.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
                  {error}
                </div>
              )}

              {/* Name and Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Nom de l&apos;espace citoyen *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Collectif des Habitants d'Agla"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Type d&apos;espace *
                  </label>
                  <Select2
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="mt-1 w-full"
                  >
                    <option value="TERRITORIAL">Territoriale</option>
                    <option value="THEMATIC">Thématique</option>
                  </Select2>
                </div>
              </div>

              {/* Territory Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Territoire de Rattachement (Département / Commune) *
                </label>
                <div className="mt-1">
                  <Select2
                    value={territoryId}
                    onChange={(e) => setTerritoryId(e.target.value)}
                    className="w-full"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code}) — {dept.communesCount || 8} Communes
                      </option>
                    ))}
                  </Select2>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Description &amp; Objectifs *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Décrivez les activités principales, les publics concernés et la portée de cet espace..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Justification of local interest */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Justification de l&apos;Intérêt Public Local (Exigence Spécification 03) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Expliquez en quoi cet espace répond à un besoin collectif avéré et non satisfait sur le territoire..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Footer info & Actions */}
              <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-3 text-[11px] text-brand-800 dark:border-brand-900/60 dark:bg-brand-950/30 dark:text-brand-300">
                <span className="font-bold">Gouvernance transparente :</span> En soumettant cette proposition, vous vous engagez à respecter la charte de civisme républicain du Bénin. En cas d&apos;approbation, vous serez désigné Responsable Initial (Manager).
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Envoi en cours...</span>
                  ) : (
                    <>
                      <GlobeIcon className="size-3.5" />
                      <span>Soumettre la Proposition</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposeCommunityModal;
