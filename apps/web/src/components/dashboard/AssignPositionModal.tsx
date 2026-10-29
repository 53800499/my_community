'use client';

import React, { useState, useEffect } from 'react';
import { AssociationPosition, AssociationMember } from '@/features/associations';
import { Check, X, Info } from 'lucide-react';
import { Select2 } from '@/components/ui/Select2';

interface AssignPositionModalProps {
  isOpen: boolean;
  position: AssociationPosition | null;
  members: AssociationMember[];
  onClose: () => void;
  onSubmit: (targetUserId: string, targetUserName: string, termStartDate?: string, termEndDate?: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function AssignPositionModal({
  isOpen,
  position,
  members,
  onClose,
  onSubmit,
  isSubmitting = false,
}: AssignPositionModalProps) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [customName, setCustomName] = useState('');
  const [termStartDate, setTermStartDate] = useState('');
  const [termEndDate, setTermEndDate] = useState('');

  // Initialisation différée de la date courante (Next.js prerender safety)
  useEffect(() => {
    if (isOpen) {
      setTermStartDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  if (!isOpen || !position) return null;

  const isPassation = position.status === 'OCCUPIED' && position.assignedUserName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let targetUserId = selectedUserId;
    let targetUserName = customName.trim();

    if (!selectedUserId) {
      return;
    }

    const found = members.find((m) => m.userId === selectedUserId || m.id === selectedUserId);
    if (!found) {
      return;
    }

    targetUserId = found.userId || found.id;
    targetUserName = found.userName;

    await onSubmit(
      targetUserId,
      targetUserName,
      termStartDate || undefined,
      termEndDate || undefined,
    );

    setSelectedUserId('');
    setCustomName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-4 sm:p-6 shadow-2xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {isPassation ? 'Passation de Service & Succession' : 'Nommer un Responsable'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Poste : <strong className="text-brand-600 dark:text-brand-400">{position.title}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
          >
            <X className="size-4" />
          </button>
        </div>

        {isPassation && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
            Titulaire actuel : <strong>{position.assignedUserName}</strong>. Cette action enregistre la passation de service officielle vers le nouveau titulaire.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Sélectionner un Membre Adhérent *
              </label>
              <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">
                Règle : Réservé aux membres
              </span>
            </div>
            <Select2
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="mt-1 w-full"
              required
            >
              <option value="">-- Choisir un membre de l’association --</option>
              {members.map((m) => (
                <option key={m.userId || m.id} value={m.userId || m.id}>
                  {m.userName} ({m.membershipCardNumber ? `Matricule ${m.membershipCardNumber}` : m.userPhone || 'Adhérent'})
                </option>
              ))}
            </Select2>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
              <Info className="size-3.5 text-brand-600 shrink-0" />
              <span>Conformément aux statuts, toute nomination à un poste de gouvernance requiert que le bénéficiaire soit préalablement inscrit au registre des adhérents.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Date de prise de fonction
              </label>
              <input
                type="date"
                value={termStartDate}
                onChange={(e) => setTermStartDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-2.5 py-1.5 text-xs text-gray-900 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Fin de mandat (Optionnel)
              </label>
              <input
                type="date"
                value={termEndDate}
                onChange={(e) => setTermEndDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-2.5 py-1.5 text-xs text-gray-900 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-700 disabled:opacity-50"
            >
              <Check className="size-4" />
              <span>{isSubmitting ? 'Enregistrement...' : isPassation ? 'Valider la Passation' : 'Nommer au Poste'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
