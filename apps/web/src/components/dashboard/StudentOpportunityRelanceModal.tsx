'use client';

import React, { useState } from 'react';
import { StudentOpportunityRelanceInput, AssociationMember } from '@/features/associations';
import { X, Send, GraduationCap, Users } from 'lucide-react';
import { Select2 } from '@/components/ui/Select2';

interface StudentOpportunityRelanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: StudentOpportunityRelanceInput) => Promise<void>;
  members: AssociationMember[];
  isSubmitting?: boolean;
}

export function StudentOpportunityRelanceModal({
  isOpen,
  onClose,
  onSubmit,
  members,
  isSubmitting = false,
}: StudentOpportunityRelanceModalProps) {
  const [opportunityType, setOpportunityType] = useState<StudentOpportunityRelanceInput['opportunityType']>('INTERNSHIP');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetInstitution, setTargetInstitution] = useState('ALL');
  const [targetStudyLevel, setTargetStudyLevel] = useState('ALL');
  const [channel, setChannel] = useState<StudentOpportunityRelanceInput['channel']>('NOTIFICATION');
  const [deadline, setDeadline] = useState('');

  if (!isOpen) return null;

  // Calcul en direct des étudiants ciblés
  const targetedStudents = members.filter((m) => {
    if (!m.isStudent && !m.studentInfo) return false;
    if (targetInstitution !== 'ALL') {
      const inst = (m.studentInfo?.institutionName || m.studentInfo?.university || '').toLowerCase();
      if (!inst.includes(targetInstitution.toLowerCase())) return false;
    }
    if (targetStudyLevel !== 'ALL' && m.studentInfo?.studyLevel !== targetStudyLevel) return false;
    return true;
  });

  const count = targetedStudents.length > 0 ? targetedStudents.length : members.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    await onSubmit({
      opportunityType,
      title: title.trim(),
      description: description.trim(),
      targetInstitution: targetInstitution === 'ALL' ? undefined : targetInstitution,
      targetFaculty: undefined,
      targetStudyLevel: targetStudyLevel === 'ALL' ? undefined : targetStudyLevel,
      channel,
      deadline: deadline.trim() || undefined,
    });

    setTitle('');
    setDescription('');
    setDeadline('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border border-gray-100 bg-white p-4 sm:p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                Diffuser une Opportunité &amp; Relance Étudiante
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Alerte ciblée pour stages, bourses d&apos;études, mentorat ou concours professionnels.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-xl p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bannière de ciblage en direct */}
          <div className="flex items-center justify-between rounded-2xl border border-brand-200/60 bg-brand-50/50 p-3.5 text-xs dark:border-brand-900/60 dark:bg-brand-950/20">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-brand-600 dark:text-brand-400" />
              <span className="font-semibold text-brand-900 dark:text-brand-200">
                Public étudiant ciblé :
              </span>
            </div>
            <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-black text-white">
              {count} étudiant(s) éligible(s)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Type d&apos;Opportunité *
              </label>
              <Select2
                value={opportunityType}
                onChange={(e) => setOpportunityType(e.target.value as StudentOpportunityRelanceInput['opportunityType'])}
                className="mt-1 w-full"
              >
                <option value="INTERNSHIP">Stage &amp; Insertion Professionnelle</option>
                <option value="SCHOLARSHIP">Bourse d&apos;Études &amp; Financement</option>
                <option value="MENTORSHIP">Mentorat &amp; Accompagnement</option>
                <option value="JOB">Job Étudiant &amp; Vacations</option>
                <option value="TRAINING">Formation Certifiante &amp; Atelier</option>
              </Select2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Canal de Diffusion Prioritaire
              </label>
              <Select2
                value={channel}
                onChange={(e) => setChannel(e.target.value as StudentOpportunityRelanceInput['channel'])}
                className="mt-1 w-full"
              >
                <option value="NOTIFICATION">Notification In-App + Tableau d&apos;Affichage</option>
                <option value="SMS_WHATSAPP">Relance SMS &amp; Alerte WhatsApp</option>
                <option value="EMAIL">Courrier Électronique Officiel</option>
              </Select2>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Intitulé de l&apos;Opportunité *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: 5 Postes de Stage PFE en Génie Logiciel &amp; Data — Cotonou"
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Établissement / Université Ciblé(e)
              </label>
              <Select2
                value={targetInstitution}
                onChange={(e) => setTargetInstitution(e.target.value)}
                className="mt-1 w-full"
              >
                <option value="ALL">Tous les établissements (Publics, Privés &amp; Lycées)</option>
                <option value="UAC">UAC (Université d’Abomey-Calavi)</option>
                <option value="Parakou">Université de Parakou (UP)</option>
                <option value="UNSTIM">UNSTIM (Natitingou / Lokossa / Abomey)</option>
                <option value="UNA">UNA (Porto-Novo / Kétou)</option>
                <option value="Pigier">Pigier Bénin</option>
                <option value="Epitech">Epitech Bénin</option>
                <option value="ESM">ESM Bénin</option>
                <option value="HECM">HECM Bénin</option>
                <option value="Lycée">Lycées &amp; Enseignement Technique</option>
              </Select2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Promotion / Niveau d&apos;Études Ciblé
              </label>
              <Select2
                value={targetStudyLevel}
                onChange={(e) => setTargetStudyLevel(e.target.value)}
                className="mt-1 w-full"
              >
                <option value="ALL">Toutes les promotions (Secondaire à Doctorat)</option>
                <option value="Secondaire">Secondaire / Lycée / Collège</option>
                <option value="Licence 1">Licence 1 (L1)</option>
                <option value="Licence 2">Licence 2 (L2)</option>
                <option value="Licence 3">Licence 3 (L3 / Finissants)</option>
                <option value="Master 1">Master 1 (M1)</option>
                <option value="Master 2">Master 2 (M2 / Diplômés)</option>
                <option value="Doctorat">Doctorat / Ph.D</option>
                <option value="Formation Professionnelle">Formation Pro &amp; Métiers</option>
              </Select2>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Date Limite de Soumission
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Descriptif, Modalités &amp; Pièces à Fournir *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détaillez ici l&apos;offre de stage, le montant de la bourse, les critères académiques d&apos;éligibilité et le contact de dépôt..."
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-xs leading-relaxed text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-50"
            >
              <Send className="size-3.5" />
              <span>{isSubmitting ? 'Diffusion...' : `Diffuser l'Alerte (${count} étudiants)`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentOpportunityRelanceModal;
