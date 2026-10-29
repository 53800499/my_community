import { Injectable, Inject } from '@nestjs/common';
import { EventEntity, EventStatus } from '../../domain/entities/event.entity.js';
import { EVENT_READER_PORT, type EventReaderPort } from '../ports/event-reader.port.js';

export interface ListCommunityEventsParams {
  communityId: string;
  status?: EventStatus;
}

/**
 * Requête Applicative : Liste des événements d'une communauté (ListCommunityEventsQuery)
 * Conforme SOLID :
 * - SRP : Dédié uniquement à la consultation filtrée des événements.
 */
@Injectable()
export class ListCommunityEventsQuery {
  constructor(
    @Inject(EVENT_READER_PORT)
    private readonly eventReader: EventReaderPort,
  ) {}

  async execute(params: ListCommunityEventsParams): Promise<EventEntity[]> {
    return this.eventReader.listByCommunity(params.communityId, params.status);
  }
}
