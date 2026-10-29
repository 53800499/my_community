'use client';

import React, { useState } from 'react';
import Badge from '@/components/ui/badge/Badge';
import { PlusIcon, UsersIcon, ShieldCheckIcon, CheckIcon, SearchIcon } from '@/components/icons';
import { ShieldCheck, FileDown, Plus, FileSignature } from 'lucide-react';
import {
  useAssociations,
  useAssociationBureau,
  useAssociationMembers,
  AssociationPosition,
} from '@/features/associations';
import Link from 'next/link';
import { OrganigrammeTree } from '@/features/associations/components/OrganigrammeTree';
import { CreatePositionModal } from '@/components/dashboard/CreatePositionModal';
import { AssignPositionModal } from '@/components/dashboard/AssignPositionModal';
import { PermissionsSpacesModal } from '@/components/dashboard/PermissionsSpacesModal';
import { Select2 } from '@/components/ui/Select2';
import { useConfirm } from '@/context/ConfirmationContext';

export default function AssociationBureauPage() {
  const {
    associations,
    selectedAssociation,
    selectedAssocId,
    selectAssociation,
    isLoading: isLoadingAssocs,
  } = useAssociations();

  const {
    positions,
    isLoading: isLoadingPositions,
    isSubmitting,
    metrics,
    createPosition,
    assignPosition,
    vacatePosition,
    deletePosition,
    updatePermissions,
    initializeDefaultBureau,
    exportOrganigrammePdf,
  } = useAssociationBureau(selectedAssociation);

  const { members } = useAssociationMembers(selectedAssocId);

  // Modals state
  const { confirm } = useConfirm();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assigningPosition, setAssigningPosition] = useState<AssociationPosition | null>(null);
  const [permissionsPosition, setPermissionsPosition] = useState<AssociationPosition | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OCCUPIED' | 'VACANT'>('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Filtrage des postes
  const filteredPositions = positions.filter((pos) => {
    if (statusFilter === 'OCCUPIED' && pos.status !== 'OCCUPIED') return false;
    if (statusFilter === 'VACANT' && pos.status !== 'VACANT') return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchTitle = pos.title.toLowerCase().includes(q);
      const matchDept = pos.department.toLowerCase().includes(q);
      const matchUser = pos.assignedUserName?.toLowerCase().includes(q);
      return matchTitle || matchDept || matchUser;
    }
    return true;
  });

  const handleCreatePosition = async (input: any) => {
    try {
      await createPosition(input);
      showToast(`Poste « ${input.title} » créé avec succès dans l'organigramme !`);
    } catch {
      showToast('Erreur lors de la création du poste.');
    }
  };

  const handleAssignPosition = async (
    targetUserId: string,
    targetUserName: string,
    termStartDate?: string,
    termEndDate?: string,
  ) => {
    if (!assigningPosition) return;
    try {
      await assignPosition(assigningPosition.id, {
        targetUserId,
        targetUserName,
        termStartDate,
        termEndDate,
      });
      showToast(`Responsable « ${targetUserName} » affecté au poste avec succès !`);
      setAssigningPosition(null);
    } catch {
      showToast('Erreur lors de la nomination.');
    }
  };

  const handleVacatePosition = async (position: AssociationPosition) => {
    const ok = await confirm({
      title: "Libérer le poste",
      message: `Confirmez-vous la libération du poste « ${position.title} » ? Le titulaire actuel ${position.assignedUserName} sera démis et le poste redeviendra vacant.`,
      confirmText: "Libérer le poste",
      cancelText: "Annuler",
      variant: "warning",
    });
    if (!ok) return;

    try {
      await vacatePosition(position.id);
      showToast(`Le poste « ${position.title} » a été libéré et est désormais vacant.`);
    } catch (err: any) {
      showToast(err?.message || 'Erreur lors de la libération du poste.');
    }
  };

  const handleDeletePosition = async (position: AssociationPosition) => {
    const ok = await confirm({
      title: "Supprimer le poste",
      message: `Confirmez-vous la suppression définitive du poste personnalisé « ${position.title} » ?`,
      confirmText: "Supprimer",
      cancelText: "Annuler",
      variant: "danger",
    });
    if (!ok) return;

    try {
      await deletePosition(position.id);
      showToast(`Poste « ${position.title} » supprimé de l'organigramme.`);
    } catch {
      showToast('Erreur lors de la suppression.');
    }
  };

  const handleUpdatePermissions = async (
    positionId: string,
    accessSpaces: string[],
    permissions: string[],
  ) => {
    try {
      await updatePermissions(positionId, accessSpaces, permissions);
      showToast('Permissions et espaces d’accès mis à jour avec succès !');
      setPermissionsPosition(null);
    } catch {
      showToast('Erreur lors de la mise à jour des permissions.');
    }
  };

  return (
    <div className="space-y-6">

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-xs font-semibold text-white shadow-xl dark:bg-white dark:text-gray-900 animate-in fade-in slide-in-from-top-3">
          <CheckIcon className="size-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
              Organigramme &amp; Gestion des Postes Associatifs
            </h1>
            <Badge variant="light" color="primary" size="sm">
              Gouvernance Civique
            </Badge>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Création de postes sur mesure, attribution des commissions, passation de service et organigramme officiel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/associations/governance"
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/70 px-4 py-2 text-xs font-bold text-indigo-700 shadow-xs transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
          >
            <FileSignature className="size-4" />
            <span>Règles &amp; Mandats Dirigeants (PDF)</span>
          </Link>

          <Link
            href="/dashboard/associations/permissions"
            className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-2 text-xs font-semibold text-brand-700 shadow-xs transition hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300 dark:hover:bg-brand-900/60"
          >
            <ShieldCheck className="size-4" />
            <span>Matrice des Droits &amp; Accès</span>
          </Link>

          <button
            type="button"
            onClick={async () => {
              try {
                await initializeDefaultBureau();
                showToast("Modèle de bureau statutaire recommandé (6 postes) initialisé avec succès !");
              } catch {
                showToast("Erreur lors de l'initialisation du bureau.");
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/70 px-4 py-2 text-xs font-semibold text-indigo-700 shadow-xs transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
            title="Génère les 6 postes statutaires fondamentaux : Président, Vice-Président, SG, Trésorier, Communication, Adhésions"
          >
            <ShieldCheck className="size-4" />
            <span>Modèle Bureau par Défaut</span>
          </button>

          <button
            type="button"
            onClick={exportOrganigrammePdf}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <FileDown className="size-4" />
            <span>Exporter Organigramme PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-700"
          >
            <Plus className="size-4" />
            <span>Créer un Poste</span>
          </button>
        </div>
      </div>

      {/* Association Selector */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 shrink-0">
              Association active :
            </span>
            <div className="w-full sm:w-auto sm:min-w-[260px]">
              <Select2
                value={selectedAssocId}
                onChange={(e) => selectAssociation(e.target.value)}
                disabled={isLoadingAssocs}
                className="w-full"
              >
                {associations.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.acronym || 'ASSO'})
                  </option>
                ))}
              </Select2>
            </div>
          </div>

          {selectedAssociation && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Récépissé : <strong>{selectedAssociation.registrationNumber || 'Enregistré'}</strong></span>
              <span>•</span>
              <span>Siège : <strong>{selectedAssociation.territory || 'Bénin'}</strong></span>
              <span>•</span>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                {selectedAssociation.category || 'COMMUNITY'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Note Pédagogique de Gouvernance */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="size-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              Séparation des Rôles : Administrateur Technique vs Président &amp; Bureau Exécutif
            </p>
            <p className="text-[11px] text-blue-800/90 dark:text-blue-300/90">
              Le créateur de l&apos;espace reçoit les droits d&apos;administration technique numérique. Les postes de direction (Président, Trésorier, Secrétaire Général) font l&apos;objet de nominations statutaires formelles parmi les membres enregistrés. Chaque fonction dispose de permissions isolées (RBAC) pour garantir l&apos;intégrité financière et opérationnelle.
            </p>
          </div>
        </div>
      </div>

      {/* KPIs de Gouvernance */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Total Postes Organigramme</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{metrics.total}</p>
          <p className="mt-1 text-[10px] text-gray-400">Statutaires et commissions</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Postes Pourvus</p>
          <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{metrics.occupied}</p>
          <p className="mt-1 text-[10px] text-gray-400">Responsables en exercice</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Postes Vacants</p>
          <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">{metrics.vacant}</p>
          <p className="mt-1 text-[10px] text-gray-400">À pourvoir / élection</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <p className="text-[11px] font-medium text-brand-600 dark:text-brand-400">Taux de Couverture</p>
          <p className="mt-1 text-2xl font-black text-brand-600 dark:text-brand-400">{metrics.fillRate}%</p>
          <p className="mt-1 text-[10px] text-gray-400">Bureau opérationnel</p>
        </div>
      </div>

      {/* Barre de Filtres & Recherche */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Rechercher un poste, commission ou titulaire..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pr-4 pl-9 text-xs text-gray-900 focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === 'ALL'
                ? 'bg-brand-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Tous ({positions.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('OCCUPIED')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === 'OCCUPIED'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Pourvus ({metrics.occupied})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('VACANT')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === 'VACANT'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Vacants ({metrics.vacant})
          </button>
        </div>
      </div>

      {/* Organigramme Tree */}
      {isLoadingPositions ? (
        <div className="flex items-center justify-center p-12 text-xs text-gray-500">
          Chargement de l'organigramme associatif...
        </div>
      ) : filteredPositions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center dark:border-gray-800">
          <UsersIcon className="mx-auto size-8 text-gray-400" />
          <p className="mt-2 text-sm font-bold text-gray-700 dark:text-gray-300">Aucun poste correspondant</p>
          <p className="text-xs text-gray-500">Ajustez vos filtres ou créez un nouveau poste dans l'association.</p>
        </div>
      ) : (
        <OrganigrammeTree
          positions={filteredPositions}
          onAssign={(pos) => setAssigningPosition(pos)}
          onVacate={handleVacatePosition}
          onDelete={handleDeletePosition}
          onManagePermissions={(pos) => setPermissionsPosition(pos)}
        />
      )}

      {/* Modal Créer un Poste */}
      <CreatePositionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePosition}
        isSubmitting={isSubmitting}
      />

      {/* Modal Nomination / Passation */}
      <AssignPositionModal
        isOpen={Boolean(assigningPosition)}
        position={assigningPosition}
        members={members}
        onClose={() => setAssigningPosition(null)}
        onSubmit={handleAssignPosition}
        isSubmitting={isSubmitting}
      />

      {/* Modal Configuration des Espaces & Permissions */}
      <PermissionsSpacesModal
        isOpen={Boolean(permissionsPosition)}
        position={permissionsPosition}
        onClose={() => setPermissionsPosition(null)}
        onSubmit={handleUpdatePermissions}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
