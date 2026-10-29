import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/database/prisma.service.js';
import { TerritoryEntity } from '../../domain/entities/territory.entity.js';
import { TerritoryReaderPort } from '../../application/ports/territory-reader.port.js';
import { TerritoryWriterPort } from '../../application/ports/territory-writer.port.js';
import { TerritoryMapper } from '../mappers/territory.mapper.js';

/**
 * Adaptateur de Persistance Prisma pour le Référentiel Territorial
 * Conforme LSP & DIP : Implémente TerritoryReaderPort et TerritoryWriterPort.
 */
@Injectable()
export class PrismaTerritoryRepository implements TerritoryReaderPort, TerritoryWriterPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<TerritoryEntity | null> {
    const record = await this.prisma.territory.findUnique({ where: { id } });
    return record ? TerritoryMapper.toDomain(record) : null;
  }

  async findByCode(code: string): Promise<TerritoryEntity | null> {
    const record = await this.prisma.territory.findUnique({ where: { code } });
    return record ? TerritoryMapper.toDomain(record) : null;
  }

  async listRoots(): Promise<TerritoryEntity[]> {
    const records = await this.prisma.territory.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
    });
    return records.map(TerritoryMapper.toDomain);
  }

  async listChildren(parentId: string): Promise<TerritoryEntity[]> {
    const records = await this.prisma.territory.findMany({
      where: { parentId },
      orderBy: { name: 'asc' },
    });
    return records.map(TerritoryMapper.toDomain);
  }

  async save(territory: TerritoryEntity): Promise<void> {
    await this.prisma.territory.upsert({
      where: { code: territory.code },
      update: {
        name: territory.name,
        type: territory.type,
        parentId: territory.parentId ?? null,
      },
      create: {
        id: territory.id,
        name: territory.name,
        code: territory.code,
        type: territory.type,
        parentId: territory.parentId ?? null,
        createdAt: territory.createdAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.territory.delete({ where: { id } });
  }
}
