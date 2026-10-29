'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/badge/Badge';
import {
  ShieldCheck,
  Search,
  Check,
  Home,
  Coins,
  Megaphone,
  Contact,
  Settings2,
  Lock,
  ArrowLeft,
  LayoutGrid,
  Table,
  Info,
} from 'lucide-react';
import {
  useAssociations,
  useAssociationBureau,
  AssociationPosition,
  ASSOCIATION_ACCESS_SPACES,
} from '@/features/associations';
import { PermissionsSpacesModal } from '@/components/dashboard/PermissionsSpacesModal';
import { Select2 } from '@/components/ui/Select2';
import { usePermissions } from '@/features/auth';
import { AccessRestricted } from '@/components/auth/AccessRestricted';

export default function AssociationPermissionsPage() {
  const { isExecutive } = usePermissions();
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
    updatePermissions,
  } = useAssociationBureau(selectedAssociation);

  const [searchFilter, setSearchFilter] = useState('');
  const [spaceFilter, setSpaceFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'AUTO' | 'GRID' | 'TABLE'>('AUTO');
  const [editingPosition, setEditingPosition] = useState<AssociationPosition | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const renderSpaceIcon = (spaceId: string, size = 'size-4') => {
    switch (spaceId) {
      case 'RESIDENCES':
        return <Home className={`${size} text-blue-600 dark:text-blue-400`} />;
      case 'FINANCE':
        return <Coins className={`${size} text-amber-600 dark:text-amber-400`} />;
      case 'COMMUNICATION':
        return <Megaphone className={`${size} text-brand-600 dark:text-brand-400`} />;
      case 'MEMBERSHIP':
        return <Contact className={`${size} text-emerald-600 dark:text-emerald-400`} />;
      case 'GOVERNANCE':
        return <Settings2 className={`${size} text-purple-600 dark:text-purple-400`} />;
      default:
        return <Lock className={`${size} text-gray-500`} />;
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
      setEditingPosition(null);
    } catch {
      showToast('Erreur lors de la mise à jour des permissions.');
    }
  };

  // Filtrage des postes
  const filteredPositions = positions.filter((pos) => {
    if (spaceFilter !== 'ALL') {
      const hasSpace = pos.accessSpaces?.includes(spaceFilter);
      if (!hasSpace) return false;
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchTitle = pos.title.toLowerCase().includes(q);
      const matchDept = pos.department.toLowerCase().includes(q);
      const matchUser = pos.assignedUserName?.toLowerCase().includes(q);
      return matchTitle || matchDept || matchUser;
    }
    return true;
  });

  // Métriques de gouvernance RBAC
  const countResidenceManagers = positions.filter((p) =>
    p.accessSpaces?.includes('RESIDENCES'),
  ).length;

  const countFinanceManagers = positions.filter((p) =>
    p.accessSpaces?.includes('FINANCE'),
  ).length;

  const countPublishers = positions.filter((p) =>
    p.permissions?.includes('communication:publish_posts'),
  ).length;

  const countCertSigners = positions.filter((p) =>
    p.permissions?.includes('residences:issue_certificate'),
  ).length;

  if (!isExecutive) {
    return (
      <AccessRestricted
        title="Gestion des Habilitations & Sécurité Associative"
        description="La gestion des droits d'accès aux espaces, des habilitations de signature financière et de modération est une prérogative stricte du bureau exécutif et des administrateurs système."
        requiredRole="Président(e), Administrateur ou Délégué Sécurité"
        backHref="/dashboard/associations"
        backLabel="Retour à l'annuaire associatif"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-xs font-semibold text-white shadow-xl dark:bg-white dark:text-gray-900 animate-in fade-in slide-in-from-top-3">
          <Check className="size-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
              Attribution des Permissions &amp; Espaces d&apos;Accès
            </h1>
            <Badge variant="light" color="primary" size="sm">
              Sécurité RBAC
            </Badge>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Matrice des habilitations par poste de gouvernance : résidences &amp; attestations, trésorerie FCFA, communication et adhésions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/associations/bureau"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="size-4" />
            <span>Retour à l&apos;Organigramme</span>
          </Link>
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
              <span>Territoire : <strong>{selectedAssociation.territory || 'Bénin'}</strong></span>
              <span>•</span>
              <span>Postes configurés : <strong>{positions.length}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Note Fondamentale sur le Découplage Titres vs Permissions */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs text-indigo-950 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-200">
        <div className="flex items-start gap-2.5">
          <Info className="size-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              Règle Fondamentale : Découplage Strict des Fonctions Officielles et des Permissions Techniques
            </p>
            <p className="text-[11px] text-indigo-900/80 dark:text-indigo-300/80">
              Une fonction statutaire ne donne pas aveuglément tous les droits techniques. Par exemple, le Trésorier enregistre les opérations financières sans pouvoir modifier les paramètres techniques ou supprimer l&apos;association. De même, un Administrateur Technique configure les accès autorisés sans pouvoir modifier arbitrairement les comptes financiers. Chaque poste reçoit un ensemble précis et configurable de droits.
            </p>
          </div>
        </div>
      </div>

      {/* KPIs Sécurité & Périmètre des Droits */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50">
              <Home className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
            <Badge variant="light" color="primary" size="sm">
              Logement
            </Badge>
          </div>
          <p className="mt-3 text-[11px] font-medium text-gray-500 dark:text-gray-400">
            Gestionnaires Résidences
          </p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">
            {countResidenceManagers}
          </p>
          <p className="mt-0.5 text-[10px] text-gray-400">
            {countCertSigners} signataire(s) d&apos;attestations
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/50">
              <Coins className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <Badge variant="light" color="warning" size="sm">
              Finances
            </Badge>
          </div>
          <p className="mt-3 text-[11px] font-medium text-amber-600 dark:text-amber-400">
            Ordonnateurs Trésorerie
          </p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {countFinanceManagers}
          </p>
          <p className="mt-0.5 text-[10px] text-gray-400">
            Encaissements &amp; livre de caisse
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/50">
              <Megaphone className="size-5 text-brand-600 dark:text-brand-400" />
            </div>
            <Badge variant="light" color="primary" size="sm">
              Presse
            </Badge>
          </div>
          <p className="mt-3 text-[11px] font-medium text-brand-600 dark:text-brand-400">
            Diffuseurs Communiqués
          </p>
          <p className="text-2xl font-black text-brand-600 dark:text-brand-400">
            {countPublishers}
          </p>
          <p className="mt-0.5 text-[10px] text-gray-400">
            Notes officielles &amp; avis résidents
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50">
              <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <Badge variant="light" color="success" size="sm">
              Contrôle
            </Badge>
          </div>
          <p className="mt-3 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            Total Postes Évalués
          </p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {positions.length}
          </p>
          <p className="mt-0.5 text-[10px] text-gray-400">
            Couverture des permissions à 100%
          </p>
        </div>
      </div>

      {/* Barre de Filtres & Recherche Adaptative */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 sm:p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Rechercher par poste, titulaire ou pôle..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/70 py-2.5 pr-4 pl-10 text-xs font-medium text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white min-h-[42px]"
            />
          </div>

          {/* View Mode Toggle: Auto / Cartes / Matrice */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 sm:hidden">
              Mode d'affichage :
            </span>
            <div className="inline-flex items-center rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-800/80">
              <button
                type="button"
                onClick={() => setViewMode('AUTO')}
                title="Affichage adaptatif selon la taille de l'écran"
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  viewMode === 'AUTO'
                    ? 'bg-white text-brand-700 shadow-2xs dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                }`}
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => setViewMode('GRID')}
                title="Forcer la vue Cartes Habilitations"
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  viewMode === 'GRID'
                    ? 'bg-white text-brand-700 shadow-2xs dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                }`}
              >
                <LayoutGrid className="size-3" />
                <span>Cartes</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('TABLE')}
                title="Forcer la vue Matrice Tableau"
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  viewMode === 'TABLE'
                    ? 'bg-white text-brand-700 shadow-2xs dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                }`}
              >
                <Table className="size-3" />
                <span>Matrice</span>
              </button>
            </div>
          </div>
        </div>

        {/* Space Filter Horizontal Pill Track */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth -mx-3.5 px-3.5 sm:mx-0 sm:px-0 py-1 flex-nowrap sm:flex-wrap border-t border-gray-100 pt-3 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setSpaceFilter('ALL')}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              spaceFilter === 'ALL'
                ? 'bg-brand-600 text-white shadow-2xs'
                : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Tous les Espaces
          </button>
          {ASSOCIATION_ACCESS_SPACES.map((space) => (
            <button
              key={space.id}
              type="button"
              onClick={() => setSpaceFilter(space.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                spaceFilter === space.id
                  ? 'bg-brand-600 text-white shadow-2xs'
                  : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {renderSpaceIcon(space.id, 'size-3.5')}
              <span>{space.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chargement ou Vide */}
      {isLoadingPositions ? (
        <div className="flex h-56 items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <span className="size-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            <p className="text-xs font-semibold">Chargement des habilitations...</p>
          </div>
        </div>
      ) : filteredPositions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <ShieldCheck className="size-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-3 text-sm font-bold text-gray-800 dark:text-gray-200">
            Aucun poste trouvé
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Aucun poste ne correspond aux filtres de recherche ou d'espace sélectionnés.
          </p>
        </div>
      ) : (
        <>
          {/* 1. VUE ADAPTATIVE : CARTES POSTES (Optimisée Mobile & Tablette) */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
              viewMode === 'TABLE' ? 'hidden' : viewMode === 'GRID' ? 'block' : 'block lg:hidden'
            }`}
          >
            {filteredPositions.map((pos) => {
              const isOccupied = pos.status === 'OCCUPIED' && pos.assignedUserName;

              return (
                <div
                  key={pos.id}
                  className="rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between gap-4 transition hover:border-brand-200 dark:hover:border-gray-700"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                        {pos.assignedUserName
                          ? pos.assignedUserName.slice(0, 2).toUpperCase()
                          : '—'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                            {pos.title}
                          </h3>
                          {pos.isStatutory && (
                            <span className="rounded-md bg-purple-50 px-1.5 py-0.5 text-[9px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                              Statutaire
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {pos.department} •{' '}
                          {isOccupied ? (
                            <strong className="text-gray-700 dark:text-gray-200">
                              {pos.assignedUserName}
                            </strong>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                              Poste Vacant
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
                        isOccupied
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {isOccupied ? 'Pourvu' : 'Vacant'}
                    </span>
                  </div>

                  {/* Espaces Habilités */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Habilitations par Espace
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ASSOCIATION_ACCESS_SPACES.map((space) => {
                        const hasSpace = pos.accessSpaces?.includes(space.id);
                        const spacePerms = space.permissions.filter((p) =>
                          pos.permissions?.includes(p.id),
                        );
                        const permsCount = spacePerms.length;
                        const totalPerms = space.permissions.length;

                        return (
                          <div
                            key={space.id}
                            className={`flex items-center justify-between gap-2 rounded-xl p-2.5 text-xs transition border ${
                              hasSpace
                                ? 'border-emerald-200/80 bg-emerald-50/50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200'
                                : 'border-gray-100 bg-gray-50/60 text-gray-400 dark:border-gray-800/60 dark:bg-gray-800/40 dark:text-gray-500'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {renderSpaceIcon(space.id, 'size-3.5')}
                              <span className="font-semibold truncate text-[11px]">
                                {space.name.split('&')[0].trim()}
                              </span>
                            </div>

                            {hasSpace ? (
                              <span className="inline-flex items-center gap-1 font-bold text-[10px] text-emerald-700 dark:text-emerald-300 shrink-0">
                                <Check className="size-3" />
                                <span>{permsCount}/{totalPerms}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-gray-400 dark:text-gray-600 shrink-0">
                                Inactif
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bouton de Configuration */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => setEditingPosition(pos)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-gray-700 shadow-xs transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-brand-700 dark:hover:bg-brand-950 dark:hover:text-brand-300 min-h-[42px]"
                    >
                      <ShieldCheck className="size-4 text-brand-600 dark:text-brand-400" />
                      <span>Configurer les Permissions</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. VUE MATRICE TABLEAU (Optimisée Grand Écran Desktop) */}
          <div
            className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900 ${
              viewMode === 'GRID' ? 'hidden' : viewMode === 'TABLE' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-100 bg-gray-50/80 font-bold text-gray-700 uppercase dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-300">
                  <tr>
                    <th className="px-5 py-4 min-w-[240px]">Poste de Gouvernance &amp; Titulaire</th>
                    {ASSOCIATION_ACCESS_SPACES.map((s) => (
                      <th key={s.id} className="px-3 py-4 text-center min-w-[130px]">
                        <div className="flex flex-col items-center gap-1">
                          {renderSpaceIcon(s.id, 'size-4')}
                          <span className="text-[10px] tracking-tight">{s.name.split('&')[0].trim()}</span>
                        </div>
                      </th>
                    ))}
                    <th className="px-5 py-4 text-right min-w-[120px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                  {filteredPositions.map((pos) => {
                    const isOccupied = pos.status === 'OCCUPIED' && pos.assignedUserName;

                    return (
                      <tr
                        key={pos.id}
                        className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
                      >
                        {/* Colonne Poste & Titulaire */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                              {pos.assignedUserName
                                ? pos.assignedUserName.slice(0, 2).toUpperCase()
                                : '—'}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-gray-900 dark:text-white">
                                  {pos.title}
                                </span>
                                {pos.isStatutory && (
                                  <span className="rounded-md bg-purple-50 px-1 py-0.5 text-[9px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                                    Statutaire
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                {pos.department} •{' '}
                                {isOccupied ? (
                                  <strong className="text-gray-700 dark:text-gray-200">
                                    {pos.assignedUserName}
                                  </strong>
                                ) : (
                                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                                    Poste Vacant
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Colonnes Espaces d'Accès */}
                        {ASSOCIATION_ACCESS_SPACES.map((space) => {
                          const hasSpace = pos.accessSpaces?.includes(space.id);
                          const spacePerms = space.permissions.filter((p) =>
                            pos.permissions?.includes(p.id),
                          );
                          const permsCount = spacePerms.length;
                          const totalPerms = space.permissions.length;

                          return (
                            <td key={space.id} className="px-3 py-4 text-center">
                              {hasSpace ? (
                                <div className="inline-flex flex-col items-center">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                                    <Check className="size-3" />
                                    <span>{permsCount}/{totalPerms} perms</span>
                                  </span>
                                  {permsCount === totalPerms && (
                                    <span className="mt-0.5 text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
                                      Accès Total
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-300 dark:text-gray-600 font-medium">
                                  —
                                </span>
                              )}
                            </td>
                          );
                        })}

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setEditingPosition(pos)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-brand-700 dark:hover:bg-brand-950 dark:hover:text-brand-300"
                          >
                            <ShieldCheck className="size-3.5" />
                            <span>Configurer</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Guide & Sécurité : Les 5 Espaces de Responsabilité Civique */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          Guide des 5 Espaces d&apos;Accès &amp; Conformité Légale (Bénin)
        </h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Chaque espace regroupe les prérogatives associatives et techniques nécessaires à l&apos;exercice des missions :
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ASSOCIATION_ACCESS_SPACES.map((space) => (
            <div
              key={space.id}
              className="rounded-xl border border-gray-100 bg-gray-50/60 p-3.5 dark:border-gray-800 dark:bg-gray-800/40"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-white dark:bg-gray-700 shadow-2xs">
                  {renderSpaceIcon(space.id, 'size-4')}
                </span>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  {space.name}
                </h4>
              </div>
              <p className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                {space.description}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1">
                {space.permissions.map((p) => (
                  <span
                    key={p.id}
                    className="rounded-md bg-white px-1.5 py-0.5 text-[9px] font-medium text-gray-600 shadow-2xs dark:bg-gray-750 dark:text-gray-300"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Configuration des Espaces & Permissions */}
      <PermissionsSpacesModal
        isOpen={Boolean(editingPosition)}
        position={editingPosition}
        onClose={() => setEditingPosition(null)}
        onSubmit={handleUpdatePermissions}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
