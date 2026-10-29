import {
  Association,
  AssociationPosition,
  AssociationMember,
  AssociationPost,
  AssociationRoleType,
  AssociationCategory,
} from './association.types';

/**
 * Mapper Pur : Transformation & Normalisation des Données Associatives (SRP)
 */
export class AssociationMapper {
  public static normalizePosition(raw: any, associationId: string): AssociationPosition {
    return {
      id: raw.id || `pos-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      associationId: raw.associationId || associationId,
      title: raw.title || 'Poste de Direction',
      roleCategory: (raw.roleCategory as AssociationRoleType) || 'BOARD_MEMBER',
      department: raw.department || 'Bureau Exécutif',
      description: raw.description || '',
      assignedUserId: raw.assignedUserId || null,
      assignedUserName: raw.assignedUserName || null,
      assignedUserAvatar: raw.assignedUserAvatar || null,
      assignedUserPhone: raw.assignedUserPhone || null,
      termStartDate: raw.termStartDate || null,
      termEndDate: raw.termEndDate || null,
      isStatutory: Boolean(raw.isStatutory),
      status: raw.assignedUserId ? 'OCCUPIED' : (raw.status || 'VACANT'),
      accessSpaces: Array.isArray(raw.accessSpaces) && raw.accessSpaces.length > 0
        ? raw.accessSpaces
        : (raw.roleCategory === 'PRESIDENT' || raw.title?.toLowerCase().includes('président'))
        ? ['RESIDENCES', 'FINANCE', 'COMMUNICATION', 'MEMBERSHIP', 'GOVERNANCE', 'TERRITORIES']
        : raw.roleCategory === 'SECRETARY' || raw.title?.toLowerCase().includes('secrétaire')
        ? ['COMMUNICATION', 'MEMBERSHIP', 'TERRITORIES', 'RESIDENCES']
        : raw.roleCategory === 'TREASURER' || raw.title?.toLowerCase().includes('trésor')
        ? ['FINANCE', 'MEMBERSHIP']
        : raw.title?.toLowerCase().includes('logement') || raw.title?.toLowerCase().includes('résidence')
        ? ['RESIDENCES', 'MEMBERSHIP']
        : ['COMMUNICATION', 'MEMBERSHIP'],
      permissions: Array.isArray(raw.permissions) && raw.permissions.length > 0
        ? raw.permissions
        : (raw.roleCategory === 'PRESIDENT' || raw.title?.toLowerCase().includes('président'))
        ? ['residences:read', 'residences:manage_rooms', 'residences:issue_certificate', 'finance:read', 'finance:collect_dues', 'finance:manage_expenses', 'communication:publish_posts', 'membership:register', 'governance:manage_positions', 'governance:assign_roles']
        : raw.roleCategory === 'SECRETARY' || raw.title?.toLowerCase().includes('secrétaire')
        ? ['communication:read', 'communication:publish_posts', 'communication:pin_posts', 'membership:read', 'membership:register', 'residences:read']
        : raw.roleCategory === 'TREASURER' || raw.title?.toLowerCase().includes('trésor')
        ? ['finance:read', 'finance:collect_dues', 'finance:manage_expenses', 'membership:read']
        : raw.title?.toLowerCase().includes('logement') || raw.title?.toLowerCase().includes('résidence')
        ? ['residences:read', 'residences:manage_rooms', 'residences:issue_certificate', 'membership:read']
        : ['communication:read', 'membership:read'],
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt || new Date().toISOString(),
    };
  }

  public static normalizeMember(raw: any, associationId: string): AssociationMember {
    const roles: AssociationRoleType[] = Array.isArray(raw.roles)
      ? raw.roles
      : raw.role
      ? [raw.role]
      : ['MEMBER'];

    return {
      id: raw.id || `m-${Date.now()}`,
      associationId: raw.associationId || associationId,
      userId: raw.userId || `usr-${Date.now()}`,
      userName: raw.userName || raw.name || 'Adhérent Citoyen',
      userEmail: raw.userEmail || raw.email || 'adherent@mycommunity.bj',
      userPhone: raw.userPhone || raw.phone || '+229 97 00 00 00',
      roles,
      positionTitle: raw.positionTitle || undefined,
      joinedAt: raw.joinedAt || new Date().toISOString(),
      status: raw.status || 'ACTIVE',
      duesStatus: raw.duesStatus || 'UP_TO_DATE',
      membershipCardNumber: raw.membershipCardNumber || `BJ-ADH-${Math.floor(1000 + Math.random() * 9000)}`,
      isStudent:
        raw.isStudent !== undefined
          ? Boolean(raw.isStudent)
          : Boolean(raw.studentInfo || raw.studentIdNumber || raw.faculty),
      studentInfo: raw.studentInfo
        ? {
            studentIdNumber: raw.studentInfo.studentIdNumber,
            institutionName: raw.studentInfo.institutionName || raw.studentInfo.university,
            university: raw.studentInfo.university || raw.studentInfo.institutionName,
            faculty: raw.studentInfo.faculty,
            fieldOfStudy: raw.studentInfo.fieldOfStudy,
            studyLevel: raw.studentInfo.studyLevel,
            academicYear: raw.studentInfo.academicYear || '2025-2026',
            opportunityInterests: Array.isArray(raw.studentInfo.opportunityInterests)
              ? raw.studentInfo.opportunityInterests
              : [],
          }
        : raw.studentIdNumber || raw.institutionName || raw.university
          ? {
              studentIdNumber: raw.studentIdNumber,
              institutionName: raw.institutionName || raw.university,
              university: raw.university || raw.institutionName,
              faculty: raw.faculty,
              fieldOfStudy: raw.fieldOfStudy,
              studyLevel: raw.studyLevel,
              academicYear: raw.academicYear || '2025-2026',
              opportunityInterests: Array.isArray(raw.opportunityInterests)
                ? raw.opportunityInterests
                : [],
            }
          : undefined,
      professionalInfo: raw.professionalInfo
        ? {
            currentJobTitle: raw.professionalInfo.currentJobTitle,
            company: raw.professionalInfo.company,
            industrySector: raw.professionalInfo.industrySector,
            yearsOfExperience: raw.professionalInfo.yearsOfExperience,
            highestDegree: raw.professionalInfo.highestDegree,
            skills: Array.isArray(raw.professionalInfo.skills) ? raw.professionalInfo.skills : [],
            linkedInUrl: raw.professionalInfo.linkedInUrl,
            portfolioUrl: raw.professionalInfo.portfolioUrl,
            bio: raw.professionalInfo.bio,
            isAvailableForMentoring: Boolean(raw.professionalInfo.isAvailableForMentoring),
          }
        : undefined,
    };
  }

  public static normalizePost(raw: any, associationId: string): AssociationPost {
    return {
      id: raw.id || `post-${Date.now()}`,
      associationId: raw.associationId || associationId,
      authorId: raw.authorId || 'author-1',
      authorName: raw.authorName || 'Présidence de l’Association',
      authorRole: raw.authorRole || 'Président',
      title: raw.title || 'Communiqué Officiel',
      content: raw.content || '',
      category: raw.category || 'COMMUNIQUE',
      visibility: raw.visibility || 'ASSOCIATION_MEMBERS',
      publishedAt: raw.publishedAt || new Date().toISOString(),
      pinned: Boolean(raw.pinned),
      attachmentsCount: raw.attachmentsCount || 0,
    };
  }

  public static normalizeAssociation(raw: any): Association {
    const assocId = raw.id || `ass-${Date.now()}`;
    const nameLower = (raw.name || '').toLowerCase();

    // L'association est citoyenne/communautaire par défaut (COMMUNITY)
    // Elle n'est catégorisée autrement que si spécifié ou si son intitulé est explicite
    let category: AssociationCategory = raw.category || 'COMMUNITY';
    if (!raw.category) {
      if (
        nameLower.includes('coopérative étudiante') ||
        nameLower.includes('amicale des étudiants') ||
        nameLower.includes('amicale des élèves') ||
        nameLower.includes('association des élèves') ||
        nameLower.includes('fédération étudiante') ||
        nameLower.includes('club universitaire')
      ) {
        category = 'EDUCATIONAL';
      } else if (
        nameLower.includes('maraîchers') ||
        nameLower.includes('artisans') ||
        nameLower.includes('professionnel') ||
        nameLower.includes('commerçants')
      ) {
        category = 'PROFESSIONAL';
      } else if (nameLower.includes('sport') || nameLower.includes('football')) {
        category = 'SPORT';
      } else if (nameLower.includes('culture') || nameLower.includes('artistique')) {
        category = 'CULTURAL';
      }
    }

    const educationalInstitution = raw.educationalInstitution || raw.universityCampus || undefined;

    const hasValidRegNumber = Boolean(raw.registrationNumber && raw.registrationNumber.trim().length >= 3);
    const verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'PENDING' = raw.verificationStatus
      ? raw.verificationStatus
      : hasValidRegNumber
        ? 'VERIFIED'
        : 'UNVERIFIED';

    return {
      id: assocId,
      name: raw.name || 'Association Citoyenne',
      acronym: raw.acronym || undefined,
      registrationNumber: raw.registrationNumber || undefined,
      description: raw.description || 'Regroupement associatif local.',
      status: raw.status || 'APPROVED',
      verificationStatus,
      isVerified: verificationStatus === 'VERIFIED',
      creatorRole: raw.creatorRole || 'ADMINISTRATEUR_TECHNIQUE',
      creatorUserId: raw.creatorUserId || undefined,
      category,
      educationalInstitution,
      universityCampus: educationalInstitution,
      membersCount: Number(raw.membersCount) || 1,
      monthlyDuesXOF: Number(raw.monthlyDuesXOF) || 1000,
      treasuryBalanceXOF: Number(raw.treasuryBalanceXOF) || 0,
      territory: raw.territory || 'Bénin',
      city: raw.city || 'Abomey-Calavi',
      departmentName: raw.departmentName || 'Atlantique',
      linkedCommunityIds: Array.isArray(raw.linkedCommunityIds) ? raw.linkedCommunityIds : [],
      createdAt: raw.createdAt || new Date().toISOString(),
      positions: Array.isArray(raw.positions)
        ? raw.positions.map((p: any) => this.normalizePosition(p, assocId))
        : [],
      members: Array.isArray(raw.members)
        ? raw.members.map((m: any) => this.normalizeMember(m, assocId))
        : [],
      posts: Array.isArray(raw.posts)
        ? raw.posts.map((post: any) => this.normalizePost(post, assocId))
        : [],
    };
  }
}
