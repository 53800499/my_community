import type {
  Association as PrismaAssociation,
  AssociationMember as PrismaAssociationMember,
  AssociationCommunity as PrismaAssociationCommunity,
} from '@prisma/client';
import { AssociationEntity } from '../../domain/entities/association.entity.js';
import {
  AssociationMemberEntity,
  AssociationRole,
} from '../../domain/entities/association-member.entity.js';
import { AssociationCommunityLinkEntity } from '../../domain/entities/association-community-link.entity.js';
import { AssociationResponseDto } from '../../presentation/http/dto/association-response.dto.js';
import { AssociationMemberResponseDto } from '../../presentation/http/dto/association-member-response.dto.js';

export class AssociationMapper {
  public static toDomain(raw: PrismaAssociation): AssociationEntity {
    let category = (raw as any).category;
    let cleanDescription = raw.description;

    if (!category && raw.description && raw.description.startsWith('[CATEGORY:')) {
      const match = raw.description.match(/^\[CATEGORY:([A-Z_]+)\]\s*(.*)$/s);
      if (match) {
        category = match[1];
        cleanDescription = match[2];
      }
    }

    if (!category && raw.name) {
      const lower = (raw.name + ' ' + (raw.description || '')).toLowerCase();
      if (
        lower.includes('étudiant') ||
        lower.includes('scolaire') ||
        lower.includes('école') ||
        lower.includes('université') ||
        lower.includes('académique') ||
        lower.includes('alumni')
      ) {
        category = 'EDUCATIONAL';
      } else if (
        lower.includes('professionnel') ||
        lower.includes('métier') ||
        lower.includes('artisan') ||
        lower.includes('avocat') ||
        lower.includes('médecin') ||
        lower.includes('ingénieur') ||
        lower.includes('coopérative')
      ) {
        category = 'PROFESSIONAL';
      }
    }

    return AssociationEntity.create({
      id: raw.id,
      name: raw.name,
      acronym: raw.acronym,
      registrationNumber: raw.registrationNumber,
      description: cleanDescription,
      category: category ?? 'COMMUNITY',
      createdAt: raw.createdAt,
    });
  }

  public static toMemberDomain(
    raw: PrismaAssociationMember,
    professionalInfo?: import('../../domain/entities/association-member.entity.js').MemberProfessionalInfo | null,
  ): AssociationMemberEntity {
    return AssociationMemberEntity.create({
      id: raw.id,
      associationId: raw.associationId,
      userId: raw.userId,
      role: raw.role as AssociationRole,
      professionalInfo: professionalInfo ?? null,
      joinedAt: raw.joinedAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toLinkDomain(
    raw: PrismaAssociationCommunity,
  ): AssociationCommunityLinkEntity {
    return AssociationCommunityLinkEntity.create({
      id: raw.id,
      associationId: raw.associationId,
      communityId: raw.communityId,
      linkedAt: raw.linkedAt,
    });
  }

  public static toResponseDto(
    entity: AssociationEntity,
    members?: AssociationMemberEntity[],
    linkedCommunityIds?: string[],
  ): AssociationResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      acronym: entity.acronym,
      registrationNumber: entity.registrationNumber,
      description: entity.description,
      category: entity.category,
      members: members?.map((m) => AssociationMapper.toMemberResponseDto(m)),
      linkedCommunityIds,
      createdAt: entity.createdAt.toISOString(),
    };
  }

  public static toMemberResponseDto(
    entity: AssociationMemberEntity,
  ): AssociationMemberResponseDto {
    return {
      id: entity.id,
      associationId: entity.associationId,
      userId: entity.userId,
      role: entity.role,
      joinedAt: entity.joinedAt.toISOString(),
      professionalInfo: entity.professionalInfo ?? undefined,
    };
  }
}
