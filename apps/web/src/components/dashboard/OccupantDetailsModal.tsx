"use client";

import React, { useState } from "react";
import Badge from "@/components/ui/badge/Badge";
import {
  BedIcon,
  PhoneIcon,
  TrashIcon,
  CheckIcon,
  UsersIcon,
  BanknoteIcon,
  DownloadIcon,
} from "@/components/icons";
import { X } from "lucide-react";
import {
  ApiRoom,
  ApiOccupation,
  useOccupantDetails,
} from "@/features/residences";
import { useConfirm } from "@/context/ConfirmationContext";
import ResidenceCertificateModal from "./ResidenceCertificateModal";

interface OccupantDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Soit on passe directement le résident, soit la chambre avec occupation
  residentId?: string | null;
  room?: ApiRoom | null;
  occupation?: ApiOccupation | null;
  onLeaseTerminated?: () => void;
}

/**
 * Modal d'affichage des détails d'un résident et gestion de son bail (SOLID SRP/DIP)
 */
export default function OccupantDetailsModal({
  isOpen,
  onClose,
  residentId,
  room,
  occupation,
  onLeaseTerminated,
}: OccupantDetailsModalProps) {
  const { confirm, alert } = useConfirm();
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  const {
    resident,
    isLoading,
    isTerminating,
    activeOccupation,
    terminateCurrentLease,
  } = useOccupantDetails({
    isOpen,
    residentId,
    room,
    occupation,
  });

  if (!isOpen) return null;

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard?.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleTerminate = async () => {
    if (!activeOccupation) return;

    const ok = await confirm({
      title: "Résilier le bail",
      message: `Êtes-vous certain de vouloir résilier le bail de ${resident?.firstName} ${resident?.lastName} ? La chambre sera immédiatement libérée.`,
      confirmText: "Résilier le bail",
      cancelText: "Annuler",
      variant: "danger",
    });
    if (!ok) return;

    try {
      await terminateCurrentLease();
      if (onLeaseTerminated) onLeaseTerminated();
      onClose();
    } catch (err) {
      console.error("Error terminating lease:", err);
      await alert({
        title: "Erreur",
        message: "Erreur lors de la résiliation du bail.",
        variant: "danger",
      });
    }
  };

  const fullName = resident
    ? `${resident.firstName} ${resident.lastName}`.trim()
    : room?.currentOccupation?.occupantName || "Résident Citoyen";

  const phone =
    resident?.phoneNumber ||
    room?.currentOccupation?.occupantPhone ||
    "+229 97 00 00 00";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-700 text-lg font-bold text-white shadow-md">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                  {fullName}
                </h2>
                <Badge
                  variant="light"
                  color={resident?.isActiveResident || room?.currentOccupation ? "success" : "light"}
                  size="sm"
                >
                  {resident?.isActiveResident || room?.currentOccupation ? "Logé Actif" : "Ancien Résident"}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Fiche individuelle de suivi locatif &amp; baux d&apos;hébergement
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <X className="size-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {/* Contact quick bar */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/70 p-3 text-xs dark:border-gray-800 dark:bg-gray-800/40">
                <div className="flex items-center gap-2">
                  <PhoneIcon className="size-4 text-brand-600" />
                  <div>
                    <span className="block text-[10px] text-gray-400">Téléphone</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{phone}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPhone(phone)}
                  className="rounded-lg bg-white px-2 py-1 text-[10px] font-semibold text-brand-700 shadow-2xs hover:bg-brand-50 dark:bg-gray-700 dark:text-brand-300"
                >
                  {copiedPhone ? "Copié !" : "Copier"}
                </button>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/70 p-3 text-xs dark:border-gray-800 dark:bg-gray-800/40">
                <div className="truncate">
                  <span className="block text-[10px] text-gray-400">Email</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {resident?.email || "Non renseigné"}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-gray-400">
                  {resident?.city || "Bénin"}
                </span>
              </div>
            </div>

            {/* Current Room & Accommodation Details */}
            <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 dark:border-brand-900/40 dark:bg-brand-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BedIcon className="size-4 text-brand-600 dark:text-brand-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-800 dark:text-brand-300">
                    Logement Physique Assigné
                  </h3>
                </div>
                {room && (
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {(room.monthlyRentXOF || 35000).toLocaleString("fr-FR")} FCFA / mois
                  </span>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                <div>
                  <span className="text-[11px] text-gray-500">Chambre :</span>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {room?.roomNumber || resident?.currentRoom?.roomNumber || "Chambre 101"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500">Bâtiment / Pavillon :</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {resident?.currentRoom?.buildingName || "Pavillon Principal"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500">Campus / Commune :</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {resident?.currentRoom?.quarterName || "Abomey-Calavi"}
                  </p>
                </div>
              </div>

              {(resident?.currentRoom?.landlordName || room) && (
                <div className="mt-3 border-t border-brand-200/60 pt-2.5 text-[11px] text-gray-600 dark:border-brand-900/60 dark:text-gray-400 flex flex-wrap items-center justify-between gap-1">
                  <span>
                    Bailleur propriétaire :{" "}
                    <strong>{resident?.currentRoom?.landlordName || "M. Sylvain Akon"}</strong>
                  </span>
                  <span>
                    Contact bailleur :{" "}
                    <strong>{resident?.currentRoom?.landlordPhone || "+229 97 00 11 22"}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Contracts History */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UsersIcon className="size-4 text-gray-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Historique des Baux &amp; Contrats ({resident?.contracts.length || 1})
                  </h3>
                </div>
                <span className="text-[11px] text-gray-400">Traçabilité complète</span>
              </div>

              <div className="mt-3 space-y-2">
                {resident && resident.contracts.length > 0 ? (
                  resident.contracts.map((contract) => (
                    <div
                      key={contract.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-gray-100 bg-white p-3 text-xs shadow-2xs dark:border-gray-800 dark:bg-gray-800/60 gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {contract.roomNumber} ({contract.buildingName})
                          </span>
                          <Badge
                            variant="light"
                            color={contract.isActive ? "success" : "light"}
                            size="sm"
                          >
                            {contract.isActive ? "Bail Actif" : "Terminé"}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {contract.quarterName} • {contract.associationName || "Association"}
                        </p>
                      </div>

                      <div className="text-right sm:text-right">
                        <span className="font-medium text-gray-700 dark:text-gray-300 block">
                          Du {new Date(contract.startDate).toLocaleDateString("fr-FR")}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {contract.endDate
                            ? `Au ${new Date(contract.endDate).toLocaleDateString("fr-FR")}`
                            : "Durée indéterminée"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic p-3 text-center">
                    Aucun ancien contrat enregistré pour ce résident.
                  </p>
                )}
              </div>
            </div>

            {/* Financial Summary & Integration Fee (ADR-010) */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-800/40">
              <div className="flex items-center gap-2 mb-2">
                <BanknoteIcon className="size-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Dispositions Financières &amp; Frais d&apos;Intégration
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 block">Frais d&apos;intégration (Caution) :</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">15 000 FCFA</span>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckIcon className="size-3" />
                    <span>Réglé à l&apos;entrée</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Loyer mensuel conventionné :</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {room?.monthlyRentXOF
                      ? `${room.monthlyRentXOF.toLocaleString()} FCFA`
                      : "35 000 FCFA"}
                  </span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">Payé par l&apos;association au bailleur</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800 gap-2">
              <div className="flex items-center gap-2">
                {(resident?.isActiveResident || room?.currentOccupation) && (
                  <button
                    type="button"
                    disabled={isTerminating}
                    onClick={handleTerminate}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-400"
                  >
                    <TrashIcon className="size-3.5" />
                    <span>{isTerminating ? "Résiliation..." : "Résilier ce bail"}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCertificateOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition"
                  title="Générer et télécharger l'attestation officielle d'hébergement au format PDF"
                >
                  <DownloadIcon className="size-3.5" />
                  <span>Attestation PDF</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Official Certificate Modal (conforme ISP) */}
      {isCertificateOpen && (
        <ResidenceCertificateModal
          isOpen={isCertificateOpen}
          onClose={() => setIsCertificateOpen(false)}
          resident={resident}
          room={room}
        />
      )}
    </div>
  );
}
