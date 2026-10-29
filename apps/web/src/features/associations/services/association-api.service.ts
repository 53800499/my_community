import { AssociationServicePort } from './association.port';
import {
  Association,
  AssociationPosition,
  AssociationMember,
  AssociationPost,
  CreatePositionInput,
  AssignPositionInput,
  CreatePostInput,
  UpdatePostInput,
  RegisterAssociationInput,
  AddMemberInput,
  MemberProfessionalInfo,
  StudentOpportunityRelanceInput,
} from '../domain/association.types';
import { AssociationMapper } from '../domain/association.mapper';
import { apiClient } from '@/lib/api';
import { mandateAuditTrailService } from './mandate-audit-trail.service';

const STORAGE_KEYS = {
  ASSOCIATIONS: 'my_community_associations_cache',
  POSITIONS: 'my_community_positions_cache',
  POSTS: 'my_community_posts_cache',
  MEMBERS: 'my_community_members_cache',
};

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota
  }
}

export const DEFAULT_STATUTORY_POSITIONS = [
  {
    title: 'Président(e) de l’Association',
    roleCategory: 'PRESIDENT' as const,
    department: 'Direction Générale',
    description: 'Représentation légale, coordination générale et supervision des activités statutaires.',
    isStatutory: true,
  },
  {
    title: 'Vice-Président(e)',
    roleCategory: 'BOARD_MEMBER' as const,
    department: 'Direction Générale',
    description: 'Assiste le président et assure l’intérim selon les règles statutaires.',
    isStatutory: true,
  },
  {
    title: 'Secrétaire Général(e)',
    roleCategory: 'SECRETARY' as const,
    department: 'Secrétariat Administratif',
    description: 'Procès-verbaux, tenue des registres, documents administratifs et suivi des décisions.',
    isStatutory: true,
  },
  {
    title: 'Trésorier(e) Général(e)',
    roleCategory: 'TREASURER' as const,
    department: 'Trésorerie & Finances',
    description: 'Suivi des recettes, dépenses, cotisations et rapports financiers avec accès exclusif aux livres comptables.',
    isStatutory: true,
  },
  {
    title: 'Responsable de la Communication',
    roleCategory: 'BOARD_MEMBER' as const,
    department: 'Information & Mobilisation',
    description: 'Publications officielles, avis aux résidents, annonces et relations extérieures.',
    isStatutory: true,
  },
  {
    title: 'Responsable des Adhésions & Registre',
    roleCategory: 'BOARD_MEMBER' as const,
    department: 'Vie Associative',
    description: 'Traitement des demandes d’adhésion, mise à jour des membres et suivi administratif des inscriptions.',
    isStatutory: true,
  },
];

/**
 * Adaptateur Concret : Communication REST API & Synchronisation Locale Réactive (DIP)
 */
export class AssociationApiService implements AssociationServicePort {
  async listAssociations(): Promise<Association[]> {
    const cached = getLocal<Association[]>(STORAGE_KEYS.ASSOCIATIONS, []);
    try {
      const res = await apiClient.fetch<any[]>('associations');
      if (res && res.length > 0) {
        const normalized = res.map((item) => AssociationMapper.normalizeAssociation(item));
        const mergedMap = new Map<string, Association>();
        cached.forEach((a) => mergedMap.set(a.id, a));
        normalized.forEach((a) => {
          const existing = mergedMap.get(a.id);
          mergedMap.set(a.id, {
            ...a,
            monthlyDuesXOF: existing?.monthlyDuesXOF || a.monthlyDuesXOF,
            treasuryBalanceXOF: existing?.treasuryBalanceXOF || a.treasuryBalanceXOF,
            positions: existing?.positions && existing.positions.length > 0
              ? existing.positions
              : (a.positions || []),
          });
        });
        const result = Array.from(mergedMap.values());
        setLocal(STORAGE_KEYS.ASSOCIATIONS, result);
        return result;
      }
    } catch {
      // API error or offline
    }

    return cached;
  }

  async getAssociationById(id: string): Promise<Association> {
    const list = await this.listAssociations();
    try {
      const res = await apiClient.fetch<any>(`associations/${id}`);
      if (res) {
        return AssociationMapper.normalizeAssociation(res);
      }
    } catch {
      // Fallback
    }
    const found = list.find((a) => a.id === id);
    if (!found) {
      throw new Error(`Association non trouvée (${id})`);
    }
    return found;
  }



  async initializeDefaultBureau(associationId: string): Promise<AssociationPosition[]> {
    const existing = await this.listPositions(associationId);
    if (existing.length > 0) {
      return existing;
    }
    const createdPositions: AssociationPosition[] = [];
    for (const def of DEFAULT_STATUTORY_POSITIONS) {
      const pos = await this.createPosition(associationId, {
        title: def.title,
        roleCategory: def.roleCategory,
        department: def.department,
        description: def.description,
      });
      createdPositions.push(pos);
    }
    return createdPositions;
  }

  async registerAssociation(input: RegisterAssociationInput): Promise<Association> {
    const assocs = await this.listAssociations();
    let res: any;
    try {
      res = await apiClient.fetch('associations', {
        method: 'POST',
        body: JSON.stringify({
          name: input.name,
          acronym: input.acronym,
          registrationNumber: input.registrationNumber,
          description: input.description,
        }),
      });
    } catch {
      // Fallback local creation if needed
    }

    const assocId = res?.id || `ass-${Date.now()}`;

    // Initialisation du créateur en tant qu'Administrateur Technique de l'Espace (non Président)
    const creatorMember: AssociationMember = {
      id: `m-creator-${Date.now()}`,
      associationId: assocId,
      userId: `usr-creator-${Date.now()}`,
      userName: 'Créateur de l’Espace',
      roles: ['MEMBER'],
      positionTitle: 'Administrateur de l’Espace Numérique',
      joinedAt: new Date().toISOString(),
      status: 'ACTIVE',
      duesStatus: 'UP_TO_DATE',
      membershipCardNumber: `BJ-FND-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    const allMembers = getLocal<Record<string, AssociationMember[]>>(STORAGE_KEYS.MEMBERS, {});
    allMembers[assocId] = [creatorMember];
    setLocal(STORAGE_KEYS.MEMBERS, allMembers);

    const created: Association = AssociationMapper.normalizeAssociation({
      id: assocId,
      name: input.name,
      acronym: input.acronym || input.name.slice(0, 4).toUpperCase(),
      registrationNumber: input.registrationNumber || '',
      description: input.description || '',
      city: input.city || 'Abomey-Calavi',
      territory: input.territory || `${input.city || 'Abomey-Calavi'} (Bénin)`,
      monthlyDuesXOF: input.monthlyDuesXOF || 1000,
      treasuryBalanceXOF: 0,
      membersCount: 1,
      creatorRole: 'ADMINISTRATEUR_TECHNIQUE',
      verificationStatus: (input.registrationNumber && input.registrationNumber.trim().length >= 3) ? 'VERIFIED' : 'UNVERIFIED',
      linkedCommunityIds: [],
      positions: [],
      members: [creatorMember],
    });

    const updated = [created, ...assocs.filter((a) => a.id !== created.id)];
    setLocal(STORAGE_KEYS.ASSOCIATIONS, updated);

    // Initialiser automatiquement l'organigramme du bureau exécutif par défaut (postes vacants)
    try {
      await this.initializeDefaultBureau(assocId);
    } catch {
      // Non bloquant
    }

    return created;
  }

  async linkCommunity(associationId: string, communityId: string): Promise<{ success: boolean }> {
    const list = await this.listAssociations();
    try {
      await apiClient.fetch(`associations/${associationId}/communities/${communityId}`, {
        method: 'POST',
      });
    } catch {
      // Fallback
    }
    const updated = list.map((a) => {
      if (a.id === associationId) {
        return {
          ...a,
          linkedCommunityIds: Array.from(new Set([...(a.linkedCommunityIds || []), communityId])),
        };
      }
      return a;
    });
    setLocal(STORAGE_KEYS.ASSOCIATIONS, updated);
    return { success: true };
  }

  /**
   * Dissoudre et supprimer une association avec confirmation de sécurité.
   */
  async deleteAssociation(id: string, confirmationName?: string): Promise<{ success: boolean; associationId: string }> {
    try {
      const query = confirmationName ? `?confirmationName=${encodeURIComponent(confirmationName)}` : '';
      await apiClient.fetch(`associations/${id}${query}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn("API DELETE associations/:id fallback to local state removal:", err);
    }

    // Supprimer des données locales
    const assocs = getLocal<Association[]>(STORAGE_KEYS.ASSOCIATIONS, []);
    const updated = assocs.filter((a) => a.id !== id);
    setLocal(STORAGE_KEYS.ASSOCIATIONS, updated);

    // Supprimer les membres associés
    const allMembers = getLocal<Record<string, AssociationMember[]>>(STORAGE_KEYS.MEMBERS, {});
    delete allMembers[id];
    setLocal(STORAGE_KEYS.MEMBERS, allMembers);

    // Supprimer les postes associés
    const allPositions = getLocal<Record<string, AssociationPosition[]>>(STORAGE_KEYS.POSITIONS, {});
    delete allPositions[id];
    setLocal(STORAGE_KEYS.POSITIONS, allPositions);

    return { success: true, associationId: id };
  }

  // ----------------------------------------------------------------------------
  // GESTION DES POSTES & ORGANIGRAMME
  // ----------------------------------------------------------------------------
  async listPositions(associationId: string): Promise<AssociationPosition[]> {
    const allPositions = getLocal<Record<string, AssociationPosition[]>>(STORAGE_KEYS.POSITIONS, {});
    try {
      const res = await apiClient.fetch<any[]>(`associations/${associationId}/positions`);
      if (res && res.length > 0) {
        const normalized = res.map((p) => AssociationMapper.normalizePosition(p, associationId));
        allPositions[associationId] = normalized;
        setLocal(STORAGE_KEYS.POSITIONS, allPositions);
        return normalized;
      }
    } catch {
      // Fallback
    }

    return allPositions[associationId] || [];
  }

  async createPosition(associationId: string, input: CreatePositionInput): Promise<AssociationPosition> {
    const positions = await this.listPositions(associationId);
    let created: AssociationPosition;

    try {
      const res = await apiClient.fetch<any>(`associations/${associationId}/positions`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
      created = AssociationMapper.normalizePosition(res, associationId);
    } catch {
      created = AssociationMapper.normalizePosition(
        {
          id: `pos-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          associationId,
          title: input.title,
          roleCategory: input.roleCategory || 'BOARD_MEMBER',
          department: input.department || 'Bureau Exécutif',
          description: input.description || '',
          assignedUserId: input.assignedUserId || null,
          assignedUserName: input.assignedUserName || null,
          termStartDate: input.termStartDate || (input.assignedUserId ? new Date().toISOString() : null),
          termEndDate: input.termEndDate || null,
          isStatutory: false,
          status: input.assignedUserId ? 'OCCUPIED' : 'VACANT',
        },
        associationId,
      );
    }

    const allPositions = getLocal<Record<string, AssociationPosition[]>>(STORAGE_KEYS.POSITIONS, {});
    allPositions[associationId] = [...positions, created];
    setLocal(STORAGE_KEYS.POSITIONS, allPositions);
    return created;
  }

  async assignPosition(
    associationId: string,
    positionId: string,
    input: AssignPositionInput,
  ): Promise<AssociationPosition> {
    const positions = await this.listPositions(associationId);
    let updated: AssociationPosition;

    try {
      const res = await apiClient.fetch<any>(`associations/${associationId}/positions/${positionId}/assign`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
      updated = AssociationMapper.normalizePosition(res, associationId);
    } catch {
      const existing = positions.find((p) => p.id === positionId);
      if (!existing) throw new Error('Poste introuvable.');

      updated = {
        ...existing,
        assignedUserId: input.targetUserId,
        assignedUserName: input.targetUserName,
        termStartDate: input.termStartDate || new Date().toISOString(),
        termEndDate: input.termEndDate || null,
        status: 'OCCUPIED',
        updatedAt: new Date().toISOString(),
      };
    }

    const allPositions = getLocal<Record<string, AssociationPosition[]>>(STORAGE_KEYS.POSITIONS, {});
    allPositions[associationId] = positions.map((p) => (p.id === positionId ? updated : p));
    setLocal(STORAGE_KEYS.POSITIONS, allPositions);

    mandateAuditTrailService.recordAction({
      associationId,
      mandatePeriod: 'Mandat 2026-2028 (Actuel)',
      mandateContractNumber: 'MANDAT-2026-001',
      actorId: input.targetUserId,
      actorName: input.targetUserName || 'Membre Exécutif',
      actorRole: updated.title,
      category: 'GOVERNANCE',
      actionType: 'BUREAU_OFFICER_APPOINTED',
      actionTitle: `Nomination au Bureau Exécutif : ${updated.title}`,
      resourceType: 'ASSOCIATION_POSITION',
      resourceId: positionId,
      details: `Attribution officielle du poste à ${input.targetUserName || input.targetUserId}. Entrée en vigueur de la délégation de mandat.`,
    }).catch(() => {});

    return updated;
  }

  async vacatePosition(associationId: string, positionId: string): Promise<AssociationPosition> {
    const positions = await this.listPositions(associationId);
    let vacated: AssociationPosition;

    try {
      const res = await apiClient.fetch<any>(`associations/${associationId}/positions/${positionId}/vacate`, {
        method: 'POST',
      });
      vacated = AssociationMapper.normalizePosition(res, associationId);
    } catch {
      const existing = positions.find((p) => p.id === positionId);
      if (!existing) throw new Error('Poste introuvable.');

      vacated = {
        ...existing,
        assignedUserId: null,
        assignedUserName: null,
        termStartDate: null,
        termEndDate: null,
        status: 'VACANT',
        updatedAt: new Date().toISOString(),
      };
    }

    const allPositions = getLocal<Record<string, AssociationPosition[]>>(STORAGE_KEYS.POSITIONS, {});
    allPositions[associationId] = positions.map((p) => (p.id === positionId ? vacated : p));
    setLocal(STORAGE_KEYS.POSITIONS, allPositions);

    mandateAuditTrailService.recordAction({
      associationId,
      mandatePeriod: 'Mandat 2026-2028 (Actuel)',
      mandateContractNumber: 'MANDAT-2026-001',
      actorId: 'usr-pres-01',
      actorName: 'Président(e) du Bureau',
      actorRole: 'Présidence',
      category: 'GOVERNANCE',
      actionType: 'BUREAU_OFFICER_VACATED',
      actionTitle: `Fin de Fonction / Vacance de Poste : ${vacated.title}`,
      resourceType: 'ASSOCIATION_POSITION',
      resourceId: positionId,
      details: `Cessation d'exercice actée pour le poste ${vacated.title}. Clôture de la période de responsabilité.`,
    }).catch(() => {});

    return vacated;
  }

  async deletePosition(associationId: string, positionId: string): Promise<void> {
    const positions = await this.listPositions(associationId);
    const filtered = positions.filter((p) => p.id !== positionId);
    const allPositions = getLocal<Record<string, AssociationPosition[]>>(STORAGE_KEYS.POSITIONS, {});
    allPositions[associationId] = filtered;
    setLocal(STORAGE_KEYS.POSITIONS, allPositions);
  }

  async updatePositionPermissions(
    associationId: string,
    positionId: string,
    accessSpaces: string[],
    permissions: string[],
  ): Promise<AssociationPosition> {
    const positions = await this.listPositions(associationId);
    let updated: AssociationPosition;

    try {
      const res = await apiClient.fetch<any>(`associations/${associationId}/positions/${positionId}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ accessSpaces, permissions }),
      });
      updated = AssociationMapper.normalizePosition(res, associationId);
    } catch {
      const existing = positions.find((p) => p.id === positionId);
      if (!existing) throw new Error('Poste introuvable.');

      updated = {
        ...existing,
        accessSpaces,
        permissions,
        updatedAt: new Date().toISOString(),
      };
    }

    const allPositions = getLocal<Record<string, AssociationPosition[]>>(STORAGE_KEYS.POSITIONS, {});
    allPositions[associationId] = positions.map((p) => (p.id === positionId ? updated : p));
    setLocal(STORAGE_KEYS.POSITIONS, allPositions);
    return updated;
  }

  // ----------------------------------------------------------------------------
  // GESTION DES MEMBRES & ADHÉSIONS
  // ----------------------------------------------------------------------------
  async listMembers(associationId: string): Promise<AssociationMember[]> {
    const allMembers = getLocal<Record<string, AssociationMember[]>>(STORAGE_KEYS.MEMBERS, {});
    try {
      const res = await apiClient.fetch<any[]>(`associations/${associationId}/members`);
      if (res && res.length > 0) {
        const normalized = res.map((m) => AssociationMapper.normalizeMember(m, associationId));
        allMembers[associationId] = normalized;
        setLocal(STORAGE_KEYS.MEMBERS, allMembers);
        return normalized;
      }
    } catch {
      // Fallback
    }

    return allMembers[associationId] || [];
  }

  async addMember(
    associationId: string,
    input: AddMemberInput,
  ): Promise<AssociationMember> {
    const members = await this.listMembers(associationId);
    const targetUserId = input.userId || `usr-${Date.now()}`;

    // Appel API backend officiel si l'utilisateur est authentifié / valide
    try {
      await apiClient.fetch(`associations/${associationId}/members`, {
        method: 'POST',
        body: JSON.stringify({
          targetUserId,
          role: input.role || 'MEMBER',
          action: 'ADD',
        }),
      });
    } catch {
      // Tolérance hors-ligne / persistance locale
    }

    const isStudent = Boolean(
      input.isStudent ||
        input.studentInfo ||
        input.studentIdNumber ||
        input.faculty ||
        input.institutionName ||
        input.university,
    );

    const newMember: AssociationMember = {
      id: `m-${Date.now()}`,
      associationId,
      userId: targetUserId,
      userName: input.userName,
      userPhone: input.userPhone || '',
      userEmail: input.userEmail,
      roles: [(input.role as any) || 'MEMBER'],
      joinedAt: new Date().toISOString(),
      status: 'ACTIVE',
      duesStatus: 'PENDING',
      membershipCardNumber: `BJ-ADH-${Math.floor(1000 + Math.random() * 9000)}`,
      isStudent,
      studentInfo: isStudent
        ? {
            studentIdNumber:
              input.studentInfo?.studentIdNumber ||
              input.studentIdNumber ||
              `ETU-${Math.floor(100000 + Math.random() * 900000)}`,
            institutionName:
              input.studentInfo?.institutionName ||
              input.studentInfo?.university ||
              input.institutionName ||
              input.university ||
              undefined,
            university:
              input.studentInfo?.institutionName ||
              input.studentInfo?.university ||
              input.institutionName ||
              input.university ||
              undefined,
            faculty:
              input.studentInfo?.faculty ||
              input.faculty ||
              undefined,
            fieldOfStudy:
              input.studentInfo?.fieldOfStudy ||
              input.fieldOfStudy ||
              undefined,
            studyLevel:
              input.studentInfo?.studyLevel ||
              input.studyLevel ||
              undefined,
            academicYear:
              input.studentInfo?.academicYear ||
              input.academicYear ||
              '2025-2026',
            opportunityInterests:
              input.studentInfo?.opportunityInterests ||
              input.opportunityInterests ||
              [],
          }
        : undefined,
      professionalInfo: input.professionalInfo,
    };

    const allMembers = getLocal<Record<string, AssociationMember[]>>(STORAGE_KEYS.MEMBERS, {});
    allMembers[associationId] = [newMember, ...members];
    setLocal(STORAGE_KEYS.MEMBERS, allMembers);
    return newMember;
  }

  async updateMemberProfessionalInfo(
    associationId: string,
    memberId: string,
    data: MemberProfessionalInfo,
  ): Promise<AssociationMember> {
    const allMembers = getLocal<Record<string, AssociationMember[]>>(STORAGE_KEYS.MEMBERS, {});
    const members = allMembers[associationId] || [];
    let updated: AssociationMember | undefined;

    try {
      const res = await apiClient.fetch<any>(
        `associations/${associationId}/members/${memberId}/professional-info`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        },
      );
      if (res) {
        updated = AssociationMapper.normalizeMember(res, associationId);
      }
    } catch {
      // Fallback in case backend call fails offline
    }

    if (!updated) {
      const existing = members.find((m) => m.id === memberId);
      if (!existing) throw new Error('Membre introuvable.');
      updated = {
        ...existing,
        professionalInfo: data,
      };
    }

    allMembers[associationId] = members.map((m) => (m.id === memberId ? updated! : m));
    setLocal(STORAGE_KEYS.MEMBERS, allMembers);
    return updated;
  }

  async dispatchStudentOpportunityRelance(
    associationId: string,
    input: StudentOpportunityRelanceInput,
  ): Promise<{ notifiedCount: number; message: string }> {
    const members = await this.listMembers(associationId);
    const targetMembers = members.filter((m) => {
      if (!m.isStudent && !m.studentInfo) return false;
      if (input.targetInstitution && input.targetInstitution !== 'ALL') {
        const inst = (m.studentInfo?.institutionName || m.studentInfo?.university || '').toLowerCase();
        if (!inst.includes(input.targetInstitution.toLowerCase())) return false;
      }
      if (input.targetStudyLevel && input.targetStudyLevel !== 'ALL') {
        if (m.studentInfo?.studyLevel !== input.targetStudyLevel) return false;
      }
      if (input.targetFaculty && input.targetFaculty !== 'ALL') {
        const fac = (m.studentInfo?.faculty || '').toLowerCase();
        if (!fac.includes(input.targetFaculty.toLowerCase())) return false;
      }
      return true;
    });

    const notifiedCount = targetMembers.length > 0 ? targetMembers.length : members.length;

    const instLabel = input.targetInstitution && input.targetInstitution !== 'ALL' ? input.targetInstitution : 'Tous établissements';
    const lvlLabel = input.targetStudyLevel && input.targetStudyLevel !== 'ALL' ? input.targetStudyLevel : 'Toutes promotions';
    const facLabel = input.targetFaculty && input.targetFaculty !== 'ALL' ? input.targetFaculty : 'Toutes filières';

    await this.createPost(associationId, {
      title: `[OPPORTUNITÉ ÉTUDIANTE / JEUNESSE] ${input.title}`,
      content: `${input.description}\n\n• Public & Cohorte : ${instLabel} — ${lvlLabel} (${facLabel})\n• Date limite de candidature : ${input.deadline || 'Délai standard'}\n• Canal de relance & notification : ${input.channel}\n• Bénéficiaires ciblés : ${notifiedCount} apprenants répertoriés`,
      category: 'OPPORTUNITE_ETUDIANTE',
      visibility: 'ASSOCIATION_MEMBERS',
      pinned: true,
    });

    return {
      notifiedCount,
      message: `${notifiedCount} étudiant(s) éligible(s) ont été notifiés et relancés avec succès via ${input.channel} !`,
    };
  }

  // ----------------------------------------------------------------------------
  // GESTION DES POSTS & PUBLICATIONS DU BUREAU
  // ----------------------------------------------------------------------------
  async listPosts(associationId: string): Promise<AssociationPost[]> {
    const allPosts = getLocal<Record<string, AssociationPost[]>>(STORAGE_KEYS.POSTS, {});
    return allPosts[associationId] || [];
  }

  async createPost(associationId: string, input: CreatePostInput): Promise<AssociationPost> {
    const posts = await this.listPosts(associationId);
    const newPost: AssociationPost = {
      id: `post-${Date.now()}`,
      associationId,
      authorId: 'u-pres-1',
      authorName: 'Bureau Exécutif',
      authorRole: 'Présidence du Bureau',
      title: input.title,
      content: input.content,
      category: input.category,
      visibility: input.visibility,
      publishedAt: new Date().toISOString(),
      pinned: Boolean(input.pinned),
      attachmentsCount: 0,
    };

    const allPosts = getLocal<Record<string, AssociationPost[]>>(STORAGE_KEYS.POSTS, {});
    allPosts[associationId] = [newPost, ...posts];
    setLocal(STORAGE_KEYS.POSTS, allPosts);
    return newPost;
  }

  async updatePost(
    associationId: string,
    postId: string,
    input: UpdatePostInput,
  ): Promise<AssociationPost> {
    const posts = await this.listPosts(associationId);
    const existingIndex = posts.findIndex((p) => p.id === postId);
    if (existingIndex === -1) {
      throw new Error('Publication introuvable.');
    }

    const current = posts[existingIndex];
    const updated: AssociationPost = {
      ...current,
      ...(input.title !== undefined && { title: input.title }),
      ...(input.content !== undefined && { content: input.content }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.visibility !== undefined && { visibility: input.visibility }),
      ...(input.pinned !== undefined && { pinned: input.pinned }),
    };

    const nextPosts = [...posts];
    nextPosts[existingIndex] = updated;

    const allPosts = getLocal<Record<string, AssociationPost[]>>(STORAGE_KEYS.POSTS, {});
    allPosts[associationId] = nextPosts;
    setLocal(STORAGE_KEYS.POSTS, allPosts);
    return updated;
  }

  async deletePost(associationId: string, postId: string): Promise<void> {
    const posts = await this.listPosts(associationId);
    const filtered = posts.filter((p) => p.id !== postId);

    const allPosts = getLocal<Record<string, AssociationPost[]>>(STORAGE_KEYS.POSTS, {});
    allPositionsCleaned(associationId, filtered, allPosts);
  }

  async togglePinPost(associationId: string, postId: string): Promise<AssociationPost> {
    const posts = await this.listPosts(associationId);
    const target = posts.find((p) => p.id === postId);
    if (!target) {
      throw new Error('Publication introuvable.');
    }
    return this.updatePost(associationId, postId, { pinned: !target.pinned });
  }
}

function allPositionsCleaned(associationId: string, filtered: AssociationPost[], allPosts: Record<string, AssociationPost[]>) {
  allPosts[associationId] = filtered;
  setLocal(STORAGE_KEYS.POSTS, allPosts);
}

export const associationApiService = new AssociationApiService();
