import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { NotificationEntity } from '../../domain/entities/notification.entity.js';
import {
  NotificationReaderPort,
  NOTIFICATION_READER_PORT,
} from '../ports/notification-reader.port.js';

export interface ListUserNotificationsParams {
  userId: string;
  unreadOnly?: boolean;
}

/**
 * Cas d'Usage de Lecture (Query) : Consultation des Notifications Citoyennes
 * Conforme SOLID :
 * - SRP : Dédié uniquement à la recherche et au filtrage des notifications de l'utilisateur.
 * - DIP : Dépend du port de lecture injecté.
 */
@Injectable()
export class ListUserNotificationsQuery {
  constructor(
    @Inject(NOTIFICATION_READER_PORT)
    private readonly reader: NotificationReaderPort,
  ) {}

  async execute(params: ListUserNotificationsParams): Promise<NotificationEntity[]> {
    if (!params.userId || params.userId.trim().length === 0) {
      throw new BadRequestException("L'identifiant utilisateur est obligatoire.");
    }

    return this.reader.findByUserId(params.userId, params.unreadOnly);
  }
}
