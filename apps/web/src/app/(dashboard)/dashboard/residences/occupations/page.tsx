"use client";

import React, { useState, useEffect, useCallback } from "react";
import Badge from "@/components/ui/badge/Badge";
import { BedIcon, SearchIcon, PlusIcon, CheckIcon, TrashIcon, BuildingIcon } from "@/components/icons";
import { AlertTriangle } from "lucide-react";
import { Select2 } from "@/components/ui/Select2";
import { useConfirm } from "@/context/ConfirmationContext";
import { useActiveAssociation } from "@/context/AssociationContext";
import {
  ResidenceScopeHeader,
  NoActiveAssociationNotice,
} from "@/components/dashboard/ResidenceScopeHeader";
import { apiService, ApiOccupation, ApiRoom, ApiAssociation, ApiBuilding, ApiQuarter } from "@/lib/api";
import AssignRoomOccupationModal from "@/components/dashboard/AssignRoomOccupationModal";

export default function OccupationsPage() {
  const { confirm } = useConfirm();
  const {
    activeAssociation,
    activeAssociationId,
    hasActiveAssociation,
  } = useActiveAssociation();

  const [occupations, setOccupations] = useState<ApiOccupation[]>([]);
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [buildings, setBuildings] = useState<ApiBuilding[]>([]);
  const [quarters, setQuarters] = useState<ApiQuarter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "TERMINATED">("ALL");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [terminatingId, setTerminatingId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    if (!activeAssociationId) return;
    setIsLoading(true);
    try {
      const [occList, rList, bList, qList] = await Promise.all([
        apiService.residences.getOccupations({ associationId: activeAssociationId }),
        apiService.residences.getRooms(),
        apiService.residences.getBuildings(),
        apiService.residences.getQuarters(activeAssociationId),
      ]);
      setQuarters(qList);
      const quarterIds = new Set(qList.map((q) => q.id));
      const scopedBuildings = bList.filter((b) => quarterIds.has(b.quarterId));
      setBuildings(scopedBuildings);
      const buildingIds = new Set(scopedBuildings.map((b) => b.id));
      const scopedRooms = rList.filter((r) => buildingIds.has(r.buildingId));
      setRooms(scopedRooms);
      setOccupations(occList);
    } catch (err) {
      console.error("Failed to load occupations data:", err);
      showToast("Erreur lors du chargement des baux.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [activeAssociationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTerminateOccupation = async (occ: ApiOccupation) => {
    const ok = await confirm({
      title: "Résilier le bail",
      message: `Êtes-vous sûr de vouloir résilier ce bail pour ${occ.occupantName || "ce résident"} ? La chambre redeviendra immédiatement disponible.`,
      confirmText: "Résilier le bail",
      cancelText: "Annuler",
      variant: "danger",
    });
    if (!ok) return;

    setTerminatingId(occ.id);
    try {
      await apiService.residences.terminateOccupation(occ.id, occ.roomId);
      showToast("Bail résilié avec succès ! La chambre est libre.");
      await loadData();
    } catch (err) {
      console.error("Error terminating occupation:", err);
      showToast("Erreur lors de la clôture du bail.", "error");
    } finally {
      setTerminatingId(null);
    }
  };

  const filtered = occupations.filter((occ) => {
    const room = rooms.find((r) => r.id === occ.roomId);
    const building = room ? buildings.find((b) => b.id === room.buildingId) : null;
    const assocName = activeAssociation?.name || "";

    const matchesStatus =
      filterStatus === "ALL" ||
      (filterStatus === "ACTIVE" && occ.isActive) ||
      (filterStatus === "TERMINATED" && !occ.isActive);

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (occ.occupantName && occ.occupantName.toLowerCase().includes(searchLower)) ||
      (occ.occupantPhone && occ.occupantPhone.toLowerCase().includes(searchLower)) ||
      (room && room.roomNumber.toLowerCase().includes(searchLower)) ||
      (building && building.name.toLowerCase().includes(searchLower)) ||
      assocName.toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  const activeCount = occupations.filter((o) => o.isActive).length;
  const terminatedCount = occupations.filter((o) => !o.isActive).length;

  if (!hasActiveAssociation) {
    return (
      <div className="space-y-6">
        <NoActiveAssociationNotice
          title="Module Résidence : Baux & Occupations"
          subtitle="Veuillez sélectionner ou activer une association pour consulter et gérer les baux d'hébergement."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-semibold shadow-xl animate-in slide-in-from-top-4 duration-200 ${
            toast.type === "success"
              ? "border-emerald-300 bg-emerald-600 text-white"
              : "border-rose-300 bg-rose-600 text-white"
          }`}
        >
          {toast.type === "success" ? <CheckIcon className="size-4" /> : <AlertTriangle className="size-4" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header unifié avec portée d'association */}
      <ResidenceScopeHeader
        title="Attributions des Baux & Contrats d'Occupation"
        subtitle="Contrats d'hébergement citoyen, affectation des lits et historique complet des séjours."
        rightElement={
          <button
            type="button"
            onClick={() => setIsAssignModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-700"
          >
            <PlusIcon className="size-4" />
            <span>Nouvelle Attribution</span>
          </button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Baux Enregistrés</span>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{occupations.length}</p>
          <span className="text-[11px] text-gray-400">Historique complet des séjours</span>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs dark:border-emerald-950 dark:bg-emerald-950/20">
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Baux Actifs en Cours</span>
          <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300">{activeCount}</p>
          <span className="text-[11px] text-emerald-600/80">Résidents actuellement logés</span>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Baux Clôturés</span>
          <p className="mt-1 text-2xl font-black text-gray-700 dark:text-gray-300">{terminatedCount}</p>
          <span className="text-[11px] text-gray-400">Chambres libérées</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-auto sm:min-w-[190px]">
            <Select2
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full"
            >
              <option value="ALL">Tous les statuts ({occupations.length})</option>
              <option value="ACTIVE">Baux Actifs ({activeCount})</option>
              <option value="TERMINATED">Baux Clôturés ({terminatedCount})</option>
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
            placeholder="Rechercher résident, chambre, bâtiment..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pr-3 pl-8 text-xs text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Leases Table */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="size-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <BedIcon className="size-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-3 text-sm font-bold text-gray-800 dark:text-gray-200">Aucun bail trouvé</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Attribuez une chambre à un résident pour enregistrer le premier bail officiel.
          </p>
          <button
            type="button"
            onClick={() => setIsAssignModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs"
          >
            <PlusIcon className="size-4" />
            <span>Attribuer une chambre</span>
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th className="px-5 py-3.5">Logement / Chambre</th>
                  <th className="px-5 py-3.5">Résident Titulaire</th>
                  <th className="px-5 py-3.5">Association Gestionnaire</th>
                  <th className="px-5 py-3.5">Période du Séjour</th>
                  <th className="px-5 py-3.5">Loyer Mensuel</th>
                  <th className="px-5 py-3.5">Statut du Bail</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((occ) => {
                  const room = rooms.find((r) => r.id === occ.roomId);
                  const building = room ? buildings.find((b) => b.id === room.buildingId) : null;
                  const quarter = building ? quarters.find((q) => q.id === building.quarterId) : null;
                  const isProcessing = terminatingId === occ.id;

                  return (
                    <tr
                      key={occ.id}
                      className="transition hover:bg-gray-50/50 dark:hover:bg-gray-800/40"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                            <BedIcon className="size-4.5" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 dark:text-white">
                              {room?.roomNumber || "Chambre"}
                            </span>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <BuildingIcon className="size-3" />
                              <span>{building?.name || "Bâtiment"}</span>
                              {quarter && <span>({quarter.city})</span>}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {occ.occupantName || "Résident Citoyen"}
                        </span>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {occ.occupantPhone || "+229 (Non renseigné)"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {activeAssociation?.name || "Association Active"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          Du {new Date(occ.startDate).toLocaleDateString("fr-FR")}
                        </span>
                        <p className="text-[11px] text-gray-500">
                          Au {occ.endDate ? new Date(occ.endDate).toLocaleDateString("fr-FR") : "Indéterminé"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {(room?.monthlyRentXOF || 35000).toLocaleString("fr-FR")} FCFA
                        </span>
                        <p className="text-[10px] text-gray-400">/ mois</p>
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          variant="light"
                          color={occ.isActive ? "success" : "light"}
                          size="sm"
                        >
                          {occ.isActive ? "Bail Actif" : "Bail Clôturé"}
                        </Badge>
                      </td>

                      <td className="px-5 py-4 text-right">
                        {occ.isActive ? (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleTerminateOccupation(occ)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
                          >
                            <TrashIcon className="size-3.5" />
                            <span>{isProcessing ? "Clôture..." : "Clôturer le Bail"}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400">Clôturé</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      <AssignRoomOccupationModal
        isOpen={isAssignModalOpen}
        initialAssociationId={activeAssociationId}
        onClose={() => {
          setIsAssignModalOpen(false);
          loadData();
        }}
        onSuccess={() => loadData()}
      />
    </div>
  );
}
