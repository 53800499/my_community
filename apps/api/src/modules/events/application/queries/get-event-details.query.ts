import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEntity } from '../../domain/entities/event.entity.js';
import { EVENT_READER_PORT, type EventReaderPort } from '../ports/event-reader.port.js';

export interface GetEventDetailsParams {
  eventId: string;
  currentUserId?: string;
}

export interface EventDetailsResult {
  event: EventEntity;
  attendeesCount: number;
  userRegistrationStatus?: 'CONFIRMED' | 'WAITLIST' | 'CANCELLED' | null;
}

/**
 * Requête Applicative : Détails d'un événement citoyen avec compteurs et statut utilisateur (GetEventDetailsQuery)
 */
@Injectable()
export class GetEventDetailsQuery {
  constructor(
    @Inject(EVENT_READER_PORT)
    private readonly eventReader: EventReaderPort,
  ) {}

  async execute(params: GetEventDetailsParams): Promise<EventDetailsResult> {
    const event = await this.eventReader.findById(params.eventId);
    if (!event) {
      throw new NotFoundException(`Événement ${params.eventId} introuvable.`);
    }

    const attendeesCount = await this.eventReader.countAttendees(params.eventId);

    let userRegistrationStatus: 'CONFIRMED' | 'WAITLIST' | 'CANCELLED' | null = null;
    if (params.currentUserId) {
      const reg = await this.eventReader.findRegistration(params.eventId, params.currentUserId);
      if (reg) {
        userRegistrationStatus = reg.status;
      }
    }

    return {
      event,
      attendeesCount,
      userRegistrationStatus,
    };
  }
}
