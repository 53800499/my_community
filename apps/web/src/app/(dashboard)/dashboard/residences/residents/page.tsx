"use client";

import React, { useState, useEffect, useCallback } from "react";
import Badge from "@/components/ui/badge/Badge";
import {
  UsersIcon,
  BedIcon,
  SearchIcon,
  PhoneIcon,
  BuildingIcon,
  CheckIcon,
  DownloadIcon,
} from "@/components/icons";
import { apiService, ApiResident } from "@/lib/api";
import OccupantDetailsModal from "@/components/dashboard/OccupantDetailsModal";
import AssignRoomOccupationModal from "@/components/dashboard/AssignRoomOccupationModal";
import ResidenceCertificateModal from "@/components/dashboard/ResidenceCertificateModal";
import { Select2 } from "@/components/ui/Select2";
import { useActiveAssociation } from "@/context/AssociationContext";
import {
  ResidenceScopeHeader,
  NoActiveAssociationNotice,
} from "@/components/dashboard/ResidenceScopeHeader";

export default function ResidentsPage() {
  const {
    activeAssociation,
    activeAssociationId,
    hasActiveAssociation,
  } = useActiveAssociation();

  const [residents, setResidents] = useState<ApiResident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "PAST">("ALL");

  // Selected resident for full details modal & certificate modal
  const [selectedResident, setSelectedResident] = useState<ApiResident | null>(null);
  const [certificateResident, setCertificateResident] = useState<ApiResident | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!activeAssociationId) return;
    setIsLoading(true);
    try {
      const list = await apiService.residences.getResidents({ associationId: activeAssociationId });
      setResidents(list);
    } catch (err) {
      console.error("Failed to load residents:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeAssociationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter residents
  const filteredResidents = residents.filter((r) => {
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && r.isActiveResident) ||
      (statusFilter === "PAST" && !r.isActiveResident);

    const term = searchTerm.toLowerCase();
    const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
    const phone = r.phoneNumber.toLowerCase();
    const roomNumber = r.currentRoom?.roomNumber.toLowerCase() || "";
    const buildingName = r.currentRoom?.buildingName.toLowerCase() || "";
    const quarterCity = r.currentRoom?.quarterCity.toLowerCase() || "";

    const matchesSearch =
      fullName.includes(term) ||
      phone.includes(term) ||
      roomNumber.includes(term) ||
      buildingName.includes(term) ||
      quarterCity.includes(term);

    return matchesStatus && matchesSearch;
  });

  const activeCount = residents.filter((r) => r.isActiveResident).length;
  const pastCount = residents.filter((r) => !r.isActiveResident).length;
  const totalContracts = residents.reduce((sum, r) => sum + (r.contractsCount || r.contracts.length), 0);

  if (!hasActiveAssociation) {
    return (
      <div className="space-y-6">
        <NoActiveAssociationNotice
          title="Module Résidence : Répertoire des Résidents"
          subtitle="Veuillez sélectionner ou activer une association pour consulter ses résidents et leurs baux."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header unifié avec portée d'association */}
      <ResidenceScopeHeader
        title="Répertoire des Résidents & Baux d'Occupation"
        subtitle="Fiches individuelles des citoyens hébergés, suivi des contrats de bail et historique complet des séjours."
        rightElement={
          <button
            type="button"
            onClick={() => setIsAssignModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-700"
          >
            <BedIcon className="size-4" />
            <span>Nouvelle Attribution de Bail</span>
          </button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Résidents</span>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{residents.length}</p>
          <span className="text-[11px] text-gray-400">Citoyens répertoriés</span>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs dark:border-emerald-950 dark:bg-emerald-950/20">
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Actuellement Logés</span>
          <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300">{activeCount}</p>
          <span className="text-[11px] text-emerald-600/80">Baux en cours de validité</span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Anciens Résidents</span>
          <p className="mt-1 text-2xl font-black text-gray-700 dark:text-gray-300">{pastCount}</p>
          <span className="text-[11px] text-gray-400">Baux clôturés</span>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-xs dark:border-indigo-950 dark:bg-indigo-950/20">
          <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Total Contrats Signés</span>
          <p className="mt-1 text-2xl font-black text-indigo-700 dark:text-indigo-300">{totalContracts}</p>
          <span className="text-[11px] text-indigo-600/80">Historique des baux</span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <Select2
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full"
            >
              <option value="ALL">Tous les Résidents ({residents.length})</option>
              <option value="ACTIVE">Actuellement Logés ({activeCount})</option>
              <option value="PAST">Anciens Résidents ({pastCount})</option>
            </Select2>
          </div>
        </div>

        <div className="relative w-full sm:w-auto sm:min-w-[260px]">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <SearchIcon className="size-3.5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher résident, tél, chambre..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pr-3 pl-8 text-xs text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Residents Grid */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="size-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : filteredResidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <UsersIcon className="size-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-3 text-sm font-bold text-gray-800 dark:text-gray-200">
            Aucun résident trouvé
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Attribuez un bail pour enregistrer le premier résident de la communauté.
          </p>
          <button
            type="button"
            onClick={() => setIsAssignModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs"
          >
            <BedIcon className="size-4" />
            <span>Attribuer un premier bail</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResidents.map((r) => {
            const fullName = `${r.firstName} ${r.lastName}`.trim();
            const activeContract = r.contracts.find((c) => c.isActive);

            return (
              <div
                key={r.userId}
                className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-700"
              >
                <div>
                  {/* Top identity */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-50 text-base font-bold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                        {fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                          {fullName}
                        </h3>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <PhoneIcon className="size-3 text-gray-400" />
                          <span>{r.phoneNumber}</span>
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="light"
                      color={r.isActiveResident ? "success" : "light"}
                      size="sm"
                    >
                      {r.isActiveResident ? "Logé Actif" : "Ancien Résident"}
                    </Badge>
                  </div>

                  {/* Current accommodation card */}
                  <div className="mt-4 rounded-xl bg-gray-50/70 p-3 text-xs dark:bg-gray-800/40">
                    {r.isActiveResident && r.currentRoom ? (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          Logement Actuel :
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {r.currentRoom.roomNumber}
                          </span>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">
                            {r.currentRoom.buildingName}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400">
                          {r.currentRoom.quarterName} ({r.currentRoom.quarterCity})
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-gray-400">
                          Statut locatif :
                        </span>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          Aucun bail actif en cours
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Chambres précédemment occupées : {r.contracts.length}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Contracts count and last period */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 px-1">
                    <span>
                      Total baux signés : <strong>{r.contracts.length}</strong>
                    </span>
                    {activeContract ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Bail en cours
                      </span>
                    ) : (
                      <span>Clôturé</span>
                    )}
                  </div>
                </div>

                {/* Bottom action button */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    {r.city || "Abomey-Calavi"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCertificateResident(r)}
                      className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300"
                      title="Générer et télécharger l'attestation officielle d'hébergement au format PDF"
                    >
                      <DownloadIcon className="size-3.5" />
                      <span>Attestation PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedResident(r)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-300"
                    >
                      <span>Fiche</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Resident Full Details */}
      <OccupantDetailsModal
        isOpen={!!selectedResident}
        onClose={() => {
          setSelectedResident(null);
          loadData();
        }}
        residentId={selectedResident?.userId}
        onLeaseTerminated={() => {
          loadData();
        }}
      />

      {/* Modal 2: Assign Lease */}
      <AssignRoomOccupationModal
        isOpen={isAssignModalOpen}
        initialAssociationId={activeAssociationId}
        onClose={() => {
          setIsAssignModalOpen(false);
          loadData();
        }}
        onSuccess={() => loadData()}
      />

      {/* Modal 3: Official Certificate Modal */}
      {certificateResident && (
        <ResidenceCertificateModal
          isOpen={!!certificateResident}
          onClose={() => setCertificateResident(null)}
          resident={certificateResident}
        />
      )}
    </div>
  );
}
