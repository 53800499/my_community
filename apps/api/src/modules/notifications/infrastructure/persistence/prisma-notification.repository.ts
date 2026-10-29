import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../platform/database/prisma.service.js';
import { NotificationEntity } from '../../domain/entities/notification.entity.js';
import { NotificationReaderPort } from '../../application/ports/notification-reader.port.js';
import { NotificationWriterPort } from '../../application/ports/notification-writer.port.js';
import { NotificationMapper } from '../mappers/notification.mapper.js';

/**
 * Adaptateur de Persistance Prisma : Implémente NotificationReaderPort et NotificationWriterPort.
 * Isole les accès SQL Prisma des cas d'usage applicatifs (Clean Architecture / DIP).
 */
@Injectable()
export class PrismaNotificationRepository
  implements NotificationReaderPort, NotificationWriterPort
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<NotificationEntity | null> {
    const raw = await this.prisma.notification.findUnique({
      where: { id },
    });
    return raw ? NotificationMapper.toDomain(raw) : null;
  }

  async findByUserId(
    userId: string,
    unreadOnly?: boolean,
  ): Promise<NotificationEntity[]> {
    const whereClause: { userId: string; isRead?: boolean } = { userId };
    if (unreadOnly) {
      whereClause.isRead = false;
    }

    const rows = await this.prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((r) => NotificationMapper.toDomain(r));
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async save(notification: NotificationEntity): Promise<void> {
    await this.prisma.notification.create({
      data: {
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: (notification.data ?? Prisma.DbNull) as Prisma.InputJsonValue,
        isRead: notification.isRead,
        readAt: notification.readAt,
        createdAt: notification.createdAt,
      },
    });
  }

  async markAsRead(id: string, readAt: Date): Promise<void> {
    await this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt,
      },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
}
