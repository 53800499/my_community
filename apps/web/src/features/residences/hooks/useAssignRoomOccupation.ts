import { useState, useEffect, useCallback, useMemo } from "react";
import { residenceApiService } from "../services/residence-api.service";
import { associationGovernanceApiService } from "@/features/associations";
import { userApiService, ApiUserSummary } from "@/features/users";
import {
  ApiQuarter,
  ApiBuilding,
  ApiRoom,
  ApiOccupation,
} from "../types/residence-api.types";
import { ApiAssociation } from "@/features/associations";

export interface AssignOccupationFormData {
  tenantName: string;
  tenantPhone: string;
  monthlyRentXOF: string;
  depositXOF: string;
  startDate: string;
  endDate: string;
  allowSurplus?: boolean;
  surplusReason?: string;
}

export interface UseAssignRoomOccupationOptions {
  isOpen: boolean;
  initialQuarterId?: string;
  initialBuildingId?: string;
  initialRoomId?: string;
}

export interface UseAssignRoomOccupationReturn {
  associations: ApiAssociation[];
  quarters: ApiQuarter[];
  buildings: ApiBuilding[];
  rooms: ApiRoom[];
  users: ApiUserSummary[];
  selectedQuarterId: string;
  setSelectedQuarterId: (val: string) => void;
  selectedBuildingId: string;
  setSelectedBuildingId: (val: string) => void;
  selectedRoomId: string;
  setSelectedRoomId: (val: string) => void;
  selectedUserId: string;
  setSelectedUserId: (val: string) => void;
  formData: AssignOccupationFormData;
  setFormData: React.Dispatch<React.SetStateAction<AssignOccupationFormData>>;
  isSubmitting: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  isSuccess: boolean;
  filteredBuildings: ApiBuilding[];
  filteredRooms: ApiRoom[];
  submitAssignment: () => Promise<ApiOccupation>;
}

/**
 * Custom Hook orchestrant l'affectation d'un bail citoyen dans une chambrée (SRP, DIP)
 */
export function useAssignRoomOccupation({
  isOpen,
  initialQuarterId,
  initialBuildingId,
  initialRoomId,
}: UseAssignRoomOccupationOptions): UseAssignRoomOccupationReturn {
  const [associations, setAssociations] = useState<ApiAssociation[]>([]);
  const [quarters, setQuarters] = useState<ApiQuarter[]>([]);
  const [buildings, setBuildings] = useState<ApiBuilding[]>([]);
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [users, setUsers] = useState<ApiUserSummary[]>([]);

  const [selectedQuarterId, setSelectedQuarterId] = useState(initialQuarterId || "");
  const [selectedBuildingId, setSelectedBuildingId] = useState(initialBuildingId || "");
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId || "");
  const [selectedUserId, setSelectedUserId] = useState("");

  const [formData, setFormData] = useState<AssignOccupationFormData>({
    tenantName: "",
    tenantPhone: "+229 ",
    monthlyRentXOF: "35000",
    depositXOF: "70000",
    startDate: "",
    endDate: "",
    allowSurplus: true,
    surplusReason: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Synchronisation des paramètres initiaux lors de l'ouverture
  useEffect(() => {
    if (isOpen) {
      if (initialRoomId) setSelectedRoomId(initialRoomId);
      if (initialBuildingId) setSelectedBuildingId(initialBuildingId);
      if (initialQuarterId) setSelectedQuarterId(initialQuarterId);
    }
  }, [isOpen, initialRoomId, initialBuildingId, initialQuarterId]);

  // Initialisation différée des dates (sécurité prerender Next.js)
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split("T")[0];
      const nextYear = new Date(Date.now() + 86400000 * 365).toISOString().split("T")[0];
      setFormData((prev) => ({
        ...prev,
        startDate: prev.startDate || today,
        endDate: prev.endDate || nextYear,
      }));
    }
  }, [isOpen]);

  // Chargement des dépendances réseau (DIP)
  useEffect(() => {
    if (isOpen) {
      Promise.all([
        associationGovernanceApiService.associations.list(),
        residenceApiService.residences.getQuarters(),
        residenceApiService.residences.getBuildings(),
        residenceApiService.residences.getRooms(),
        userApiService.list(),
      ]).then(([assocs, qList, bList, rList, uList]) => {
        setAssociations(assocs);
        setQuarters(qList);
        setBuildings(bList);
        setRooms(rList);
        setUsers(uList);

        if (initialRoomId) {
          const room = rList.find((r) => r.id === initialRoomId);
          if (room) {
            setSelectedRoomId(room.id);
            if (room.buildingId) setSelectedBuildingId(room.buildingId);
            const b = bList.find((bld) => bld.id === room.buildingId);
            if (b?.quarterId) setSelectedQuarterId(b.quarterId);
            const rent = room.monthlyRentXOF || 35000;
            setFormData((prev) => ({
              ...prev,
              monthlyRentXOF: String(rent),
              depositXOF: String(rent * 2),
            }));
          }
        } else if (!selectedQuarterId && qList.length > 0) {
          setSelectedQuarterId(qList[0].id);
        }
      });
    }
  }, [isOpen, initialRoomId]);

  // Auto-remplissage dynamique lorsque la chambre sélectionnée change
  useEffect(() => {
    if (!selectedRoomId || rooms.length === 0) return;
    const room = rooms.find((r) => r.id === selectedRoomId);
    if (!room) return;

    if (room.buildingId && selectedBuildingId !== room.buildingId) {
      setSelectedBuildingId(room.buildingId);
    }
    const b = buildings.find((bld) => bld.id === room.buildingId);
    if (b?.quarterId && selectedQuarterId !== b.quarterId) {
      setSelectedQuarterId(b.quarterId);
    }

    const rent = room.monthlyRentXOF || 35000;
    setFormData((prev) => ({
      ...prev,
      monthlyRentXOF: String(rent),
      depositXOF: String(rent * 2),
    }));
  }, [selectedRoomId, rooms, buildings]);

  const filteredBuildings = useMemo(() => {
    return buildings.filter(
      (b) => !selectedQuarterId || b.quarterId === selectedQuarterId
    );
  }, [buildings, selectedQuarterId]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(
      (r) => !selectedBuildingId || r.buildingId === selectedBuildingId
    );
  }, [rooms, selectedBuildingId]);

  const submitAssignment = useCallback(async (): Promise<ApiOccupation> => {
    setError(null);

    if (!selectedRoomId) {
      const msg = "Veuillez sélectionner une chambre à attribuer.";
      setError(msg);
      throw new Error(msg);
    }

    if (!formData.tenantName.trim()) {
      const msg = "Veuillez renseigner le nom complet de l'occupant.";
      setError(msg);
      throw new Error(msg);
    }

    const defaultAssocId = associations[0]?.id || "770e8400-e29b-41d4-a716-446655440099";
    const occupantId = selectedUserId || `user-${Date.now()}`;

    setIsSubmitting(true);
    try {
      const res = await residenceApiService.residences.assignOccupation({
        roomId: selectedRoomId,
        occupantUserId: occupantId,
        occupantName: formData.tenantName.trim(),
        occupantPhone: formData.tenantPhone.trim(),
        associationId: defaultAssocId,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        allowSurplus: formData.allowSurplus ?? true,
        surplusReason: formData.surplusReason || undefined,
      });

      setIsSuccess(true);
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'attribution du logement.";
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedRoomId, formData, associations, selectedUserId]);

  return {
    associations,
    quarters,
    buildings,
    rooms,
    users,
    selectedQuarterId,
    setSelectedQuarterId,
    selectedBuildingId,
    setSelectedBuildingId,
    selectedRoomId,
    setSelectedRoomId,
    selectedUserId,
    setSelectedUserId,
    formData,
    setFormData,
    isSubmitting,
    error,
    setError,
    isSuccess,
    filteredBuildings,
    filteredRooms,
    submitAssignment,
  };
}
