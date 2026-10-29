"use client";

import React from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import {
  GlobeIcon,
  BuildingIcon,
  ShieldAlertIcon,
  PlusIcon,
  CheckIcon,
} from "@/components/icons";
import { useCommunities } from "@/features/communities";

interface CitizenRightWidgetsProps {
  onOpenCommunityDetail: (communityId: string) => void;
  joinedIds: string[];
  pendingIds?: string[];
  joiningId?: string | null;
  onToggleJoin: (communityId: string) => void;
}

export const CitizenRightWidgets: React.FC<CitizenRightWidgetsProps> = ({
  onOpenCommunityDetail,
  joinedIds,
  pendingIds = [],
  joiningId = null,
  onToggleJoin,
}) => {
  const { communities } = useCommunities();

  return (
    <div className="sticky top-20 space-y-4">
      {/* Widget 1: Local Alert / Municipal Info */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
        <div className="flex items-center gap-2">
          <ShieldAlertIcon className="size-4 text-amber-600 dark:text-amber-400" />
          <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
            Avis Municipal • Abomey-Calavi
          </h4>
        </div>
        <p className="mt-1.5 text-xs text-amber-800 dark:text-amber-300">
          Permanence d&apos;état civil et de légalisation d&apos;actes ouverte ce samedi jusqu&apos;à 13h00 à l&apos;arrondissement central.
        </p>
      </div>

      {/* Widget 2: Suggested Communities */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Communautés à Découvrir
          </span>
          <Link href="/communities" className="text-[11px] font-bold text-brand-600 hover:underline">
            Toutes &rarr;
          </Link>
        </div>

        <ul className="mt-3 divide-y divide-gray-100 text-xs dark:divide-gray-800">
          {communities.slice(0, 4).map((c) => {
            const isJoined = joinedIds.includes(c.id);
            const isPending = pendingIds.includes(c.id);
            const isJoining = joiningId === c.id;

            return (
              <li key={c.id} className="py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => onOpenCommunityDetail(c.id)}
                      className="text-left font-bold text-gray-900 transition hover:text-brand-600 dark:text-white dark:hover:text-brand-400 line-clamp-1"
                    >
                      {c.name}
                    </button>
                    <p className="text-[11px] text-gray-500">
                      {c.type === "TERRITORIAL" ? "Territoriale" : "Thématique"} • {c.membersCount || 1} membre(s)
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isJoined || isPending || isJoining}
                    onClick={() => onToggleJoin(c.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[11px] font-bold transition shrink-0 ${
                      isJoined
                        ? "border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 cursor-default"
                        : isPending
                        ? "border border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400 cursor-default"
                        : isJoining
                        ? "border border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 opacity-75 cursor-wait"
                        : "bg-brand-600 text-white hover:bg-brand-700 shadow-2xs active:scale-95"
                    }`}
                  >
                    {isJoined ? (
                      <>
                        <CheckIcon className="size-3" />
                        <span>Adhérent</span>
                      </>
                    ) : isPending ? (
                      <>
                        <span className="flex size-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>En attente</span>
                      </>
                    ) : isJoining ? (
                      <>
                        <span className="size-3 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                        <span>Envoi...</span>
                      </>
                    ) : (
                      <>
                        <PlusIcon className="size-3" />
                        <span>Rejoindre</span>
                      </>
                    )}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Widget 3: Upcoming Citizen Events */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
          <div className="flex items-center gap-1.5">
            <GlobeIcon className="size-3.5 text-brand-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Agenda Citoyen
            </span>
          </div>
          <Link href="/events" className="text-[11px] font-bold text-brand-600 hover:underline">
            Voir tout
          </Link>
        </div>

        <div className="mt-3 space-y-3 text-xs">
          <p className="text-gray-500 text-xs text-center py-2">
            Aucun événement programmé prochainement.
          </p>
        </div>
      </div>

      {/* Widget 4: Switch to Console */}
      <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-indigo-50/60 p-4 dark:border-brand-900 dark:from-brand-950/40 dark:to-indigo-950/20">
        <div className="flex items-center gap-2">
          <BuildingIcon className="size-4 text-brand-600 dark:text-brand-400" />
          <h4 className="text-xs font-bold text-gray-900 dark:text-white">
            Console de Gestion
          </h4>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-gray-600 dark:text-gray-300">
          Vous administrez un bâtiment, des chambres ou le bureau d&apos;une association ?
        </p>
        <Link
          href="/dashboard"
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-brand-700"
        >
          <span>Ouvrir la Console Gestion</span>
          <span>&rarr;</span>
        </Link>
      </div>
    </div>
  );
};

export default CitizenRightWidgets;
