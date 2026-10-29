import { Injectable } from '@nestjs/common';
import type { AccountStatus as PrismaAccountStatus } from '@prisma/client';
import { PrismaService } from '../../../../platform/database/prisma.service.js';
import { IdentityReaderPort } from '../../application/ports/identity-reader.port.js';
import { IdentityWriterPort } from '../../application/ports/identity-writer.port.js';
import { UserAccountEntity } from '../../domain/entities/user-account.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { PhoneNumber } from '../../domain/value-objects/phone-number.vo.js';
import { IdentityMapper } from '../mappers/identity.mapper.js';

/**
 * Adaptateur de Persistance Prisma : Implémentation concrète des ports IdentityReaderPort et IdentityWriterPort.
 * Isole les requêtes SQL/Prisma et mappe systématiquement vers le Domaine pur.
 */
@Injectable()
export class PrismaIdentityRepository implements IdentityReaderPort, IdentityWriterPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserAccountEntity | null> {
    const raw = await this.prisma.userAccount.findUnique({
      where: { id },
    });
    return raw ? IdentityMapper.toDomain(raw) : null;
  }

  async findByEmail(email: Email): Promise<UserAccountEntity | null> {
    const raw = await this.prisma.userAccount.findUnique({
      where: { email: email.getValue() },
    });
    return raw ? IdentityMapper.toDomain(raw) : null;
  }

  async findByPhoneNumber(phoneNumber: PhoneNumber): Promise<UserAccountEntity | null> {
    const raw = await this.prisma.userAccount.findUnique({
      where: { phoneNumber: phoneNumber.getValue() },
    });
    return raw ? IdentityMapper.toDomain(raw) : null;
  }

  async save(account: UserAccountEntity): Promise<void> {
    await this.prisma.userAccount.create({
      data: {
        id: account.id,
        email: account.email ? account.email.getValue() : null,
        phoneNumber: account.phoneNumber.getValue(),
        passwordHash: account.passwordHash.getValue(),
        status: account.status as unknown as PrismaAccountStatus,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      },
    });
  }

  async update(account: UserAccountEntity): Promise<void> {
    await this.prisma.userAccount.update({
      where: { id: account.id },
      data: {
        email: account.email ? account.email.getValue() : null,
        phoneNumber: account.phoneNumber.getValue(),
        passwordHash: account.passwordHash.getValue(),
        status: account.status as unknown as PrismaAccountStatus,
        updatedAt: account.updatedAt,
      },
    });
  }
}
