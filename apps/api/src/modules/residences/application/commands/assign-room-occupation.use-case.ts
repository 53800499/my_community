import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  RoomOccupationEntity,
  type OccupationStatusValue,
} from '../../domain/entities/room-occupation.entity.js';
import { RoomOccupiedDomainEvent } from '../../domain/events/room-occupied.domain-event.js';
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
import type { AssignRoomOccupationCommand } from './assign-room-occupation.command.js';

export interface AssignRoomOccupationResult {
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
export class AssignRoomOccupationUseCase {
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
    command: AssignRoomOccupationCommand,
  ): Promise<AssignRoomOccupationResult> {
    const room = await this.reader.findRoomById(command.roomId);
    if (!room) {
      throw new NotFoundException(`La chambre avec l'ID ${command.roomId} est introuvable.`);
    }

    if (room.status === 'MAINTENANCE') {
      throw new ConflictException('Cette chambre est actuellement en maintenance.');
    }

    const activeOccupations = await this.reader.findActiveOccupationsByRoom(command.roomId);
    const isAtOrOverCapacity = activeOccupations.length >= room.capacity;

    if (isAtOrOverCapacity && !command.allowSurplus) {
      throw new ConflictException(
        `La chambre a déjà atteint sa capacité maximale de ${room.capacity} occupant(s).`,
      );
    }

    const existingUserOccupation = await this.reader.findActiveOccupationByUser(
      command.occupantUserId,
    );
    if (existingUserOccupation) {
      throw new ConflictException(
        "Cet utilisateur dispose déjà d'un logement actif dans une résidence.",
      );
    }

    const occupation = RoomOccupationEntity.create({
      roomId: command.roomId,
      occupantUserId: command.occupantUserId,
      associationId: command.associationId,
      startDate: command.startDate,
      endDate: command.endDate,
    });

    await this.writer.saveOccupation(occupation);

    // Si la capacité maximale est atteinte suite à cette assignation, marquer la chambre comme occupée
    if (activeOccupations.length + 1 >= room.capacity) {
      room.markOccupied();
      await this.writer.saveRoom(room);
    }

    // Émettre l'événement de domaine découplé (intercepté par finance pour facturation integration fee)
    this.eventEmitter.emit(
      RoomOccupiedDomainEvent.EVENT_NAME,
      new RoomOccupiedDomainEvent(
        occupation.id,
        occupation.roomId,
        occupation.occupantUserId,
        occupation.associationId,
        occupation.startDate,
      ),
    );

    await this.auditLogger.log(
      AuditLogEntity.create({
        id: crypto.randomUUID(),
        actorId: command.requesterUserId,
        action: 'residence.room_occupation.assigned',
        resourceType: 'room_occupation',
        resourceId: occupation.id,
        payload: {
          roomId: occupation.roomId,
          occupantUserId: occupation.occupantUserId,
          associationId: occupation.associationId,
          startDate: occupation.startDate.toISOString(),
          isSurplus: isAtOrOverCapacity,
          surplusReason: command.surplusReason || (isAtOrOverCapacity ? 'Surplus solidaire admis en cas de besoin' : undefined),
          standardCapacity: room.capacity,
          occupantsCount: activeOccupations.length + 1,
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
