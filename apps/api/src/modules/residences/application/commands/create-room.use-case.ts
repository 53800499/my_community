import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { RoomEntity, type RoomStatusValue } from '../../domain/entities/room.entity.js';
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
import type { CreateRoomCommand } from './create-room.command.js';

export interface CreateRoomResult {
  id: string;
  buildingId: string;
  roomNumber: string;
  capacity: number;
  status: RoomStatusValue;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class CreateRoomUseCase {
  constructor(
    @Inject(RESIDENCE_READER_PORT)
    private readonly reader: ResidenceReaderPort,
    @Inject(RESIDENCE_WRITER_PORT)
    private readonly writer: ResidenceWriterPort,
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger: AuditLoggerPort,
  ) {}

  public async execute(command: CreateRoomCommand): Promise<CreateRoomResult> {
    const building = await this.reader.findBuildingById(command.buildingId);
    if (!building) {
      throw new NotFoundException(`Le bâtiment avec l'ID ${command.buildingId} est introuvable.`);
    }

    const existingRoom = await this.reader.findRoomByBuildingAndNumber(
      command.buildingId,
      command.roomNumber,
    );
    if (existingRoom) {
      throw new ConflictException(
        `Une chambre portant le numéro "${command.roomNumber}" existe déjà dans ce bâtiment.`,
      );
    }

    const room = RoomEntity.create({
      buildingId: command.buildingId,
      roomNumber: command.roomNumber,
      capacity: command.capacity,
    });

    await this.writer.saveRoom(room);

    await this.auditLogger.log(
      AuditLogEntity.create({
        id: crypto.randomUUID(),
        actorId: command.requesterUserId,
        action: 'residence.room.created',
        resourceType: 'room',
        resourceId: room.id,
        payload: {
          buildingId: room.buildingId,
          roomNumber: room.roomNumber,
          capacity: room.capacity,
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
