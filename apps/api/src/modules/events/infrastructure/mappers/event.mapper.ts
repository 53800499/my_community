import {
  CommunityEvent as PrismaCommunityEvent,
  CommunityEventRegistration as PrismaCommunityEventRegistration,
} from '@prisma/client';
import { EventEntity, EventStatus } from '../../domain/entities/event.entity.js';
import {
  EventRegistrationEntity,
  EventRegistrationStatus,
} from '../../domain/entities/event-registration.entity.js';
import { EventResponseDto } from '../../presentation/http/dto/event-response.dto.js';
import { EventRegistrationResponseDto } from '../../presentation/http/dto/event-registration-response.dto.js';

/**
 * Data Mapper Pur : Mappage entre modèles Prisma, Entités Domaine et DTOs HTTP
 * Conforme SOLID :
 * - SRP : Dédié uniquement à la transformation bidirectionnelle sans effet de bord.
 */
export class EventMapper {
  public static toDomain(raw: PrismaCommunityEvent): EventEntity {
    return EventEntity.create({
      id: raw.id,
      communityId: raw.communityId,
      organizerUserId: raw.organizerUserId,
      title: raw.title,
      description: raw.description,
      location: raw.location,
      startsAt: raw.startsAt,
      endsAt: raw.endsAt,
      maxAttendees: raw.maxAttendees,
      status: raw.status as EventStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toRegistrationDomain(
    raw: PrismaCommunityEventRegistration,
  ): EventRegistrationEntity {
    return EventRegistrationEntity.create({
      id: raw.id,
      eventId: raw.eventId,
      userId: raw.userId,
      status: raw.status as EventRegistrationStatus,
      registeredAt: raw.registeredAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toResponseDto(
    entity: EventEntity,
    attendeesCount: number = 0,
    userRegistrationStatus?: 'CONFIRMED' | 'WAITLIST' | 'CANCELLED' | null,
  ): EventResponseDto {
    return {
      id: entity.id,
      communityId: entity.communityId,
      organizerUserId: entity.organizerUserId,
      title: entity.title,
      description: entity.description,
      location: entity.location,
      startsAt: entity.startsAt.toISOString(),
      endsAt: entity.endsAt.toISOString(),
      maxAttendees: entity.maxAttendees,
      status: entity.status,
      attendeesCount,
      userRegistrationStatus: userRegistrationStatus ?? null,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  public static toRegistrationResponseDto(
    entity: EventRegistrationEntity,
  ): EventRegistrationResponseDto {
    return {
      id: entity.id,
      eventId: entity.eventId,
      userId: entity.userId,
      status: entity.status,
      registeredAt: entity.registeredAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
