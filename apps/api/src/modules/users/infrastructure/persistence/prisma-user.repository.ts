import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/database/prisma.service.js';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity.js';
import { UserReaderPort } from '../../application/ports/user-reader.port.js';
import { UserWriterPort } from '../../application/ports/user-writer.port.js';
import { UserMapper } from '../mappers/user.mapper.js';

/**
 * Adaptateur de Persistance Prisma : Implémente les ports UserReaderPort et UserWriterPort.
 * Isole les accès SQL Prisma des cas d'usage applicatifs.
 */
@Injectable()
export class PrismaUserRepository implements UserReaderPort, UserWriterPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<UserProfileEntity | null> {
    const raw = await this.prisma.userProfile.findUnique({
      where: { userId },
    });
    return raw ? UserMapper.toDomain(raw) : null;
  }

  async findById(id: string): Promise<UserProfileEntity | null> {
    const raw = await this.prisma.userProfile.findUnique({
      where: { id },
    });
    return raw ? UserMapper.toDomain(raw) : null;
  }

  async save(profile: UserProfileEntity): Promise<void> {
    await this.prisma.userProfile.create({
      data: {
        id: profile.id,
        userId: profile.userId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarKey: profile.avatarKey,
        bio: profile.bio,
        city: profile.city,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
    });
  }

  async update(profile: UserProfileEntity): Promise<void> {
    await this.prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarKey: profile.avatarKey,
        bio: profile.bio,
        city: profile.city,
        updatedAt: profile.updatedAt,
      },
    });
  }
}
