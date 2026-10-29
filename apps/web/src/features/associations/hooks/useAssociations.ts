'use client';

import { useState, useEffect, useCallback } from 'react';
import { Association, RegisterAssociationInput } from '../domain/association.types';
import { associationApiService } from '../services/association-api.service';

/**
 * Hook Découplé : Gestion du catalogue et du contexte d'association active (SRP)
 */
export function useAssociations(initialAssocId?: string) {
  const [associations, setAssociations] = useState<Association[]>([]);
  const [selectedAssocId, setSelectedAssocId] = useState<string>(initialAssocId || '');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssociations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await associationApiService.listAssociations();
      setAssociations(list);
      if (list.length > 0 && !selectedAssocId) {
        setSelectedAssocId(list[0].id);
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur lors du chargement des associations.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAssocId]);

  useEffect(() => {
    fetchAssociations();
  }, [fetchAssociations]);

  const selectAssociation = useCallback((id: string) => {
    setSelectedAssocId(id);
  }, []);

  const registerAssociation = useCallback(async (input: RegisterAssociationInput): Promise<Association> => {
    setIsLoading(true);
    try {
      const created = await associationApiService.registerAssociation(input);
      setAssociations((prev) => [created, ...prev.filter((a) => a.id !== created.id)]);
      setSelectedAssocId(created.id);
      return created;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const linkCommunity = useCallback(async (associationId: string, communityId: string) => {
    await associationApiService.linkCommunity(associationId, communityId);
    setAssociations((prev) =>
      prev.map((a) => {
        if (a.id === associationId) {
          const links = a.linkedCommunityIds || [];
          return {
            ...a,
            linkedCommunityIds: Array.from(new Set([...links, communityId])),
          };
        }
        return a;
      }),
    );
  }, []);

  const selectedAssociation = associations.find((a) => a.id === selectedAssocId) || associations[0];

  return {
    associations,
    selectedAssociation,
    selectedAssocId,
    selectAssociation,
    isLoading,
    error,
    refresh: fetchAssociations,
    registerAssociation,
    linkCommunity,
  };
}
