import { Module } from '@nestjs/common';
import { NotificationsController } from './presentation/http/controllers/notifications.controller.js';
import { SendNotificationUseCase } from './application/commands/send-notification.use-case.js';
import { MarkNotificationAsReadUseCase } from './application/commands/mark-notification-as-read.use-case.js';
import { ListUserNotificationsQuery } from './application/queries/list-user-notifications.query.js';
import { NOTIFICATION_READER_PORT } from './application/ports/notification-reader.port.js';
import { NOTIFICATION_WRITER_PORT } from './application/ports/notification-writer.port.js';
import { PrismaNotificationRepository } from './infrastructure/persistence/prisma-notification.repository.js';
import { AuditModule } from '../audit/audit.module.js';

/**
 * Module Métier : Notifications (Niveau 1)
 * Fournit le centre de notifications in-app et l'orchestration des alertes citoyennes.
 */
@Module({
  imports: [AuditModule],
  controllers: [NotificationsController],
  providers: [
    SendNotificationUseCase,
    MarkNotificationAsReadUseCase,
    ListUserNotificationsQuery,
    {
      provide: NOTIFICATION_READER_PORT,
      useClass: PrismaNotificationRepository,
    },
    {
      provide: NOTIFICATION_WRITER_PORT,
      useClass: PrismaNotificationRepository,
    },
  ],
  exports: [
    SendNotificationUseCase,
    MarkNotificationAsReadUseCase,
    ListUserNotificationsQuery,
    NOTIFICATION_READER_PORT,
    NOTIFICATION_WRITER_PORT,
  ],
})
export class NotificationsModule {}
