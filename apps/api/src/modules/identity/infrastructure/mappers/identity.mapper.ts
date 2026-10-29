import type { UserAccount as PrismaUserAccount } from '@prisma/client';
import { UserAccountEntity } from '../../domain/entities/user-account.entity.js';
import { AccountStatus } from '../../domain/value-objects/account-status.enum.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { PhoneNumber } from '../../domain/value-objects/phone-number.vo.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo.js';

import {
  UserAccountResponseDto,
  AuthSuccessResponseDto,
} from '../../presentation/http/dto/auth-response.dto.js';
export { UserAccountResponseDto, AuthSuccessResponseDto };

/**
 * Data Mapper Pur : Conversion Statique entre Modèle Prisma, Entité Domaine et DTOs
 * Isole totalement le domaine pur des structures de données de la base de données.
 */
export class IdentityMapper {
  public static toDomain(raw: PrismaUserAccount): UserAccountEntity {
    return UserAccountEntity.create({
      id: raw.id,
      email: raw.email ? new Email(raw.email) : null,
      phoneNumber: new PhoneNumber(raw.phoneNumber),
      passwordHash: new PasswordHash(raw.passwordHash),
      status: raw.status as unknown as AccountStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toUserDto(entity: UserAccountEntity): UserAccountResponseDto {
    return {
      id: entity.id,
      phoneNumber: entity.phoneNumber.getValue(),
      email: entity.email ? entity.email.getValue() : null,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  public static toAuthResponse(
    entity: UserAccountEntity,
    token: string,
  ): AuthSuccessResponseDto {
    return {
      token,
      user: IdentityMapper.toUserDto(entity),
    };
  }
}
