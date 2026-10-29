import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/database/prisma.service.js';
import {
  CommunityMembershipEntity,
  MembershipStatus,
} from '../../domain/entities/community-membership.entity.js';
import { MembershipReaderPort } from '../../application/ports/membership-reader.port.js';
import { MembershipWriterPort } from '../../application/ports/membership-writer.port.js';
import { MembershipMapper } from '../mappers/membership.mapper.js';

/**
 * Adaptateur de Persistance Prisma : Adhésions et Rôles Communautaires
 * Implémente MembershipReaderPort et MembershipWriterPort (LSP & DIP).
 */
@Injectable()
export class PrismaMembershipRepository
  implements MembershipReaderPort, MembershipWriterPort
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CommunityMembershipEntity | null> {
    const raw = await this.prisma.communityMembership.findUnique({
      where: { id },
      include: { roles: true },
    });
    return raw ? MembershipMapper.toDomain(raw) : null;
  }

  async findByCommunityAndUser(
    communityId: string,
    userId: string,
  ): Promise<CommunityMembershipEntity | null> {
    const raw = await this.prisma.communityMembership.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId,
        },
      },
      include: { roles: true },
    });
    return raw ? MembershipMapper.toDomain(raw) : null;
  }

  async listByCommunity(
    communityId: string,
    status?: MembershipStatus,
  ): Promise<CommunityMembershipEntity[]> {
    const rows = await this.prisma.communityMembership.findMany({
      where: {
        communityId,
        ...(status ? { status } : {}),
      },
      include: { roles: true },
      orderBy: { joinedAt: 'desc' },
    });
    return rows.map((r) => MembershipMapper.toDomain(r));
  }

  async listByUser(userId: string): Promise<CommunityMembershipEntity[]> {
    const rows = await this.prisma.communityMembership.findMany({
      where: { userId },
      include: { roles: true },
      orderBy: { joinedAt: 'desc' },
    });
    return rows.map((r) => MembershipMapper.toDomain(r));
  }

  async save(membership: CommunityMembershipEntity): Promise<void> {
    await this.prisma.communityMembership.create({
      data: {
        id: membership.id,
        communityId: membership.communityId,
        userId: membership.userId,
        status: membership.status,
        joinedAt: membership.joinedAt,
        updatedAt: membership.updatedAt,
        roles: {
          create: membership.roles.map((r) => ({ role: r })),
        },
      },
    });
  }

  async updateStatus(membership: CommunityMembershipEntity): Promise<void> {
    await this.prisma.communityMembership.update({
      where: { id: membership.id },
      data: {
        status: membership.status,
        updatedAt: membership.updatedAt,
      },
    });
  }

  async updateRoles(membership: CommunityMembershipEntity): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.communityMembershipRole.deleteMany({
        where: { membershipId: membership.id },
      }),
      this.prisma.communityMembershipRole.createMany({
        data: membership.roles.map((r) => ({
          membershipId: membership.id,
          role: r,
        })),
      }),
      this.prisma.communityMembership.update({
        where: { id: membership.id },
        data: {
          updatedAt: membership.updatedAt,
        },
      }),
    ]);
  }
}
