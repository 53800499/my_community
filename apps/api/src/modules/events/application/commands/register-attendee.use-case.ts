import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventRegistrationEntity } from '../../domain/entities/event-registration.entity.js';
import { EVENT_READER_PORT, type EventReaderPort } from '../ports/event-reader.port.js';
import { EVENT_WRITER_PORT, type EventWriterPort } from '../ports/event-writer.port.js';
import { RegisterAttendeeCommand } from './register-attendee.command.js';
import { AttendeeRegisteredDomainEvent } from '../../domain/events/attendee-registered.domain-event.js';
import { AUDIT_LOGGER_PORT, type AuditLoggerPort, AuditLogEntity } from '../../../audit/index.js';

/**
 * Cas d'Usage Applicatif : Inscription Citoyenne à un Événement (RegisterAttendeeUseCase)
 * Conforme SOLID :
 * - SRP : Gère l'inscription avec vérification des capacités et anti-doublon.
 * - DIP : Dépend des abstractions injectées.
 */
@Injectable()
export class RegisterAttendeeUseCase {
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

  async execute(command: RegisterAttendeeCommand): Promise<EventRegistrationEntity> {
    const event = await this.eventReader.findById(command.eventId);
    if (!event) {
      throw new NotFoundException(`Événement ${command.eventId} introuvable.`);
    }

    if (event.status === 'CANCELLED') {
      throw new BadRequestException("Impossible de s'inscrire à un événement annulé.");
    }
    if (event.status === 'COMPLETED') {
      throw new BadRequestException("Impossible de s'inscrire à un événement déjà terminé.");
    }

    // Vérifier inscription existante
    const existing = await this.eventReader.findRegistration(command.eventId, command.userId);
    if (existing) {
      if (existing.status === 'CONFIRMED') {
        throw new ConflictException("Vous êtes déjà inscrit à cet événement.");
      }
      if (existing.status === 'WAITLIST') {
        throw new ConflictException("Vous êtes déjà sur la liste d'attente pour cet événement.");
      }
    }

    // Vérifier capacité maximale
    const currentCount = await this.eventReader.countAttendees(command.eventId);
    const isFull = event.isFull(currentCount);
    const status = isFull ? 'WAITLIST' : 'CONFIRMED';

    const registration = EventRegistrationEntity.create({
      id: randomUUID(),
      eventId: command.eventId,
      userId: command.userId,
      status,
    });

    await this.eventWriter.saveRegistration(registration);

    if (this.eventEmitter) {
      this.eventEmitter.emit(
        'event.attendee_registered',
        new AttendeeRegisteredDomainEvent(registration.id, event.id, command.userId),
      );
    }

    if (this.auditLogger) {
      await this.auditLogger.log(
        AuditLogEntity.create({
          id: randomUUID(),
          actorId: command.userId,
          action: 'EVENT.ATTENDEE_REGISTERED',
          resourceType: 'CommunityEventRegistration',
          resourceId: registration.id,
          payload: {
            eventId: event.id,
            status,
          },
          createdAt: new Date(),
        }),
      );
    }

    return registration;
  }
}
