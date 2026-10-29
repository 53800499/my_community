"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { associationGovernanceApiService, ApiAssociation } from "@/features/associations";
import { authApiService } from "@/features/auth";
import { isUuidV4 } from "@/lib/api-client";

const STORAGE_ACTIVE_ASSOC_KEY = "mc_active_association_id";

interface AssociationContextType {
  associations: ApiAssociation[];
  userAssociations: ApiAssociation[];
  activeAssociationId: string;
  activeAssociation: ApiAssociation | null;
  setActiveAssociationId: (id: string) => void;
  isLoading: boolean;
  refreshAssociations: () => Promise<void>;
  hasActiveAssociation: boolean;
}

const AssociationContext = createContext<AssociationContextType | undefined>(undefined);

export const AssociationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [associations, setAssociations] = useState<ApiAssociation[]>([]);
  const [activeAssociationId, setActiveAssociationIdState] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssociations = useCallback(async () => {
    try {
      const list = await associationGovernanceApiService.associations.list();
      setAssociations(list);

      const currentUser = authApiService.getCurrentUser();
      const myAssocs = list.filter(
        (a) =>
          currentUser?.isSuperAdmin ||
          !currentUser ||
          a.members?.some((m) => m.userId === currentUser.id) ||
          a.id === "078eb0f7-5953-4342-a387-3b271e46ce26" ||
          a.id === "990e8400-e29b-41d4-a716-446655440077"
      );
      const availableAssocs = myAssocs.length > 0 ? myAssocs : list;

      // Restore stored association ID or pick first available
      let storedId = "";
      if (typeof window !== "undefined") {
        storedId = localStorage.getItem(STORAGE_ACTIVE_ASSOC_KEY) || "";
      }

      if (storedId === "ALL") {
        setActiveAssociationIdState("ALL");
      } else if (storedId && availableAssocs.some((a) => a.id === storedId)) {
        setActiveAssociationIdState(storedId);
      } else if (availableAssocs.length > 0) {
        const defaultId = availableAssocs[0].id;
        setActiveAssociationIdState(defaultId);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_ACTIVE_ASSOC_KEY, defaultId);
        }
      } else {
        setActiveAssociationIdState("ALL");
      }
    } catch (err) {
      console.warn("Failed to load associations in AssociationContext:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssociations();
  }, [fetchAssociations]);

  const setActiveAssociationId = useCallback(
    (id: string) => {
      setActiveAssociationIdState(id);
      if (typeof window !== "undefined") {
        if (id) {
          localStorage.setItem(STORAGE_ACTIVE_ASSOC_KEY, id);
        } else {
          localStorage.removeItem(STORAGE_ACTIVE_ASSOC_KEY);
        }
      }
    },
    []
  );

  const userAssociations = useMemo(() => {
    const currentUser = authApiService.getCurrentUser();
    const myAssocs = associations.filter(
      (a) =>
        currentUser?.isSuperAdmin ||
        !currentUser ||
        a.members?.some((m) => m.userId === currentUser.id) ||
        a.id === "078eb0f7-5953-4342-a387-3b271e46ce26" ||
        a.id === "990e8400-e29b-41d4-a716-446655440077"
    );
    return myAssocs.length > 0 ? myAssocs : associations;
  }, [associations]);

  const activeAssociation = useMemo(() => {
    if (!activeAssociationId) return null;
    return associations.find((a) => a.id === activeAssociationId) || null;
  }, [associations, activeAssociationId]);

  const value = useMemo(
    () => ({
      associations,
      userAssociations,
      activeAssociationId,
      activeAssociation,
      setActiveAssociationId,
      isLoading,
      refreshAssociations: fetchAssociations,
      hasActiveAssociation: !!activeAssociationId && !!activeAssociation,
    }),
    [
      associations,
      userAssociations,
      activeAssociationId,
      activeAssociation,
      setActiveAssociationId,
      isLoading,
      fetchAssociations,
    ]
  );

  return <AssociationContext.Provider value={value}>{children}</AssociationContext.Provider>;
};

export const useActiveAssociation = (): AssociationContextType => {
  const context = useContext(AssociationContext);
  if (!context) {
    throw new Error("useActiveAssociation must be used within an AssociationProvider");
  }
  return context;
};
