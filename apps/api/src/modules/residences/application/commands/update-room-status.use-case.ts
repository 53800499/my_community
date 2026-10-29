import {
  Inject,
  Injectable,
  NotFoundException,
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
import type { UpdateRoomStatusCommand } from './update-room-status.command.js';

export interface UpdateRoomStatusResult {
  id: string;
  buildingId: string;
  roomNumber: string;
  capacity: number;
  status: RoomStatusValue;
  updatedAt: Date;
}

@Injectable()
export class UpdateRoomStatusUseCase {
  constructor(
    @Inject(RESIDENCE_READER_PORT)
    private readonly reader: ResidenceReaderPort,
    @Inject(RESIDENCE_WRITER_PORT)
    private readonly writer: ResidenceWriterPort,
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger: AuditLoggerPort,
  ) {}

  public async execute(command: UpdateRoomStatusCommand): Promise<UpdateRoomStatusResult> {
    const room = await this.reader.findRoomById(command.roomId);
    if (!room) {
      throw new NotFoundException(`La chambre avec l'ID ${command.roomId} est introuvable.`);
    }

    const activeOccupations = await this.reader.findActiveOccupationsByRoom(room.id);

    if (command.status === 'MAINTENANCE' && activeOccupations.length > 0) {
      throw new BadRequestException(
        `Impossible de passer la chambre en maintenance car elle est actuellement occupée par ${activeOccupations.length} résident(s).`,
      );
    }

    if (command.status === 'MAINTENANCE') {
      room.markMaintenance();
    } else if (command.status === 'AVAILABLE') {
      if (activeOccupations.length > 0) {
        throw new BadRequestException(
          `Impossible de rendre la chambre disponible car elle a des occupations actives.`,
        );
      }
      room.markAvailable();
    } else if (command.status === 'OCCUPIED') {
      room.markOccupied();
    }

    await this.writer.saveRoom(room);

    await this.auditLogger.log(
      AuditLogEntity.create({
        id: crypto.randomUUID(),
        actorId: command.requesterUserId,
        action: 'RESIDENCE.ROOM.STATUS_CHANGED',
        resourceType: 'room',
        resourceId: room.id,
        payload: {
          buildingId: room.buildingId,
          roomNumber: room.roomNumber,
          newStatus: room.status,
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
      updatedAt: room.updatedAt,
    };
  }
}
