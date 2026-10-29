'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AssociationMember,
  AddMemberInput,
  MemberProfessionalInfo,
  StudentOpportunityRelanceInput,
} from '../domain/association.types';
import { associationApiService } from '../services/association-api.service';

/**
 * Hook Découplé : Registre des Adhérents et Gestion des Cotisations (SRP)
 */
export function useAssociationMembers(associationId?: string) {
  const [members, setMembers] = useState<AssociationMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    if (!associationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const list = await associationApiService.listMembers(associationId);
      setMembers(list);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors du chargement des adhérents.');
    } finally {
      setIsLoading(false);
    }
  }, [associationId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const addMember = useCallback(
    async (input: AddMemberInput): Promise<AssociationMember> => {
      if (!associationId) throw new Error('Association introuvable.');
      setIsSubmitting(true);
      try {
        const created = await associationApiService.addMember(associationId, input);
        setMembers((prev) => [created, ...prev]);
        return created;
      } finally {
        setIsSubmitting(false);
      }
    },
    [associationId],
  );

  const dispatchOpportunityRelance = useCallback(
    async (
      input: StudentOpportunityRelanceInput,
    ): Promise<{ notifiedCount: number; message: string }> => {
      if (!associationId) throw new Error('Association introuvable.');
      setIsSubmitting(true);
      try {
        return await associationApiService.dispatchStudentOpportunityRelance(
          associationId,
          input,
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [associationId],
  );

  const updateProfessionalInfo = useCallback(
    async (
      memberId: string,
      data: MemberProfessionalInfo,
    ): Promise<AssociationMember> => {
      if (!associationId) throw new Error('Association introuvable.');
      setIsSubmitting(true);
      try {
        const updated = await associationApiService.updateMemberProfessionalInfo(
          associationId,
          memberId,
          data,
        );
        setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
        return updated;
      } finally {
        setIsSubmitting(false);
      }
    },
    [associationId],
  );

  const stats = useMemo(() => {
    const total = members.length;
    const upToDate = members.filter((m) => m.duesStatus === 'UP_TO_DATE').length;
    const pending = members.filter((m) => m.duesStatus === 'PENDING').length;
    const late = members.filter((m) => m.duesStatus === 'LATE').length;
    const studentsCount = members.filter((m) => m.isStudent || m.studentInfo).length;
    return { total, upToDate, pending, late, studentsCount };
  }, [members]);

  return {
    members,
    stats,
    isLoading,
    isSubmitting,
    error,
    addMember,
    updateProfessionalInfo,
    dispatchOpportunityRelance,
    reload: loadMembers,
  };
}
