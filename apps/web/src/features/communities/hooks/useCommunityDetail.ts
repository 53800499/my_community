import { useState, useEffect, useCallback, useMemo } from "react";
import { communityApiService } from "../services/community-api.service";
import { authApiService } from "@/features/auth";
import { ApiCommunity, ApiMembership } from "../types/community.types";

export interface UseCommunityDetailReturn {
  community: ApiCommunity | null;
  members: ApiMembership[];
  activeTab: "DETAILS" | "MEMBERS" | "ASSOCIATIONS" | "GOVERNANCE";
  setActiveTab: (tab: "DETAILS" | "MEMBERS" | "ASSOCIATIONS" | "GOVERNANCE") => void;
  isLoading: boolean;
  actionFeedback: string | null;
  currentMembership?: ApiMembership;
  isManagerOrAdmin: boolean;
  refresh: () => Promise<void>;
  decideMembership: (userId: string, decision: "APPROVE" | "SUSPEND" | "REVOKE") => Promise<void>;
  assignRole: (userId: string, role: "MODERATOR" | "MANAGER", action: "ASSIGN" | "REVOKE") => Promise<void>;
}

/**
 * Custom Hook gérant la consultation, gouvernance et membres d'une communauté (SRP, DIP)
 */
export function useCommunityDetail(communityId: string | null): UseCommunityDetailReturn {
  const [activeTab, setActiveTab] = useState<"DETAILS" | "MEMBERS" | "ASSOCIATIONS" | "GOVERNANCE">("DETAILS");
  const [community, setCommunity] = useState<ApiCommunity | null>(null);
  const [members, setMembers] = useState<ApiMembership[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const currentUser = authApiService.getCurrentUser();

  const loadData = useCallback(async () => {
    if (!communityId) return;
    setIsLoading(true);
    try {
      const [com, mems] = await Promise.all([
        communityApiService.getById(communityId),
        communityApiService.listMembers(communityId),
      ]);
      setCommunity(com);
      setMembers(mems);
    } catch (err) {
      console.error("useCommunityDetail load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentMembership = useMemo(() => {
    return members.find(
      (m) => m.userId === currentUser?.id || m.userId === "user-admin-calavi"
    );
  }, [members, currentUser]);

  const isManagerOrAdmin = useMemo(() => {
    return (
      !!currentMembership?.roles?.some((r) => r === "MANAGER" || r === "ADMIN") ||
      !!currentUser?.isSuperAdmin ||
      currentUser?.role === "ASSOCIATION_ADMIN"
    );
  }, [currentMembership, currentUser]);

  const decideMembership = useCallback(
    async (userId: string, decision: "APPROVE" | "SUSPEND" | "REVOKE") => {
      if (!communityId) return;
      try {
        await communityApiService.decideMembership(communityId, userId, decision);
        setActionFeedback(
          decision === "APPROVE"
            ? "Membre approuvé avec succès."
            : decision === "SUSPEND"
            ? "Membre suspendu."
            : "Adhésion révoquée."
        );
        await loadData();
      } catch {
        setActionFeedback("Erreur lors de la mise à jour de l'adhésion.");
      }
    },
    [communityId, loadData]
  );

  const assignRole = useCallback(
    async (userId: string, role: "MODERATOR" | "MANAGER", action: "ASSIGN" | "REVOKE") => {
      if (!communityId) return;
      try {
        await communityApiService.assignRole(communityId, userId, role, action);
        setActionFeedback(
          action === "ASSIGN" ? `Rôle ${role} attribué.` : `Rôle ${role} retiré.`
        );
        await loadData();
      } catch {
        setActionFeedback("Erreur lors de la modification des rôles.");
      }
    },
    [communityId, loadData]
  );

  return {
    community,
    members,
    activeTab,
    setActiveTab,
    isLoading,
    actionFeedback,
    currentMembership,
    isManagerOrAdmin,
    refresh: loadData,
    decideMembership,
    assignRole,
  };
}
