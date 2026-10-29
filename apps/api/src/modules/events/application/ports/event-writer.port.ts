import { EventEntity } from '../../domain/entities/event.entity.js';
import { EventRegistrationEntity } from '../../domain/entities/event-registration.entity.js';

export const EVENT_WRITER_PORT = Symbol('EVENT_WRITER_PORT');

/**
 * Port d'Écriture : Événements Communautaires (EventWriterPort)
 * Conforme SOLID :
 * - ISP : Ségrégation stricte des opérations de mutation (DIP).
 */
export interface EventWriterPort {
  save(event: EventEntity): Promise<void>;
  update(event: EventEntity): Promise<void>;
  saveRegistration(registration: EventRegistrationEntity): Promise<void>;
  updateRegistration(registration: EventRegistrationEntity): Promise<void>;
}
