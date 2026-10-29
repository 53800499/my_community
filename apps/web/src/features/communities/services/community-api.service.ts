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

export const DEFAULT_COMMUNITIES: ApiCommunity[] = [
  {
    id: "4f79ff2c-c965-4af7-a99e-de4e4bf457dc",
    name: "Habitants de Zogbadjè (Abomey-Calavi)",
    slug: "habitants-de-zogbadje",
    description: "Espace citoyen de concertation, salubrité et solidarité des résidents de Zogbadjè et du campus.",
    type: "TERRITORIAL",
    territoryId: "territory-calavi",
    territoryName: "Abomey-Calavi",
    membersCount: 142,
    status: "ACTIVE",
  },
  {
    id: "02554230-fa9f-4494-acc0-1f0652e217a9",
    name: "Campus Universitaire Tankpè (UAC)",
    slug: "campus-universitaire-tankpe",
    description: "Communauté de vie étudiante, entraide académique et gestion des résidences universitaires.",
    type: "TERRITORIAL",
    territoryId: "territory-calavi",
    territoryName: "Abomey-Calavi",
    membersCount: 88,
    status: "ACTIVE",
  },
  {
    id: "62cd05e4-f423-4055-acb8-58af601405d0",
    name: "Godomey Centre & Environs",
    slug: "godomey-centre",
    description: "Rassemblement des familles, commerçants et jeunes de Godomey pour le développement local.",
    type: "TERRITORIAL",
    territoryId: "territory-godomey",
    territoryName: "Godomey",
    membersCount: 65,
    status: "ACTIVE",
  },
  {
    id: "99de87bc-1e47-4f92-a128-444455556666",
    name: "Développeurs & Innovateurs du Bénin",
    slug: "developpeurs-benin",
    description: "Communauté thématique tech, partage de projets open-source, hackathons et opportunités numériques.",
    type: "THEMATIC",
    membersCount: 210,
    status: "ACTIVE",
  },
];

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
    const stored = getLocalState<ApiCommunity[]>(STORAGE_KEYS.COMMUNITIES, []);
    if (stored.length === 0) {
      setLocalState(STORAGE_KEYS.COMMUNITIES, DEFAULT_COMMUNITIES);
      return DEFAULT_COMMUNITIES;
    }
    return stored;
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
    } catch (err) {
      console.warn("API requestMembership fallback to local resilient state:", err);
      const existing = memberships.find((m) => m.communityId === communityId && (!currentUser?.id || m.userId === currentUser.id));
      if (existing) {
        return existing;
      }
      const newMembership: ApiMembership = {
        id: generateUuid(),
        communityId,
        userId: currentUser?.id || "demo-citizen-id",
        status: "ACTIVE",
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
};
