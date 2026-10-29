import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
import type { DeleteRoomCommand } from './delete-room.command.js';

@Injectable()
export class DeleteRoomUseCase {
  constructor(
    @Inject(RESIDENCE_READER_PORT)
    private readonly reader: ResidenceReaderPort,
    @Inject(RESIDENCE_WRITER_PORT)
    private readonly writer: ResidenceWriterPort,
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger: AuditLoggerPort,
  ) {}

  public async execute(command: DeleteRoomCommand): Promise<void> {
    const room = await this.reader.findRoomById(command.roomId);
    if (!room) {
      throw new NotFoundException(`La chambre avec l'ID ${command.roomId} est introuvable.`);
    }

    const activeOccupations = await this.reader.findActiveOccupationsByRoom(room.id);
    if (activeOccupations.length > 0) {
      throw new BadRequestException(
        `Impossible de supprimer la chambre ${room.roomNumber} car elle compte ${activeOccupations.length} bail/occupation(s) actif(s). Veuillez d'abord résilier le bail.`,
      );
    }

    await this.writer.deleteRoom(room.id);

    await this.auditLogger.log(
      AuditLogEntity.create({
        id: crypto.randomUUID(),
        actorId: command.requesterUserId,
        action: 'RESIDENCE.ROOM.DELETED',
        resourceType: 'room',
        resourceId: room.id,
        payload: {
          buildingId: room.buildingId,
          roomNumber: room.roomNumber,
        },
        createdAt: new Date(),
      }),
    );
  }
}
