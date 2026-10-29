import { Injectable, Inject, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventEntity } from '../../domain/entities/event.entity.js';
import { EVENT_WRITER_PORT, type EventWriterPort } from '../ports/event-writer.port.js';
import { CreateEventCommand } from './create-event.command.js';
import { EventCreatedDomainEvent } from '../../domain/events/event-created.domain-event.js';
import { AUDIT_LOGGER_PORT, type AuditLoggerPort, AuditLogEntity } from '../../../audit/index.js';

/**
 * Cas d'Usage Applicatif : Création d'un Événement Citoyen (CreateEventUseCase)
 * Conforme SOLID :
 * - SRP : Uniquement responsable de l'instanciation, persistance et diffusion de l'événement.
 * - DIP : Dépend des abstractions injectées (WriterPort, AuditLoggerPort).
 */
@Injectable()
export class CreateEventUseCase {
  constructor(
    @Inject(EVENT_WRITER_PORT)
    private readonly eventWriter: EventWriterPort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
    @Optional()
    private readonly eventEmitter?: EventEmitter2,
  ) {}

  async execute(command: CreateEventCommand): Promise<EventEntity> {
    const event = EventEntity.create({
      id: randomUUID(),
      communityId: command.communityId,
      organizerUserId: command.organizerUserId,
      title: command.title,
      description: command.description,
      location: command.location,
      startsAt: command.startsAt,
      endsAt: command.endsAt,
      maxAttendees: command.maxAttendees,
    });

    await this.eventWriter.save(event);

    if (this.eventEmitter) {
      this.eventEmitter.emit(
        'event.created',
        new EventCreatedDomainEvent(
          event.id,
          event.communityId,
          event.title,
          event.organizerUserId,
          event.startsAt,
        ),
      );
    }

    if (this.auditLogger) {
      await this.auditLogger.log(
        AuditLogEntity.create({
          id: randomUUID(),
          actorId: command.organizerUserId,
          action: 'EVENT.CREATED',
          resourceType: 'CommunityEvent',
          resourceId: event.id,
          payload: {
            communityId: command.communityId,
            title: command.title,
            startsAt: command.startsAt.toISOString(),
          },
          createdAt: new Date(),
        }),
      );
    }

    return event;
  }
}
