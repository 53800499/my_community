import type {
  CommunityMembership as PrismaCommunityMembership,
  CommunityMembershipRole as PrismaCommunityMembershipRole,
} from '@prisma/client';
import {
  CommunityMembershipEntity,
  MembershipStatus,
  CommunityRole,
} from '../../domain/entities/community-membership.entity.js';
import { MembershipResponseDto } from '../../presentation/http/dto/membership-response.dto.js';

export type PrismaMembershipWithRoles = PrismaCommunityMembership & {
  roles?: PrismaCommunityMembershipRole[];
};

export class MembershipMapper {
  public static toDomain(raw: PrismaMembershipWithRoles): CommunityMembershipEntity {
    const roles: CommunityRole[] =
      raw.roles && raw.roles.length > 0
        ? raw.roles.map((r) => r.role as CommunityRole)
        : ['MEMBER'];

    return CommunityMembershipEntity.create({
      id: raw.id,
      communityId: raw.communityId,
      userId: raw.userId,
      status: raw.status as MembershipStatus,
      roles,
      joinedAt: raw.joinedAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toResponseDto(
    entity: CommunityMembershipEntity,
  ): MembershipResponseDto {
    return {
      id: entity.id,
      communityId: entity.communityId,
      userId: entity.userId,
      status: entity.status,
      roles: entity.roles,
      joinedAt: entity.joinedAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
