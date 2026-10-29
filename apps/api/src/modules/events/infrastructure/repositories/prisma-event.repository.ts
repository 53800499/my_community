import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/database/prisma.service.js';
import { EventEntity, EventStatus } from '../../domain/entities/event.entity.js';
import { EventRegistrationEntity } from '../../domain/entities/event-registration.entity.js';
import { EventReaderPort } from '../../application/ports/event-reader.port.js';
import { EventWriterPort } from '../../application/ports/event-writer.port.js';
import { EventMapper } from '../mappers/event.mapper.js';

/**
 * Adaptateur de Persistance Prisma : Événements Communautaires
 * Conforme SOLID :
 * - LSP : Implémente rigoureusement EventReaderPort & EventWriterPort.
 * - DIP : Les cas d'usage dépendent des ports, Prisma est un détail d'infrastructure.
 */
@Injectable()
export class PrismaEventRepository implements EventReaderPort, EventWriterPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<EventEntity | null> {
    const raw = await this.prisma.communityEvent.findUnique({
      where: { id },
    });
    return raw ? EventMapper.toDomain(raw) : null;
  }

  async listByCommunity(communityId: string, status?: EventStatus): Promise<EventEntity[]> {
    const rows = await this.prisma.communityEvent.findMany({
      where: {
        communityId,
        ...(status ? { status } : {}),
      },
      orderBy: { startsAt: 'asc' },
    });
    return rows.map((r) => EventMapper.toDomain(r));
  }

  async findRegistration(eventId: string, userId: string): Promise<EventRegistrationEntity | null> {
    const raw = await this.prisma.communityEventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });
    return raw ? EventMapper.toRegistrationDomain(raw) : null;
  }

  async listEventRegistrations(eventId: string): Promise<EventRegistrationEntity[]> {
    const rows = await this.prisma.communityEventRegistration.findMany({
      where: { eventId },
      orderBy: { registeredAt: 'asc' },
    });
    return rows.map((r) => EventMapper.toRegistrationDomain(r));
  }

  async countAttendees(eventId: string): Promise<number> {
    return this.prisma.communityEventRegistration.count({
      where: {
        eventId,
        status: 'CONFIRMED',
      },
    });
  }

  async save(event: EventEntity): Promise<void> {
    await this.prisma.communityEvent.create({
      data: {
        id: event.id,
        communityId: event.communityId,
        organizerUserId: event.organizerUserId,
        title: event.title,
        description: event.description,
        location: event.location,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        maxAttendees: event.maxAttendees,
        status: event.status,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      },
    });
  }

  async update(event: EventEntity): Promise<void> {
    await this.prisma.communityEvent.update({
      where: { id: event.id },
      data: {
        status: event.status,
        updatedAt: event.updatedAt,
      },
    });
  }

  async saveRegistration(registration: EventRegistrationEntity): Promise<void> {
    await this.prisma.communityEventRegistration.create({
      data: {
        id: registration.id,
        eventId: registration.eventId,
        userId: registration.userId,
        status: registration.status,
        registeredAt: registration.registeredAt,
        updatedAt: registration.updatedAt,
      },
    });
  }

  async updateRegistration(registration: EventRegistrationEntity): Promise<void> {
    await this.prisma.communityEventRegistration.update({
      where: { id: registration.id },
      data: {
        status: registration.status,
        updatedAt: registration.updatedAt,
      },
    });
  }
}
