import {
  apiClient,
  STORAGE_KEYS,
  getLocalState,
  setLocalState,
  generateUuid,
} from "@/lib/api-client";
import { authApiService } from "@/features/auth/services/auth-api.service";
import {
  ApiCommunity,
  ApiCommunityProposal,
  ApiMembership,
} from "../types/community.types";

export const communityApiService = {
  async list(): Promise<ApiCommunity[]> {
    try {
      const res = await apiClient.fetch<ApiCommunity[]>("communities");
      if (res && res.length > 0) {
        const mapped: ApiCommunity[] = res.map((c) => ({
          ...c,
          type: c.type || "TERRITORIAL",
          membersCount: c.membersCount || 1,
          status: c.status || "ACTIVE",
        }));
        setLocalState(STORAGE_KEYS.COMMUNITIES, mapped);
        return mapped;
      }
    } catch (err) {
      console.warn("API /communities unreachable, fallback to storage:", err);
    }
    return getLocalState<ApiCommunity[]>(STORAGE_KEYS.COMMUNITIES, []);
  },

  async getById(id: string): Promise<ApiCommunity> {
    try {
      const res = await apiClient.fetch<ApiCommunity>(`communities/${id}`);
      if (res) return res;
    } catch {
      // fallback to cached list
    }
    const list = await this.list();
    const found = list.find((c) => c.id === id);
    if (!found) {
      throw new Error(`Communauté non trouvée (${id})`);
    }
    return found;
  },

  // Soumettre une proposition d'espace citoyen
  async submitProposal(data: {
    name: string;
    description: string;
    justification: string;
    territoryId: string;
  }): Promise<ApiCommunityProposal> {
    const proposals = getLocalState<ApiCommunityProposal[]>(STORAGE_KEYS.PROPOSALS, []);
    const res = await apiClient.fetch<ApiCommunityProposal>("community-proposals", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const updated = [res, ...proposals.filter((p) => p.id !== res.id)];
    setLocalState(STORAGE_KEYS.PROPOSALS, updated);
    return res;
  },

  // Lister mes propositions citoyennes
  async getMyProposals(): Promise<ApiCommunityProposal[]> {
    const currentUser = authApiService.getCurrentUser();
    try {
      const res = await apiClient.fetch<ApiCommunityProposal[]>("community-proposals/my");
      if (res && res.length >= 0) {
        setLocalState(STORAGE_KEYS.PROPOSALS, res);
        return res;
      }
    } catch (err) {
      console.warn("API /community-proposals/my unreachable, fallback to storage:", err);
    }
    const stored = getLocalState<ApiCommunityProposal[]>(STORAGE_KEYS.PROPOSALS, []);
    return stored.filter((p) => p.proposedById === currentUser?.id);
  },

  // Lister toutes les propositions à instruire (Admin)
  async getAdminProposals(): Promise<ApiCommunityProposal[]> {
    try {
      const res = await apiClient.fetch<ApiCommunityProposal[]>("admin/community-proposals");
      if (res && res.length >= 0) {
        setLocalState(STORAGE_KEYS.PROPOSALS, res);
        return res;
      }
    } catch (err) {
      console.warn("API /admin/community-proposals unreachable, fallback to storage:", err);
    }
    return getLocalState<ApiCommunityProposal[]>(STORAGE_KEYS.PROPOSALS, []);
  },

  // Instruire une proposition citoyenne (APPROVE / REJECT)
  async reviewProposal(
    id: string,
    data: { decision: "APPROVED" | "REJECTED"; rejectionReason?: string }
  ): Promise<ApiCommunityProposal> {
    const proposals = getLocalState<ApiCommunityProposal[]>(STORAGE_KEYS.PROPOSALS, []);
    const res = await apiClient.fetch<ApiCommunityProposal>(`admin/community-proposals/${id}/review`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    const updatedProposals = proposals.map((p) => (p.id === id ? { ...p, ...res, status: data.decision } : p));
    setLocalState(STORAGE_KEYS.PROPOSALS, updatedProposals);

    // Refresh communities list from backend
    await this.list();

    return res;
  },

  // -------------------------------------------------------------------------
  // Adhésions (Memberships)
  // -------------------------------------------------------------------------

  async requestMembership(communityId: string): Promise<ApiMembership> {
    const memberships = getLocalState<ApiMembership[]>(STORAGE_KEYS.MEMBERSHIPS, []);
    const currentUser = authApiService.getCurrentUser();
    try {
      const res = await apiClient.fetch<ApiMembership>(`communities/${communityId}/memberships`, {
        method: "POST",
      });
      setLocalState(STORAGE_KEYS.MEMBERSHIPS, [res, ...memberships.filter((m) => m.id !== res.id && m.communityId !== res.communityId)]);
      return res;
    } catch (err: unknown) {
      console.warn("API requestMembership fallback to local resilient state:", err);
      const errMsg = String((err as { message?: string; detail?: string })?.message || (err as { detail?: string })?.detail || "");
      const isPendingConflict = errMsg.includes("en attente");
      const existing = memberships.find((m) => m.communityId === communityId && (!currentUser?.id || m.userId === currentUser.id));
      if (existing) {
        if (isPendingConflict && existing.status !== "PENDING") {
          const updatedExisting: ApiMembership = { ...existing, status: "PENDING" };
          setLocalState(STORAGE_KEYS.MEMBERSHIPS, [updatedExisting, ...memberships.filter((m) => m.id !== existing.id)]);
          return updatedExisting;
        }
        return existing;
      }
      const newMembership: ApiMembership = {
        id: generateUuid(),
        communityId,
        userId: currentUser?.id || "demo-citizen-id",
        status: "PENDING",
        joinedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        roles: ["MEMBER"],
      };
      const updated = [newMembership, ...memberships.filter((m) => m.communityId !== communityId)];
      setLocalState(STORAGE_KEYS.MEMBERSHIPS, updated);
      return newMembership;
    }
  },

  async listMembers(communityId: string, status?: string): Promise<ApiMembership[]> {
    try {
      const query = status ? `?status=${status}` : "";
      const res = await apiClient.fetch<ApiMembership[]>(`communities/${communityId}/memberships${query}`);
      if (res && res.length >= 0) {
        const stored = getLocalState<ApiMembership[]>(STORAGE_KEYS.MEMBERSHIPS, []);
        const localOnly = stored.filter(
          (m) =>
            m.communityId === communityId &&
            (!status || m.status === status) &&
            !res.some((r) => r.id === m.id || r.userId === m.userId)
        );
        return [...res, ...localOnly];
      }
    } catch (err) {
      console.warn("Failed to fetch community members from API", err);
    }
    const stored = getLocalState<ApiMembership[]>(STORAGE_KEYS.MEMBERSHIPS, []);
    return stored.filter(
      (m) => m.communityId === communityId && (!status || m.status === status)
    );
  },

  async decideMembership(
    communityId: string,
    userId: string,
    decision: "APPROVE" | "SUSPEND" | "REVOKE"
  ): Promise<ApiMembership> {
    const memberships = getLocalState<ApiMembership[]>(STORAGE_KEYS.MEMBERSHIPS, []);
    const newStatus: ApiMembership["status"] = decision === "APPROVE" ? "ACTIVE" : decision === "SUSPEND" ? "SUSPENDED" : "REVOKED";

    const res = await apiClient.fetch<ApiMembership>(`communities/${communityId}/memberships/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ decision }),
    });
    const updated = memberships.map((m) =>
      m.communityId === communityId && m.userId === userId ? { ...m, ...res, status: newStatus } : m
    );
    setLocalState(STORAGE_KEYS.MEMBERSHIPS, updated);
    return res;
  },

  async assignRole(
    communityId: string,
    userId: string,
    role: "MODERATOR" | "MANAGER",
    action: "ASSIGN" | "REVOKE"
  ): Promise<ApiMembership> {
    const memberships = getLocalState<ApiMembership[]>(STORAGE_KEYS.MEMBERSHIPS, []);

    const res = await apiClient.fetch<ApiMembership>(`communities/${communityId}/memberships/${userId}/roles`, {
      method: "POST",
      body: JSON.stringify({ role, action }),
    });
    const updated = memberships.map((m) =>
      m.communityId === communityId && m.userId === userId ? { ...m, ...res } : m
    );
    setLocalState(STORAGE_KEYS.MEMBERSHIPS, updated);
    return res;
  },

  async getMyMemberships(): Promise<ApiMembership[]> {
    const currentUser = authApiService.getCurrentUser();
    try {
      const comms = await this.list();
      const promises = comms.map(async (com) => {
        try {
          const members = await apiClient.fetch<ApiMembership[]>(`communities/${com.id}/memberships`);
          return members
            .filter((m) => m.userId === currentUser?.id)
            .map((m) => ({ ...m, communityName: com.name }));
        } catch {
          return [];
        }
      });
      const allMems = (await Promise.all(promises)).flat();
      if (allMems.length > 0) {
        setLocalState(STORAGE_KEYS.MEMBERSHIPS, allMems);
        return allMems;
      }
    } catch (err) {
      console.warn("Failed to fetch remote memberships", err);
    }
    const stored = getLocalState<ApiMembership[]>(STORAGE_KEYS.MEMBERSHIPS, []);
    return stored.filter((m) => !currentUser?.id || m.userId === currentUser.id || m.userId === "demo-citizen-id" || !m.userId);
  },

  /**
   * Dissoudre et supprimer un espace communautaire
   */
  async deleteCommunity(id: string, confirmationName?: string): Promise<{ success: boolean; communityId: string }> {
    try {
      const query = confirmationName ? `?confirmationName=${encodeURIComponent(confirmationName)}` : '';
      await apiClient.fetch(`communities/${id}${query}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("API DELETE communities/:id fallback to local state removal:", err);
    }

    // Supprimer des données locales
    const comms = getLocalState<ApiCommunity[]>(STORAGE_KEYS.COMMUNITIES, []);
    const updated = comms.filter((c) => c.id !== id);
    setLocalState(STORAGE_KEYS.COMMUNITIES, updated);

    // Supprimer les adhésions associées
    const mems = getLocalState<ApiMembership[]>(STORAGE_KEYS.MEMBERSHIPS, []);
    setLocalState(STORAGE_KEYS.MEMBERSHIPS, mems.filter((m) => m.communityId !== id));

    return { success: true, communityId: id };
  },
};
