'use client';

import React, { useState, useEffect } from 'react';
import { CreatePositionInput, AssociationRoleType } from '@/features/associations';
import { Plus, X } from 'lucide-react';
import { Select2 } from '@/components/ui/Select2';

interface CreatePositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreatePositionInput) => Promise<void>;
  isSubmitting?: boolean;
}

const PRESET_DEPARTMENTS = [
  'Bureau Exécutif',
  'Secrétariat & Administration',
  'Finances & Recouvrement',
  'Commission Logements & Patrimoine',
  'Commission Organisation & Événements',
  'Communication & Mobilisation',
  'Comité de Contrôle & Transparence',
  'Commission Affaires Féminines & Sociales',
];

export function CreatePositionModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreatePositionModalProps) {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Bureau Exécutif');
  const [customDepartment, setCustomDepartment] = useState('');
  const [roleCategory, setRoleCategory] = useState<AssociationRoleType>('BOARD_MEMBER');
  const [description, setDescription] = useState('');
  const [assignedUserName, setAssignedUserName] = useState('');
  const [termStartDate, setTermStartDate] = useState('');
  const [termEndDate, setTermEndDate] = useState('');

  // Initialisation différée de la date courante (Next.js prerender safety)
  useEffect(() => {
    if (isOpen) {
      setTermStartDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalDepartment = department === 'AUTRE' ? (customDepartment.trim() || 'Comité Spécial') : department;

    await onSubmit({
      title: title.trim(),
      department: finalDepartment,
      roleCategory,
      description: description.trim(),
      assignedUserName: assignedUserName.trim() || undefined,
      assignedUserId: assignedUserName.trim() ? `usr-named-${Date.now()}` : undefined,
      termStartDate: termStartDate || undefined,
      termEndDate: termEndDate || undefined,
    });

    // Reset
    setTitle('');
    setDescription('');
    setAssignedUserName('');
    setCustomDepartment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-4 sm:p-6 shadow-2xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Créer un Nouveau Poste de Direction
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Définissez un poste dans l’organigramme officiel de l’association.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Intitulé Officiel du Poste *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Chargé(e) aux Résidences & Logements, Vice-Président..."
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Pôle ou Commission
              </label>
              <Select2
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="mt-1 w-full"
              >
                {PRESET_DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
                <option value="AUTRE">+ Autre commission sur mesure</option>
              </Select2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Rôle Système (RBAC)
              </label>
              <Select2
                value={roleCategory}
                onChange={(e) => setRoleCategory(e.target.value as AssociationRoleType)}
                className="mt-1 w-full"
              >
                <option value="BOARD_MEMBER">Membre du Bureau / Responsable</option>
                <option value="SECRETARY">Administration / Secrétariat</option>
                <option value="TREASURER">Finances / Trésorerie</option>
                <option value="PRESIDENT">Présidence / Représentation</option>
              </Select2>
            </div>
          </div>

          {department === 'AUTRE' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Nom de la commission personnalisée
              </label>
              <input
                type="text"
                required
                value={customDepartment}
                onChange={(e) => setCustomDepartment(e.target.value)}
                placeholder="Ex: Commission Juridique & Statuts"
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Missions &amp; Cahier des Charges
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Attributions officielles confiées au titulaire de ce poste..."
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Nomination Immédiate du Titulaire (Optionnel)
            </h3>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400">
                  Nom du Responsable nommé
                </label>
                <input
                  type="text"
                  value={assignedUserName}
                  onChange={(e) => setAssignedUserName(e.target.value)}
                  placeholder="Laisser vide pour poste vacant"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-900 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400">
                  Prise de fonction
                </label>
                <input
                  type="date"
                  value={termStartDate}
                  onChange={(e) => setTermStartDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-900 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
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
              disabled={isSubmitting || !title.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-700 disabled:opacity-50"
            >
              <Plus className="size-4" />
              <span>{isSubmitting ? 'Création...' : 'Créer le Poste'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
