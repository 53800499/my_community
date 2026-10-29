import {
  apiClient,
  STORAGE_KEYS,
  getLocalState,
  setLocalState,
  generateUuid,
} from "@/lib/api-client";
import { authApiService } from "@/features/auth/services/auth-api.service";
import {
  ApiAssociation,
  ApiAssociationMember,
  ApiAssociationContract,
  ApiAssociationIntegrationRules,
  ApiAssociationExecutiveContract,
  ApiAssociationMandate,
  ApiMandateOfficer,
} from "../types/association-api.types";
import { MemberProfessionalInfo } from "../domain/association.types";

export const associationGovernanceApiService = {
  // 3. Associations & Comités Exécutifs
  associations: {
    async list(): Promise<ApiAssociation[]> {
      const stored = getLocalState<ApiAssociation[]>(
        STORAGE_KEYS.ASSOCIATIONS,
        []
      );
      try {
        const res = await apiClient.fetch<ApiAssociation[]>("associations");
        if (res && res.length > 0) {
          const map = new Map<string, ApiAssociation>();
          stored.forEach((a) => map.set(a.id, a));
          res.forEach((a) =>
            map.set(a.id, {
              ...a,
              monthlyDuesXOF: a.monthlyDuesXOF || 1000,
              treasuryBalanceXOF: a.treasuryBalanceXOF || 0,
            })
          );
          const merged = Array.from(map.values());
          setLocalState(STORAGE_KEYS.ASSOCIATIONS, merged);
          return merged;
        }
        return stored;
      } catch {
        return stored;
      }
    },

    async getById(id: string): Promise<ApiAssociation | null> {
      try {
        const res = await apiClient.fetch<ApiAssociation>(`associations/${id}`);
        if (res) return res;
      } catch {
        // Fallback to cache
      }
      const list = await this.list();
      return list.find((a) => a.id === id) || null;
    },

    async register(data: {
      name: string;
      acronym?: string;
      registrationNumber?: string;
      description?: string;
      monthlyDuesXOF?: number;
      territory?: string;
    }): Promise<ApiAssociation> {
      const assocs = await this.list();
      const currentUser = authApiService.getCurrentUser();

      const res = await apiClient.fetch<ApiAssociation>("associations", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const enriched: ApiAssociation = {
        ...res,
        monthlyDuesXOF: data.monthlyDuesXOF || 1000,
        treasuryBalanceXOF: 0,
        territory: data.territory || "Bénin",
        members: [
          {
            id: generateUuid(),
            associationId: res.id,
            userId: currentUser?.id || "",
            userName: `${currentUser?.firstName || "Citoyen"} ${currentUser?.lastName || "Président"}`.trim(),
            roles: ["PRESIDENT" as const],
            joinedAt: new Date().toISOString(),
          },
        ],
      };
      const updated = [enriched, ...assocs.filter((a) => a.id !== enriched.id)];
      setLocalState(STORAGE_KEYS.ASSOCIATIONS, updated);
      return enriched;
    },

    async linkCommunity(associationId: string, communityId: string): Promise<{ success: boolean }> {
      const assocs = await this.list();
      await apiClient.fetch(`associations/${associationId}/communities/${communityId}`, {
        method: "POST",
      });
      const updated = assocs.map((a) => {
        if (a.id === associationId) {
          const links = a.linkedCommunityIds || [];
          return {
            ...a,
            linkedCommunityIds: Array.from(new Set([...links, communityId])),
          };
        }
        return a;
      });
      setLocalState(STORAGE_KEYS.ASSOCIATIONS, updated);
      return { success: true };
    },

    async manageMember(
      associationId: string,
      data: {
        targetUserId: string;
        targetUserName?: string;
        role: "SECRETARY" | "TREASURER" | "MANAGER" | "MEMBER";
        action: "ASSIGN" | "REVOKE";
      }
    ): Promise<ApiAssociationMember> {
      const assocs = await this.list();
      const res = await apiClient.fetch<ApiAssociationMember>(`associations/${associationId}/members`, {
        method: "POST",
        body: JSON.stringify({
          targetUserId: data.targetUserId,
          role: data.role,
          action: data.action,
        }),
      });
      const updated = assocs.map((a) => {
        if (a.id === associationId) {
          const members = a.members || [];
          return {
            ...a,
            members: [res, ...members.filter((m) => m.userId !== data.targetUserId)],
          };
        }
        return a;
      });
      setLocalState(STORAGE_KEYS.ASSOCIATIONS, updated);
      return res;
    },

    async updateMemberProfessionalInfo(
      associationId: string,
      memberId: string,
      data: MemberProfessionalInfo
    ): Promise<ApiAssociationMember> {
      const assocs = await this.list();
      let res: ApiAssociationMember;
      try {
        res = await apiClient.fetch<ApiAssociationMember>(
          `associations/${associationId}/members/${memberId}/professional-info`,
          {
            method: "PUT",
            body: JSON.stringify(data),
          }
        );
      } catch (err) {
        // Fallback for offline or local cache
        const assoc = assocs.find((a) => a.id === associationId);
        const member = assoc?.members?.find((m) => m.id === memberId);
        if (!member) throw err;
        res = {
          ...member,
          professionalInfo: data,
        };
      }
      const updated = assocs.map((a) => {
        if (a.id === associationId) {
          const members = a.members || [];
          return {
            ...a,
            members: members.map((m) => (m.id === memberId ? res : m)),
          };
        }
        return a;
      });
      setLocalState(STORAGE_KEYS.ASSOCIATIONS, updated);
      return res;
    },
  },

  // 3b. Contrats & Conventions d'Intégration des Associations
  associationContracts: {
    async list(): Promise<ApiAssociationContract[]> {
      return getLocalState<ApiAssociationContract[]>(
        STORAGE_KEYS.ASSOCIATION_CONTRACTS,
        []
      );
    },
    async get(id: string): Promise<ApiAssociationContract | null> {
      const list = await this.list();
      return list.find((c) => c.id === id) || null;
    },
    async getByAssociation(associationId: string): Promise<ApiAssociationContract[]> {
      const list = await this.list();
      return list.filter((c) => c.associationId === associationId);
    },
    async create(data: Omit<ApiAssociationContract, "id" | "createdAt" | "updatedAt">): Promise<ApiAssociationContract> {
      const list = await this.list();
      const newContract: ApiAssociationContract = {
        ...data,
        id: generateUuid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLocalState(STORAGE_KEYS.ASSOCIATION_CONTRACTS, [newContract, ...list]);
      return newContract;
    },
    async sign(id: string, signatoryPresident: string): Promise<ApiAssociationContract> {
      const list = await this.list();
      const now = new Date().toISOString();
      const updated = list.map((c) =>
        c.id === id
          ? {
              ...c,
              signatoryPresident,
              signedAt: now,
              status: "ACTIVE" as const,
              updatedAt: now,
            }
          : c
      );
      setLocalState(STORAGE_KEYS.ASSOCIATION_CONTRACTS, updated);
      const found = updated.find((c) => c.id === id);
      if (!found) throw new Error("Contrat introuvable");
      return found;
    },
    async update(id: string, data: Partial<ApiAssociationContract>): Promise<ApiAssociationContract> {
      const list = await this.list();
      const now = new Date().toISOString();
      const updated = list.map((c) => (c.id === id ? { ...c, ...data, updatedAt: now } : c));
      setLocalState(STORAGE_KEYS.ASSOCIATION_CONTRACTS, updated);
      const found = updated.find((c) => c.id === id);
      if (!found) throw new Error("Contrat introuvable");
      return found;
    },
  },

  // 3c. Règles d'Intégration & Charte d'Adhésion des Associations
  associationIntegrationRules: {
    async get(associationId: string): Promise<ApiAssociationIntegrationRules | null> {
      const list = getLocalState<ApiAssociationIntegrationRules[]>(
        STORAGE_KEYS.ASSOCIATION_INTEGRATION_RULES,
        []
      );
      const found = list.find((r) => r.associationId === associationId);
      return found || null;
    },

    async update(associationId: string, data: Partial<ApiAssociationIntegrationRules>): Promise<ApiAssociationIntegrationRules> {
      const list = getLocalState<ApiAssociationIntegrationRules[]>(
        STORAGE_KEYS.ASSOCIATION_INTEGRATION_RULES,
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
        const created: ApiAssociationIntegrationRules = {
          id: generateUuid(),
          associationId,
          associationName: data.associationName || "Association",
          status: data.status || "OPEN",
          approvalMode: data.approvalMode || "BUREAU_REVIEW",
          membershipFeeXOF: data.membershipFeeXOF ?? 5000,
          annualDuesXOF: data.annualDuesXOF ?? 12000,
          requiresSponsorship: !!data.requiresSponsorship,
          sponsorsCountRequired: data.sponsorsCountRequired ?? 0,
          eligibilityCriteria: data.eligibilityCriteria || [],
          requiredDocuments: data.requiredDocuments || [],
          charterArticles: data.charterArticles || [],
          updatedAt: now,
          updatedByUserName: data.updatedByUserName || "Bureau Exécutif",
          updatedByUserRole: data.updatedByUserRole || "PRESIDENT",
          ...data,
        };
        updated.push(created);
        setLocalState(STORAGE_KEYS.ASSOCIATION_INTEGRATION_RULES, updated);
        return created;
      }

      setLocalState(STORAGE_KEYS.ASSOCIATION_INTEGRATION_RULES, updated);
      return updated.find((r) => r.associationId === associationId)!;
    },

    async uploadPdf(associationId: string, fileName: string, fileData: string, fileSize: string): Promise<ApiAssociationIntegrationRules> {
      return this.update(associationId, {
        internalRegulationsPdfName: fileName,
        internalRegulationsPdfData: fileData,
        internalRegulationsPdfSize: fileSize,
      });
    },
  },

  // 3d. Mandats, Contrats & Règles des Hauts Membres du Bureau
  associationExecutiveContracts: {
    async list(filter?: { associationId?: string; officerRole?: string }): Promise<ApiAssociationExecutiveContract[]> {
      const list = getLocalState<ApiAssociationExecutiveContract[]>(
        STORAGE_KEYS.ASSOCIATION_EXECUTIVE_CONTRACTS,
        []
      );
      let res = list;
      if (filter?.associationId) {
        res = res.filter((c) => c.associationId === filter.associationId);
      }
      if (filter?.officerRole && filter.officerRole !== "ALL") {
        res = res.filter((c) => c.officerRole === filter.officerRole);
      }
      return res;
    },

    async get(id: string): Promise<ApiAssociationExecutiveContract | null> {
      const list = await this.list();
      return list.find((c) => c.id === id) || null;
    },

    async getByAssociation(associationId: string): Promise<ApiAssociationExecutiveContract[]> {
      return this.list({ associationId });
    },

    async create(data: Omit<ApiAssociationExecutiveContract, "id" | "createdAt" | "updatedAt">): Promise<ApiAssociationExecutiveContract> {
      const list = await this.list();
      const now = new Date().toISOString();
      const newContract: ApiAssociationExecutiveContract = {
        ...data,
        id: generateUuid(),
        createdAt: now,
        updatedAt: now,
      };
      setLocalState(STORAGE_KEYS.ASSOCIATION_EXECUTIVE_CONTRACTS, [newContract, ...list]);
      return newContract;
    },

    async update(id: string, data: Partial<ApiAssociationExecutiveContract>): Promise<ApiAssociationExecutiveContract> {
      const list = await this.list();
      const now = new Date().toISOString();
      const updated = list.map((c) => (c.id === id ? { ...c, ...data, updatedAt: now } : c));
      setLocalState(STORAGE_KEYS.ASSOCIATION_EXECUTIVE_CONTRACTS, updated);
      const found = updated.find((c) => c.id === id);
      if (!found) throw new Error("Contrat introuvable");
      return found;
    },

    async sign(id: string, signatoryOfficerName: string): Promise<ApiAssociationExecutiveContract> {
      const list = await this.list();
      const now = new Date().toISOString();
      const updated = list.map((c) =>
        c.id === id
          ? {
              ...c,
              isSigned: true,
              signatoryOfficerName,
              signedAt: now,
              status: "ACTIVE" as const,
              updatedAt: now,
            }
          : c
      );
      setLocalState(STORAGE_KEYS.ASSOCIATION_EXECUTIVE_CONTRACTS, updated);
      const found = updated.find((c) => c.id === id);
      if (!found) throw new Error("Contrat introuvable");
      return found;
    },

    async uploadPdf(id: string, fileName: string, fileData: string, fileSize: string): Promise<ApiAssociationExecutiveContract> {
      const now = new Date().toISOString();
      return this.update(id, {
        pdfFileName: fileName,
        pdfFileData: fileData,
        pdfFileSize: fileSize,
        pdfUploadedAt: now,
      });
    },

    async terminate(id: string): Promise<ApiAssociationExecutiveContract> {
      return this.update(id, {
        status: "TERMINATED",
      });
    },
  },

  // 3e. Mandatures & Passation de Service (100% Dynamique & Auditée)
  mandates: {
    async list(associationId: string): Promise<ApiAssociationMandate[]> {
      const stored = getLocalState<ApiAssociationMandate[]>(STORAGE_KEYS.ASSOCIATION_MANDATES, []);
      try {
        const res = await apiClient.fetch<ApiAssociationMandate[]>(`associations/${associationId}/mandates`);
        if (res && Array.isArray(res) && res.length > 0) {
          const filtered = stored.filter((m) => m.associationId !== associationId);
          const merged = [...res, ...filtered];
          setLocalState(STORAGE_KEYS.ASSOCIATION_MANDATES, merged);
          return res;
        }
      } catch {
        // Fallback to cache
      }
      return stored.filter((m) => m.associationId === associationId);
    },

    async create(
      associationId: string,
      data: {
        title: string;
        academicYear: string;
        startDate: string;
        endDate?: string;
        presidentUserId?: string;
        presidentName: string;
        secretaryUserId?: string;
        secretaryName?: string;
        treasurerUserId?: string;
        treasurerName?: string;
        officers?: ApiMandateOfficer[];
      }
    ): Promise<ApiAssociationMandate> {
      const stored = getLocalState<ApiAssociationMandate[]>(STORAGE_KEYS.ASSOCIATION_MANDATES, []);
      let res: ApiAssociationMandate;
      try {
        res = await apiClient.fetch<ApiAssociationMandate>(`associations/${associationId}/mandates`, {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch {
        const now = new Date().toISOString();
        res = {
          id: generateUuid(),
          associationId,
          title: data.title,
          academicYear: data.academicYear,
          startDate: data.startDate,
          endDate: data.endDate || null,
          status: "ACTIVE",
          presidentUserId: data.presidentUserId || generateUuid(),
          presidentName: data.presidentName,
          secretaryUserId: data.secretaryUserId || null,
          secretaryName: data.secretaryName || null,
          treasurerUserId: data.treasurerUserId || null,
          treasurerName: data.treasurerName || null,
          officers: data.officers || [],
          createdAt: now,
          updatedAt: now,
        };
      }
      const updated = [res, ...stored.filter((m) => m.id !== res.id)];
      setLocalState(STORAGE_KEYS.ASSOCIATION_MANDATES, updated);
      return res;
    },

    async update(
      associationId: string,
      mandateId: string,
      data: {
        title?: string;
        academicYear?: string;
        startDate?: string;
        endDate?: string;
        presidentUserId?: string;
        presidentName?: string;
        secretaryUserId?: string;
        secretaryName?: string;
        treasurerUserId?: string;
        treasurerName?: string;
        officers?: ApiMandateOfficer[];
      }
    ): Promise<ApiAssociationMandate> {
      const stored = getLocalState<ApiAssociationMandate[]>(STORAGE_KEYS.ASSOCIATION_MANDATES, []);
      let res: ApiAssociationMandate;
      try {
        res = await apiClient.fetch<ApiAssociationMandate>(`associations/${associationId}/mandates/${mandateId}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } catch {
        const found = stored.find((m) => m.id === mandateId);
        if (!found) throw new Error("Mandature introuvable");
        res = {
          ...found,
          ...data,
          updatedAt: new Date().toISOString(),
        };
      }
      const updated = stored.map((m) => (m.id === mandateId ? res : m));
      setLocalState(STORAGE_KEYS.ASSOCIATION_MANDATES, updated);
      return res;
    },

    async activate(associationId: string, mandateId: string): Promise<ApiAssociationMandate> {
      const stored = getLocalState<ApiAssociationMandate[]>(STORAGE_KEYS.ASSOCIATION_MANDATES, []);
      let res: ApiAssociationMandate;
      try {
        res = await apiClient.fetch<ApiAssociationMandate>(`associations/${associationId}/mandates/${mandateId}/activate`, {
          method: "POST",
        });
      } catch {
        const found = stored.find((m) => m.id === mandateId);
        if (!found) throw new Error("Mandature introuvable");
        res = {
          ...found,
          status: "ACTIVE",
          updatedAt: new Date().toISOString(),
        };
      }
      const updated = stored.map((m) => {
        if (m.associationId === associationId) {
          if (m.id === mandateId) return res;
          if (m.status === "ACTIVE") return { ...m, status: "COMPLETED" as const };
        }
        return m;
      });
      setLocalState(STORAGE_KEYS.ASSOCIATION_MANDATES, updated);
      return res;
    },

    async handover(
      associationId: string,
      data: {
        outgoingMandateId: string;
        incomingMandateId?: string;
        incomingPresidentName: string;
        incomingPresidentUserId?: string;
        incomingSecretaryName?: string;
        incomingTreasurerName?: string;
        handoverDate: string;
        treasuryTransferredAmount: number;
        handoverNotes: string;
        checklist?: string[];
      }
    ): Promise<{ success: boolean; mandate: ApiAssociationMandate; pvDocumentRef: string; message: string }> {
      const stored = getLocalState<ApiAssociationMandate[]>(STORAGE_KEYS.ASSOCIATION_MANDATES, []);
      let res: { success: boolean; mandate: ApiAssociationMandate; pvDocumentRef: string; message: string };
      try {
        res = await apiClient.fetch(`associations/${associationId}/handover`, {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch {
        const outgoing = stored.find((m) => m.id === data.outgoingMandateId);
        const pvDoc = `PV-PASSATION-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const updatedOutgoing: ApiAssociationMandate = outgoing
          ? {
              ...outgoing,
              status: "COMPLETED",
              handoverDate: data.handoverDate,
              outgoingPresidentName: outgoing.presidentName,
              incomingPresidentName: data.incomingPresidentName,
              handoverNotes: data.handoverNotes,
              treasuryTransferredAmount: data.treasuryTransferredAmount,
              pvDocumentRef: pvDoc,
              updatedAt: new Date().toISOString(),
            }
          : ({} as any);

        res = {
          success: true,
          mandate: updatedOutgoing,
          pvDocumentRef: pvDoc,
          message: "Passation de service enregistrée avec succès.",
        };
      }

      if (res.mandate?.id) {
        const updated = stored.map((m) => (m.id === res.mandate.id ? res.mandate : m));
        setLocalState(STORAGE_KEYS.ASSOCIATION_MANDATES, updated);
      }
      return res;
    },
  },
};
