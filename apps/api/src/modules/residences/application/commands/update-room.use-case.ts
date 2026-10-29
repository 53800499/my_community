import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import type { RoomStatusValue } from '../../domain/entities/room.entity.js';
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
import type { UpdateRoomCommand } from './update-room.command.js';

export interface UpdateRoomResult {
  id: string;
  buildingId: string;
  roomNumber: string;
  capacity: number;
  status: RoomStatusValue;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UpdateRoomUseCase {
  constructor(
    @Inject(RESIDENCE_READER_PORT)
    private readonly reader: ResidenceReaderPort,
    @Inject(RESIDENCE_WRITER_PORT)
    private readonly writer: ResidenceWriterPort,
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger: AuditLoggerPort,
  ) {}

  public async execute(command: UpdateRoomCommand): Promise<UpdateRoomResult> {
    const room = await this.reader.findRoomById(command.roomId);
    if (!room) {
      throw new NotFoundException(`La chambre avec l'ID ${command.roomId} est introuvable.`);
    }

    // Check room number uniqueness if changed
    if (command.roomNumber && command.roomNumber.trim() !== room.roomNumber) {
      const existing = await this.reader.findRoomByBuildingAndNumber(
        room.buildingId,
        command.roomNumber.trim(),
      );
      if (existing && existing.id !== room.id) {
        throw new ConflictException(
          `Le numéro de chambre ${command.roomNumber} existe déjà dans ce bâtiment.`,
        );
      }
    }

    const activeOccupations = await this.reader.findActiveOccupationsByRoom(room.id);

    // If capacity is reduced, verify it doesn't violate active occupants count
    if (command.capacity !== undefined && command.capacity < activeOccupations.length) {
      throw new BadRequestException(
        `Impossible de réduire la capacité à ${command.capacity} car il y a actuellement ${activeOccupations.length} occupant(s) actif(s).`,
      );
    }

    // If status is changed to MAINTENANCE, verify no active occupants
    if (command.status === 'MAINTENANCE' && activeOccupations.length > 0) {
      throw new BadRequestException(
        `Impossible de passer la chambre en maintenance car elle est actuellement occupée par ${activeOccupations.length} résident(s).`,
      );
    }

    room.updateDetails({
      roomNumber: command.roomNumber,
      capacity: command.capacity,
    });

    if (command.status) {
      if (command.status === 'MAINTENANCE') {
        room.markMaintenance();
      } else if (command.status === 'AVAILABLE' && activeOccupations.length === 0) {
        room.markAvailable();
      } else if (command.status === 'OCCUPIED' || activeOccupations.length > 0) {
        room.markOccupied();
      }
    }

    await this.writer.saveRoom(room);

    await this.auditLogger.log(
      AuditLogEntity.create({
        id: crypto.randomUUID(),
        actorId: command.requesterUserId,
        action: 'RESIDENCE.ROOM.UPDATED',
        resourceType: 'room',
        resourceId: room.id,
        payload: {
          buildingId: room.buildingId,
          roomNumber: room.roomNumber,
          capacity: room.capacity,
          status: room.status,
        },
        createdAt: new Date(),
      }),
    );

    return {
      id: room.id,
      buildingId: room.buildingId,
      roomNumber: room.roomNumber,
      capacity: room.capacity,
      status: room.status,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }
}
