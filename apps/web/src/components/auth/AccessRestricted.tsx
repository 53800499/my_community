"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, UserCheck, Lock } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";

interface AccessRestrictedProps {
  title?: string;
  description?: string;
  requiredRole?: string;
  backHref?: string;
  backLabel?: string;
}

/**
 * Composant de protection d'accès pour les zones confidentielles (SOLID: SRP & OCP).
 * Avertit avec élégance les membres simples ou non-autorisés et leur propose une redirection sécurisée.
 */
export const AccessRestricted: React.FC<AccessRestrictedProps> = ({
  title = "Accès Réservé au Bureau Exécutif",
  description = "Cet espace contient des actes juridiques, décrets de gouvernance et registres confidentiels réservés aux membres habilités du bureau ou aux administrateurs. Votre compte actuel (membre adhérent / citoyen) ne dispose pas des privilèges nécessaires pour consulter ces secrets associatifs.",
  requiredRole = "Président(e), Dirigeant ou Administrateur",
  backHref = "/dashboard/associations",
  backLabel = "Retour à l'annuaire des associations",
}) => {
  return (
    <div className="mx-auto max-w-2xl py-12 px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 p-8 text-center shadow-lg dark:border-amber-900/40 dark:from-amber-950/20 dark:via-gray-900 dark:to-amber-950/10 sm:p-12">
        {/* Halo décoratif subtil */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-600/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 size-60 rounded-full bg-brand-500/10 blur-3xl dark:bg-brand-600/10" />

        {/* Icone de sécurité */}
        <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-sm dark:bg-amber-900/50 dark:text-amber-300">
          <ShieldAlert className="size-10" />
        </div>

        {/* Badge d'habilitation */}
        <div className="mt-6 flex justify-center">
          <Badge variant="light" color="warning" size="sm">
            <span className="flex items-center gap-1.5 font-semibold">
              <Lock className="size-3.5" />
              Zone Confidentielle Protégée
            </span>
          </Badge>
        </div>

        {/* Titre & Explication */}
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {description}
        </p>

        {/* Notice d'habilitation requise */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-amber-200/80 bg-white/80 px-4 py-2 text-xs font-medium text-amber-900 dark:border-amber-800/60 dark:bg-gray-800/80 dark:text-amber-200">
          <UserCheck className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Habilitation requise : <strong>{requiredRole}</strong></span>
        </div>

        {/* Actions de redirection */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={backHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700 sm:w-auto"
          >
            <ArrowLeft className="size-4" />
            <span>{backLabel}</span>
          </Link>

          <Link
            href="/dashboard/profile"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 shadow-2xs transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 sm:w-auto"
          >
            <span>Consulter mon profil &amp; mes droits</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
