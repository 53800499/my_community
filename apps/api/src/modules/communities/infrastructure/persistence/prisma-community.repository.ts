import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/database/prisma.service.js';
import { CommunityEntity } from '../../domain/entities/community.entity.js';
import { CommunityReaderPort } from '../../application/ports/community-reader.port.js';
import { CommunityWriterPort } from '../../application/ports/community-writer.port.js';
import { CommunityMapper } from '../mappers/community.mapper.js';

/**
 * Adaptateur de Persistance Prisma : Implémente les ports CommunityReaderPort et CommunityWriterPort.
 * Conforme LSP et DIP : Isole Prisma des cas d'usage applicatifs.
 */
@Injectable()
export class PrismaCommunityRepository implements CommunityReaderPort, CommunityWriterPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CommunityEntity | null> {
    const raw = await this.prisma.community.findUnique({
      where: { id },
    });
    if (!raw) return null;

    return CommunityMapper.toDomain({
      id: raw.id,
      name: raw.name,
      slug: raw.slug,
      description: raw.description,
      territoryId: raw.territoryId,
      status: 'ACTIVE',
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findBySlug(slug: string): Promise<CommunityEntity | null> {
    const raw = await this.prisma.community.findUnique({
      where: { slug },
    });
    if (!raw) return null;

    return CommunityMapper.toDomain({
      id: raw.id,
      name: raw.name,
      slug: raw.slug,
      description: raw.description,
      territoryId: raw.territoryId,
      status: 'ACTIVE',
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async listAll(): Promise<CommunityEntity[]> {
    const list = await this.prisma.community.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return list.map((raw) =>
      CommunityMapper.toDomain({
        id: raw.id,
        name: raw.name,
        slug: raw.slug,
        description: raw.description,
        territoryId: raw.territoryId,
        status: 'ACTIVE',
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      }),
    );
  }

  async save(community: CommunityEntity): Promise<void> {
    await this.prisma.community.create({
      data: {
        id: community.id,
        name: community.name,
        slug: community.slug,
        description: community.description ?? null,
        territoryId: community.territoryId,
        createdAt: community.createdAt,
        updatedAt: community.updatedAt,
      },
    });
  }

  async updateStatus(_id: string, _status: 'PENDING' | 'ACTIVE' | 'SUSPENDED'): Promise<void> {
    // Statut géré au niveau proposition / adhésions
  }

  async delete(id: string): Promise<void> {
    await this.prisma.community.delete({
      where: { id },
    });
  }
}
