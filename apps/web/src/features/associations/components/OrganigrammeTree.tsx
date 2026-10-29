'use client';

import React from 'react';
import Badge from '@/components/ui/badge/Badge';
import { AssociationPosition } from '../domain/association.types';
import {
  Home,
  Coins,
  Megaphone,
  Contact,
  Settings2,
  ShieldCheck,
  Sparkles,
  Lock,
  Trash2,
} from 'lucide-react';

interface OrganigrammeTreeProps {
  positions: AssociationPosition[];
  onAssign: (position: AssociationPosition) => void;
  onVacate: (position: AssociationPosition) => void;
  onDelete: (position: AssociationPosition) => void;
  onManagePermissions?: (position: AssociationPosition) => void;
}

export function OrganigrammeTree({
  positions,
  onAssign,
  onVacate,
  onDelete,
  onManagePermissions,
}: OrganigrammeTreeProps) {
  // Regrouper par pôle / département
  const grouped = positions.reduce<Record<string, AssociationPosition[]>>((acc, pos) => {
    const dept = pos.department || 'Bureau Exécutif';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(pos);
    return acc;
  }, {});

  const departmentKeys = Object.keys(grouped);

  const getSpaceMeta = (spaceId: string) => {
    switch (spaceId) {
      case 'RESIDENCES':
        return {
          label: 'Résidences',
          icon: <Home className="size-3 text-blue-600 dark:text-blue-400" />,
          color: 'primary' as const,
        };
      case 'FINANCE':
        return {
          label: 'Trésorerie',
          icon: <Coins className="size-3 text-amber-600 dark:text-amber-400" />,
          color: 'warning' as const,
        };
      case 'COMMUNICATION':
        return {
          label: 'Comm',
          icon: <Megaphone className="size-3 text-brand-600 dark:text-brand-400" />,
          color: 'primary' as const,
        };
      case 'MEMBERSHIP':
        return {
          label: 'Adhésions',
          icon: <Contact className="size-3 text-emerald-600 dark:text-emerald-400" />,
          color: 'success' as const,
        };
      case 'GOVERNANCE':
        return {
          label: 'Gouv',
          icon: <Settings2 className="size-3 text-purple-600 dark:text-purple-400" />,
          color: 'light' as const,
        };
      default:
        return {
          label: spaceId,
          icon: <Lock className="size-3 text-gray-500" />,
          color: 'light' as const,
        };
    }
  };

  return (
    <div className="space-y-8">
      {departmentKeys.map((deptName) => {
        const deptPositions = grouped[deptName];
        return (
          <div key={deptName} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-2 dark:border-gray-700">
              <span className="flex size-7 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <Sparkles className="size-3.5 text-brand-600 dark:text-brand-400" />
              </span>
              <h3 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white uppercase">
                {deptName}
              </h3>
              <Badge variant="light" color="light" size="sm">
                {deptPositions.length} {deptPositions.length > 1 ? 'postes' : 'poste'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {deptPositions.map((pos) => {
                const isOccupied = pos.status === 'OCCUPIED' && pos.assignedUserName;
                const accessSpaces = pos.accessSpaces || [];

                return (
                  <div
                    key={pos.id}
                    className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-xs hover:shadow-md ${
                      isOccupied
                        ? 'border-gray-200/80 bg-white dark:border-gray-700/80 dark:bg-gray-850'
                        : 'border-dashed border-amber-300 bg-amber-50/30 dark:border-amber-800/60 dark:bg-amber-950/20'
                    }`}
                  >
                    <div>
                      {/* Top Bar Card */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                            {pos.department}
                          </span>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                            {pos.title}
                          </h4>
                        </div>
                        {isOccupied ? (
                          <Badge variant="light" color="success" size="sm">
                            Pourvu
                          </Badge>
                        ) : (
                          <Badge variant="light" color="warning" size="sm">
                            Vacant
                          </Badge>
                        )}
                      </div>

                      {/* Missions */}
                      {pos.description && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {pos.description}
                        </p>
                      )}

                      {/* Responsable Titulaire */}
                      <div className="mt-4 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/80">
                        {isOccupied ? (
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 font-bold text-white shadow-xs">
                              {pos.assignedUserName?.slice(0, 2).toUpperCase() || 'MC'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                {pos.assignedUserName}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                Prise de fonction :{' '}
                                {pos.termStartDate
                                  ? new Date(pos.termStartDate).toLocaleDateString('fr-FR', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  : 'En exercice'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                            <span>Poste ouvert — En attente de nomination</span>
                          </div>
                        )}
                      </div>

                      {/* Espaces d'Accès Attribués */}
                      <div className="mt-3.5 space-y-1.5 border-t border-gray-100/70 pt-2.5 dark:border-gray-700/50">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                          <span>Espaces autorisés ({accessSpaces.length}) :</span>
                          <span className="text-[10px] text-brand-600 dark:text-brand-400">
                            {pos.permissions?.length || 0} permissions
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {accessSpaces.length > 0 ? (
                            accessSpaces.map((sId) => {
                              const meta = getSpaceMeta(sId);
                              return (
                                <span
                                  key={sId}
                                  className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-700 dark:bg-gray-750 dark:text-gray-300"
                                >
                                  <span>{meta.icon}</span>
                                  <span>{meta.label}</span>
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-[10px] italic text-gray-400">
                              Aucun espace restreint configuré
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions de gouvernance */}
                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700/60">
                      <div className="flex items-center gap-2">
                        {isOccupied ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onAssign(pos)}
                              className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                            >
                              Passation
                            </button>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <button
                              type="button"
                              onClick={() => onVacate(pos)}
                              className="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
                            >
                              Libérer
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onAssign(pos)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                          >
                            <span>Nommer un Responsable</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {onManagePermissions && (
                          <button
                            type="button"
                            onClick={() => onManagePermissions(pos)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-brand-700 dark:hover:bg-brand-950 dark:hover:text-brand-300"
                            title="Configurer les espaces d'accès et permissions"
                          >
                            <ShieldCheck className="size-3.5" />
                            <span>Droits</span>
                          </button>
                        )}

                        {!pos.isStatutory && (
                          <button
                            type="button"
                            onClick={() => onDelete(pos)}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                            title="Supprimer ce poste personnalisé"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
