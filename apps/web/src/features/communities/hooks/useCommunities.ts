import { useState, useEffect, useCallback } from "react";
import { communityApiService } from "../services/community-api.service";
import { ApiCommunity } from "../types/community.types";

export interface UseCommunitiesReturn {
  communities: ApiCommunity[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Custom Hook gérant la récupération et le rafraîchissement des communautés (SRP, DIP)
 */
export function useCommunities(): UseCommunitiesReturn {
  const [communities, setCommunities] = useState<ApiCommunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await communityApiService.list();
      setCommunities(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors du chargement des espaces citoyens.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  return {
    communities,
    isLoading,
    error,
    refresh: fetchCommunities,
  };
}
