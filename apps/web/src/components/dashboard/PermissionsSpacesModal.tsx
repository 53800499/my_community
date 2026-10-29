'use client';

import React, { useState, useEffect } from 'react';
import Badge from '@/components/ui/badge/Badge';
import {
  AssociationPosition,
  ASSOCIATION_ACCESS_SPACES,
} from '@/features/associations';
import {
  ShieldCheck,
  Check,
  Home,
  Coins,
  Megaphone,
  Contact,
  Settings2,
  Crown,
  FileText,
  RotateCcw,
  Zap,
  Lock,
  X,
} from 'lucide-react';

interface PermissionsSpacesModalProps {
  isOpen: boolean;
  position: AssociationPosition | null;
  onClose: () => void;
  onSubmit: (
    positionId: string,
    accessSpaces: string[],
    permissions: string[],
  ) => Promise<void>;
  isSubmitting?: boolean;
}

export function PermissionsSpacesModal({
  isOpen,
  position,
  onClose,
  onSubmit,
  isSubmitting = false,
}: PermissionsSpacesModalProps) {
  const [prevPosition, setPrevPosition] = useState(position);
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>(position?.accessSpaces || []);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(position?.permissions || []);

  if (position !== prevPosition) {
    setPrevPosition(position);
    setSelectedSpaces(position?.accessSpaces || []);
    setSelectedPermissions(position?.permissions || []);
  }

  if (!isOpen || !position) return null;

  const renderSpaceIcon = (spaceId: string) => {
    switch (spaceId) {
      case 'RESIDENCES':
        return <Home className="size-4.5 text-blue-600 dark:text-blue-400" />;
      case 'FINANCE':
        return <Coins className="size-4.5 text-amber-600 dark:text-amber-400" />;
      case 'COMMUNICATION':
        return <Megaphone className="size-4.5 text-brand-600 dark:text-brand-400" />;
      case 'MEMBERSHIP':
        return <Contact className="size-4.5 text-emerald-600 dark:text-emerald-400" />;
      case 'GOVERNANCE':
        return <Settings2 className="size-4.5 text-purple-600 dark:text-purple-400" />;
      default:
        return <Lock className="size-4.5 text-gray-500" />;
    }
  };

  // Toggle Space
  const handleToggleSpace = (spaceId: string) => {
    const isCurrentlyActive = selectedSpaces.includes(spaceId);
    const spaceDef = ASSOCIATION_ACCESS_SPACES.find((s) => s.id === spaceId);
    const spacePermIds = spaceDef ? spaceDef.permissions.map((p) => p.id) : [];

    if (isCurrentlyActive) {
      // Retirer l'espace et toutes ses permissions
      setSelectedSpaces((prev) => prev.filter((id) => id !== spaceId));
      setSelectedPermissions((prev) => prev.filter((p) => !spacePermIds.includes(p)));
    } else {
      // Activer l'espace et par défaut toutes ses permissions
      setSelectedSpaces((prev) => [...prev, spaceId]);
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...spacePermIds])));
    }
  };

  // Toggle Single Permission
  const handleTogglePermission = (permId: string, spaceId: string) => {
    const isCurrentlyActive = selectedPermissions.includes(permId);

    if (isCurrentlyActive) {
      const nextPerms = selectedPermissions.filter((p) => p !== permId);
      setSelectedPermissions(nextPerms);

      // Si plus aucune permission pour cet espace, retirer l'espace
      const spaceDef = ASSOCIATION_ACCESS_SPACES.find((s) => s.id === spaceId);
      const remainingForSpace = spaceDef
        ? spaceDef.permissions.filter((p) => nextPerms.includes(p.id))
        : [];
      if (remainingForSpace.length === 0) {
        setSelectedSpaces((prev) => prev.filter((s) => s !== spaceId));
      }
    } else {
      // Activer la permission et s'assurer que l'espace parent est actif
      setSelectedPermissions((prev) => [...prev, permId]);
      if (!selectedSpaces.includes(spaceId)) {
        setSelectedSpaces((prev) => [...prev, spaceId]);
      }
    }
  };

  // Presets rapides en 1 clic
  const applyPreset = (preset: 'ALL' | 'RESIDENCES' | 'FINANCE' | 'SECRETARY' | 'MINIMAL') => {
    if (preset === 'ALL') {
      const allSpaces = ASSOCIATION_ACCESS_SPACES.map((s) => s.id);
      const allPerms = ASSOCIATION_ACCESS_SPACES.flatMap((s) => s.permissions.map((p) => p.id));
      setSelectedSpaces(allSpaces);
      setSelectedPermissions(allPerms);
    } else if (preset === 'RESIDENCES') {
      setSelectedSpaces(['RESIDENCES', 'COMMUNICATION', 'MEMBERSHIP']);
      setSelectedPermissions([
        'residences:read',
        'residences:manage_rooms',
        'residences:issue_certificate',
        'communication:read',
        'membership:read',
      ]);
    } else if (preset === 'FINANCE') {
      setSelectedSpaces(['FINANCE', 'MEMBERSHIP']);
      setSelectedPermissions([
        'finance:read',
        'finance:collect_dues',
        'finance:manage_expenses',
        'membership:read',
      ]);
    } else if (preset === 'SECRETARY') {
      setSelectedSpaces(['MEMBERSHIP', 'COMMUNICATION', 'RESIDENCES']);
      setSelectedPermissions([
        'membership:read',
        'membership:register',
        'membership:issue_card',
        'communication:read',
        'communication:publish_posts',
        'communication:pin_posts',
        'residences:read',
      ]);
    } else if (preset === 'MINIMAL') {
      setSelectedSpaces(['COMMUNICATION']);
      setSelectedPermissions(['communication:read']);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(position.id, selectedSpaces, selectedPermissions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs">
      <div className="flex max-h-[94vh] sm:max-h-[92vh] w-full max-w-3xl flex-col rounded-3xl bg-white shadow-2xl dark:bg-gray-850 overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4 sm:p-6 dark:border-gray-700/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <ShieldCheck className="size-5 sm:size-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white sm:text-lg truncate">
                  Permissions &amp; Espaces d&apos;Accès
                </h2>
                <Badge variant="light" color="primary" size="sm">
                  RBAC
                </Badge>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                Poste : <strong className="text-gray-800 dark:text-gray-200">{position.title}</strong>{' '}
                • {position.department}
                {position.assignedUserName && (
                  <>
                    {' '}•{' '}
                    <span className="font-semibold text-brand-600 dark:text-brand-400">
                      {position.assignedUserName}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200 shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Corps avec Défilement */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Bannière d'aide & Presets Rapides */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/60">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Zap className="size-4 text-amber-500" />
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Préréglages Rapides (Presets de Rôles)
                  </p>
                </div>
                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                  Appliquez en 1 clic un profil standardisé selon les responsabilités civiques.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset('ALL')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  <Crown className="size-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Direction Générale</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('RESIDENCES')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-800 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
                >
                  <Home className="size-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Logements</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('FINANCE')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900"
                >
                  <Coins className="size-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Trésorerie</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('SECRETARY')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
                >
                  <FileText className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Secrétariat</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('MINIMAL')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <RotateCcw className="size-3.5 text-gray-500" />
                  <span>Minimal</span>
                </button>
              </div>
            </div>
          </div>

          {/* Liste des Espaces d'Accès avec permissions fines */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Espaces Fonctionnels &amp; Droits Granulaires
            </h3>

            {ASSOCIATION_ACCESS_SPACES.map((space) => {
              const isSpaceActive = selectedSpaces.includes(space.id);
              const activePermsCount = space.permissions.filter((p) =>
                selectedPermissions.includes(p.id),
              ).length;

              return (
                <div
                  key={space.id}
                  className={`rounded-2xl border transition-all ${
                    isSpaceActive
                      ? 'border-brand-200 bg-brand-50/20 shadow-xs dark:border-brand-800/60 dark:bg-brand-950/20'
                      : 'border-gray-200/70 bg-white dark:border-gray-700/60 dark:bg-gray-800/40'
                  }`}
                >
                  {/* Space Header */}
                  <div className="flex items-start justify-between p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                        {renderSpaceIcon(space.id)}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                            {space.name}
                          </h4>
                          <Badge variant="light" color={space.badgeColor} size="sm">
                            {isSpaceActive
                              ? `${activePermsCount}/${space.permissions.length} perms actives`
                              : 'Désactivé'}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {space.description}
                        </p>
                      </div>
                    </div>

                    {/* Master Switch / Checkbox pour l'espace */}
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={isSpaceActive}
                        onChange={() => handleToggleSpace(space.id)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-hidden dark:bg-gray-700 dark:peer-checked:bg-brand-500"></div>
                    </label>
                  </div>

                  {/* Permissions Détaillées (Visible si l'espace est actif) */}
                  {isSpaceActive && (
                    <div className="border-t border-brand-100/60 bg-white/70 p-4 dark:border-brand-900/40 dark:bg-gray-850/70">
                      <p className="mb-2 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                        Permissions détaillées pour l’espace {space.name} :
                      </p>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {space.permissions.map((perm) => {
                          const isPermActive = selectedPermissions.includes(perm.id);

                          return (
                            <label
                              key={perm.id}
                              onClick={() => handleTogglePermission(perm.id, space.id)}
                              className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-2.5 transition ${
                                isPermActive
                                  ? 'border-brand-300 bg-brand-50/50 dark:border-brand-700 dark:bg-brand-950/40'
                                  : 'border-gray-200 bg-gray-50/60 hover:bg-gray-100/80 dark:border-gray-700 dark:bg-gray-800/40'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isPermActive}
                                onChange={() => {}} // géré par le conteneur label
                                className="mt-0.5 size-4 rounded-sm border-gray-300 text-brand-600 focus:ring-brand-500"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-900 dark:text-white">
                                  {perm.name}
                                </p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                  {perm.description}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer avec Synthèse et Boutons d'Action */}
        <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/70 p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700/80 dark:bg-gray-900/60">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
            <Lock className="size-4 text-brand-600 dark:text-brand-400 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              Bilan : <strong>{selectedSpaces.length}</strong> espaces •{' '}
              <strong>{selectedPermissions.length}</strong> permissions
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial rounded-xl px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 text-center min-h-[40px]"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-700 disabled:opacity-50 min-h-[40px]"
            >
              <Check className="size-4" />
              <span>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
