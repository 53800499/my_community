/**
 * Façade Publique du Module Événements (Niveau 4)
 * Conforme SOLID :
 * - OCP : Seuls les ports et cas d'usage exportés ici sont accessibles depuis l'extérieur.
 */

// Module
export { EventsModule } from './events.module.js';

// Domain Entities & Types
export { EventEntity, type EventStatus, type EventEntityProps } from './domain/entities/event.entity.js';
export {
  EventRegistrationEntity,
  type EventRegistrationStatus,
  type EventRegistrationProps,
} from './domain/entities/event-registration.entity.js';

// Domain Events
export { EventCreatedDomainEvent } from './domain/events/event-created.domain-event.js';
export { AttendeeRegisteredDomainEvent } from './domain/events/attendee-registered.domain-event.js';
export { EventCancelledDomainEvent } from './domain/events/event-cancelled.domain-event.js';

// Ports
export { EVENT_READER_PORT, type EventReaderPort } from './application/ports/event-reader.port.js';
export { EVENT_WRITER_PORT, type EventWriterPort } from './application/ports/event-writer.port.js';

// Commands & Use Cases
export { CreateEventUseCase } from './application/commands/create-event.use-case.js';
export type { CreateEventCommand } from './application/commands/create-event.command.js';
export { RegisterAttendeeUseCase } from './application/commands/register-attendee.use-case.js';
export type { RegisterAttendeeCommand } from './application/commands/register-attendee.command.js';
export { CancelEventUseCase } from './application/commands/cancel-event.use-case.js';
export type { CancelEventCommand } from './application/commands/cancel-event.command.js';

// Queries
export { ListCommunityEventsQuery, type ListCommunityEventsParams } from './application/queries/list-community-events.query.js';
export {
  GetEventDetailsQuery,
  type GetEventDetailsParams,
  type EventDetailsResult,
} from './application/queries/get-event-details.query.js';

// DTOs & Mappers
export { CreateEventDto } from './presentation/http/dto/create-event.dto.js';
export { EventResponseDto } from './presentation/http/dto/event-response.dto.js';
export { EventRegistrationResponseDto } from './presentation/http/dto/event-registration-response.dto.js';
export { EventMapper } from './infrastructure/mappers/event.mapper.js';
