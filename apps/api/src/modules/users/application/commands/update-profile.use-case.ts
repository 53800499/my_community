import { Injectable, Inject, BadRequestException, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity.js';
import { UserReaderPort, USER_READER_PORT } from '../ports/user-reader.port.js';
import { UserWriterPort, USER_WRITER_PORT } from '../ports/user-writer.port.js';
import { AuditLoggerPort, AUDIT_LOGGER_PORT } from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';
import { UpdateProfileCommand } from './update-profile.command.js';

/**
 * Cas d'Usage Applicatif : Mise à jour ou création du Profil Citoyen (UpdateProfileUseCase)
 * Conforme SOLID :
 * - SRP : Dédié uniquement à la gestion de l'état civil et des données de profil.
 * - DIP : Dépend exclusivement des ports injectés par Symbol tokens.
 */
@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(USER_READER_PORT)
    private readonly userReader: UserReaderPort,
    @Inject(USER_WRITER_PORT)
    private readonly userWriter: UserWriterPort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
  ) {}

  async execute(command: UpdateProfileCommand): Promise<UserProfileEntity> {
    if (!command.userId || command.userId.trim().length === 0) {
      throw new BadRequestException("L'identifiant utilisateur est obligatoire.");
    }

    let profile = await this.userReader.findByUserId(command.userId);

    if (profile) {
      profile.updateInfo({
        firstName: command.firstName,
        lastName: command.lastName,
        bio: command.bio,
        city: command.city,
      });

      if (command.avatarKey !== undefined) {
        profile.updateAvatar(command.avatarKey);
      }

      await this.userWriter.update(profile);

      if (this.auditLogger) {
        const auditLog = AuditLogEntity.create({
          id: randomUUID(),
          actorId: command.userId,
          action: 'USER_PROFILE_UPDATED',
          resourceType: 'USER_PROFILE',
          resourceId: profile.id,
          payload: {
            fullName: profile.fullName,
            city: profile.city,
          },
          ipAddress: command.ipAddress ?? null,
          userAgent: command.userAgent ?? null,
          createdAt: new Date(),
        });
        await this.auditLogger.log(auditLog);
      }
    } else {
      if (!command.firstName || !command.lastName) {
        throw new BadRequestException('Le prénom et le nom de famille sont obligatoires pour créer le profil.');
      }

      profile = UserProfileEntity.create({
        id: randomUUID(),
        userId: command.userId,
        firstName: command.firstName,
        lastName: command.lastName,
        bio: command.bio,
        city: command.city,
        avatarKey: command.avatarKey,
      });

      await this.userWriter.save(profile);

      if (this.auditLogger) {
        const auditLog = AuditLogEntity.create({
          id: randomUUID(),
          actorId: command.userId,
          action: 'USER_PROFILE_CREATED',
          resourceType: 'USER_PROFILE',
          resourceId: profile.id,
          payload: {
            fullName: profile.fullName,
            city: profile.city,
          },
          ipAddress: command.ipAddress ?? null,
          userAgent: command.userAgent ?? null,
          createdAt: new Date(),
        });
        await this.auditLogger.log(auditLog);
      }
    }

    return profile;
  }
}
