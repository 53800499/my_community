"use client";

import React, { useMemo } from "react";
import { DownloadIcon, PrinterIcon, CheckCircle2Icon } from "@/components/icons";
import {
  ApiResident,
  ApiResidentContract,
  ApiRoom,
  ResidenceCertificateData,
  ResidenceCertificateMapper,
  useResidenceCertificate,
} from "@/features/residences";

/**
 * Props ségrégées (ISP) :
 * Accepte soit le contrat de données pur `data`,
 * soit les entités de domaine mappées automatiquement.
 */
interface ResidenceCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: ResidenceCertificateData | null;
  resident?: ApiResident | null;
  room?: ApiRoom | null;
  activeContract?: ApiResidentContract | null;
}

export default function ResidenceCertificateModal({
  isOpen,
  onClose,
  data: explicitData,
  resident,
  room,
  activeContract,
}: ResidenceCertificateModalProps) {
  const { isGenerating, downloadPdf, print } = useResidenceCertificate();

  // Mapping pur et mémoïsé (Patterns Pragmatiques)
  const certificateData: ResidenceCertificateData | null = useMemo(() => {
    if (explicitData) return explicitData;
    if (resident) {
      return ResidenceCertificateMapper.fromResident(resident, activeContract);
    }
    if (room) {
      return ResidenceCertificateMapper.fromRoom(room);
    }
    return null;
  }, [explicitData, resident, room, activeContract]);

  if (!isOpen || !certificateData) return null;

  const handleExport = async () => {
    await downloadPdf(certificateData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Conteneur principal */}
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 my-auto overflow-hidden print:shadow-none print:border-none print:rounded-none print:max-w-none print:my-0">
        {/* Barre d'outils (masquée à l'impression) */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-6 py-3.5 dark:border-gray-800 dark:bg-gray-950/80 print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2Icon className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Attestation d&apos;Hébergement &amp; Contrat Résidentiel
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Génération instantanée du certificat officiel au format PDF
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition"
              title="Télécharger directement l'attestation au format PDF"
            >
              <DownloadIcon className="size-3.5" />
              <span>{isGenerating ? "Génération PDF..." : "Exporter en PDF"}</span>
            </button>
            <button
              type="button"
              onClick={print}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              title="Imprimer directement"
            >
              <PrinterIcon className="size-3.5" />
              <span>Imprimer</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Fermer
            </button>
          </div>
        </div>

        {/* FEUILLE OFFICIELLE FORMAT A4 / PRINT READY */}
        <div className="print-certificate bg-white p-8 sm:p-12 text-gray-900 print:p-8 print:m-0">
          {/* En-tête de la République & Association */}
          <div className="border-b-2 border-emerald-800 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-800">
                  RÉPUBLIQUE DU BÉNIN
                </p>
                <p className="text-[9px] font-semibold tracking-wider text-gray-500 uppercase">
                  Fraternité — Justice — Travail
                </p>
                <div className="mt-2">
                  <h2 className="text-base font-black tracking-tight text-gray-900 uppercase">
                    {certificateData.association.name}
                  </h2>
                  <p className="text-[11px] text-gray-600 font-medium">
                    Gestion des Logements &amp; Résidences Universitaires Partenaires
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {certificateData.association.prefectureOrder}
                  </p>
                </div>
              </div>

              {/* Sceau / Logo textuel */}
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-emerald-800/40 p-3 bg-emerald-50/40 text-center">
                <span className="text-xs font-black tracking-wider text-emerald-900">
                  MY COMMUNITY
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-700">
                  BÉNIN
                </span>
                <span className="mt-1 text-[8px] font-mono text-gray-500">
                  {certificateData.certificateRef}
                </span>
              </div>
            </div>
          </div>

          {/* Titre du document */}
          <div className="my-6 text-center">
            <h1 className="text-lg font-black tracking-wide text-gray-900 uppercase underline decoration-emerald-700 decoration-2 underline-offset-4">
              Attestation d&apos;Hébergement &amp; Convention de Séjour
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              Délivrée pour servir et valoir ce que de droit (Inscription académique, démarches administratives et bancaires)
            </p>
          </div>

          {/* Corps de l'attestation */}
          <div className="space-y-4 text-xs leading-relaxed text-gray-700">
            <p>
              Le Bureau Exécutif de l&apos;association <strong>{certificateData.association.name}</strong>, agissant en qualité de gestionnaire des baux d&apos;hébergement communautaires, certifie par la présente que :
            </p>

            {/* Fiche Identité Résident */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-gray-500">Nom &amp; Prénom(s) :</span>
                  <p className="text-sm font-bold text-gray-900 uppercase">
                    {certificateData.resident.fullName}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-gray-500">Numéro de Téléphone :</span>
                  <p className="text-xs font-semibold text-gray-900">{certificateData.resident.phoneNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-gray-500">Adresse Email :</span>
                  <p className="text-xs text-gray-700">{certificateData.resident.email || "Non renseigné"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-gray-500">Statut de Résidence :</span>
                  <p className="text-xs font-bold text-emerald-700">
                    {certificateData.resident.statusText}
                  </p>
                </div>
              </div>
            </div>

            <p>
              Est effectivement et régulièrement hébergé(e) dans les locaux sous convention de bail dont le détail est stipulé ci-après :
            </p>

            {/* Fiche Logement */}
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-emerald-800">Campus / Quartier :</span>
                  <p className="text-xs font-bold text-gray-900">{certificateData.housing.quarterName}</p>
                  <p className="text-[10px] text-gray-500">{certificateData.housing.quarterCity}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-emerald-800">Pavillon / Bâtiment :</span>
                  <p className="text-xs font-bold text-gray-900">{certificateData.housing.buildingName}</p>
                  <p className="text-[10px] text-gray-500">Bailleur : {certificateData.housing.landlordName || "Propriétaire conventionné"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-emerald-800">Chambre Assignée :</span>
                  <p className="text-sm font-black text-emerald-800">Chambre {certificateData.housing.roomNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-emerald-800">Prise d&apos;Effet du Bail :</span>
                  <p className="text-xs font-bold text-gray-900">
                    {certificateData.housing.startDateFormatted}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-emerald-800">Échéance / Durée :</span>
                  <p className="text-xs font-bold text-gray-900">
                    {certificateData.housing.endDateFormatted}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-emerald-800">Redevance / Loyer :</span>
                  <p className="text-xs font-bold text-gray-900">
                    {certificateData.housing.monthlyRentXOF.toLocaleString()} FCFA / mois
                  </p>
                </div>
              </div>
            </div>

            {/* Clauses d'occupation */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-[11px] text-gray-600">
              <p className="font-semibold text-gray-800 mb-1">Engagements de l&apos;occupant :</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Le bénéficiaire s&apos;engage à se conformer aux règles de salubrité et de bon voisinage de la résidence.</li>
                <li>Toute sous-location ou cession de chambre à des tiers est formellement interdite sous peine d&apos;expulsion immédiate.</li>
                <li>L&apos;occupant s&apos;engage à s&apos;acquitter à bonne date des frais de séjour convenus avec le comité de gestion.</li>
              </ul>
            </div>
          </div>

          {/* Signatures & Cachet */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] text-gray-500">
                  Fait à <strong className="text-gray-800">{certificateData.housing.quarterCity}</strong>, le {certificateData.issueDateFormatted}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  {/* QR Code Simulé de vérification numérique */}
                  <div className="flex size-14 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-1 text-[8px] font-mono text-center text-gray-400">
                    QR-VERIF<br />OK
                  </div>
                  <div className="text-[9px] text-gray-400">
                    <p className="font-bold text-gray-600">Vérification de conformité</p>
                    <p>Code numérique : {certificateData.certificateRef}</p>
                    <p>Plateforme nationale My Community Bénin</p>
                  </div>
                </div>
              </div>

              {/* Cachet & Signature */}
              <div className="text-right">
                <p className="text-[11px] font-bold text-gray-800">Pour le Bureau Exécutif</p>
                <p className="text-[10px] text-gray-500">Le Secrétaire Général aux Logements</p>
                <div className="mt-3 inline-block rounded-xl border-2 border-emerald-800/40 bg-emerald-50/40 px-4 py-2 text-center">
                  <span className="block text-[10px] font-bold text-emerald-900 uppercase">
                    [ SCEAU OFFICIEL CERTIFIÉ ]
                  </span>
                  <span className="block text-[8px] font-semibold text-emerald-700">
                    {certificateData.association.name} — Service Résidences
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Règles CSS pour impression propre A4 sans artefacts */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-certificate,
          .print-certificate * {
            visibility: visible;
          }
          .print-certificate {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20mm !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}
