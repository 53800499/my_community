import type { Notification as PrismaNotification } from '@prisma/client';
import {
  NotificationEntity,
  NotificationType,
} from '../../domain/entities/notification.entity.js';
import { NotificationResponseDto } from '../../presentation/http/dto/notification-response.dto.js';

/**
 * Data Mapper Pur : Conversion Statique entre Modèle Prisma Notification, Entité Domaine et DTO
 */
export class NotificationMapper {
  public static toDomain(raw: PrismaNotification): NotificationEntity {
    return NotificationEntity.create({
      id: raw.id,
      userId: raw.userId,
      type: raw.type as NotificationType,
      title: raw.title,
      message: raw.message,
      data: (raw.data as Record<string, unknown> | null) ?? null,
      isRead: raw.isRead,
      readAt: raw.readAt,
      createdAt: raw.createdAt,
    });
  }

  public static toResponseDto(entity: NotificationEntity): NotificationResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      type: entity.type,
      title: entity.title,
      message: entity.message,
      data: entity.data,
      isRead: entity.isRead,
      readAt: entity.readAt ? entity.readAt.toISOString() : null,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
