import { EventEntity, EventStatus } from '../../domain/entities/event.entity.js';
import { EventRegistrationEntity } from '../../domain/entities/event-registration.entity.js';

export const EVENT_READER_PORT = Symbol('EVENT_READER_PORT');

/**
 * Port de Lecture : Événements Communautaires (EventReaderPort)
 * Conforme SOLID :
 * - ISP : Ségrégation stricte des opérations de lecture (DIP).
 */
export interface EventReaderPort {
  findById(id: string): Promise<EventEntity | null>;
  listByCommunity(communityId: string, status?: EventStatus): Promise<EventEntity[]>;
  findRegistration(eventId: string, userId: string): Promise<EventRegistrationEntity | null>;
  listEventRegistrations(eventId: string): Promise<EventRegistrationEntity[]>;
  countAttendees(eventId: string): Promise<number>;
}
