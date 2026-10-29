"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import {
  BedIcon,
  PlusIcon,
  SearchIcon,
  BuildingIcon,
  CheckIcon,
  TrashIcon,
  PencilIcon,
  WrenchIcon,
  UsersIcon,
} from "@/components/icons";
import {
  Check,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  School,
  Grid,
  Layers,
  Key,
  DoorOpen,
  Building2,
  Sparkles,
  Bed,
  CheckCircle2,
  BarChart3,
  MapPin,
  User,
  Info,
} from "lucide-react";
import { isUuidV4 } from "@/lib/api-client";
import { Select2 } from "@/components/ui/Select2";
import AssignRoomOccupationModal from "@/components/dashboard/AssignRoomOccupationModal";
import OccupantDetailsModal from "@/components/dashboard/OccupantDetailsModal";
import {
  ResidenceScopeHeader,
  NoActiveAssociationNotice,
} from "@/components/dashboard/ResidenceScopeHeader";
import { useConfirm } from "@/context/ConfirmationContext";
import { useActiveAssociation } from "@/context/AssociationContext";
import {
  apiService,
  ApiQuarter,
  ApiBuilding,
  ApiRoom,
  ApiResidenceStats,
  ApiAssociation,
} from "@/lib/api";
import { BUILDING_TYPES, ROOM_TYPES } from "@/features/residences";

export default function ResidencesPage() {
  const { confirm } = useConfirm();
  const {
    activeAssociation,
    activeAssociationId,
    hasActiveAssociation,
    userAssociations,
  } = useActiveAssociation();

  const [stats, setStats] = useState<ApiResidenceStats | null>(null);
  const [quarters, setQuarters] = useState<ApiQuarter[]>([]);
  const [selectedQuarterId, setSelectedQuarterId] = useState("");

  const [buildings, setBuildings] = useState<ApiBuilding[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState("");

  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AVAILABLE" | "OCCUPIED" | "MAINTENANCE">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals & Hierarchy state
  const [assignRoomId, setAssignRoomId] = useState<string | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"HIERARCHY" | "INVENTORY">("HIERARCHY");
  const [allBuildings, setAllBuildings] = useState<ApiBuilding[]>([]);
  const [allRooms, setAllRooms] = useState<ApiRoom[]>([]);
  const [expandedQuarters, setExpandedQuarters] = useState<Record<string, boolean>>({});
  const [expandedBuildings, setExpandedBuildings] = useState<Record<string, boolean>>({});
  const [isLoadingHierarchy, setIsLoadingHierarchy] = useState(false);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isNewQuarterModalOpen, setIsNewQuarterModalOpen] = useState(false);
  const [isEditQuarterModalOpen, setIsEditQuarterModalOpen] = useState(false);

  const [isNewBuildingModalOpen, setIsNewBuildingModalOpen] = useState(false);
  const [isEditBuildingModalOpen, setIsEditBuildingModalOpen] = useState(false);

  const [isNewRoomModalOpen, setIsNewRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<ApiRoom | null>(null);
  const [selectedOccupantRoom, setSelectedOccupantRoom] = useState<ApiRoom | null>(null);

  // Form inputs for Quarter
  const [quarterAssocId, setQuarterAssocId] = useState("");
  const [quarterName, setQuarterName] = useState("");
  const [quarterCity, setQuarterCity] = useState("Abomey-Calavi");
  const [quarterDesc, setQuarterDesc] = useState("");

  // Form inputs for Building
  const [buildingName, setBuildingName] = useState("");
  const [buildingAddress, setBuildingAddress] = useState("");
  const [buildingLandlord, setBuildingLandlord] = useState("");
  const [buildingPhone, setBuildingPhone] = useState("+229 ");
  const [buildingFloors, setBuildingFloors] = useState("0");
  const [buildingType, setBuildingType] = useState(BUILDING_TYPES[0].id);

  // Form inputs for Room (Create & Edit)
  const [roomNumber, setRoomNumber] = useState("");
  const [roomCapacity, setRoomCapacity] = useState("4");
  const [roomFloor, setRoomFloor] = useState("0");
  const [roomType, setRoomType] = useState(ROOM_TYPES[0].label);
  const [roomRent, setRoomRent] = useState("15000");

  // Toast, Processing & Form Errors
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quarterError, setQuarterError] = useState<string | null>(null);
  const [buildingError, setBuildingError] = useState<string | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Initial Load: Stats de l'association active
  const refreshStats = useCallback(async () => {
    if (!activeAssociationId) return;
    try {
      const s = await apiService.residences.getStats(activeAssociationId);
      setStats(s);
    } catch (err) {
      console.warn("Could not load stats:", err);
    }
  }, [activeAssociationId]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // 2. Charger les Quartiers / Campus strictement de l'association active
  useEffect(() => {
    if (activeAssociationId) {
      setQuarterAssocId(activeAssociationId);
      apiService.residences.getQuarters(activeAssociationId).then((qList) => {
        setQuarters(qList);
        if (qList.length > 0) {
          setSelectedQuarterId(qList[0].id);
        } else {
          setSelectedQuarterId("");
          setBuildings([]);
          setSelectedBuildingId("");
          setRooms([]);
        }
      });
    } else {
      setQuarters([]);
      setSelectedQuarterId("");
      setBuildings([]);
      setSelectedBuildingId("");
      setRooms([]);
    }
  }, [activeAssociationId]);

  // 2. Load Buildings when Quarter changes
  useEffect(() => {
    if (selectedQuarterId) {
      apiService.residences.getBuildings(selectedQuarterId).then((bList) => {
        setBuildings(bList);
        if (bList.length > 0) {
          setSelectedBuildingId(bList[0].id);
        } else {
          setSelectedBuildingId("");
          setRooms([]);
        }
      });
    } else {
      setBuildings([]);
      setSelectedBuildingId("");
      setRooms([]);
    }
  }, [selectedQuarterId]);

  // 3. Load Rooms when Building changes
  const refreshRooms = useCallback(() => {
    if (selectedBuildingId) {
      apiService.residences.getRooms(selectedBuildingId).then((rList) => {
        setRooms(rList);
      });
    } else {
      setRooms([]);
    }
    refreshStats();
  }, [selectedBuildingId, refreshStats]);

  // 3b. Load full hierarchy (Campuses -> Buildings -> Rooms)
  const loadAllHierarchyData = useCallback(async () => {
    setIsLoadingHierarchy(true);
    try {
      const [allB, allR] = await Promise.all([
        apiService.residences.getBuildings("all"),
        apiService.residences.getRooms("all"),
      ]);
      setAllBuildings(allB);
      setAllRooms(allR);
      setExpandedQuarters((prev) => {
        const next = { ...prev };
        quarters.forEach((q) => {
          if (next[q.id] === undefined) next[q.id] = true;
        });
        return next;
      });
      setExpandedBuildings((prev) => {
        const next = { ...prev };
        allB.forEach((b) => {
          if (next[b.id] === undefined) next[b.id] = true;
        });
        return next;
      });
    } catch (err) {
      console.warn("Could not load residence hierarchy:", err);
    } finally {
      setIsLoadingHierarchy(false);
    }
  }, [quarters]);

  useEffect(() => {
    loadAllHierarchyData();
  }, [loadAllHierarchyData]);

  const handleAssignRoom = (room: ApiRoom, quarterId?: string, buildingId?: string) => {
    setAssignRoomId(room.id);
    if (quarterId) setSelectedQuarterId(quarterId);
    if (buildingId) setSelectedBuildingId(buildingId);
    else setSelectedBuildingId(room.buildingId);
    setIsAssignModalOpen(true);
  };

  const handleOpenCreateBuildingForQuarter = (quarterId: string) => {
    setSelectedQuarterId(quarterId);
    handleOpenCreateBuilding();
  };

  const handleOpenCreateRoomForBuilding = (quarterId: string, buildingId: string) => {
    setSelectedQuarterId(quarterId);
    setSelectedBuildingId(buildingId);
    handleOpenCreateRoom();
  };

  const toggleQuarterExpand = (qid: string) => {
    setExpandedQuarters((prev) => ({ ...prev, [qid]: !prev[qid] }));
  };

  const toggleBuildingExpand = (bid: string) => {
    setExpandedBuildings((prev) => ({ ...prev, [bid]: !prev[bid] }));
  };

  const selectedAssociation = activeAssociation;
  const selectedQuarter = quarters.find((q) => q.id === selectedQuarterId);
  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);

  // --- QUARTER HANDLERS ---
  const handleOpenCreateQuarter = () => {
    setQuarterName("");
    setQuarterCity("Abomey-Calavi");
    setQuarterDesc("");
    setQuarterAssocId(activeAssociationId);
    setIsNewQuarterModalOpen(true);
  };

  const handleCreateQuarter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quarterName.trim()) return;

    setIsProcessing(true);
    try {
      const targetAssocId =
        quarterAssocId && isUuidV4(quarterAssocId)
          ? quarterAssocId
          : activeAssociationId && isUuidV4(activeAssociationId)
          ? activeAssociationId
          : "770e8400-e29b-41d4-a716-446655440099";
      const q = await apiService.residences.createQuarter({
        associationId: targetAssocId,
        name: quarterName.trim(),
        city: quarterCity,
        description: quarterDesc.trim() || `Campus résidentiel à ${quarterCity}`,
      });
      setQuarters((prev) => [q, ...prev]);
      setSelectedQuarterId(q.id);
      setIsNewQuarterModalOpen(false);
      showToast("Nouveau campus / quartier créé avec succès !");
      refreshStats();
    } catch {
      showToast("Erreur lors de la création du quartier.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenEditQuarter = () => {
    if (!selectedQuarter) return;
    setQuarterName(selectedQuarter.name);
    setQuarterCity(selectedQuarter.city);
    setQuarterDesc(selectedQuarter.description || "");
    setIsEditQuarterModalOpen(true);
  };

  const handleUpdateQuarter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuarter || !quarterName.trim()) return;

    setIsProcessing(true);
    try {
      const updated = await apiService.residences.updateQuarter(selectedQuarter.id, {
        name: quarterName.trim(),
        city: quarterCity,
        description: quarterDesc.trim(),
      });
      setQuarters((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      setIsEditQuarterModalOpen(false);
      showToast("Campus / Quartier mis à jour avec succès !");
    } catch {
      showToast("Erreur lors de la mise à jour du quartier.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteQuarter = async () => {
    if (!selectedQuarter) return;
    const ok = await confirm({
      title: "Supprimer le quartier",
      message: `Êtes-vous sûr de vouloir supprimer le quartier "${selectedQuarter.name}" ? Cette action est irréversible.`,
      confirmText: "Supprimer",
      cancelText: "Annuler",
      variant: "danger",
    });
    if (!ok) return;

    setIsProcessing(true);
    try {
      await apiService.residences.deleteQuarter(selectedQuarter.id);
      const remaining = quarters.filter((q) => q.id !== selectedQuarter.id);
      setQuarters(remaining);
      setSelectedQuarterId(remaining[0]?.id || "");
      showToast("Quartier supprimé avec succès !");
      refreshStats();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Impossible de supprimer ce quartier (il contient probablement des bâtiments).";
      showToast(message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- BUILDING HANDLERS ---
  const handleOpenCreateBuilding = () => {
    setBuildingName("");
    setBuildingAddress("");
    setBuildingLandlord("");
    setBuildingPhone("+229 ");
    setBuildingType(BUILDING_TYPES[0].id);
    setBuildingFloors(String(BUILDING_TYPES[0].defaultFloors));
    setBuildingError(null);
    setIsNewBuildingModalOpen(true);
  };

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuildingError(null);
    if (!buildingName.trim() || !selectedQuarterId) {
      setBuildingError("Veuillez renseigner le nom du bâtiment et le campus.");
      return;
    }

    const normalizedName = buildingName.trim().toLowerCase();
    const normalizedAddress = (buildingAddress.trim() || "Rue principale").toLowerCase();
    const duplicate = buildings.find(
      (b) =>
        b.name.trim().toLowerCase() === normalizedName &&
        b.address.trim().toLowerCase() === normalizedAddress
    );
    if (duplicate) {
      setBuildingError(
        `Un bâtiment nommé "${buildingName.trim()}" existe déjà à cette adresse. Veuillez indiquer un nom ou une adresse distincte.`
      );
      return;
    }

    const parsedFloors =
      buildingFloors !== "" && !isNaN(Number(buildingFloors))
        ? Math.max(0, Number(buildingFloors))
        : 0;

    setIsProcessing(true);
    try {
      const b = await apiService.residences.createBuilding({
        quarterId: selectedQuarterId,
        name: buildingName.trim(),
        address: buildingAddress.trim() || "Rue principale",
        landlordName: buildingLandlord.trim() || "Bailleur Partenaire",
        landlordPhone:
          buildingPhone.trim().length >= 8 ? buildingPhone.trim() : "+229 97 00 00 00",
        floorsCount: parsedFloors,
      });
      setBuildings((prev) => [b, ...prev]);
      setSelectedBuildingId(b.id);
      setIsNewBuildingModalOpen(false);

      // Enregistrer automatiquement la convention bailleur préalable à l'intégration
      try {
        const today = new Date();
        const year = today.getFullYear();
        const randNum = String(Math.floor(Math.random() * 900) + 100);
        const endDateObj = new Date(today);
        endDateObj.setFullYear(endDateObj.getFullYear() + 3);
        const effectiveUnits = Math.max(1, parsedFloors || 1);

        await apiService.residenceContracts.create({
          buildingId: b.id,
          buildingName: b.name,
          quarterId: selectedQuarterId,
          quarterName: selectedQuarter?.name || "Campus",
          quarterCity: selectedQuarter?.city || "Abomey-Calavi",
          associationId: activeAssociationId,
          associationName: activeAssociation?.name || "Association Active",
          landlordName: b.landlordName,
          landlordPhone: b.landlordPhone || "+229 97 00 00 00",
          conventionNumber: `CONV-BAILLEUR-${year}-${randNum}`,
          type: "MANDAT_GESTION",
          status: "ACTIVE",
          monthlyMasterRentXOF: effectiveUnits * 75000,
          guaranteeDepositXOF: effectiveUnits * 150000,
          startDate: today.toISOString().split("T")[0],
          endDate: endDateObj.toISOString().split("T")[0],
          renewalType: "TACITE_REDUCTION",
          roomsCovered: effectiveUnits * 4,
          clauses: [
            "Mandat d'exploitation exclusif consenti à l'association pour hébergement citoyen.",
            "Loyer cadre garanti versé au propriétaire le 5 de chaque mois.",
            "Entretien courant et maintenance préventive pris en charge par l'association.",
          ],
          complianceCheck: true,
        });
      } catch (convErr) {
        console.warn("Auto-creation of building convention skipped:", convErr);
      }

      showToast(`Le bâtiment "${b.name}" a été enregistré et conventionné avec succès !`, "success");
      refreshStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la création du bâtiment.";
      setBuildingError(msg);
      showToast(msg, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenEditBuilding = () => {
    if (!selectedBuilding) return;
    setBuildingName(selectedBuilding.name);
    setBuildingAddress(selectedBuilding.address);
    setBuildingLandlord(selectedBuilding.landlordName);
    setBuildingPhone(selectedBuilding.landlordPhone);
    setBuildingFloors(String(selectedBuilding.floorsCount));
    setBuildingError(null);
    setIsEditBuildingModalOpen(true);
  };

  const handleUpdateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuildingError(null);
    if (!selectedBuilding || !buildingName.trim()) {
      setBuildingError("Veuillez renseigner le nom du bâtiment.");
      return;
    }

    const normalizedName = buildingName.trim().toLowerCase();
    const normalizedAddress = buildingAddress.trim().toLowerCase();
    const duplicate = buildings.find(
      (b) =>
        b.id !== selectedBuilding.id &&
        b.name.trim().toLowerCase() === normalizedName &&
        b.address.trim().toLowerCase() === normalizedAddress
    );
    if (duplicate) {
      setBuildingError(
        `Un bâtiment nommé "${buildingName.trim()}" existe déjà à l'adresse "${buildingAddress.trim()}".`
      );
      return;
    }

    const parsedFloors =
      buildingFloors !== "" && !isNaN(Number(buildingFloors))
        ? Math.max(0, Number(buildingFloors))
        : 0;

    setIsProcessing(true);
    try {
      const updated = await apiService.residences.updateBuilding(selectedBuilding.id, {
        name: buildingName.trim(),
        address: buildingAddress.trim(),
        landlordName: buildingLandlord.trim(),
        landlordPhone: buildingPhone.trim(),
        floorsCount: parsedFloors,
      });
      setBuildings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setIsEditBuildingModalOpen(false);
      showToast(`Bâtiment "${updated.name}" mis à jour avec succès !`, "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la modification du bâtiment.";
      setBuildingError(msg);
      showToast(msg, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteBuilding = async () => {
    if (!selectedBuilding) return;
    const ok = await confirm({
      title: "Supprimer le bâtiment",
      message: `Êtes-vous sûr de vouloir supprimer le bâtiment "${selectedBuilding.name}" ? Cette action est irréversible.`,
      confirmText: "Supprimer",
      cancelText: "Annuler",
      variant: "danger",
    });
    if (!ok) return;

    setIsProcessing(true);
    try {
      await apiService.residences.deleteBuilding(selectedBuilding.id);
      const remaining = buildings.filter((b) => b.id !== selectedBuilding.id);
      setBuildings(remaining);
      setSelectedBuildingId(remaining[0]?.id || "");
      showToast("Bâtiment supprimé avec succès !");
      refreshStats();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Impossible de supprimer ce bâtiment (il contient probablement des chambres).";
      showToast(message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- ROOM HANDLERS ---
  const handleOpenCreateRoom = () => {
    setRoomNumber("");
    setRoomCapacity(String(ROOM_TYPES[0].defaultCapacity));
    setRoomFloor("0"); // 0 = Rez-de-chaussée
    setRoomType(ROOM_TYPES[0].label);
    setRoomRent(String(ROOM_TYPES[0].suggestedRentXOF));
    setRoomError(null);
    setIsNewRoomModalOpen(true);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoomError(null);
    if (!roomNumber.trim() || !selectedBuildingId) {
      setRoomError("Veuillez saisir un numéro ou nom de chambre.");
      return;
    }

    const normalizedRoom = roomNumber.trim().toLowerCase();
    const duplicate = rooms.find(
      (r) =>
        r.buildingId === selectedBuildingId &&
        r.roomNumber.trim().toLowerCase() === normalizedRoom
    );
    if (duplicate) {
      setRoomError(
        `Une chambre ou un local nommé "${roomNumber.trim()}" existe déjà dans ce bâtiment.`
      );
      return;
    }

    const floor =
      roomFloor !== "" && !isNaN(Number(roomFloor))
        ? Math.max(0, Number(roomFloor))
        : 0;

    setIsProcessing(true);
    try {
      const r = await apiService.residences.createRoom({
        buildingId: selectedBuildingId,
        roomNumber: roomNumber.trim(),
        capacity: Number(roomCapacity) || 1,
        floor: floor,
        type: roomType,
        monthlyRentXOF: Number(roomRent) || 35000,
      });
      setRooms((prev) => [r, ...prev]);
      setIsNewRoomModalOpen(false);
      showToast(`Chambre "${r.roomNumber}" ajoutée à l'inventaire avec succès !`, "success");
      refreshStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'ajout de la chambre.";
      setRoomError(msg);
      showToast(msg, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenEditRoom = (room: ApiRoom) => {
    setEditingRoom(room);
    setRoomNumber(room.roomNumber);
    setRoomCapacity(String(room.capacity));
    setRoomFloor(String(room.floor ?? 0));
    setRoomType(room.type || "Studio Individuel");
    setRoomRent(String(room.monthlyRentXOF || 35000));
    setRoomError(null);
  };

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoomError(null);
    if (!editingRoom || !roomNumber.trim()) {
      setRoomError("Veuillez renseigner le numéro de chambre.");
      return;
    }

    const normalizedRoom = roomNumber.trim().toLowerCase();
    const duplicate = rooms.find(
      (r) =>
        r.id !== editingRoom.id &&
        r.buildingId === editingRoom.buildingId &&
        r.roomNumber.trim().toLowerCase() === normalizedRoom
    );
    if (duplicate) {
      setRoomError(
        `Une chambre ou un local nommé "${roomNumber.trim()}" existe déjà dans ce bâtiment.`
      );
      return;
    }

    const floor =
      roomFloor !== "" && !isNaN(Number(roomFloor))
        ? Math.max(0, Number(roomFloor))
        : 0;

    setIsProcessing(true);
    try {
      const updated = await apiService.residences.updateRoom(editingRoom.id, {
        roomNumber: roomNumber.trim(),
        capacity: Number(roomCapacity) || 1,
        floor: floor,
        type: roomType,
        monthlyRentXOF: Number(roomRent) || 35000,
      });
      setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setEditingRoom(null);
      showToast(`Chambre "${updated.roomNumber}" modifiée avec succès !`, "success");
      refreshStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la mise à jour de la chambre.";
      setRoomError(msg);
      showToast(msg, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleRoomStatus = async (room: ApiRoom) => {
    if (room.status === "OCCUPIED") {
      showToast("Impossible de changer le statut d'une chambre avec un bail actif.", "error");
      return;
    }

    const nextStatus = room.status === "AVAILABLE" ? "MAINTENANCE" : "AVAILABLE";
    const label = nextStatus === "MAINTENANCE" ? "mise en maintenance" : "remise en service";

    try {
      const updated = await apiService.residences.updateRoomStatus(room.id, nextStatus);
      setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      showToast(`Chambre ${label} avec succès !`);
      refreshStats();
    } catch {
      showToast(`Erreur lors de la ${label}.`, "error");
    }
  };

  const handleDeleteRoom = async (room: ApiRoom) => {
    if (room.status === "OCCUPIED") {
      showToast("Impossible de supprimer une chambre occupée par un bail.", "error");
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
      setRooms((prev) => prev.filter((r) => r.id !== room.id));
      showToast("Chambre retirée de l'inventaire !");
      refreshStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la suppression de la chambre.";
      showToast(msg, "error");
    }
  };

  const handleTerminateOccupation = async (occupationId: string, roomId: string) => {
    const ok = await confirm({
      title: "Résilier le bail",
      message: "Êtes-vous sûr de vouloir résilier ce bail ? La chambre redeviendra immédiatement disponible.",
      confirmText: "Résilier le bail",
      cancelText: "Annuler",
      variant: "danger",
    });
    if (!ok) return;

    try {
      await apiService.residences.terminateOccupation(occupationId, roomId);
      showToast("Bail résilié avec succès ! La chambre est libre.");
      refreshRooms();
    } catch {
      showToast("Erreur lors de la résiliation du bail.", "error");
    }
  };

  // Filtered rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesStatus = statusFilter === "ALL" || room.status === statusFilter;
    const matchesSearch =
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.currentOccupation?.occupantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    return matchesStatus && matchesSearch;
  });

  const occupiedCount = rooms.filter((r) => r.status === "OCCUPIED").length;
  const occupancyRate = rooms.length > 0 ? ((occupiedCount / rooms.length) * 100).toFixed(1) : "0";

  // Filtered quarters for hierarchy view
  const filteredHierarchyQuarters = quarters.filter((q) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const matchesQ =
      q.name.toLowerCase().includes(term) ||
      q.city.toLowerCase().includes(term) ||
      (q.description && q.description.toLowerCase().includes(term));
    const qBuildings = allBuildings.filter((b) => b.quarterId === q.id);
    const matchesB = qBuildings.some(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        b.address.toLowerCase().includes(term) ||
        b.landlordName.toLowerCase().includes(term)
    );
    const qRooms = allRooms.filter((r) => qBuildings.some((b) => b.id === r.buildingId));
    const matchesR = qRooms.some((r) => r.roomNumber.toLowerCase().includes(term));
    return matchesQ || matchesB || matchesR;
  });

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

      {/* Scope Header with Active Association Context & Sub-Tabs */}
      <ResidenceScopeHeader
        title="Quartiers & Campus de Résidences"
        subtitle="Supervision du patrimoine immobilier, campus, pavillons et chambres"
        actionButton={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenCreateQuarter}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <PlusIcon className="size-3.5" />
              <span>Nouveau Campus</span>
            </button>

            <button
              type="button"
              disabled={!selectedQuarterId}
              onClick={handleOpenCreateBuilding}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <BuildingIcon className="size-3.5" />
              <span>Nouveau Bâtiment</span>
            </button>

            <button
              type="button"
              disabled={!selectedBuildingId}
              onClick={handleOpenCreateRoom}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-50 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300"
            >
              <BedIcon className="size-3.5" />
              <span>Ajouter Chambre</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAssignRoomId(undefined);
                setIsAssignModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-700 hover:shadow-md"
            >
              <PlusIcon className="size-4" />
              <span>Attribuer un Bail</span>
            </button>
          </div>
        }
      />

      {/* Global Statistics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Campus &amp; Quartiers</span>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">
            {stats ? stats.totalQuarters : quarters.length}
          </p>
          <span className="text-[11px] text-gray-400">Sites d&apos;hébergement</span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Bâtiments</span>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">
            {stats ? stats.totalBuildings : buildings.length}
          </p>
          <span className="text-[11px] text-gray-400">Pavillons enregistrés</span>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs dark:border-emerald-950 dark:bg-emerald-950/20">
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Chambres Libres</span>
          <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300">
            {stats ? stats.availableRooms : rooms.filter((r) => r.status === "AVAILABLE").length}
          </p>
          <span className="text-[11px] text-emerald-600/80">Prêtes pour bail</span>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-xs dark:border-blue-950 dark:bg-blue-950/20">
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Baux Actifs</span>
          <p className="mt-1 text-2xl font-black text-blue-700 dark:text-blue-300">
            {stats ? stats.activeOccupations : occupiedCount}
          </p>
          <span className="text-[11px] text-blue-600/80">Résidents sous contrat</span>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-xs dark:border-amber-950 dark:bg-amber-950/20">
          <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Taux d&apos;Occupation</span>
          <p className="mt-1 text-2xl font-black text-amber-700 dark:text-amber-300">
            {stats ? `${stats.occupancyRate}%` : `${occupancyRate}%`}
          </p>
          <span className="text-[11px] text-amber-600/80">
            {stats ? `${stats.maintenanceRooms} en travaux` : "Ensemble du parc"}
          </span>
        </div>
      </div>

      {/* View Switcher: Arborescence Universités vs Inventaire Filtré */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("HIERARCHY")}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              viewMode === "HIERARCHY"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <School className="size-4" />
            <span>Listing Universités &amp; Arborescence Bâtiments / Chambres</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("INVENTORY")}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
              viewMode === "INVENTORY"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <Grid className="size-4" />
            <span>Inventaire &amp; Gestion par Bâtiment</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <SearchIcon className="absolute left-3 top-2.5 size-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher université, bâtiment, chambre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-8 pr-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* 1. VUE HIERARCHIQUE : Universités -> Bâtiments -> Chambres */}
      {viewMode === "HIERARCHY" && (
        <div className="space-y-5">
          {isLoadingHierarchy && quarters.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900">
              Chargement du catalogue des universités et résidences...
            </div>
          ) : filteredHierarchyQuarters.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
              <School className="mx-auto size-10 text-gray-400" />
              <h4 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">
                Aucune université ou campus trouvé
              </h4>
              <p className="mt-1 text-xs text-gray-500">
                {searchTerm
                  ? "Aucun résultat ne correspond à votre recherche."
                  : "Enregistrez votre première université ou campus pour rattacher les pavillons et chambres."}
              </p>
              <button
                type="button"
                onClick={handleOpenCreateQuarter}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700"
              >
                <PlusIcon className="size-3.5" />
                <span>Nouveau Campus / Université</span>
              </button>
            </div>
          ) : (
            filteredHierarchyQuarters.map((quarter) => {
              const qBuildings = allBuildings.filter((b) => b.quarterId === quarter.id);
              const qRooms = allRooms.filter((r) => qBuildings.some((b) => b.id === r.buildingId));
              const qAvailRooms = qRooms.filter((r) => r.status === "AVAILABLE");
              const qOccupiedRooms = qRooms.filter((r) => r.status === "OCCUPIED");
              const qOccupancyRate =
                qRooms.length > 0
                  ? ((qOccupiedRooms.length / qRooms.length) * 100).toFixed(0)
                  : "0";
              const isQuarterExpanded = expandedQuarters[quarter.id] !== false;

              return (
                <div
                  key={quarter.id}
                  className="rounded-3xl border border-gray-200 bg-white shadow-xs overflow-hidden dark:border-gray-800 dark:bg-gray-900 transition"
                >
                  {/* University / Campus Card Header */}
                  <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800/80 bg-gradient-to-r from-gray-50/70 via-white to-gray-50/40 dark:from-gray-800/40 dark:via-gray-900 dark:to-gray-800/20">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="rounded-2xl bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 shrink-0 shadow-xs border border-brand-100 dark:border-brand-900/40">
                          <School className="size-6" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-base text-gray-900 dark:text-white">
                              {quarter.name}
                            </h3>
                            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200/50 dark:border-brand-800/50">
                              {quarter.city}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-2xl">
                            {quarter.description || "Campus universitaire et résidences étudiantes associées."}
                          </p>
                        </div>
                      </div>

                      {/* Badges & Actions */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 rounded-xl bg-gray-100 px-2.5 py-1 text-gray-700 font-semibold dark:bg-gray-800 dark:text-gray-300">
                            <Building2 className="size-3.5 text-gray-500" />
                            <span>{qBuildings.length} bâtiment{qBuildings.length > 1 ? "s" : ""}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-xl bg-gray-100 px-2.5 py-1 text-gray-700 font-semibold dark:bg-gray-800 dark:text-gray-300">
                            <Bed className="size-3.5 text-gray-500" />
                            <span>{qRooms.length} chambre{qRooms.length > 1 ? "s" : ""}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1 text-emerald-700 font-semibold dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/50">
                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                            <span>{qAvailRooms.length} libre{qAvailRooms.length > 1 ? "s" : ""}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-2.5 py-1 text-blue-700 font-semibold dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/50">
                            <BarChart3 className="size-3.5 text-blue-600" />
                            <span>{qOccupancyRate}% occupation</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 border-l border-gray-200 pl-2 sm:pl-3 dark:border-gray-700">
                          <button
                            type="button"
                            onClick={() => handleOpenCreateBuildingForQuarter(quarter.id)}
                            className="inline-flex items-center gap-1 rounded-xl bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-300"
                            title="Ajouter un bâtiment à cette université"
                          >
                            <BuildingIcon className="size-3.5" />
                            <span>+ Bâtiment</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedQuarterId(quarter.id);
                              handleOpenEditQuarter();
                            }}
                            className="rounded-xl p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Modifier ce campus"
                          >
                            <PencilIcon className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleQuarterExpand(quarter.id)}
                            className="rounded-xl p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition"
                            title={isQuarterExpanded ? "Réduire les bâtiments" : "Déplier les bâtiments"}
                          >
                            {isQuarterExpanded ? (
                              <ChevronDown className="size-4.5" />
                            ) : (
                              <ChevronRight className="size-4.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Associated Buildings List */}
                  {isQuarterExpanded && (
                    <div className="p-4 sm:p-5 space-y-4 bg-gray-50/40 dark:bg-gray-950/20">
                      {qBuildings.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900/60">
                          <Building2 className="mx-auto size-8 text-gray-400" />
                          <p className="mt-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Aucun bâtiment ou pavillon n&apos;est encore rattaché à &quot;{quarter.name}&quot;.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleOpenCreateBuildingForQuarter(quarter.id)}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                          >
                            <PlusIcon className="size-3.5" />
                            <span>Ajouter le premier bâtiment</span>
                          </button>
                        </div>
                      ) : (
                        qBuildings.map((building) => {
                          const bRooms = allRooms.filter((r) => r.buildingId === building.id);
                          const bAvailRooms = bRooms.filter((r) => r.status === "AVAILABLE");
                          const isBuildingExpanded = expandedBuildings[building.id] !== false;

                          return (
                            <div
                              key={building.id}
                              className="rounded-2xl border border-gray-200/90 bg-white shadow-2xs overflow-hidden dark:border-gray-800 dark:bg-gray-900"
                            >
                              {/* Building Header */}
                              <div className="p-3.5 sm:p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-gray-900">
                                <div className="flex items-start gap-3">
                                  <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 shrink-0">
                                    <BuildingIcon className="size-4.5" />
                                  </div>
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                        {building.name}
                                      </h4>
                                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                        {building.floorsCount === 0 ? "Plain-pied (RDC)" : `R+${building.floorsCount}`}
                                      </span>
                                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                        {bRooms.length} chambre{bRooms.length > 1 ? "s" : ""} ({bAvailRooms.length} libre{bAvailRooms.length > 1 ? "s" : ""})
                                      </span>
                                    </div>
                                    <p className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                                      <MapPin className="size-3 text-gray-400" />
                                      <span>{building.address}</span>
                                      <span className="mx-1">•</span>
                                      <User className="size-3 text-gray-400" />
                                      <span>Bailleur: {building.landlordName} ({building.landlordPhone})</span>
                                    </p>
                                  </div>
                                </div>

                                {/* Building Actions */}
                                <div className="flex items-center gap-2 self-end md:self-center">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCreateRoomForBuilding(quarter.id, building.id)}
                                    className="inline-flex items-center gap-1 rounded-xl border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300"
                                  >
                                    <BedIcon className="size-3" />
                                    <span>+ Chambre</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleBuildingExpand(building.id)}
                                    className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                  >
                                    <span>{isBuildingExpanded ? "Masquer chambres" : "Voir chambres"}</span>
                                    {isBuildingExpanded ? (
                                      <ChevronDown className="size-3.5" />
                                    ) : (
                                      <ChevronRight className="size-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Associated Rooms Grid */}
                              {isBuildingExpanded && (
                                <div className="p-3.5 sm:p-4 bg-gray-50/30 dark:bg-gray-950/40">
                                  {bRooms.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900/50">
                                      <p className="text-xs text-gray-500">
                                        Aucune chambre configurée dans ce bâtiment.
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenCreateRoomForBuilding(quarter.id, building.id)}
                                        className="mt-2 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                                      >
                                        + Ajouter une première chambre
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                      {bRooms.map((room) => {
                                        const occ = room.currentOccupation;
                                        return (
                                          <div
                                            key={room.id}
                                            className={`flex flex-col justify-between rounded-xl border p-3 transition shadow-2xs ${
                                              room.status === "AVAILABLE"
                                                ? "border-emerald-200 bg-emerald-50/20 hover:border-emerald-300 dark:border-emerald-900/40 dark:bg-emerald-950/10"
                                                : room.status === "OCCUPIED"
                                                ? "border-blue-200 bg-white hover:border-blue-300 dark:border-blue-900/40 dark:bg-gray-900"
                                                : "border-amber-200 bg-amber-50/20 dark:border-amber-900/40 dark:bg-amber-950/10"
                                            }`}
                                          >
                                            <div>
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                  <span className="font-black text-sm text-gray-900 dark:text-white">
                                                    {room.roomNumber}
                                                  </span>
                                                  <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                    {room.floor === 0 ? "RDC" : `Étage ${room.floor}`}
                                                  </span>
                                                </div>
                                                <span
                                                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                    room.status === "AVAILABLE"
                                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                                      : room.status === "OCCUPIED"
                                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                                  }`}
                                                >
                                                  {room.status === "AVAILABLE"
                                                    ? "Disponible"
                                                    : room.status === "OCCUPIED"
                                                    ? "Occupée"
                                                    : "En travaux"}
                                                </span>
                                              </div>

                                              <div className="mt-2 space-y-1 text-[11px] text-gray-600 dark:text-gray-400">
                                                <div className="flex justify-between">
                                                  <span>Type :</span>
                                                  <span className="font-semibold text-gray-900 dark:text-white">
                                                    {room.type || "Studio"}
                                                  </span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span>Capacité :</span>
                                                  <span className="font-semibold text-gray-900 dark:text-white">
                                                    {room.capacity} lit{room.capacity > 1 ? "s" : ""}
                                                  </span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span>Loyer :</span>
                                                  <span className="font-bold text-brand-600 dark:text-brand-400">
                                                    {(room.monthlyRentXOF || 35000).toLocaleString("fr-FR")} FCFA/mois
                                                  </span>
                                                </div>
                                                {occ && (
                                                  <div className="mt-2 rounded-lg bg-blue-50/70 p-2 text-[10px] text-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                                                    <span className="font-bold flex items-center gap-1">
                                                      <User className="size-3 text-blue-600 dark:text-blue-400" />
                                                      <span>{occ.occupantName}</span>
                                                    </span>
                                                    <span className="text-[9px] text-blue-700/80 dark:text-blue-400/80">
                                                      Bail actif depuis {new Date(occ.startDate).toLocaleDateString("fr-FR")}
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>

                                            {/* Room card action: Auto-fill assign room directly */}
                                            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-1.5">
                                              {room.status === "AVAILABLE" ? (
                                                <button
                                                  type="button"
                                                  onClick={() => handleAssignRoom(room, quarter.id, building.id)}
                                                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-brand-700"
                                                >
                                                  <Key className="size-3" />
                                                  <span>Attribuer cette chambre</span>
                                                </button>
                                              ) : occ ? (
                                                <div className="flex items-center gap-1.5 w-full justify-between">
                                                  <button
                                                    type="button"
                                                    onClick={() => setSelectedOccupantRoom(room)}
                                                    className="rounded-lg bg-brand-50 px-2 py-1 text-[10px] font-bold text-brand-700 hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-300"
                                                  >
                                                    Occupant
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleTerminateOccupation(occ.id, room.id)}
                                                    className="rounded-lg border border-rose-200 px-2 py-1 text-[10px] font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400"
                                                  >
                                                    Résilier
                                                  </button>
                                                </div>
                                              ) : (
                                                <button
                                                  type="button"
                                                  onClick={() => handleToggleRoomStatus(room)}
                                                  className="w-full rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 text-center"
                                                >
                                                  Rétablir disponibilité
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. VUE INVENTAIRE FILTRÉ */}
      {viewMode === "INVENTORY" && (
        <>
          {/* Quarter & Building Selectors with Edit/Delete Actions */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Quarter Box */}
            <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Campus / Quartier Actif ({quarters.length})
                  </label>
                  <div className="flex items-center gap-1">
                    {selectedQuarter && (
                      <>
                        <button
                          type="button"
                          title="Modifier ce quartier"
                          onClick={handleOpenEditQuarter}
                          className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                        >
                          <PencilIcon className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Supprimer ce quartier"
                          disabled={isProcessing}
                          onClick={handleDeleteQuarter}
                          className="rounded-lg p-1 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30"
                        >
                          <TrashIcon className="size-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
            <Select2
              value={selectedQuarterId}
              onChange={(e) => setSelectedQuarterId(e.target.value)}
              disabled={quarters.length === 0}
              className="mt-2 w-full"
            >
              {quarters.length === 0 ? (
                <option value="">Aucun campus pour cette association</option>
              ) : (
                quarters.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.name} ({q.city})
                  </option>
                ))
              )}
            </Select2>
          </div>
          {selectedQuarter ? (
            <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 truncate">
              {selectedQuarter.description || "Aucune description renseignée"}
            </p>
          ) : (
            <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">
              Aucun campus enregistré. Créez-en un avec le bouton ci-dessus.
            </p>
          )}
        </div>

        {/* Building Box */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Bâtiment / Pavillon
              </label>
              <div className="flex items-center gap-1">
                {selectedBuilding && (
                  <>
                    <button
                      type="button"
                      title="Modifier ce bâtiment"
                      onClick={handleOpenEditBuilding}
                      className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    >
                      <PencilIcon className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Supprimer ce bâtiment"
                      disabled={isProcessing}
                      onClick={handleDeleteBuilding}
                      className="rounded-lg p-1 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30"
                    >
                      <TrashIcon className="size-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <Select2
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(e.target.value)}
              disabled={buildings.length === 0}
              className="mt-2 w-full"
            >
              {buildings.length === 0 ? (
                <option value="">Aucun bâtiment dans ce quartier</option>
              ) : (
                buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.floorsCount} étages) — {b.address}
                  </option>
                ))
              )}
            </Select2>
          </div>
          {selectedBuilding && (
            <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 truncate">
              Bailleur : {selectedBuilding.landlordName} • Tél : {selectedBuilding.landlordPhone}
            </p>
          )}
        </div>

        {/* Local Occupancy Rate */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Occupation Bâtiment Sélectionné
            </span>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {occupancyRate}% Occupé
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {rooms.length - occupiedCount} libres sur {rooms.length}
              </span>
            </div>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === "ALL"
                ? "bg-brand-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            Toutes les chambres ({rooms.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("AVAILABLE")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === "AVAILABLE"
                ? "bg-emerald-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            Disponibles ({rooms.filter((r) => r.status === "AVAILABLE").length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("OCCUPIED")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === "OCCUPIED"
                ? "bg-brand-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            Occupées ({rooms.filter((r) => r.status === "OCCUPIED").length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("MAINTENANCE")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === "MAINTENANCE"
                ? "bg-amber-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            En Travaux ({rooms.filter((r) => r.status === "MAINTENANCE").length})
          </button>
        </div>

        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <SearchIcon className="size-3.5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher numéro, locataire..."
            className="h-9 w-full sm:w-64 rounded-xl border border-gray-200 bg-gray-50/50 pl-8 pr-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <BedIcon className="mx-auto size-10 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">
            Aucune chambre trouvée pour ce bâtiment
          </h3>
          <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
            Ajoutez de nouvelles chambres physiques pour commencer à attribuer des baux.
          </p>
          <button
            type="button"
            disabled={!selectedBuildingId}
            onClick={handleOpenCreateRoom}
            className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 disabled:opacity-50"
          >
             Ajouter une Chambre
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => {
            const occ = room.currentOccupation;

            return (
              <div
                key={room.id}
                className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
                        <BedIcon className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                          {room.roomNumber}
                        </h3>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          Étage {room.floor || 1} • {room.type || "Studio"} • {room.capacity} lit(s) • <span className="font-medium text-blue-600 dark:text-blue-400">Surplus admis</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {room.status === "AVAILABLE" && (
                        <Badge variant="light" color="success" size="sm">
                          Disponible
                        </Badge>
                      )}
                      {room.status === "OCCUPIED" && (
                        <Badge variant="light" color="primary" size="sm">
                          Occupée
                        </Badge>
                      )}
                      {room.status === "MAINTENANCE" && (
                        <Badge variant="light" color="warning" size="sm">
                          Travaux
                        </Badge>
                      )}

                      {/* Quick action buttons for Room */}
                      <button
                        type="button"
                        title="Modifier cette chambre"
                        onClick={() => handleOpenEditRoom(room)}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                      >
                        <PencilIcon className="size-3.5" />
                      </button>

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

                  {/* Tenant info or price */}
                  <div className="mt-4 rounded-xl bg-gray-50/70 p-3 text-xs dark:bg-gray-800/40">
                    {occ ? (
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                          Locataire sous bail actif :
                        </span>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {occ.occupantName || "Résident Citoyen"}
                        </p>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400">
                          Tél : {occ.occupantPhone || "Non renseigné"} • Début : {new Date(occ.startDate).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                          Conditions locatives :
                        </span>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {(room.monthlyRentXOF || 35000).toLocaleString("fr-FR")} FCFA / mois
                        </p>
                        <p className={`text-[11px] font-medium flex items-center gap-1 ${
                          room.status === "AVAILABLE"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}>
                          {room.status === "AVAILABLE" ? (
                            <>
                              <Check className="size-3.5" />
                              <span>Prête pour emménagement immédiat</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="size-3.5" />
                              <span>Indisponible temporairement</span>
                            </>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {(room.monthlyRentXOF || 35000).toLocaleString("fr-FR")} FCFA
                    </span>

                    {/* Toggle Maintenance quick action */}
                    {room.status !== "OCCUPIED" && (
                      <button
                        type="button"
                        onClick={() => handleToggleRoomStatus(room)}
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold transition ${
                          room.status === "AVAILABLE"
                            ? "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                        }`}
                      >
                        <WrenchIcon className="size-3" />
                        <span>{room.status === "AVAILABLE" ? "Travaux" : "Rétablir"}</span>
                      </button>
                    )}
                  </div>

                  {room.status === "AVAILABLE" ? (
                    <button
                      type="button"
                      onClick={() => handleAssignRoom(room)}
                      className="rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-700"
                    >
                      Attribuer cette chambre
                    </button>
                  ) : occ ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedOccupantRoom(room)}
                        className="rounded-xl bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700 hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-300"
                      >
                        Détails occupant
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTerminateOccupation(occ.id, room.id)}
                        className="rounded-xl border border-rose-200 px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400"
                      >
                        Résilier
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-amber-600 font-medium">En réfection</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {/* Modal: Occupant Details */}
      <OccupantDetailsModal
        isOpen={!!selectedOccupantRoom}
        onClose={() => setSelectedOccupantRoom(null)}
        room={selectedOccupantRoom}
        occupation={selectedOccupantRoom?.currentOccupation}
        onLeaseTerminated={refreshRooms}
      />

      {/* Modal 1: Assign Room Occupation */}
      <AssignRoomOccupationModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setAssignRoomId(undefined);
        }}
        initialAssociationId={activeAssociationId}
        initialQuarterId={selectedQuarterId}
        initialBuildingId={selectedBuildingId}
        initialRoomId={assignRoomId}
        onSuccess={() => {
          setAssignRoomId(undefined);
          refreshRooms();
          loadAllHierarchyData();
        }}
      />

      {/* Modal 2: Create Quarter */}
      {isNewQuarterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Créer un Nouveau Campus / Quartier Résidentiel
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Rattachement territorial pour hébergement étudiant ou résidentiel.
            </p>

            <form onSubmit={handleCreateQuarter} className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl border border-brand-200 bg-brand-50/80 p-2.5 dark:border-brand-900/50 dark:bg-brand-950/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                  Association Gestionnaire (Verrouillée)
                </span>
                <p className="font-bold text-xs text-gray-900 dark:text-white mt-0.5">
                  {activeAssociation?.name} {activeAssociation?.acronym ? `(${activeAssociation.acronym})` : ""}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  Ce campus sera rattaché au patrimoine de votre association active.
                </p>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Nom du Campus / Quartier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Campus Zogbadjè Résidences"
                  value={quarterName}
                  onChange={(e) => setQuarterName(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Commune / Ville *
                </label>
                <Select2
                  value={quarterCity}
                  onChange={(e) => setQuarterCity(e.target.value)}
                  className="mt-1 w-full"
                >
                  <option>Abomey-Calavi</option>
                  <option>Cotonou</option>
                  <option>Porto-Novo</option>
                  <option>Parakou</option>
                </Select2>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes, situation géographique..."
                  value={quarterDesc}
                  onChange={(e) => setQuarterDesc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsNewQuarterModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="rounded-xl bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {isProcessing ? "Création..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2b: Edit Quarter */}
      {isEditQuarterModalOpen && selectedQuarter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Modifier le Campus / Quartier
            </h3>

            <form onSubmit={handleUpdateQuarter} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Nom du Campus / Quartier *
                </label>
                <input
                  type="text"
                  required
                  value={quarterName}
                  onChange={(e) => setQuarterName(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Commune / Ville *
                </label>
                <Select2
                  value={quarterCity}
                  onChange={(e) => setQuarterCity(e.target.value)}
                  className="mt-1 w-full"
                >
                  <option>Abomey-Calavi</option>
                  <option>Cotonou</option>
                  <option>Porto-Novo</option>
                  <option>Parakou</option>
                </Select2>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={quarterDesc}
                  onChange={(e) => setQuarterDesc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsEditQuarterModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="rounded-xl bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {isProcessing ? "Mise à jour..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Create Building */}
      {isNewBuildingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Enregistrer un Nouveau Bâtiment
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Déclaration du bâtiment physique dans &quot;{selectedQuarter?.name}&quot;.
            </p>

            <form onSubmit={handleCreateBuilding} className="mt-4 space-y-3 text-xs">
              {buildingError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
                  <span className="flex-1 font-medium">{buildingError}</span>
                </div>
              )}

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Type de Bâtiment / Résidence *
                </label>
                <Select2
                  value={buildingType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBuildingType(val);
                    const def = BUILDING_TYPES.find((bt) => bt.id === val);
                    if (def) {
                      setBuildingFloors(String(def.defaultFloors));
                    }
                  }}
                  className="mt-1 w-full"
                >
                  {BUILDING_TYPES.map((bt) => (
                    <option key={bt.id} value={bt.id}>
                      {bt.label}
                    </option>
                  ))}
                </Select2>
                {BUILDING_TYPES.find((bt) => bt.id === buildingType) && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                    <Info className="size-3.5 text-brand-600 shrink-0" />
                    <span>{BUILDING_TYPES.find((bt) => bt.id === buildingType)?.description}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Nom du Bâtiment / Pavillon *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pavillon Baobab"
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Adresse Complète *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rue des Palmiers, Lot 45"
                  value={buildingAddress}
                  onChange={(e) => setBuildingAddress(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Propriétaire / Bailleur
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: M. Jean Bio"
                    value={buildingLandlord}
                    onChange={(e) => setBuildingLandlord(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Téléphone Bailleur
                  </label>
                  <input
                    type="text"
                    value={buildingPhone}
                    onChange={(e) => setBuildingPhone(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Nombre d&apos;Étages
                  </label>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {Number(buildingFloors) === 0 ? "Plain-pied (Rez-de-chaussée seul)" : `R+${buildingFloors}`}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="30"
                  placeholder="0 pour rez-de-chaussée seul"
                  value={buildingFloors}
                  onChange={(e) => setBuildingFloors(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <p className="mt-1 text-[10px] text-gray-500">
                  Indiquez <strong>0</strong> si le bâtiment n&apos;est pas en étage (plain-pied / rez-de-chaussée uniquement).
                </p>
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsNewBuildingModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="rounded-xl bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {isProcessing ? "Création..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3b: Edit Building */}
      {isEditBuildingModalOpen && selectedBuilding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Modifier le Bâtiment &quot;{selectedBuilding.name}&quot;
            </h3>

            <form onSubmit={handleUpdateBuilding} className="mt-4 space-y-3 text-xs">
              {buildingError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
                  <span className="flex-1 font-medium">{buildingError}</span>
                </div>
              )}

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Nom du Bâtiment *
                </label>
                <input
                  type="text"
                  required
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Adresse Complète *
                </label>
                <input
                  type="text"
                  required
                  value={buildingAddress}
                  onChange={(e) => setBuildingAddress(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Bailleur
                  </label>
                  <input
                    type="text"
                    value={buildingLandlord}
                    onChange={(e) => setBuildingLandlord(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={buildingPhone}
                    onChange={(e) => setBuildingPhone(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Nombre d&apos;Étages
                  </label>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {Number(buildingFloors) === 0 ? "Plain-pied (Rez-de-chaussée seul)" : `R+${buildingFloors}`}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={buildingFloors}
                  onChange={(e) => setBuildingFloors(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <p className="mt-1 text-[10px] text-gray-500">
                  Indiquez <strong>0</strong> si le bâtiment n&apos;a pas d&apos;étage (plain-pied / rez-de-chaussée uniquement).
                </p>
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsEditBuildingModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="rounded-xl bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {isProcessing ? "Mise à jour..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Create Room */}
      {isNewRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Ajouter une Chambre dans {selectedBuilding?.name || "le Bâtiment"}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Définition de l&apos;unité physique, de la capacité et du loyer mensuel.
            </p>

            <form onSubmit={handleCreateRoom} className="mt-4 space-y-3 text-xs">
              {roomError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
                  <span className="flex-1 font-medium">{roomError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Numéro de Chambre *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Chambre 301"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Capacité (Lits) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={roomCapacity}
                    onChange={(e) => setRoomCapacity(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-gray-700 dark:text-gray-300">
                      Étage
                    </label>
                    <span className="text-[10px] text-gray-500">
                      {Number(roomFloor) === 0 ? "RDC" : `Étage ${roomFloor}`}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    placeholder="0 pour RDC"
                    value={roomFloor}
                    onChange={(e) => setRoomFloor(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Type de Chambre
                  </label>
                  <Select2
                    value={roomType}
                    onChange={(e) => {
                      const selected = ROOM_TYPES.find((rt) => rt.label === e.target.value);
                      setRoomType(e.target.value);
                      if (selected) {
                        setRoomCapacity(String(selected.defaultCapacity));
                        setRoomRent(String(selected.suggestedRentXOF));
                      }
                    }}
                    className="mt-1 w-full"
                  >
                    {ROOM_TYPES.map((rt) => (
                      <option key={rt.id} value={rt.label}>
                        {rt.label} ({rt.defaultCapacity} lit{rt.defaultCapacity > 1 ? "s" : ""})
                      </option>
                    ))}
                  </Select2>
                </div>
              </div>

              {/* Solidarity surplus note */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Check className="size-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Surplus solidaire et d&apos;urgence autorisé</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-blue-700/90 dark:text-blue-300/90">
                  Une chambre configurée pour {roomCapacity || 4} occupants n&apos;est jamais bloquée : l&apos;accueil d&apos;occupants en surplus en cas de besoin reste pleinement accepté lors de l&apos;attribution.
                </p>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Loyer Mensuel Estimé (FCFA) *
                </label>
                <input
                  type="number"
                  required
                  step="1000"
                  value={roomRent}
                  onChange={(e) => setRoomRent(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsNewRoomModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="rounded-xl bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {isProcessing ? "Ajout..." : "Ajouter la Chambre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4b: Edit Room */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Modifier la Chambre &quot;{editingRoom.roomNumber}&quot;
            </h3>

            <form onSubmit={handleUpdateRoom} className="mt-4 space-y-3 text-xs">
              {roomError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
                  <span className="flex-1 font-medium">{roomError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Numéro de Chambre *
                  </label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Capacité (Lits) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={roomCapacity}
                    onChange={(e) => setRoomCapacity(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-gray-700 dark:text-gray-300">
                      Étage
                    </label>
                    <span className="text-[10px] text-gray-500">
                      {Number(roomFloor) === 0 ? "RDC" : `Étage ${roomFloor}`}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={roomFloor}
                    onChange={(e) => setRoomFloor(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Type de Chambre
                  </label>
                  <Select2
                    value={roomType}
                    onChange={(e) => {
                      const selected = ROOM_TYPES.find((rt) => rt.label === e.target.value);
                      setRoomType(e.target.value);
                      if (selected) {
                        setRoomCapacity(String(selected.defaultCapacity));
                        setRoomRent(String(selected.suggestedRentXOF));
                      }
                    }}
                    className="mt-1 w-full"
                  >
                    {ROOM_TYPES.map((rt) => (
                      <option key={rt.id} value={rt.label}>
                        {rt.label} ({rt.defaultCapacity} lit{rt.defaultCapacity > 1 ? "s" : ""})
                      </option>
                    ))}
                  </Select2>
                </div>
              </div>

              {/* Solidarity surplus note */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Check className="size-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Surplus solidaire et d&apos;urgence autorisé</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-blue-700/90 dark:text-blue-300/90">
                  Une chambre configurée pour {roomCapacity || 4} occupants n&apos;est jamais bloquée : l&apos;accueil d&apos;occupants en surplus en cas de besoin reste pleinement accepté lors de l&apos;attribution.
                </p>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Loyer Mensuel Estimé (FCFA) *
                </label>
                <input
                  type="number"
                  required
                  step="1000"
                  value={roomRent}
                  onChange={(e) => setRoomRent(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="rounded-xl bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {isProcessing ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
