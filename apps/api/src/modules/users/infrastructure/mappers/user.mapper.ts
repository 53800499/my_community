import type { UserProfile as PrismaUserProfile } from '@prisma/client';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity.js';
import { UserProfileResponseDto } from '../../presentation/http/dto/user-profile-response.dto.js';

export { UserProfileResponseDto };

/**
 * Data Mapper Pur : Conversion Statique entre Modèle Prisma UserProfile et Entité Domaine
 */
export class UserMapper {
  public static toDomain(raw: PrismaUserProfile): UserProfileEntity {
    return UserProfileEntity.create({
      id: raw.id,
      userId: raw.userId,
      firstName: raw.firstName,
      lastName: raw.lastName,
      avatarKey: raw.avatarKey,
      bio: raw.bio,
      city: raw.city,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toResponseDto(entity: UserProfileEntity): UserProfileResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      firstName: entity.firstName,
      lastName: entity.lastName,
      fullName: entity.fullName,
      avatarKey: entity.avatarKey,
      bio: entity.bio,
      city: entity.city,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
