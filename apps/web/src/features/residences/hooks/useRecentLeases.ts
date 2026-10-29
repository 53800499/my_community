import { useState, useEffect, useCallback, useMemo } from "react";
import { residenceApiService } from "../services/residence-api.service";
import {
  ApiOccupation,
  ApiRoom,
  ApiBuilding,
  ApiQuarter,
} from "../types/residence-api.types";

export interface EnrichedLeaseRow {
  occupation: ApiOccupation;
  room?: ApiRoom;
  building?: ApiBuilding;
  quarter?: ApiQuarter;
}

export interface UseRecentLeasesReturn {
  leases: EnrichedLeaseRow[];
  isLoading: boolean;
  filter: string;
  setFilter: (val: string) => void;
  terminatingId: string | null;
  refresh: () => Promise<void>;
  terminateLease: (occupationId: string, roomId: string) => Promise<void>;
}

/**
 * Custom Hook gérant l'agrégation des baux récents et leur clôture (SRP, DIP)
 */
export function useRecentLeases(): UseRecentLeasesReturn {
  const [occupations, setOccupations] = useState<ApiOccupation[]>([]);
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [buildings, setBuildings] = useState<ApiBuilding[]>([]);
  const [quarters, setQuarters] = useState<ApiQuarter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [terminatingId, setTerminatingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [oList, rList, bList, qList] = await Promise.all([
        residenceApiService.residences.getOccupations(),
        residenceApiService.residences.getRooms(),
        residenceApiService.residences.getBuildings(),
        residenceApiService.residences.getQuarters(),
      ]);
      setOccupations(oList);
      setRooms(rList);
      setBuildings(bList);
      setQuarters(qList);
    } catch (err) {
      console.error("useRecentLeases load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    void (async () => {
      try {
        const [oList, rList, bList, qList] = await Promise.all([
          residenceApiService.residences.getOccupations(),
          residenceApiService.residences.getRooms(),
          residenceApiService.residences.getBuildings(),
          residenceApiService.residences.getQuarters(),
        ]);
        if (!ignore) {
          setOccupations(oList);
          setRooms(rList);
          setBuildings(bList);
          setQuarters(qList);
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error("useRecentLeases load error:", err);
          setIsLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const terminateLease = useCallback(
    async (occupationId: string, roomId: string): Promise<void> => {
      setTerminatingId(occupationId);
      try {
        await residenceApiService.residences.terminateOccupation(occupationId, roomId);
        await loadData();
      } catch (err) {
        console.error("terminateLease error:", err);
        throw err;
      } finally {
        setTerminatingId(null);
      }
    },
    [loadData]
  );

  const leases = useMemo<EnrichedLeaseRow[]>(() => {
    const enriched = occupations.map((occ) => {
      const room = rooms.find((r) => r.id === occ.roomId);
      const building = buildings.find((b) => b.id === room?.buildingId);
      const quarter = quarters.find((q) => q.id === building?.quarterId);
      return { occupation: occ, room, building, quarter };
    });

    if (!filter.trim()) return enriched;

    const q = filter.toLowerCase();
    return enriched.filter(
      (item) =>
        item.occupation.occupantName?.toLowerCase().includes(q) ||
        item.room?.roomNumber?.toLowerCase().includes(q) ||
        item.building?.name?.toLowerCase().includes(q) ||
        item.quarter?.name?.toLowerCase().includes(q)
    );
  }, [occupations, rooms, buildings, quarters, filter]);

  return {
    leases,
    isLoading,
    filter,
    setFilter,
    terminatingId,
    refresh: loadData,
    terminateLease,
  };
}
