import { CommunityEntity } from '../../domain/entities/community.entity.js';

export interface PrismaCommunityRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  territoryId: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
}

import { CommunityResponseDto } from '../../presentation/http/dto/community-response.dto.js';

export { CommunityResponseDto };

/**
 * Data Mapper Pattern (Pragmatique & Sans Surcharge) :
 * Isole les structures de données techniques (Prisma / DTO) de l'Entité de Domaine pur.
 * Fonctions statiques pures : 0 configuration lourde, 0 magie noire, 100% typé.
 */
export class CommunityMapper {
  public static toDomain(record: PrismaCommunityRecord): CommunityEntity {
    return CommunityEntity.create({
      id: record.id,
      name: record.name,
      slug: record.slug,
      description: record.description,
      territoryId: record.territoryId,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  public static toResponseDto(entity: CommunityEntity): CommunityResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      description: entity.description ?? null,
      territoryId: entity.territoryId,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
