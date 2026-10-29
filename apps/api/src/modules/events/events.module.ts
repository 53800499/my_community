import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../platform/database/database.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { EventsController } from './presentation/http/events.controller.js';
import { CreateEventUseCase } from './application/commands/create-event.use-case.js';
import { RegisterAttendeeUseCase } from './application/commands/register-attendee.use-case.js';
import { CancelEventUseCase } from './application/commands/cancel-event.use-case.js';
import { ListCommunityEventsQuery } from './application/queries/list-community-events.query.js';
import { GetEventDetailsQuery } from './application/queries/get-event-details.query.js';
import { EVENT_READER_PORT } from './application/ports/event-reader.port.js';
import { EVENT_WRITER_PORT } from './application/ports/event-writer.port.js';
import { PrismaEventRepository } from './infrastructure/repositories/prisma-event.repository.js';

/**
 * Module Métier : Événements & Agenda Citoyen (Niveau 4)
 * Conforme SOLID :
 * - DIP : Port/Adapter pour les repositories de persistance.
 * - SRP : Découpage clair des cas d'usage et requêtes.
 */
@Module({
  imports: [DatabaseModule, AuditModule],
  controllers: [EventsController],
  providers: [
    PrismaEventRepository,
    {
      provide: EVENT_READER_PORT,
      useExisting: PrismaEventRepository,
    },
    {
      provide: EVENT_WRITER_PORT,
      useExisting: PrismaEventRepository,
    },
    CreateEventUseCase,
    RegisterAttendeeUseCase,
    CancelEventUseCase,
    ListCommunityEventsQuery,
    GetEventDetailsQuery,
  ],
  exports: [
    EVENT_READER_PORT,
    EVENT_WRITER_PORT,
    CreateEventUseCase,
    RegisterAttendeeUseCase,
    CancelEventUseCase,
    ListCommunityEventsQuery,
    GetEventDetailsQuery,
  ],
})
export class EventsModule {}
