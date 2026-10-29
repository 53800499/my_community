import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { OccupationStatusValue } from '../../domain/entities/room-occupation.entity.js';
import { RoomVacatedDomainEvent } from '../../domain/events/room-vacated.domain-event.js';
import {
  RESIDENCE_READER_PORT,
  type ResidenceReaderPort,
} from '../ports/residence-reader.port.js';
import {
  RESIDENCE_WRITER_PORT,
  type ResidenceWriterPort,
} from '../ports/residence-writer.port.js';
import {
  AUDIT_LOGGER_PORT,
  type AuditLoggerPort,
} from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';
import type { TerminateRoomOccupationCommand } from './terminate-room-occupation.command.js';

export interface TerminateRoomOccupationResult {
  id: string;
  roomId: string;
  occupantUserId: string;
  associationId: string;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  status: OccupationStatusValue;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TerminateRoomOccupationUseCase {
  constructor(
    @Inject(RESIDENCE_READER_PORT)
    private readonly reader: ResidenceReaderPort,
    @Inject(RESIDENCE_WRITER_PORT)
    private readonly writer: ResidenceWriterPort,
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger: AuditLoggerPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async execute(
    command: TerminateRoomOccupationCommand,
  ): Promise<TerminateRoomOccupationResult> {
    const occupation = await this.reader.findOccupationById(command.occupationId);
    if (!occupation) {
      throw new NotFoundException(
        `L'occupation de chambre avec l'ID ${command.occupationId} est introuvable.`,
      );
    }

    if (!occupation.isActive) {
      throw new ConflictException("Cette occupation de chambre est déjà clôturée ou résiliée.");
    }

    const terminationDate = command.endDate ?? new Date();
    occupation.terminate(terminationDate);

    await this.writer.saveOccupation(occupation);

    // Mettre à jour l'état de disponibilité de la chambre si elle était pleine
    const room = await this.reader.findRoomById(occupation.roomId);
    if (room && room.status === 'OCCUPIED') {
      const activeOccupations = await this.reader.findActiveOccupationsByRoom(occupation.roomId);
      const remainingActive = activeOccupations.filter((o) => o.id !== occupation.id);
      if (remainingActive.length < room.capacity) {
        room.markAvailable();
        await this.writer.saveRoom(room);
      }
    }

    // Émettre l'événement de domaine
    this.eventEmitter.emit(
      RoomVacatedDomainEvent.EVENT_NAME,
      new RoomVacatedDomainEvent(
        occupation.id,
        occupation.roomId,
        occupation.occupantUserId,
        occupation.associationId,
        occupation.endDate ?? terminationDate,
      ),
    );

    await this.auditLogger.log(
      AuditLogEntity.create({
        id: crypto.randomUUID(),
        actorId: command.requesterUserId,
        action: 'residence.room_occupation.terminated',
        resourceType: 'room_occupation',
        resourceId: occupation.id,
        payload: {
          roomId: occupation.roomId,
          occupantUserId: occupation.occupantUserId,
          endDate: occupation.endDate?.toISOString() ?? terminationDate.toISOString(),
        },
        createdAt: new Date(),
      }),
    );

    return {
      id: occupation.id,
      roomId: occupation.roomId,
      occupantUserId: occupation.occupantUserId,
      associationId: occupation.associationId,
      startDate: occupation.startDate,
      endDate: occupation.endDate,
      isActive: occupation.isActive,
      status: occupation.status,
      createdAt: occupation.createdAt,
      updatedAt: occupation.updatedAt,
    };
  }
}
