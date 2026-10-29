import { useState, useEffect, useCallback } from "react";
import { communityApiService } from "../services/community-api.service";
import { territoryApiService } from "@/features/territories";
import { ApiCommunityProposal } from "../types/community.types";
import { ApiTerritory } from "@/features/territories";

export interface ProposeCommunityInput {
  name: string;
  description: string;
  justification: string;
  territoryId: string;
  type: "TERRITORIAL" | "THEMATIC";
}

export interface UseProposeCommunityReturn {
  departments: ApiTerritory[];
  name: string;
  setName: (val: string) => void;
  territoryId: string;
  setTerritoryId: (val: string) => void;
  type: "TERRITORIAL" | "THEMATIC";
  setType: (val: "TERRITORIAL" | "THEMATIC") => void;
  description: string;
  setDescription: (val: string) => void;
  justification: string;
  setJustification: (val: string) => void;
  isSubmitting: boolean;
  error: string | null;
  setError: (val: string | null) => void;
  isSuccess: boolean;
  submitProposal: () => Promise<ApiCommunityProposal>;
  resetForm: () => void;
}

/**
 * Custom Hook gérant la création et validation d'une proposition citoyenne (SRP, DIP)
 */
export function useProposeCommunity(isOpen: boolean): UseProposeCommunityReturn {
  const [departments, setDepartments] = useState<ApiTerritory[]>([]);
  const [name, setName] = useState("");
  const [territoryId, setTerritoryId] = useState("");
  const [type, setType] = useState<"TERRITORIAL" | "THEMATIC">("TERRITORIAL");
  const [description, setDescription] = useState("");
  const [justification, setJustification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      territoryApiService.getDepartments().then((depts) => {
        setDepartments(depts);
        if (depts.length > 0 && !territoryId) {
          setTerritoryId(depts[0].id);
        }
      });
    }
  }, [isOpen, territoryId]);

  const resetForm = useCallback(() => {
    setName("");
    setDescription("");
    setJustification("");
    setError(null);
    setIsSuccess(false);
  }, []);

  const submitProposal = useCallback(async (): Promise<ApiCommunityProposal> => {
    setError(null);

    // Domain validation (Single Responsibility)
    if (name.trim().length < 3) {
      const msg = "Le nom de l'espace citoyen doit contenir au moins 3 caractères.";
      setError(msg);
      throw new Error(msg);
    }
    if (description.trim().length < 10) {
      const msg = "La description doit faire au moins 10 caractères.";
      setError(msg);
      throw new Error(msg);
    }
    if (justification.trim().length < 10) {
      const msg = "La justification d'utilité publique doit faire au moins 10 caractères.";
      setError(msg);
      throw new Error(msg);
    }
    if (!territoryId) {
      const msg = "Veuillez sélectionner un territoire de rattachement.";
      setError(msg);
      throw new Error(msg);
    }

    setIsSubmitting(true);
    try {
      const res = await communityApiService.submitProposal({
        name: name.trim(),
        description: description.trim(),
        justification: justification.trim(),
        territoryId,
      });
      setIsSuccess(true);
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la soumission de la proposition.";
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [name, description, justification, territoryId]);

  return {
    departments,
    name,
    setName,
    territoryId,
    setTerritoryId,
    type,
    setType,
    description,
    setDescription,
    justification,
    setJustification,
    isSubmitting,
    error,
    setError,
    isSuccess,
    submitProposal,
    resetForm,
  };
}
