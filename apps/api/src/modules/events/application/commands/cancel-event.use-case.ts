import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENT_READER_PORT, type EventReaderPort } from '../ports/event-reader.port.js';
import { EVENT_WRITER_PORT, type EventWriterPort } from '../ports/event-writer.port.js';
import { CancelEventCommand } from './cancel-event.command.js';
import { EventCancelledDomainEvent } from '../../domain/events/event-cancelled.domain-event.js';
import { AUDIT_LOGGER_PORT, type AuditLoggerPort, AuditLogEntity } from '../../../audit/index.js';

/**
 * Cas d'Usage Applicatif : Annulation d'un Événement (CancelEventUseCase)
 * Conforme SOLID :
 * - SRP : Annule un événement avec vérification des privilèges et audit.
 */
@Injectable()
export class CancelEventUseCase {
  constructor(
    @Inject(EVENT_READER_PORT)
    private readonly eventReader: EventReaderPort,
    @Inject(EVENT_WRITER_PORT)
    private readonly eventWriter: EventWriterPort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
    @Optional()
    private readonly eventEmitter?: EventEmitter2,
  ) {}

  async execute(command: CancelEventCommand): Promise<void> {
    const event = await this.eventReader.findById(command.eventId);
    if (!event) {
      throw new NotFoundException(`Événement ${command.eventId} introuvable.`);
    }

    try {
      event.cancel(command.requesterUserId, command.isPrivileged);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Impossible d'annuler cet événement.";
      if (msg.includes("Seul l'organisateur")) {
        throw new ForbiddenException(msg);
      }
      throw new BadRequestException(msg);
    }

    await this.eventWriter.update(event);

    if (this.eventEmitter) {
      this.eventEmitter.emit(
        'event.cancelled',
        new EventCancelledDomainEvent(event.id, event.communityId, command.requesterUserId),
      );
    }

    if (this.auditLogger) {
      await this.auditLogger.log(
        AuditLogEntity.create({
          id: randomUUID(),
          actorId: command.requesterUserId,
          action: 'EVENT.CANCELLED',
          resourceType: 'CommunityEvent',
          resourceId: event.id,
          payload: {
            communityId: event.communityId,
          },
          createdAt: new Date(),
        }),
      );
    }
  }
}
