"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import {
  BedIcon,
  BuildingIcon,
  PlusIcon,
  SearchIcon,
  CheckIcon,
  TrashIcon,
  PencilIcon,
  WrenchIcon,
  UsersIcon,
} from "@/components/icons";
import { AlertTriangle, X, Check } from "lucide-react";
import { Select2 } from "@/components/ui/Select2";
import {
  apiService,
  ApiRoom,
  ApiBuilding,
  ApiQuarter,
  ApiResidenceStats,
  ApiAssociation,
} from "@/lib/api";
import { ROOM_TYPES } from "@/features/residences";
import AssignRoomOccupationModal from "@/components/dashboard/AssignRoomOccupationModal";
import OccupantDetailsModal from "@/components/dashboard/OccupantDetailsModal";
import RoomMaintenanceModal from "@/components/dashboard/RoomMaintenanceModal";
import {
  ResidenceScopeHeader,
  NoActiveAssociationNotice,
} from "@/components/dashboard/ResidenceScopeHeader";
import { useConfirm } from "@/context/ConfirmationContext";
import { useActiveAssociation } from "@/context/AssociationContext";

export default function RoomsPage() {
  const { confirm } = useConfirm();
  const {
    activeAssociation,
    activeAssociationId,
    hasActiveAssociation,
    userAssociations,
  } = useActiveAssociation();

  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [buildings, setBuildings] = useState<ApiBuilding[]>([]);
  const [quarters, setQuarters] = useState<ApiQuarter[]>([]);
  const [stats, setStats] = useState<ApiResidenceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterBuilding, setFilterBuilding] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<ApiRoom | null>(null);
  const [selectedOccupantRoom, setSelectedOccupantRoom] = useState<ApiRoom | null>(null);
  const [maintenanceRoom, setMaintenanceRoom] = useState<ApiRoom | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignQuarterId, setAssignQuarterId] = useState("");
  const [assignBuildingId, setAssignBuildingId] = useState("");
  const [assignRoomId, setAssignRoomId] = useState<string | undefined>(undefined);

  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    buildingId: "",
    roomNumber: "",
    capacity: ROOM_TYPES[0].defaultCapacity,
    floor: 0,
    type: ROOM_TYPES[0].label,
    monthlyRentXOF: ROOM_TYPES[0].suggestedRentXOF,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Load Rooms & Buildings strictement rattachés à l'association active
  const loadData = useCallback(async () => {
    if (!activeAssociationId) return;
    setIsLoading(true);
    try {
      const [allRooms, allBuildings, qList, s] = await Promise.all([
        apiService.residences.getRooms(),
        apiService.residences.getBuildings(),
        apiService.residences.getQuarters(activeAssociationId),
        apiService.residences.getStats(activeAssociationId).catch(() => null),
      ]);
      setQuarters(qList);
      if (s) setStats(s);

      const quarterIds = new Set(qList.map((q) => q.id));
      const scopedBuildings = allBuildings.filter((b) => quarterIds.has(b.quarterId));
      setBuildings(scopedBuildings);

      const buildingIds = new Set(scopedBuildings.map((b) => b.id));
      const scopedRooms = allRooms.filter((r) => buildingIds.has(r.buildingId));
      setRooms(scopedRooms);

      if (scopedBuildings.length > 0) {
        setFormData((prev) => ({ ...prev, buildingId: scopedBuildings[0].id }));
      }
    } catch (err) {
      console.error("Failed to load rooms:", err);
      showToast("Erreur lors du chargement des données.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [activeAssociationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create Room
  const handleOpenCreateModal = () => {
    setFormError(null);
    setFormData({
      buildingId: buildings[0]?.id || "",
      roomNumber: "",
      capacity: 1,
      floor: 0,
      type: "Studio Individuel",
      monthlyRentXOF: 35000,
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.buildingId || !formData.roomNumber.trim()) {
      setFormError("Veuillez sélectionner un bâtiment et renseigner le numéro de chambre.");
      return;
    }

    const trimmedNumber = formData.roomNumber.trim().toLowerCase();
    const duplicate = rooms.some(
      (r) => r.buildingId === formData.buildingId && r.roomNumber.trim().toLowerCase() === trimmedNumber
    );
    if (duplicate) {
      setFormError(`Une chambre avec le numéro "${formData.roomNumber.trim()}" existe déjà dans ce bâtiment.`);
      return;
    }

    const parsedFloor = !isNaN(Number(formData.floor)) ? Math.max(0, Number(formData.floor)) : 0;
    const parsedCapacity = Math.max(1, Number(formData.capacity) || 1);
    const parsedRent = Math.max(0, Number(formData.monthlyRentXOF) || 0);

    setIsSubmitting(true);
    try {
      await apiService.residences.createRoom({
        buildingId: formData.buildingId,
        roomNumber: formData.roomNumber.trim(),
        capacity: parsedCapacity,
        floor: parsedFloor,
        type: formData.type,
        monthlyRentXOF: parsedRent,
      });
      setIsCreateModalOpen(false);
      showToast("Chambre créée et ajoutée à l'inventaire avec succès !");
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la création de la chambre.";
      setFormError(msg);
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Room
  const handleOpenEditModal = (room: ApiRoom) => {
    setFormError(null);
    setEditingRoom(room);
    setFormData({
      buildingId: room.buildingId,
      roomNumber: room.roomNumber,
      capacity: room.capacity,
      floor: room.floor ?? 0,
      type: room.type || "Studio Individuel",
      monthlyRentXOF: room.monthlyRentXOF || 35000,
    });
  };

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!editingRoom || !formData.roomNumber.trim()) {
      setFormError("Le numéro de chambre est obligatoire.");
      return;
    }

    const trimmedNumber = formData.roomNumber.trim().toLowerCase();
    const duplicate = rooms.some(
      (r) =>
        r.id !== editingRoom.id &&
        r.buildingId === editingRoom.buildingId &&
        r.roomNumber.trim().toLowerCase() === trimmedNumber
    );
    if (duplicate) {
      setFormError(`Une autre chambre avec le numéro "${formData.roomNumber.trim()}" existe déjà dans ce bâtiment.`);
      return;
    }

    const parsedFloor = !isNaN(Number(formData.floor)) ? Math.max(0, Number(formData.floor)) : 0;
    const parsedCapacity = Math.max(1, Number(formData.capacity) || 1);
    const parsedRent = Math.max(0, Number(formData.monthlyRentXOF) || 0);

    setIsSubmitting(true);
    try {
      await apiService.residences.updateRoom(editingRoom.id, {
        roomNumber: formData.roomNumber.trim(),
        capacity: parsedCapacity,
        floor: parsedFloor,
        type: formData.type,
        monthlyRentXOF: parsedRent,
      });
      setEditingRoom(null);
      showToast("Chambre mise à jour avec succès !");
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la mise à jour de la chambre.";
      setFormError(msg);
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Maintenance Status
  const handleToggleStatus = async (room: ApiRoom) => {
    if (room.status === "OCCUPIED") {
      showToast("Impossible de modifier le statut d'une chambre avec un bail actif.", "error");
      return;
    }

    const nextStatus = room.status === "AVAILABLE" ? "MAINTENANCE" : "AVAILABLE";
    const label = nextStatus === "MAINTENANCE" ? "mise en maintenance" : "remise en service";

    try {
      await apiService.residences.updateRoomStatus(room.id, nextStatus);
      showToast(`Chambre ${label} avec succès !`);
      await loadData();
    } catch {
      showToast(`Erreur lors de la ${label}.`, "error");
    }
  };

  // Delete Room
  const handleDeleteRoom = async (room: ApiRoom) => {
    if (room.status === "OCCUPIED") {
      showToast("Impossible de supprimer une chambre occupée par un locataire.", "error");
      return;
    }

    const ok = await confirm({
      title: "Supprimer la chambre",
      message: `Supprimer définitivement la chambre "${room.roomNumber}" ?`,
      confirmText: "Supprimer",
      cancelText: "Annuler",
      variant: "danger",
    });
    if (!ok) return;

    try {
      await apiService.residences.deleteRoom(room.id);
      showToast("Chambre supprimée de l'inventaire avec succès !");
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la suppression de la chambre.";
      showToast(msg, "error");
    }
  };

  // Terminate Occupation
  const handleTerminateOccupation = async (room: ApiRoom) => {
    if (!room.currentOccupation) return;
    const ok = await confirm({
      title: "Résilier le bail",
      message: `Résilier le bail de ${room.currentOccupation.occupantName || "ce résident"} ?`,
      confirmText: "Résilier le bail",
      cancelText: "Annuler",
      variant: "danger",
    });
    if (!ok) return;

    try {
      await apiService.residences.terminateOccupation(room.currentOccupation.id, room.id);
      showToast("Bail résilié avec succès ! La chambre est de nouveau disponible.");
      await loadData();
    } catch {
      showToast("Erreur lors de la résiliation du bail.", "error");
    }
  };

  // Filter logic
  const filteredRooms = rooms.filter((r) => {
    const matchesBuilding = filterBuilding === "all" || r.buildingId === filterBuilding;
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    const matchesSearch =
      r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.type && r.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.currentOccupation?.occupantName &&
        r.currentOccupation.occupantName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesBuilding && matchesStatus && matchesSearch;
  });

  const availableCount = stats ? stats.availableRooms : rooms.filter((r) => r.status === "AVAILABLE").length;
  const occupiedCount = stats ? stats.occupiedRooms : rooms.filter((r) => r.status === "OCCUPIED").length;
  const maintenanceCount = stats ? stats.maintenanceRooms : rooms.filter((r) => r.status === "MAINTENANCE").length;

  if (!hasActiveAssociation) {
    return (
      <div className="space-y-6">
        <NoActiveAssociationNotice />
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

      {/* Scope Header */}
      <ResidenceScopeHeader
        title="Chambres & Disponibilités"
        subtitle="Gestion intégrale des lits, tarification mensuelle, baux et maintenance technique des logements"
        actionButton={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setAssignQuarterId(quarters[0]?.id || "");
                setAssignBuildingId(buildings[0]?.id || "");
                setAssignRoomId(undefined);
                setIsAssignModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-800 shadow-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <BedIcon className="size-4 text-brand-600" />
              <span>Attribuer un Bail</span>
            </button>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-700"
            >
              <PlusIcon className="size-4" />
              <span>Nouvelle Chambre</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Chambres</span>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{rooms.length}</p>
          <span className="text-[11px] text-gray-400">Bâtiments gérés : {buildings.length}</span>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs dark:border-emerald-950 dark:bg-emerald-950/20">
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Disponibles</span>
          <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300">{availableCount}</p>
          <span className="text-[11px] text-emerald-600/80">Prêtes pour attribution</span>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-xs dark:border-blue-950 dark:bg-blue-950/20">
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Occupées</span>
          <p className="mt-1 text-2xl font-black text-blue-700 dark:text-blue-300">{occupiedCount}</p>
          <span className="text-[11px] text-blue-600/80">Baux actifs en cours</span>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-xs dark:border-amber-950 dark:bg-amber-950/20">
          <span className="text-xs font-medium text-amber-700 dark:text-amber-300">En Travaux</span>
          <p className="mt-1 text-2xl font-black text-amber-700 dark:text-amber-300">{maintenanceCount}</p>
          <span className="text-[11px] text-amber-600/80">Maintenance technique</span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Building selector */}
          <div className="w-full sm:w-auto sm:min-w-[190px]">
            <Select2
              value={filterBuilding}
              onChange={(e) => setFilterBuilding(e.target.value)}
              className="w-full"
            >
              <option value="all">Tous les Bâtiments ({buildings.length})</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select2>
          </div>

          {/* Status selector */}
          <div className="w-full sm:w-auto sm:min-w-[150px]">
            <Select2
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full"
            >
              <option value="all">Tous les Statuts</option>
              <option value="AVAILABLE">Disponibles</option>
              <option value="OCCUPIED">Occupées</option>
              <option value="MAINTENANCE">En Travaux</option>
            </Select2>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-auto sm:min-w-[240px]">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <SearchIcon className="size-3.5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher numéro, type, occupant..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pr-3 pl-8 text-xs text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Rooms Grid */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="size-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <BedIcon className="size-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-3 text-sm font-bold text-gray-800 dark:text-gray-200">Aucune chambre trouvée</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Ajoutez de nouvelles chambres ou modifiez vos critères de recherche.
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs"
          >
            <PlusIcon className="size-4" />
            <span>Ajouter une chambre</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => {
            const building = buildings.find((b) => b.id === room.buildingId);
            const quarter = building ? quarters.find((q) => q.id === building.quarterId) : null;
            const occ = room.currentOccupation;

            return (
              <div
                key={room.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-700"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        {building?.name || "Bâtiment"}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {room.roomNumber}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="light"
                        color={
                          room.status === "AVAILABLE"
                            ? "success"
                            : room.status === "OCCUPIED"
                            ? "primary"
                            : "warning"
                        }
                        size="sm"
                      >
                        {room.status === "AVAILABLE"
                          ? "Disponible"
                          : room.status === "OCCUPIED"
                          ? "Occupée"
                          : "Travaux"}
                      </Badge>

                      {/* Edit Button */}
                      <button
                        type="button"
                        title="Modifier cette chambre"
                        onClick={() => handleOpenEditModal(room)}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                      >
                        <PencilIcon className="size-3.5" />
                      </button>

                      {/* Delete Button */}
                      {room.status !== "OCCUPIED" && (
                        <button
                          type="button"
                          title="Supprimer cette chambre"
                          onClick={() => handleDeleteRoom(room)}
                          className="rounded-lg p-1 text-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                        >
                          <TrashIcon className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {quarter?.name || "Campus"} • Étage {room.floor || 1} • {room.type || "Studio"}
                  </p>

                  <div className="mt-4 space-y-2 rounded-xl bg-gray-50 p-3 text-xs dark:bg-gray-800/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Capacité :</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {room.capacity} lit{room.capacity > 1 ? "s" : ""}
                        </span>
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                          Surplus admis
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Loyer mensuel :</span>
                      <span className="font-bold text-brand-600 dark:text-brand-400">
                        {(room.monthlyRentXOF || 35000).toLocaleString("fr-FR")} F CFA
                      </span>
                    </div>
                    {occ && (
                      <div className="flex flex-col border-t border-gray-200 pt-1.5 dark:border-gray-700">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Occupant :</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {occ.occupantName || "Résident Actif"}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-0.5">
                          Tél : {occ.occupantPhone || "Non renseigné"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  {/* Status & Maintenance Actions */}
                  {room.status === "MAINTENANCE" ? (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(room)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-400"
                    >
                      <WrenchIcon className="size-3" />
                      <span>Remettre en service</span>
                    </button>
                  ) : room.status === "AVAILABLE" ? (
                    <button
                      type="button"
                      onClick={() => setMaintenanceRoom(room)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900/50 dark:text-amber-400 px-2.5 py-1 text-xs font-semibold"
                      title="Ouvrir un ticket de maintenance ou mettre la chambre en réfection"
                    >
                      <WrenchIcon className="size-3" />
                      <span>Mettre en travaux</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedOccupantRoom(room)}
                        className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:border-brand-900/60 dark:bg-brand-950/60 dark:text-brand-300"
                        title="Voir la fiche détaillée de l'occupant et de son bail"
                      >
                        <UsersIcon className="size-3" />
                        <span>Détails occupant</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMaintenanceRoom(room)}
                        className="inline-flex items-center rounded-lg border border-gray-200 p-1 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400"
                        title="Signaler un incident de maintenance dans cette chambre"
                      >
                        <WrenchIcon className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTerminateOccupation(room)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400"
                      >
                        <span>Résilier</span>
                      </button>
                    </div>
                  )}

                  {room.status === "AVAILABLE" && (
                    <button
                      type="button"
                      onClick={() => {
                        setAssignQuarterId(quarter?.id || "");
                        setAssignBuildingId(room.buildingId);
                        setAssignRoomId(room.id);
                        setIsAssignModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-300"
                    >
                      <CheckIcon className="size-3.5" />
                      <span>Attribuer</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Room */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <BedIcon className="size-5 text-brand-600" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Nouvelle Chambre Physique
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="mt-4 space-y-4 text-xs">
              {formError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="rounded-xl border border-brand-200 bg-brand-50/80 p-2.5 dark:border-brand-900/50 dark:bg-brand-950/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                  Association Gestionnaire (Verrouillée)
                </span>
                <p className="font-bold text-xs text-gray-900 dark:text-white mt-0.5">
                  {activeAssociation?.name} {activeAssociation?.acronym ? `(${activeAssociation.acronym})` : ""}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Bâtiment Parent *
                </label>
                <Select2
                  value={formData.buildingId}
                  onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
                  required
                  className="w-full"
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.address})
                    </option>
                  ))}
                </Select2>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Numéro ou Identifiant de la Chambre *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Chambre 204"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Capacité (Lits) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Étage (0 = RDC / Plain-pied)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Type de Chambre
                  </label>
                  <Select2
                    value={formData.type}
                    onChange={(e) => {
                      const selected = ROOM_TYPES.find((rt) => rt.label === e.target.value);
                      setFormData({
                        ...formData,
                        type: e.target.value,
                        ...(selected
                          ? {
                              capacity: selected.defaultCapacity,
                              monthlyRentXOF: selected.suggestedRentXOF,
                            }
                          : {}),
                      });
                    }}
                    className="w-full"
                  >
                    {ROOM_TYPES.map((rt) => (
                      <option key={rt.id} value={rt.label}>
                        {rt.label} ({rt.defaultCapacity} lit{rt.defaultCapacity > 1 ? "s" : ""})
                      </option>
                    ))}
                  </Select2>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Loyer Mensuel (FCFA) *
                  </label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={formData.monthlyRentXOF}
                    onChange={(e) => setFormData({ ...formData, monthlyRentXOF: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Solidarity surplus note */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Check className="size-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Surplus solidaire et d&apos;urgence autorisé</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-blue-700/90 dark:text-blue-300/90">
                  Pour toute chambre définie pour {formData.capacity || 4} occupants, l&apos;accueil d&apos;occupants en surplus en cas de besoin reste pleinement accepté lors de l&apos;attribution.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Création..." : "Créer la Chambre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Room */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <PencilIcon className="size-5 text-brand-600" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Modifier la Chambre &quot;{editingRoom.roomNumber}&quot;
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateRoom} className="mt-4 space-y-4 text-xs">
              {formError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Numéro de Chambre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Capacité (Lits) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Étage (0 = RDC / Plain-pied)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Type de Chambre
                  </label>
                  <Select2
                    value={formData.type}
                    onChange={(e) => {
                      const selected = ROOM_TYPES.find((rt) => rt.label === e.target.value);
                      setFormData({
                        ...formData,
                        type: e.target.value,
                        ...(selected
                          ? {
                              capacity: selected.defaultCapacity,
                              monthlyRentXOF: selected.suggestedRentXOF,
                            }
                          : {}),
                      });
                    }}
                    className="w-full"
                  >
                    {ROOM_TYPES.map((rt) => (
                      <option key={rt.id} value={rt.label}>
                        {rt.label} ({rt.defaultCapacity} lit{rt.defaultCapacity > 1 ? "s" : ""})
                      </option>
                    ))}
                  </Select2>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Loyer Mensuel (FCFA) *
                  </label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={formData.monthlyRentXOF}
                    onChange={(e) => setFormData({ ...formData, monthlyRentXOF: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Solidarity surplus note */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Check className="size-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Surplus solidaire et d&apos;urgence autorisé</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-blue-700/90 dark:text-blue-300/90">
                  Pour toute chambre définie pour {formData.capacity || 4} occupants, l&apos;accueil d&apos;occupants en surplus en cas de besoin reste pleinement accepté lors de l&apos;attribution.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Lease Modal */}
      <AssignRoomOccupationModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setAssignRoomId(undefined);
          loadData();
        }}
        initialAssociationId={activeAssociationId}
        initialQuarterId={assignQuarterId}
        initialBuildingId={assignBuildingId}
        initialRoomId={assignRoomId}
        onSuccess={() => {
          setAssignRoomId(undefined);
          loadData();
        }}
      />

      {/* Occupant Details Modal */}
      {selectedOccupantRoom && (
        <OccupantDetailsModal
          isOpen={!!selectedOccupantRoom}
          room={selectedOccupantRoom}
          onClose={() => setSelectedOccupantRoom(null)}
          onLeaseTerminated={() => {
            setSelectedOccupantRoom(null);
            loadData();
          }}
        />
      )}

      {/* Room Maintenance Ticket Modal */}
      {maintenanceRoom && (
        <RoomMaintenanceModal
          isOpen={!!maintenanceRoom}
          room={maintenanceRoom}
          onClose={() => setMaintenanceRoom(null)}
          onSuccess={() => {
            showToast("Intervention / Maintenance enregistrée avec succès !");
            loadData();
          }}
        />
      )}
    </div>
  );
}
