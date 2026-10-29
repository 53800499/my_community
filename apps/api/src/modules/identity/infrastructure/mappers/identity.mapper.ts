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
  public static isPlatformAdminUser(raw: {
    phoneNumber: string;
    email?: string | null;
    isPlatformAdmin?: boolean;
  }): boolean {
    if (typeof raw.isPlatformAdmin === 'boolean') {
      return raw.isPlatformAdmin;
    }
    const phone = (raw.phoneNumber || '').trim();
    const email = (raw.email || '').toLowerCase().trim();
    const adminPhones = (process.env.PLATFORM_ADMIN_PHONES || '+22997123456')
      .split(',')
      .map((p) => p.trim());
    const adminEmails = (
      process.env.PLATFORM_ADMIN_EMAILS ||
      'sikirou@mycommunity.bj,admin@mycommunity.bj'
    )
      .split(',')
      .map((e) => e.trim().toLowerCase());
    return (
      adminPhones.includes(phone) ||
      (email.length > 0 && adminEmails.includes(email))
    );
  }

  public static toDomain(
    raw: PrismaUserAccount & { isPlatformAdmin?: boolean },
  ): UserAccountEntity {
    const isPlatformAdmin = IdentityMapper.isPlatformAdminUser(raw);
    return UserAccountEntity.create({
      id: raw.id,
      email: raw.email ? new Email(raw.email) : null,
      phoneNumber: new PhoneNumber(raw.phoneNumber),
      passwordHash: new PasswordHash(raw.passwordHash),
      status: raw.status as unknown as AccountStatus,
      isPlatformAdmin,
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
      isPlatformAdmin: entity.isPlatformAdmin,
      role: entity.isPlatformAdmin ? 'SUPER_ADMIN' : 'CITIZEN',
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
