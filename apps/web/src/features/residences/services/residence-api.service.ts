import {
  apiClient,
  STORAGE_KEYS,
  getLocalState,
  setLocalState,
  isUuidV4,
  generateUuid,
} from "@/lib/api-client";
import {
  ApiQuarter,
  ApiBuilding,
  ApiRoom,
  ApiOccupation,
  ApiResidenceStats,
  ApiResident,
  ApiBuildingConvention,
  ApiResidenceAdmissionRules,
  ApiResidentDelegateContract,
} from "../types/residence-api.types";

export const residenceApiService = {
  // 4. Résidences & Baux (Niveau 3 - ADR-010)
  residences: {
    async getQuarters(associationId?: string): Promise<ApiQuarter[]> {
      const stored = getLocalState<ApiQuarter[]>(STORAGE_KEYS.QUARTERS, []);
      const validAssocUuid = isUuidV4(associationId) ? associationId!.trim() : undefined;
      try {
        const query = validAssocUuid ? `?associationId=${validAssocUuid}` : "";
        const res = await apiClient.fetch<ApiQuarter[]>(`residences/quarters${query}`);
        if (res && Array.isArray(res)) {
          const map = new Map<string, ApiQuarter>();
          stored.forEach((q) => map.set(q.id, q));
          res.forEach((q) => map.set(q.id, q));
          const merged = Array.from(map.values());
          setLocalState(STORAGE_KEYS.QUARTERS, merged);
          return associationId ? merged.filter((q) => q.associationId === associationId) : merged;
        }
      } catch {
        // Backend offline or unreachable: fallback to local cache
      }
      return associationId ? stored.filter((q) => q.associationId === associationId) : stored;
    },

    async createQuarter(data: {
      associationId: string;
      name: string;
      city: string;
      description?: string;
    }): Promise<ApiQuarter> {
      const quarters = await this.getQuarters();
      let res: ApiQuarter | undefined;
      try {
        res = await apiClient.fetch<ApiQuarter>("residences/quarters", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch (err) {
        console.warn("apiClient.fetch residences/quarters fallback to local:", err);
      }
      const createdQuarter: ApiQuarter = res || {
        id: generateUuid(),
        associationId: data.associationId,
        name: data.name,
        city: data.city,
        description: data.description || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLocalState(STORAGE_KEYS.QUARTERS, [createdQuarter, ...quarters]);
      return createdQuarter;
    },

    async getBuildings(quarterId?: string): Promise<ApiBuilding[]> {
      const stored = getLocalState<ApiBuilding[]>(STORAGE_KEYS.BUILDINGS, []);
      const validQuarterUuid = isUuidV4(quarterId) ? quarterId!.trim() : undefined;
      try {
        const query = validQuarterUuid ? `?quarterId=${validQuarterUuid}` : "";
        const res = await apiClient.fetch<ApiBuilding[]>(`residences/buildings${query}`);
        if (res && Array.isArray(res)) {
          const map = new Map<string, ApiBuilding>();
          stored.forEach((b) => map.set(b.id, b));
          res.forEach((b) => map.set(b.id, b));
          const merged = Array.from(map.values());
          setLocalState(STORAGE_KEYS.BUILDINGS, merged);
          return quarterId && quarterId !== "all"
            ? merged.filter((b) => b.quarterId === quarterId)
            : merged;
        }
      } catch {
        // Backend offline or unreachable: fallback to local cache
      }
      return quarterId && quarterId !== "all" ? stored.filter((b) => b.quarterId === quarterId) : stored;
    },

    async createBuilding(data: {
      quarterId: string;
      name: string;
      address: string;
      landlordName: string;
      landlordPhone: string;
      landlordIbanOrMomo?: string;
      floorsCount: number;
    }): Promise<ApiBuilding> {
      const buildings = getLocalState<ApiBuilding[]>(STORAGE_KEYS.BUILDINGS, []);
      let res: ApiBuilding | undefined;
      try {
        res = await apiClient.fetch<ApiBuilding>("residences/buildings", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch (err) {
        console.warn("apiClient.fetch residences/buildings fallback to local:", err);
      }
      const createdBuilding: ApiBuilding = res || {
        id: generateUuid(),
        quarterId: data.quarterId,
        name: data.name,
        address: data.address,
        landlordName: data.landlordName,
        landlordPhone: data.landlordPhone,
        landlordIbanOrMomo: data.landlordIbanOrMomo,
        floorsCount: data.floorsCount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLocalState(STORAGE_KEYS.BUILDINGS, [createdBuilding, ...buildings]);
      return createdBuilding;
    },

    async getRooms(buildingId?: string): Promise<ApiRoom[]> {
      const stored = getLocalState<ApiRoom[]>(STORAGE_KEYS.ROOMS, []);
      const validBuildingUuid = isUuidV4(buildingId) ? buildingId!.trim() : undefined;
      try {
        const query = validBuildingUuid ? `?buildingId=${validBuildingUuid}` : "";
        const res = await apiClient.fetch<ApiRoom[]>(`residences/rooms${query}`);
        if (res && Array.isArray(res)) {
          const map = new Map<string, ApiRoom>();
          stored.forEach((r) => map.set(r.id, r));
          res.forEach((r) => map.set(r.id, r));
          const merged = Array.from(map.values());
          setLocalState(STORAGE_KEYS.ROOMS, merged);
          return buildingId && buildingId !== "all"
            ? merged.filter((r) => r.buildingId === buildingId)
            : merged;
        }
      } catch {
        // Backend offline or unreachable: fallback to local cache
      }
      return buildingId && buildingId !== "all" ? stored.filter((r) => r.buildingId === buildingId) : stored;
    },

    async getOccupations(filter?: {
      associationId?: string;
      roomId?: string;
      occupantUserId?: string;
      isActive?: boolean;
    }): Promise<ApiOccupation[]> {
      try {
        const params = new URLSearchParams();
        if (filter?.associationId && isUuidV4(filter.associationId)) params.append("associationId", filter.associationId.trim());
        if (filter?.roomId && isUuidV4(filter.roomId)) params.append("roomId", filter.roomId.trim());
        if (filter?.occupantUserId && isUuidV4(filter.occupantUserId)) params.append("occupantUserId", filter.occupantUserId.trim());
        if (filter?.isActive !== undefined) params.append("isActive", String(filter.isActive));
        const query = params.toString() ? `?${params.toString()}` : "";
        const res = await apiClient.fetch<ApiOccupation[]>(`residences/occupations${query}`);
        if (res && res.length > 0) {
          setLocalState(STORAGE_KEYS.OCCUPATIONS, res);
          return res;
        }
      } catch {
        // Backend offline or unreachable: fallback to local cache
      }
      return getLocalState<ApiOccupation[]>(STORAGE_KEYS.OCCUPATIONS, []);
    },

    async createRoom(data: {
      buildingId: string;
      roomNumber: string;
      capacity: number;
      floor?: number;
      type?: string;
      monthlyRentXOF?: number;
    }): Promise<ApiRoom> {
      const rooms = getLocalState<ApiRoom[]>(STORAGE_KEYS.ROOMS, []);
      let res: ApiRoom | undefined;
      try {
        res = await apiClient.fetch<ApiRoom>("residences/rooms", {
          method: "POST",
          body: JSON.stringify({
            buildingId: data.buildingId,
            roomNumber: data.roomNumber,
            capacity: data.capacity,
          }),
        });
      } catch (err) {
        console.warn("apiClient.fetch residences/rooms fallback to local:", err);
      }
      const enriched: ApiRoom = {
        id: res?.id || generateUuid(),
        buildingId: data.buildingId,
        roomNumber: data.roomNumber,
        capacity: data.capacity,
        status: (res?.status as any) || "AVAILABLE",
        floor: data.floor !== undefined ? data.floor : 0,
        type: data.type || "Studio Individuel",
        monthlyRentXOF: data.monthlyRentXOF || 35000,
        createdAt: res?.createdAt || new Date().toISOString(),
        updatedAt: res?.updatedAt || new Date().toISOString(),
      };
      setLocalState(STORAGE_KEYS.ROOMS, [enriched, ...rooms]);
      return enriched;
    },

    async assignOccupation(data: {
      roomId: string;
      occupantUserId: string;
      occupantName?: string;
      occupantPhone?: string;
      associationId: string;
      startDate: string;
      endDate?: string;
      allowSurplus?: boolean;
      surplusReason?: string;
    }): Promise<ApiOccupation> {
      const rooms = getLocalState<ApiRoom[]>(STORAGE_KEYS.ROOMS, []);
      const occupations = getLocalState<ApiOccupation[]>(STORAGE_KEYS.OCCUPATIONS, []);

      let res: ApiOccupation | undefined;
      try {
        res = await apiClient.fetch<ApiOccupation>("residences/occupations", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch (err) {
        console.warn("apiClient.fetch residences/occupations fallback:", err);
      }

      if (!res) {
        res = {
          id: generateUuid(),
          roomId: data.roomId,
          occupantUserId: data.occupantUserId,
          occupantName: data.occupantName || "Résident Étudiant",
          occupantPhone: data.occupantPhone || "+229 00 00 00 00",
          associationId: data.associationId,
          startDate: data.startDate,
          endDate: data.endDate || null,
          isActive: true,
          status: "ACTIVE",
        };
      }

      const updatedRooms = rooms.map((r) =>
        r.id === data.roomId ? { ...r, status: "OCCUPIED" as const, currentOccupation: res } : r
      );
      setLocalState(STORAGE_KEYS.ROOMS, updatedRooms);
      setLocalState(STORAGE_KEYS.OCCUPATIONS, [res, ...occupations]);
      return res;
    },

    async terminateOccupation(occupationId: string, roomId?: string): Promise<{ success: boolean }> {
      const rooms = getLocalState<ApiRoom[]>(STORAGE_KEYS.ROOMS, []);
      const occupations = getLocalState<ApiOccupation[]>(STORAGE_KEYS.OCCUPATIONS, []);

      if (isUuidV4(occupationId)) {
        try {
          await apiClient.fetch(`residences/occupations/${occupationId.trim()}/terminate`, {
            method: "PATCH",
            body: JSON.stringify({ endDate: new Date().toISOString() }),
          });
        } catch {
          // Fallback
        }
      }

      const updatedOccupations = occupations.map((o) =>
        o.id === occupationId ? { ...o, isActive: false, status: "TERMINATED" as const } : o
      );
      setLocalState(STORAGE_KEYS.OCCUPATIONS, updatedOccupations);

      const updatedRooms = rooms.map((r) => {
        if (r.id === roomId || r.currentOccupation?.id === occupationId) {
          return {
            ...r,
            status: "AVAILABLE" as const,
            currentOccupation: null,
          };
        }
        return r;
      });
      setLocalState(STORAGE_KEYS.ROOMS, updatedRooms);

      return { success: true };
    },

    async getStats(associationId?: string): Promise<ApiResidenceStats> {
      try {
        const validAssoc = isUuidV4(associationId) ? associationId!.trim() : undefined;
        const query = validAssoc ? `?associationId=${validAssoc}` : "";
        const res = await apiClient.fetch<ApiResidenceStats>(`residences/stats${query}`);
        if (res) return res;
      } catch (err) {
        console.warn("residenceApiService.residences.getStats error:", err);
      }
      const quarters = getLocalState<ApiQuarter[]>(STORAGE_KEYS.QUARTERS, []);
      const buildings = getLocalState<ApiBuilding[]>(STORAGE_KEYS.BUILDINGS, []);
      const rooms = getLocalState<ApiRoom[]>(STORAGE_KEYS.ROOMS, []);
      const occupations = getLocalState<ApiOccupation[]>(STORAGE_KEYS.OCCUPATIONS, []);

      const totalRooms = rooms.length;
      const occupiedRooms = rooms.filter((r) => r.status === "OCCUPIED").length;
      const availableRooms = rooms.filter((r) => r.status === "AVAILABLE").length;
      const maintenanceRooms = rooms.filter((r) => r.status === "MAINTENANCE").length;
      const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || 1), 0);
      const activeOccupations = occupations.filter((o) => o.isActive).length;
      const occupancyRate = totalRooms > 0 ? Number(((occupiedRooms / totalRooms) * 100).toFixed(1)) : 0;

      return {
        totalQuarters: quarters.length,
        totalBuildings: buildings.length,
        totalRooms,
        totalCapacity,
        occupiedRooms,
        availableRooms,
        maintenanceRooms,
        activeOccupations,
        occupancyRate,
      };
    },

    async getQuarter(id: string): Promise<ApiQuarter | null> {
      try {
        return await apiClient.fetch<ApiQuarter>(`residences/quarters/${id}`);
      } catch {
        const quarters = getLocalState<ApiQuarter[]>(STORAGE_KEYS.QUARTERS, []);
        return quarters.find((q) => q.id === id) || null;
      }
    },

    async updateQuarter(
      id: string,
      data: { name?: string; city?: string; description?: string }
    ): Promise<ApiQuarter> {
      const quarters = getLocalState<ApiQuarter[]>(STORAGE_KEYS.QUARTERS, []);
      let res: ApiQuarter | undefined;
      try {
        res = await apiClient.fetch<ApiQuarter>(`residences/quarters/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
      } catch (err) {
        console.warn("apiClient.fetch residences/quarters update fallback:", err);
      }
      const existing = quarters.find((q) => q.id === id);
      const updatedQuarter: ApiQuarter = {
        id,
        associationId: existing?.associationId || "00000000-0000-0000-0000-000000000000",
        name: data.name ?? existing?.name ?? "Campus",
        city: data.city ?? existing?.city ?? "Abomey-Calavi",
        description: data.description ?? existing?.description ?? "",
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...res,
      };
      const updated = quarters.map((q) => (q.id === id ? updatedQuarter : q));
      setLocalState(STORAGE_KEYS.QUARTERS, updated);
      return updatedQuarter;
    },

    async deleteQuarter(id: string): Promise<void> {
      const quarters = getLocalState<ApiQuarter[]>(STORAGE_KEYS.QUARTERS, []);
      try {
        await apiClient.fetch(`residences/quarters/${id}`, { method: "DELETE" });
      } catch {
        // Fallback
      }
      setLocalState(
        STORAGE_KEYS.QUARTERS,
        quarters.filter((q) => q.id !== id)
      );
    },

    async getBuilding(id: string): Promise<ApiBuilding | null> {
      try {
        return await apiClient.fetch<ApiBuilding>(`residences/buildings/${id}`);
      } catch {
        const buildings = getLocalState<ApiBuilding[]>(STORAGE_KEYS.BUILDINGS, []);
        return buildings.find((b) => b.id === id) || null;
      }
    },

    async updateBuilding(
      id: string,
      data: {
        name?: string;
        address?: string;
        landlordName?: string;
        landlordPhone?: string;
        landlordIbanOrMomo?: string;
        floorsCount?: number;
      }
    ): Promise<ApiBuilding> {
      const buildings = getLocalState<ApiBuilding[]>(STORAGE_KEYS.BUILDINGS, []);
      let res: ApiBuilding | undefined;
      try {
        res = await apiClient.fetch<ApiBuilding>(`residences/buildings/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
      } catch (err) {
        console.warn("apiClient.fetch residences/buildings update fallback:", err);
      }
      const existing = buildings.find((b) => b.id === id);
      const updatedBuilding: ApiBuilding = {
        id,
        quarterId: existing?.quarterId || "",
        name: data.name ?? existing?.name ?? "Bâtiment",
        address: data.address ?? existing?.address ?? "",
        landlordName: data.landlordName ?? existing?.landlordName ?? "Bailleur",
        landlordPhone: data.landlordPhone ?? existing?.landlordPhone ?? "+229 97 00 00 00",
        landlordIbanOrMomo: data.landlordIbanOrMomo ?? existing?.landlordIbanOrMomo,
        floorsCount: data.floorsCount ?? existing?.floorsCount ?? 0,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...res,
      };
      const updated = buildings.map((b) => (b.id === id ? updatedBuilding : b));
      setLocalState(STORAGE_KEYS.BUILDINGS, updated);
      return updatedBuilding;
    },

    async deleteBuilding(id: string): Promise<void> {
      const buildings = getLocalState<ApiBuilding[]>(STORAGE_KEYS.BUILDINGS, []);
      try {
        await apiClient.fetch(`residences/buildings/${id}`, { method: "DELETE" });
      } catch {
        // Fallback
      }
      setLocalState(
        STORAGE_KEYS.BUILDINGS,
        buildings.filter((b) => b.id !== id)
      );
    },

    async getRoom(id: string): Promise<ApiRoom | null> {
      if (!isUuidV4(id)) {
        const rooms = getLocalState<ApiRoom[]>(STORAGE_KEYS.ROOMS, []);
        return rooms.find((r) => r.id === id) || null;
      }
      try {
        return await apiClient.fetch<ApiRoom>(`residences/rooms/${id.trim()}`);
      } catch {
        const rooms = getLocalState<ApiRoom[]>(STORAGE_KEYS.ROOMS, []);
        return rooms.find((r) => r.id === id) || null;
      }
    },

    async updateRoom(
      id: string,
      data: {
        roomNumber?: string;
        capacity?: number;
        status?: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
        floor?: number;
        type?: string;
        monthlyRentXOF?: number;
      }
    ): Promise<ApiRoom> {
      const rooms = getLocalState<ApiRoom[]>(STORAGE_KEYS.ROOMS, []);
      let res: ApiRoom | undefined;
      if (isUuidV4(id)) {
        try {
          res = await apiClient.fetch<ApiRoom>(`residences/rooms/${id.trim()}`, {
            method: "PATCH",
            body: JSON.stringify(data),
          });
        } catch (err) {
          console.warn("apiClient.fetch residences/rooms update fallback:", err);
        }
      }
      const existing = rooms.find((r) => r.id === id);
      const updatedRoom: ApiRoom = {
        id,
        buildingId: existing?.buildingId || "",
        roomNumber: data.roomNumber ?? existing?.roomNumber ?? "CH",
        capacity: data.capacity ?? existing?.capacity ?? 1,
        status: data.status ?? (res?.status as any) ?? existing?.status ?? "AVAILABLE",
        floor: data.floor ?? existing?.floor ?? 0,
        type: data.type ?? existing?.type ?? "Studio Individuel",
        monthlyRentXOF: data.monthlyRentXOF ?? existing?.monthlyRentXOF ?? 35000,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...res,
      };
      const updated = rooms.map((r) => (r.id === id ? updatedRoom : r));
      setLocalState(STORAGE_KEYS.ROOMS, updated);
      return updatedRoom;
    },

    async updateRoomStatus(
      id: string,
      status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE"
    ): Promise<ApiRoom> {
      const rooms = getLocalState<ApiRoom[]>(STORAGE_KEYS.ROOMS, []);
      if (isUuidV4(id)) {
        try {
          await apiClient.fetch<ApiRoom>(`residences/rooms/${id.trim()}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
          });
        } catch (err) {
          console.warn("apiClient.fetch residences/rooms status fallback:", err);
        }
      }
      const updated = rooms.map((r) => (r.id === id ? { ...r, status } : r));
      setLocalState(STORAGE_KEYS.ROOMS, updated);
      return updated.find((r) => r.id === id)!;
    },

    async deleteRoom(id: string): Promise<void> {
      const rooms = getLocalState<ApiRoom[]>(STORAGE_KEYS.ROOMS, []);
      if (isUuidV4(id)) {
        try {
          await apiClient.fetch(`residences/rooms/${id.trim()}`, { method: "DELETE" });
        } catch {
          // Fallback
        }
      }
      setLocalState(
        STORAGE_KEYS.ROOMS,
        rooms.filter((r) => r.id !== id)
      );
    },

    async getResidents(params?: { associationId?: string; isActive?: boolean }): Promise<ApiResident[]> {
      const query = new URLSearchParams();
      if (params?.associationId && isUuidV4(params.associationId)) query.append("associationId", params.associationId.trim());
      if (params?.isActive !== undefined) query.append("isActive", String(params.isActive));
      const qs = query.toString() ? `?${query.toString()}` : "";

      try {
        const res = await apiClient.fetch<ApiResident[]>(`residences/residents${qs}`);
        if (res && res.length > 0) return res;
      } catch (err) {
        console.warn("residenceApiService.residences.getResidents error:", err);
      }

      return [];
    },

    async getResidentById(id: string): Promise<ApiResident | null> {
      try {
        return await apiClient.fetch<ApiResident>(`residences/residents/${id}`);
      } catch {
        const all = await this.getResidents();
        return all.find((r) => r.userId === id) || null;
      }
    },
  },

  // 4b. Conventions & Baux Bailleurs Résidences
  residenceContracts: {
    async list(filter?: { associationId?: string; buildingId?: string }): Promise<ApiBuildingConvention[]> {
      const list = getLocalState<ApiBuildingConvention[]>(STORAGE_KEYS.BUILDING_CONVENTIONS, []);
      let res = list;
      if (filter?.associationId) {
        res = res.filter((c) => c.associationId === filter.associationId);
      }
      if (filter?.buildingId) {
        res = res.filter((c) => c.buildingId === filter.buildingId);
      }
      return res;
    },
    async get(id: string): Promise<ApiBuildingConvention | null> {
      const list = await this.list();
      return list.find((c) => c.id === id) || null;
    },
    async getByBuilding(buildingId: string): Promise<ApiBuildingConvention | null> {
      const list = await this.list();
      return list.find((c) => c.buildingId === buildingId) || null;
    },
    async create(data: Omit<ApiBuildingConvention, "id" | "createdAt" | "updatedAt">): Promise<ApiBuildingConvention> {
      const list = await this.list();
      const newConv: ApiBuildingConvention = {
        ...data,
        id: generateUuid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLocalState(STORAGE_KEYS.BUILDING_CONVENTIONS, [newConv, ...list]);
      return newConv;
    },
    async update(id: string, data: Partial<ApiBuildingConvention>): Promise<ApiBuildingConvention> {
      const list = await this.list();
      const now = new Date().toISOString();
      const updated = list.map((c) => (c.id === id ? { ...c, ...data, updatedAt: now } : c));
      setLocalState(STORAGE_KEYS.BUILDING_CONVENTIONS, updated);
      const found = updated.find((c) => c.id === id);
      if (!found) throw new Error("Convention introuvable");
      return found;
    },
    async terminate(id: string): Promise<ApiBuildingConvention> {
      return this.update(id, { status: "TERMINATED", endDate: new Date().toISOString().split("T")[0] });
    },
  },

  // 4c. Règles d'Admission & Règlement Intérieur des Résidences
  residenceAdmissionRules: {
    async get(associationId: string): Promise<ApiResidenceAdmissionRules | null> {
      const list = getLocalState<ApiResidenceAdmissionRules[]>(
        STORAGE_KEYS.RESIDENCE_ADMISSION_RULES,
        []
      );
      const found = list.find((r) => r.associationId === associationId);
      return found || null;
    },

    async update(associationId: string, data: Partial<ApiResidenceAdmissionRules>): Promise<ApiResidenceAdmissionRules> {
      const list = getLocalState<ApiResidenceAdmissionRules[]>(
        STORAGE_KEYS.RESIDENCE_ADMISSION_RULES,
        []
      );
      const now = new Date().toISOString();
      let exists = false;
      const updated = list.map((r) => {
        if (r.associationId === associationId) {
          exists = true;
          return { ...r, ...data, updatedAt: now };
        }
        return r;
      });

      if (!exists) {
        const created: ApiResidenceAdmissionRules = {
          id: generateUuid(),
          associationId,
          associationName: data.associationName || "Association",
          status: data.status || "OPEN",
          approvalMode: data.approvalMode || "COMMISSION_REVIEW",
          depositMonths: data.depositMonths ?? 2,
          applicationFeeXOF: data.applicationFeeXOF ?? 5000,
          minStayMonths: data.minStayMonths ?? 10,
          requiresGuarantor: data.requiresGuarantor ?? true,
          eligibilityCriteria: data.eligibilityCriteria || [],
          requiredDocuments: data.requiredDocuments || [],
          houseRulesArticles: data.houseRulesArticles || [],
          updatedAt: now,
          updatedByUserName: data.updatedByUserName || "Gestionnaire",
          updatedByUserRole: data.updatedByUserRole || "GESTIONNAIRE",
          ...data,
        };
        updated.push(created);
        setLocalState(STORAGE_KEYS.RESIDENCE_ADMISSION_RULES, updated);
        return created;
      }

      setLocalState(STORAGE_KEYS.RESIDENCE_ADMISSION_RULES, updated);
      return updated.find((r) => r.associationId === associationId)!;
    },

    async uploadPdf(associationId: string, fileName: string, fileData: string, fileSize: string): Promise<ApiResidenceAdmissionRules> {
      return this.update(associationId, {
        internalRegulationsPdfName: fileName,
        internalRegulationsPdfData: fileData,
        internalRegulationsPdfSize: fileSize,
      });
    },
  },

  // 4d. Mandats des Délégués de Pavillon & Comités de Résidents
  residentDelegateContracts: {
    async list(filter?: { associationId?: string; buildingId?: string; delegateRole?: string }): Promise<ApiResidentDelegateContract[]> {
      const list = getLocalState<ApiResidentDelegateContract[]>(
        STORAGE_KEYS.RESIDENT_DELEGATE_CONTRACTS,
        []
      );
      let res = list;
      if (filter?.associationId) {
        res = res.filter((c) => c.associationId === filter.associationId);
      }
      if (filter?.buildingId && filter.buildingId !== "ALL") {
        res = res.filter((c) => c.buildingId === filter.buildingId);
      }
      if (filter?.delegateRole && filter.delegateRole !== "ALL") {
        res = res.filter((c) => c.delegateRole === filter.delegateRole);
      }
      return res;
    },

    async get(id: string): Promise<ApiResidentDelegateContract | null> {
      const list = await this.list();
      return list.find((c) => c.id === id) || null;
    },

    async getByAssociation(associationId: string): Promise<ApiResidentDelegateContract[]> {
      return this.list({ associationId });
    },

    async create(data: Omit<ApiResidentDelegateContract, "id" | "createdAt" | "updatedAt">): Promise<ApiResidentDelegateContract> {
      const list = await this.list();
      const now = new Date().toISOString();
      const newContract: ApiResidentDelegateContract = {
        ...data,
        id: generateUuid(),
        createdAt: now,
        updatedAt: now,
      };
      setLocalState(STORAGE_KEYS.RESIDENT_DELEGATE_CONTRACTS, [newContract, ...list]);
      return newContract;
    },

    async update(id: string, data: Partial<ApiResidentDelegateContract>): Promise<ApiResidentDelegateContract> {
      const list = await this.list();
      const now = new Date().toISOString();
      const updated = list.map((c) => (c.id === id ? { ...c, ...data, updatedAt: now } : c));
      setLocalState(STORAGE_KEYS.RESIDENT_DELEGATE_CONTRACTS, updated);
      const found = updated.find((c) => c.id === id);
      if (!found) throw new Error("Mandat introuvable");
      return found;
    },

    async sign(id: string, signatoryDelegateName: string): Promise<ApiResidentDelegateContract> {
      const list = await this.list();
      const now = new Date().toISOString();
      const updated = list.map((c) =>
        c.id === id
          ? {
              ...c,
              isSigned: true,
              signatoryDelegateName,
              signedAt: now,
              status: "ACTIVE" as const,
              updatedAt: now,
            }
          : c
      );
      setLocalState(STORAGE_KEYS.RESIDENT_DELEGATE_CONTRACTS, updated);
      const found = updated.find((c) => c.id === id);
      if (!found) throw new Error("Mandat introuvable");
      return found;
    },

    async uploadPdf(id: string, fileName: string, fileData: string, fileSize: string): Promise<ApiResidentDelegateContract> {
      const now = new Date().toISOString();
      return this.update(id, {
        pdfFileName: fileName,
        pdfFileData: fileData,
        pdfFileSize: fileSize,
        pdfUploadedAt: now,
      });
    },

    async terminate(id: string): Promise<ApiResidentDelegateContract> {
      return this.update(id, {
        status: "TERMINATED",
      });
    },
  },
};
