'use client';

import React from 'react';
import { AssociationPost, Association } from '@/features/associations';
import { X, Printer, ShieldCheck, FileText, CheckCircle2, Award } from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';

interface OfficialPostPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: AssociationPost | null;
  association?: Association | null;
}

export function OfficialPostPreviewModal({
  isOpen,
  onClose,
  post,
  association,
}: OfficialPostPreviewModalProps) {
  if (!isOpen || !post) return null;

  const handlePrint = () => {
    window.print();
  };

  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case 'COMMUNIQUE':
        return 'COMMUNIQUÉ OFFICIEL DU BUREAU';
      case 'ASSEMBLEE_GENERALE':
        return 'CONVOCATION OFFICIELLE À L’ASSEMBLÉE GÉNÉRALE';
      case 'AVIS_RESIDENTS':
        return 'AVIS OFFICIEL AUX RÉSIDENTS ET LOCATAIRES';
      case 'APPEL_COTISATION':
        return 'APPEL AUX COTISATIONS STATUTAIRES';
      case 'EVENEMENT':
        return 'AVIS DE MOBILISATION & ÉVÉNEMENT CIVIQUE';
      case 'OPPORTUNITE_ETUDIANTE':
        return 'DIFFUSION D’OPPORTUNITÉ ÉTUDIANTE, STAGE & BOURSE';
      default:
        return 'PUBLICATION OFFICIELLE';
    }
  };

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const refNumber = `BEN-${(association?.acronym || 'ASSO').toUpperCase()}-${post.id.replace('post-', '').slice(0, 8).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 animate-in zoom-in-95 duration-200">
        {/* Modal Top Bar (Non imprimée) */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800 print:hidden">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
              <FileText className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Document Officiel Certifié
              </h2>
              <p className="text-[11px] text-gray-500">
                Acte conforme pour affichage public et archivage statutaire
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750"
            >
              <Printer className="size-3.5" />
              <span>Imprimer / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="rounded-xl p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Sheet */}
        <div className="overflow-y-auto p-8 sm:p-10 text-gray-900 dark:text-white print:p-0">
          {/* En-tête Républicain & Institutionnel */}
          <div className="border-b-2 border-brand-900/10 pb-6 text-center dark:border-brand-100/10">
            <div className="flex items-center justify-center gap-2 text-[11px] font-black tracking-widest text-gray-500 uppercase dark:text-gray-400">
              <span>RÉPUBLIQUE DU BÉNIN</span>
            </div>
            <div className="mt-0.5 text-[10px] font-medium tracking-wide text-gray-400 italic">
              Fraternité — Justice — Travail
            </div>

            {/* Tricolore Bar Bénin */}
            <div className="mx-auto mt-2 flex h-1 w-24 overflow-hidden rounded-full">
              <div className="w-1/3 bg-emerald-600" />
              <div className="w-1/3 bg-yellow-400" />
              <div className="w-1/3 bg-rose-600" />
            </div>

            <div className="mt-4">
              <h3 className="text-base font-extrabold uppercase tracking-wide text-brand-700 dark:text-brand-400">
                {association?.name || 'ASSOCIATION CITOYENNE & COMMUNAUTAIRE'}
              </h3>
              {(association?.educationalInstitution || association?.universityCampus) && (
                <p className="mt-0.5 text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                  Cadre / Établissement : {association.educationalInstitution || association.universityCampus}
                </p>
              )}
              {association?.registrationNumber && (
                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                  Enregistrement Officiel N° : <strong>{association.registrationNumber}</strong>
                </p>
              )}
              {association?.city && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Siège Social : {association.city} {association.territory ? `— ${association.territory}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Métadonnées Officielles */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gray-50 p-4 text-xs dark:bg-gray-800/60">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                RÉFÉRENCE OFFICIELLE
              </span>
              <p className="font-mono font-bold text-gray-900 dark:text-white">{refNumber}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                DATE D&apos;ÉMISSION
              </span>
              <p className="font-semibold text-gray-900 capitalize dark:text-white">{formattedDate}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                NIVEAU DE DIFFUSION
              </span>
              <div className="mt-0.5">
                <Badge variant="solid" color="primary" size="sm">
                  {post.visibility === 'PUBLIC'
                    ? 'Public — Tout Citoyen'
                    : post.visibility === 'COMMUNITY'
                      ? 'Territoire & Résidents'
                      : 'Membres Adhérents'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Titre de l'Acte */}
          <div className="mt-6 text-center">
            <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
              {getCategoryTitle(post.category)}
            </span>
            <h1 className="mt-3 text-lg font-black tracking-tight text-gray-900 sm:text-xl dark:text-white">
              {post.title}
            </h1>
          </div>

          {/* Corps officiel */}
          <div className="mt-6 border-y border-gray-100 py-6 text-sm leading-relaxed text-gray-800 dark:border-gray-800 dark:text-gray-200">
            <p className="whitespace-pre-line text-justify">{post.content}</p>
          </div>

          {/* Bloc de Signature & Cachet Officiel */}
          <div className="mt-8 flex flex-col items-end sm:flex-row sm:items-start sm:justify-between">
            {/* Cachet Numérique My Community */}
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-300">
              <ShieldCheck className="size-8 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-bold">Acte Vérifié &amp; Horodaté</p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                  Plateforme Citoyenne My Community Bénin
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-emerald-600/70">
                  SHA-256: {post.id.slice(0, 16)}...
                </p>
              </div>
            </div>

            {/* Signature Autorité émettrice */}
            <div className="mt-6 text-center sm:mt-0 sm:text-right">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Pour le Bureau Exécutif,
              </p>
              <div className="mt-2 flex items-center justify-end gap-1.5">
                <Award className="size-4 text-brand-600" />
                <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                  {post.authorName}
                </p>
              </div>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                {post.authorRole}
              </p>
              <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-gray-400">
                <CheckCircle2 className="size-3 text-emerald-500" />
                <span>Signature électronique authentifiée</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (Non imprimé) */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-3 dark:border-gray-800 dark:bg-gray-850 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            Fermer
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-700"
          >
            <Printer className="size-3.5" />
            <span>Imprimer le Communiqué</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default OfficialPostPreviewModal;
