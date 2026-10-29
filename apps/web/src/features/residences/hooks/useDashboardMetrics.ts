import { useState, useEffect, useCallback } from "react";
import { residenceApiService } from "../services/residence-api.service";
import { associationGovernanceApiService } from "@/features/associations";
import { ApiRoom, ApiBuilding, ApiOccupation } from "../types/residence-api.types";
import { ApiAssociation } from "@/features/associations/types/association-api.types";

export interface DashboardMetricsData {
  totalRooms: number;
  buildingsCount: number;
  activeOccupations: number;
  occupancyRate: string;
  totalAssociations: number;
  totalMembers: number;
  totalTreasury: number;
}

export interface UseDashboardMetricsReturn {
  metrics: DashboardMetricsData;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Custom Hook gérant l'agrégation et le calcul des métriques du tableau de bord (SRP, DIP)
 */
export function useDashboardMetrics(): UseDashboardMetricsReturn {
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [buildings, setBuildings] = useState<ApiBuilding[]>([]);
  const [associations, setAssociations] = useState<ApiAssociation[]>([]);
  const [occupations, setOccupations] = useState<ApiOccupation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rList, bList, aList, oList] = await Promise.all([
        residenceApiService.residences.getRooms(),
        residenceApiService.residences.getBuildings(),
        associationGovernanceApiService.associations.list(),
        residenceApiService.residences.getOccupations(),
      ]);
      setRooms(rList);
      setBuildings(bList);
      setAssociations(aList);
      setOccupations(oList);
    } catch (err) {
      console.error("useDashboardMetrics error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    void (async () => {
      try {
        const [rList, bList, aList, oList] = await Promise.all([
          residenceApiService.residences.getRooms(),
          residenceApiService.residences.getBuildings(),
          associationGovernanceApiService.associations.list(),
          residenceApiService.residences.getOccupations(),
        ]);
        if (!ignore) {
          setRooms(rList);
          setBuildings(bList);
          setAssociations(aList);
          setOccupations(oList);
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error("useDashboardMetrics error:", err);
          setIsLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const totalRooms = rooms.length;
  const activeOccupations = occupations.filter((o) => o.isActive).length;
  const occupancyRate =
    totalRooms > 0 ? ((activeOccupations / totalRooms) * 100).toFixed(1) : "0.0";

  const totalAssociations = associations.length;
  const totalMembers = associations.reduce(
    (acc, a) => acc + (a.membersCount || a.members?.length || 1),
    0
  );

  const totalTreasury = associations.reduce(
    (acc, a) => acc + (a.treasuryBalanceXOF || (a.monthlyDuesXOF || 1000) * 12),
    0
  );

  return {
    metrics: {
      totalRooms,
      buildingsCount: buildings.length,
      activeOccupations,
      occupancyRate,
      totalAssociations,
      totalMembers,
      totalTreasury,
    },
    isLoading,
    refresh: fetchMetrics,
  };
}
