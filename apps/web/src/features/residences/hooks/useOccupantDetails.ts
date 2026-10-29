import { useState, useEffect, useCallback } from "react";
import { residenceApiService } from "../services/residence-api.service";
import {
  ApiResident,
  ApiRoom,
  ApiOccupation,
} from "../types/residence-api.types";

export interface UseOccupantDetailsOptions {
  isOpen: boolean;
  residentId?: string | null;
  room?: ApiRoom | null;
  occupation?: ApiOccupation | null;
}

export interface UseOccupantDetailsReturn {
  resident: ApiResident | null;
  isLoading: boolean;
  isTerminating: boolean;
  activeOccupation: { id: string; roomId?: string } | null;
  terminateCurrentLease: () => Promise<void>;
}

/**
 * Custom Hook gérant la fiche de détails d'un résident et la clôture de son bail (SRP, DIP)
 */
export function useOccupantDetails({
  isOpen,
  residentId,
  room,
  occupation,
}: UseOccupantDetailsOptions): UseOccupantDetailsReturn {
  const [resident, setResident] = useState<ApiResident | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const targetUserId =
      residentId ||
      occupation?.occupantUserId ||
      room?.currentOccupation?.occupantUserId;

    if (!targetUserId) {
      return;
    }

    let ignore = false;
    setIsLoading(true);
    residenceApiService.residences
      .getResidentById(targetUserId)
      .then((res) => {
        if (ignore) return;
        if (res) {
          setResident(res);
        } else {
          setResident(null);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("useOccupantDetails fetch error:", err);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [isOpen, residentId, occupation, room]);

  const activeContract = resident?.contracts.find((c) => c.isActive);
  const rawActiveOcc = occupation || room?.currentOccupation;
  const activeOccId = activeContract?.id || rawActiveOcc?.id;
  const activeRoomId =
    activeContract?.roomId ||
    (rawActiveOcc && "roomId" in rawActiveOcc ? rawActiveOcc.roomId : room?.id);

  const activeOccupation = activeOccId
    ? { id: activeOccId, roomId: activeRoomId }
    : null;

  const terminateCurrentLease = useCallback(async (): Promise<void> => {
    if (!activeOccId) return;
    setIsTerminating(true);
    try {
      await residenceApiService.residences.terminateOccupation(activeOccId, activeRoomId);
      setResident((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          isActiveResident: false,
          contracts: prev.contracts.map((c) =>
            c.id === activeOccId
              ? { ...c, isActive: false, status: "TERMINATED" as const }
              : c
          ),
        };
      });
    } finally {
      setIsTerminating(false);
    }
  }, [activeOccId, activeRoomId]);

  return {
    resident: isOpen ? resident : null,
    isLoading,
    isTerminating,
    activeOccupation,
    terminateCurrentLease,
  };
}
