"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import { useActiveAssociation } from "@/context/AssociationContext";
import { Select2 } from "@/components/ui/Select2";

interface ResidenceScopeHeaderProps {
  title: string;
  subtitle: string;
  actionButton?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const ResidenceScopeHeader: React.FC<ResidenceScopeHeaderProps> = ({
  title,
  subtitle,
  actionButton,
  rightElement,
}) => {
  const {
    activeAssociation,
    activeAssociationId,
    setActiveAssociationId,
    userAssociations,
  } = useActiveAssociation();

  return (
    <div className="space-y-4">
      {/* 1. Active Association Scoping Banner */}
      <div className="rounded-2xl border border-brand-200/80 bg-gradient-to-r from-brand-50 via-indigo-50/50 to-white p-4 shadow-xs dark:border-brand-900/50 dark:from-brand-950/40 dark:via-gray-900/60 dark:to-gray-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm font-bold text-sm">
              {activeAssociation?.acronym ? activeAssociation.acronym.slice(0, 3) : "AS"}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                  Association Gestionnaire Active
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Contexte Actif
                </span>
                {activeAssociation?.registrationNumber && (
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    N° {activeAssociation.registrationNumber}
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white mt-0.5 flex items-center gap-2">
                {activeAssociation ? activeAssociation.name : "Aucune association sélectionnée"}
              </h2>
              {activeAssociation?.territory && (
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Territoire d&apos;implantation : <span className="font-medium">{activeAssociation.territory}</span>
                </p>
              )}
            </div>
          </div>

          {/* Quick Association Switcher */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-auto sm:min-w-[240px]">
              <Select2
                id="residence-assoc-select"
                value={activeAssociationId}
                onChange={(e) => setActiveAssociationId(e.target.value)}
                className="w-full"
              >
                {userAssociations.map((assoc) => (
                  <option key={assoc.id} value={assoc.id}>
                    {assoc.acronym ? `[${assoc.acronym}] ` : ""}{assoc.name}
                  </option>
                ))}
              </Select2>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Page Title & Action Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {subtitle} • Toutes les opérations ci-dessous s&apos;appliquent à{" "}
            <span className="font-semibold text-brand-600 dark:text-brand-400">
              {activeAssociation?.name || "l&apos;association"}
            </span>.
          </p>
        </div>
        {(actionButton || rightElement) && (
          <div className="shrink-0">{actionButton || rightElement}</div>
        )}
      </div>
    </div>
  );
};

interface NoActiveAssociationNoticeProps {
  title?: string;
  subtitle?: string;
}

export const NoActiveAssociationNotice: React.FC<NoActiveAssociationNoticeProps> = ({
  title,
  subtitle,
}) => {
  const { userAssociations, setActiveAssociationId, isLoading } = useActiveAssociation();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <div className="size-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          Chargement de l&apos;association active...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 sm:p-8 dark:border-amber-900/50 dark:bg-amber-950/20">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 text-amber-800 dark:text-amber-400">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
            <AlertTriangle className="size-5" />
          </div>
          <h2 className="text-lg font-bold">
            {title || "Association active requise pour gérer les résidences"}
          </h2>
        </div>
        <p className="mt-3 text-sm text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
          {subtitle ||
            "Le module Résidences & Chambres est directement subordonné à une association gestionnaire. Chaque campus, bâtiment, chambre et bail de séjour appartient obligatoirement au patrimoine d’une association enregistrée."}
        </p>

        {userAssociations.length > 0 ? (
          <div className="mt-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Veuillez activer une association dont vous êtes membre :
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {userAssociations.map((assoc) => (
                <button
                  key={assoc.id}
                  type="button"
                  onClick={() => setActiveAssociationId(assoc.id)}
                  className="flex items-center justify-between rounded-xl border border-amber-200 bg-white p-3 text-left shadow-2xs transition hover:border-brand-500 hover:ring-2 hover:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="truncate pr-2">
                    <p className="font-bold text-xs text-gray-900 dark:text-white truncate">
                      {assoc.name}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      {assoc.acronym ? `Sigle : ${assoc.acronym} • ` : ""}{assoc.territory || "Bénin"}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 shrink-0">
                    Activer <ArrowRight className="size-3.5" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <p className="text-xs text-amber-800 dark:text-amber-300 mb-3">
              Vous n&apos;êtes actuellement rattaché à aucune association gestionnaire. Créez ou rejoignez une association pour activer la gestion résidentielle.
            </p>
            <Link
              href="/dashboard/associations"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700"
            >
              <PlusCircle className="size-4" />
              Créer ou Rejoindre une Association
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
