import { useState, useEffect, useCallback } from "react";
import { communityApiService } from "../services/community-api.service";
import { ApiMembership } from "../types/community.types";

export interface UseMyMembershipsReturn {
  memberships: ApiMembership[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Custom Hook gérant les adhésions du citoyen connecté (SRP, DIP)
 */
export function useMyMemberships(): UseMyMembershipsReturn {
  const [memberships, setMemberships] = useState<ApiMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberships = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await communityApiService.getMyMemberships();
      setMemberships(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors du chargement des adhésions.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  return {
    memberships,
    isLoading,
    error,
    refresh: fetchMemberships,
  };
}
