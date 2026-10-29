import { useState, useCallback } from "react";
import { residenceApiService } from "../services/residence-api.service";
import { ApiRoom } from "../types/residence-api.types";

export interface RoomMaintenanceInput {
  category: string;
  priority: "NORMAL" | "URGENT" | "CRITICAL";
  description: string;
  technicianName: string;
  technicianPhone: string;
  estimatedCostXOF: number;
  setInMaintenance: boolean;
}

export interface UseRoomMaintenanceReturn {
  isSubmitting: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  submitMaintenance: (room: ApiRoom, input: RoomMaintenanceInput) => Promise<void>;
}

/**
 * Custom Hook gérant la politique et les transitions d'état de maintenance (SRP, DIP)
 */
export function useRoomMaintenance(): UseRoomMaintenanceReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitMaintenance = useCallback(
    async (room: ApiRoom, input: RoomMaintenanceInput): Promise<void> => {
      setError(null);
      setIsSubmitting(true);

      try {
        // Règle Métier Pure (Policy / Specification Pattern)
        if (input.setInMaintenance && room.status !== "MAINTENANCE") {
          if (room.status === "OCCUPIED") {
            throw new Error(
              "Impossible de basculer une chambre occupée en maintenance. Résiliez d'abord le bail ou signalez une intervention en milieu occupé."
            );
          }
          await residenceApiService.residences.updateRoomStatus(room.id, "MAINTENANCE");
        } else if (!input.setInMaintenance && room.status === "MAINTENANCE") {
          await residenceApiService.residences.updateRoomStatus(room.id, "AVAILABLE");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erreur lors de la déclaration de l'incident.";
        setError(msg);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return {
    isSubmitting,
    error,
    setError,
    submitMaintenance,
  };
}
