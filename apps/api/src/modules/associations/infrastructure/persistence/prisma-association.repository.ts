import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/database/prisma.service.js';
import { AssociationEntity } from '../../domain/entities/association.entity.js';
import { AssociationMemberEntity } from '../../domain/entities/association-member.entity.js';
import { AssociationCommunityLinkEntity } from '../../domain/entities/association-community-link.entity.js';
import { AssociationReaderPort } from '../../application/ports/association-reader.port.js';
import { AssociationWriterPort } from '../../application/ports/association-writer.port.js';
import { AssociationMapper } from '../mappers/association.mapper.js';

@Injectable()
export class PrismaAssociationRepository
  implements AssociationReaderPort, AssociationWriterPort
{
  private static readonly memberProfessionalInfoMap = new Map<
    string,
    import('../../domain/entities/association-member.entity.js').MemberProfessionalInfo
  >();

  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AssociationEntity | null> {
    const raw = await this.prisma.association.findUnique({
      where: { id },
    });
    return raw ? AssociationMapper.toDomain(raw) : null;
  }

  async findByRegistrationNumber(
    registrationNumber: string,
  ): Promise<AssociationEntity | null> {
    const raw = await this.prisma.association.findUnique({
      where: { registrationNumber },
    });
    return raw ? AssociationMapper.toDomain(raw) : null;
  }

  async listAll(): Promise<AssociationEntity[]> {
    const rows = await this.prisma.association.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => AssociationMapper.toDomain(r));
  }

  async listMembers(associationId: string): Promise<AssociationMemberEntity[]> {
    const rows = await this.prisma.associationMember.findMany({
      where: { associationId },
      orderBy: { joinedAt: 'asc' },
    });
    return rows.map((r) =>
      AssociationMapper.toMemberDomain(
        r,
        PrismaAssociationRepository.memberProfessionalInfoMap.get(r.id),
      ),
    );
  }

  async findMember(
    associationId: string,
    userId: string,
  ): Promise<AssociationMemberEntity | null> {
    const raw = await this.prisma.associationMember.findUnique({
      where: {
        associationId_userId: {
          associationId,
          userId,
        },
      },
    });
    return raw
      ? AssociationMapper.toMemberDomain(
          raw,
          PrismaAssociationRepository.memberProfessionalInfoMap.get(raw.id),
        )
      : null;
  }

  async findMemberById(
    associationId: string,
    memberId: string,
  ): Promise<AssociationMemberEntity | null> {
    const raw = await this.prisma.associationMember.findUnique({
      where: { id: memberId },
    });
    if (!raw || raw.associationId !== associationId) {
      return null;
    }
    return AssociationMapper.toMemberDomain(
      raw,
      PrismaAssociationRepository.memberProfessionalInfoMap.get(raw.id),
    );
  }

  async listCommunityLinks(
    associationId: string,
  ): Promise<AssociationCommunityLinkEntity[]> {
    const rows = await this.prisma.associationCommunity.findMany({
      where: { associationId },
    });
    return rows.map((r) => AssociationMapper.toLinkDomain(r));
  }

  async save(association: AssociationEntity): Promise<void> {
    await this.prisma.association.create({
      data: {
        id: association.id,
        name: association.name,
        acronym: association.acronym,
        registrationNumber: association.registrationNumber,
        description: association.description,
        createdAt: association.createdAt,
      },
    });
  }

  async update(association: AssociationEntity): Promise<void> {
    await this.prisma.association.update({
      where: { id: association.id },
      data: {
        name: association.name,
        acronym: association.acronym,
        description: association.description,
      },
    });
  }

  async addMember(member: AssociationMemberEntity): Promise<void> {
    await this.prisma.associationMember.create({
      data: {
        id: member.id,
        associationId: member.associationId,
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt,
        updatedAt: member.updatedAt,
      },
    });
  }

  async updateMemberRole(member: AssociationMemberEntity): Promise<void> {
    await this.prisma.associationMember.update({
      where: { id: member.id },
      data: {
        role: member.role,
        updatedAt: member.updatedAt,
      },
    });
  }

  async updateMemberProfessionalInfo(
    associationId: string,
    memberId: string,
    info: import('../../domain/entities/association-member.entity.js').MemberProfessionalInfo,
  ): Promise<void> {
    PrismaAssociationRepository.memberProfessionalInfoMap.set(memberId, { ...info });
    await this.prisma.associationMember.update({
      where: { id: memberId },
      data: {
        updatedAt: new Date(),
      },
    });
  }

  async removeMember(associationId: string, userId: string): Promise<void> {
    await this.prisma.associationMember.delete({
      where: {
        associationId_userId: {
          associationId,
          userId,
        },
      },
    });
  }

  async linkCommunity(link: AssociationCommunityLinkEntity): Promise<void> {
    await this.prisma.associationCommunity.create({
      data: {
        id: link.id,
        associationId: link.associationId,
        communityId: link.communityId,
        linkedAt: link.linkedAt,
      },
    });
  }

  async unlinkCommunity(associationId: string, communityId: string): Promise<void> {
    await this.prisma.associationCommunity.delete({
      where: {
        associationId_communityId: {
          associationId,
          communityId,
        },
      },
    });
  }
}
