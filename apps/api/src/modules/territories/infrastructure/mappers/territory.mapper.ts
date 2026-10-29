import type { Territory as PrismaTerritory } from '@prisma/client';
import { TerritoryEntity } from '../../domain/entities/territory.entity.js';

import { TerritoryResponseDto } from '../../presentation/http/dto/territory-response.dto.js';
export { TerritoryResponseDto };

/**
 * Data Mapper Pattern : TerritoryMapper
 * Isole la persistance Prisma et les DTOs REST de l'entité de domaine pur.
 */
export class TerritoryMapper {
  public static toDomain(record: PrismaTerritory): TerritoryEntity {
    return TerritoryEntity.create({
      id: record.id,
      name: record.name,
      code: record.code,
      type: record.type,
      parentId: record.parentId,
      createdAt: record.createdAt,
    });
  }

  public static toResponseDto(entity: TerritoryEntity): TerritoryResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      code: entity.code,
      type: entity.type,
      parentId: entity.parentId ?? null,
    };
  }
}
