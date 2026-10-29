import { describe, it, expect, vi, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  NotificationEntity,
  NotificationType,
} from '../../src/modules/notifications/domain/entities/notification.entity.js';
import { SendNotificationUseCase } from '../../src/modules/notifications/application/commands/send-notification.use-case.js';
import { MarkNotificationAsReadUseCase } from '../../src/modules/notifications/application/commands/mark-notification-as-read.use-case.js';
import { ListUserNotificationsQuery } from '../../src/modules/notifications/application/queries/list-user-notifications.query.js';
import { NotificationReaderPort } from '../../src/modules/notifications/application/ports/notification-reader.port.js';
import { NotificationWriterPort } from '../../src/modules/notifications/application/ports/notification-writer.port.js';
import { NotificationMapper } from '../../src/modules/notifications/infrastructure/mappers/notification.mapper.js';
import { AuditLoggerPort } from '../../src/modules/audit/application/ports/audit-logger.port.js';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

// Implémentation InMemory pour valider le respect de LSP et DIP
class InMemoryNotificationRepository
  implements NotificationReaderPort, NotificationWriterPort
{
  public notifications: Map<string, NotificationEntity> = new Map();

  async findById(id: string): Promise<NotificationEntity | null> {
    return this.notifications.get(id) ?? null;
  }

  async findByUserId(
    userId: string,
    unreadOnly?: boolean,
  ): Promise<NotificationEntity[]> {
    const list = Array.from(this.notifications.values()).filter(
      (n) => n.userId === userId,
    );
    if (unreadOnly) {
      return list.filter((n) => !n.isRead);
    }
    return list;
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return Array.from(this.notifications.values()).filter(
      (n) => n.userId === userId && !n.isRead,
    ).length;
  }

  async save(notification: NotificationEntity): Promise<void> {
    this.notifications.set(notification.id, notification);
  }

  async markAsRead(id: string, readAt: Date): Promise<void> {
    const notif = this.notifications.get(id);
    if (notif) {
      notif.markAsRead(readAt);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const now = new Date();
    for (const notif of this.notifications.values()) {
      if (notif.userId === userId && !notif.isRead) {
        notif.markAsRead(now);
      }
    }
  }
}

describe('Module Notifications — Tests de Conformité SOLID & Hexagonale (Niveau 1)', () => {
  let repository: InMemoryNotificationRepository;
  let mockAuditLogger: AuditLoggerPort;

  beforeEach(() => {
    repository = new InMemoryNotificationRepository();
    mockAuditLogger = {
      log: vi.fn().mockResolvedValue(undefined),
    };
  });

  describe('1. Domaine Pur : NotificationEntity', () => {
    it('devrait instancier une entité valide avec ses valeurs par défaut', () => {
      const id = randomUUID();
      const userId = randomUUID();
      const entity = NotificationEntity.create({
        id,
        userId,
        type: 'COMMUNITY_STATUS',
        title: 'Proposition validée',
        message: 'Votre proposition a été acceptée avec succès.',
        data: { proposalId: 'p-123' },
      });

      expect(entity.id).toBe(id);
      expect(entity.userId).toBe(userId);
      expect(entity.type).toBe('COMMUNITY_STATUS');
      expect(entity.title).toBe('Proposition validée');
      expect(entity.message).toBe('Votre proposition a été acceptée avec succès.');
      expect(entity.data).toEqual({ proposalId: 'p-123' });
      expect(entity.isRead).toBe(false);
      expect(entity.readAt).toBeNull();
      expect(entity.createdAt).toBeInstanceOf(Date);
    });

    it('devrait refuser une notification sans identifiant ou sans destinataire', () => {
      expect(() =>
        NotificationEntity.create({
          id: '',
          userId: 'u1',
          type: 'INFO',
          title: 'Titre',
          message: 'Message',
        }),
      ).toThrow("L'identifiant de la notification est obligatoire.");

      expect(() =>
        NotificationEntity.create({
          id: 'n1',
          userId: '',
          type: 'INFO',
          title: 'Titre',
          message: 'Message',
        }),
      ).toThrow("L'identifiant du destinataire (userId) est obligatoire.");
    });

    it('devrait refuser un type de notification invalide ou un titre vide / trop long', () => {
      expect(() =>
        NotificationEntity.create({
          id: 'n1',
          userId: 'u1',
          type: 'INVALID_TYPE' as NotificationType,
          title: 'Titre',
          message: 'Message',
        }),
      ).toThrow('Type de notification invalide');

      expect(() =>
        NotificationEntity.create({
          id: 'n1',
          userId: 'u1',
          type: 'INFO',
          title: '',
          message: 'Message',
        }),
      ).toThrow('Le titre de la notification est obligatoire.');

      expect(() =>
        NotificationEntity.create({
          id: 'n1',
          userId: 'u1',
          type: 'INFO',
          title: 'a'.repeat(151),
          message: 'Message',
        }),
      ).toThrow('Le titre de la notification ne peut pas dépasser 150 caractères.');
    });

    it('devrait marquer la notification comme lue et enregistrer la date', () => {
      const entity = NotificationEntity.create({
        id: randomUUID(),
        userId: randomUUID(),
        type: 'INFO',
        title: 'Info',
        message: 'Contenu',
      });

      const now = new Date('2026-10-22T10:00:00Z');
      entity.markAsRead(now);

      expect(entity.isRead).toBe(true);
      expect(entity.readAt).toEqual(now);
    });
  });

  describe('2. Cas d’Usage d’Écriture : SendNotificationUseCase', () => {
    it('devrait créer et persister une notification puis déclencher l’audit', async () => {
      const useCase = new SendNotificationUseCase(repository, mockAuditLogger);
      const userId = randomUUID();

      const notification = await useCase.execute({
        userId,
        type: 'ALERT',
        title: 'Alerte importante',
        message: 'Une réunion citoyenne a lieu ce soir.',
      });

      expect(notification).toBeDefined();
      expect(notification.userId).toBe(userId);
      expect(notification.type).toBe('ALERT');

      // Vérification persistance via port
      const persisted = await repository.findById(notification.id);
      expect(persisted).toBeDefined();
      expect(persisted?.title).toBe('Alerte importante');

      // Vérification audit
      expect(mockAuditLogger.log).toHaveBeenCalledTimes(1);
    });

    it('devrait refuser d’envoyer une notification sans identifiant destinataire', async () => {
      const useCase = new SendNotificationUseCase(repository);

      await expect(
        useCase.execute({
          userId: '   ',
          type: 'INFO',
          title: 'Titre',
          message: 'Message',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('3. Cas d’Usage de Mutation : MarkNotificationAsReadUseCase & Anti-IDOR', () => {
    it('devrait marquer la notification comme lue lorsque le propriétaire légitime le demande', async () => {
      const userId = randomUUID();
      const notifId = randomUUID();
      const entity = NotificationEntity.create({
        id: notifId,
        userId,
        type: 'INFO',
        title: 'Rappel',
        message: 'Veuillez vérifier votre compte',
      });
      await repository.save(entity);

      const useCase = new MarkNotificationAsReadUseCase(repository, repository);
      const updated = await useCase.execute({
        notificationId: notifId,
        userId,
      });

      expect(updated.isRead).toBe(true);
      expect(updated.readAt).toBeInstanceOf(Date);

      const fromDb = await repository.findById(notifId);
      expect(fromDb?.isRead).toBe(true);
    });

    it('devrait rejeter la requête avec ForbiddenException si un utilisateur tiers tente de marquer la notification (anti-IDOR)', async () => {
      const legitOwnerId = randomUUID();
      const attackerUserId = randomUUID();
      const notifId = randomUUID();

      const entity = NotificationEntity.create({
        id: notifId,
        userId: legitOwnerId,
        type: 'INFO',
        title: 'Confidentiel',
        message: 'Message privé pour legitOwner',
      });
      await repository.save(entity);

      const useCase = new MarkNotificationAsReadUseCase(repository, repository);

      await expect(
        useCase.execute({
          notificationId: notifId,
          userId: attackerUserId,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('devrait renvoyer NotFoundException si la notification n’existe pas', async () => {
      const useCase = new MarkNotificationAsReadUseCase(repository, repository);

      await expect(
        useCase.execute({
          notificationId: randomUUID(),
          userId: randomUUID(),
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('4. Cas d’Usage de Consultation : ListUserNotificationsQuery', () => {
    it('devrait renvoyer toutes les notifications de l’utilisateur et filtrer unreadOnly', async () => {
      const userId = randomUUID();
      const query = new ListUserNotificationsQuery(repository);

      const n1 = NotificationEntity.create({
        id: randomUUID(),
        userId,
        type: 'INFO',
        title: 'N1',
        message: 'Msg 1',
        isRead: false,
      });
      const n2 = NotificationEntity.create({
        id: randomUUID(),
        userId,
        type: 'ALERT',
        title: 'N2',
        message: 'Msg 2',
        isRead: true,
        readAt: new Date(),
      });
      await repository.save(n1);
      await repository.save(n2);

      const all = await query.execute({ userId });
      expect(all).toHaveLength(2);

      const unreadOnly = await query.execute({ userId, unreadOnly: true });
      expect(unreadOnly).toHaveLength(1);
      expect(unreadOnly[0].id).toBe(n1.id);
    });
  });

  describe('5. Data Mapper : NotificationMapper', () => {
    it('devrait convertir fidèlement un enregistrement en Entité Domaine et en DTO de réponse', () => {
      const now = new Date('2026-10-22T11:00:00Z');
      const raw = {
        id: randomUUID(),
        userId: randomUUID(),
        type: 'SYSTEM' as const,
        title: 'Maintenance',
        message: 'Serveurs en maintenance nocturne',
        data: { maintenanceWindow: '2h' },
        isRead: true,
        readAt: now,
        createdAt: now,
      };

      const entity = NotificationMapper.toDomain(raw);
      expect(entity.id).toBe(raw.id);
      expect(entity.type).toBe('SYSTEM');
      expect(entity.isRead).toBe(true);

      const dto = NotificationMapper.toResponseDto(entity);
      expect(dto.id).toBe(raw.id);
      expect(dto.title).toBe('Maintenance');
      expect(dto.readAt).toBe(now.toISOString());
      expect(dto.createdAt).toBe(now.toISOString());
    });
  });
});
