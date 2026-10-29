'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Association,
  AssociationPosition,
  CreatePositionInput,
  AssignPositionInput,
} from '../domain/association.types';
import { associationApiService } from '../services/association-api.service';
import { AssociationPdfService } from '../services/association-pdf.service';

/**
 * Hook Découplé : Gestion de l'Organigramme, des Postes de Direction et de la Nomination (SRP & OCP)
 */
export function useAssociationBureau(association?: Association | null) {
  const [positions, setPositions] = useState<AssociationPosition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const assocId = association?.id;

  const loadPositions = useCallback(async () => {
    if (!assocId) return;
    setIsLoading(true);
    setError(null);
    try {
      const list = await associationApiService.listPositions(assocId);
      setPositions(list);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors du chargement des postes.');
    } finally {
      setIsLoading(false);
    }
  }, [assocId]);

  useEffect(() => {
    loadPositions();
  }, [loadPositions]);

  // Création d'un poste libre dans l'organigramme
  const createPosition = useCallback(
    async (input: CreatePositionInput): Promise<AssociationPosition> => {
      if (!assocId) throw new Error('Association introuvable.');
      setIsSubmitting(true);
      try {
        const created = await associationApiService.createPosition(assocId, input);
        setPositions((prev) => [...prev, created]);
        return created;
      } finally {
        setIsSubmitting(false);
      }
    },
    [assocId],
  );

  // Nomination ou passation de service
  const assignPosition = useCallback(
    async (positionId: string, input: AssignPositionInput): Promise<AssociationPosition> => {
      if (!assocId) throw new Error('Association introuvable.');
      setIsSubmitting(true);
      try {
        const updated = await associationApiService.assignPosition(assocId, positionId, input);
        setPositions((prev) => prev.map((p) => (p.id === positionId ? updated : p)));
        return updated;
      } finally {
        setIsSubmitting(false);
      }
    },
    [assocId],
  );

  // Rendre un poste vacant / Démission
  const vacatePosition = useCallback(
    async (positionId: string): Promise<AssociationPosition> => {
      if (!assocId) throw new Error('Association introuvable.');
      setIsSubmitting(true);
      try {
        const vacated = await associationApiService.vacatePosition(assocId, positionId);
        setPositions((prev) => prev.map((p) => (p.id === positionId ? vacated : p)));
        return vacated;
      } finally {
        setIsSubmitting(false);
      }
    },
    [assocId],
  );

  // Supprimer un poste créé sur mesure
  const deletePosition = useCallback(
    async (positionId: string): Promise<void> => {
      if (!assocId) return;
      setIsSubmitting(true);
      try {
        await associationApiService.deletePosition(assocId, positionId);
        setPositions((prev) => prev.filter((p) => p.id !== positionId));
      } finally {
        setIsSubmitting(false);
      }
    },
    [assocId],
  );

  // Export PDF vectoriel officiel
  const exportOrganigrammePdf = useCallback(() => {
    if (!association) return;
    AssociationPdfService.generateOrganigrammePdf({
      association,
      positions,
    });
  }, [association, positions]);

  // Métriques et groupement par pôle
  const metrics = useMemo(() => {
    const total = positions.length;
    const occupied = positions.filter((p) => p.status === 'OCCUPIED').length;
    const vacant = positions.filter((p) => p.status === 'VACANT').length;
    const fillRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { total, occupied, vacant, fillRate };
  }, [positions]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    positions.forEach((p) => set.add(p.department));
    return Array.from(set);
  }, [positions]);

  // Configuration des permissions et espaces d'accès (RBAC contextualisé)
  const updatePermissions = useCallback(
    async (
      positionId: string,
      accessSpaces: string[],
      permissions: string[],
    ): Promise<AssociationPosition> => {
      if (!assocId) throw new Error('Association introuvable.');
      setIsSubmitting(true);
      try {
        const updated = await associationApiService.updatePositionPermissions(
          assocId,
          positionId,
          accessSpaces,
          permissions,
        );
        setPositions((prev) => prev.map((p) => (p.id === positionId ? updated : p)));
        return updated;
      } finally {
        setIsSubmitting(false);
      }
    },
    [assocId],
  );

    // Initialiser le modèle de bureau exécutif par défaut
    const initializeDefaultBureau = useCallback(async (): Promise<AssociationPosition[]> => {
      if (!assocId) throw new Error('Association introuvable.');
      setIsSubmitting(true);
      try {
        const defaultPositions = await associationApiService.initializeDefaultBureau(assocId);
        setPositions(defaultPositions);
        return defaultPositions;
      } finally {
        setIsSubmitting(false);
      }
    }, [assocId]);

    return {
      positions,
      isLoading,
      isSubmitting,
      error,
      metrics,
      departments,
      createPosition,
      assignPosition,
      vacatePosition,
      deletePosition,
      updatePermissions,
      initializeDefaultBureau,
      exportOrganigrammePdf,
      reload: loadPositions,
    };
}
