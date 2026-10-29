import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
import type { DeleteQuarterCommand } from './delete-quarter.command.js';

@Injectable()
export class DeleteQuarterUseCase {
  constructor(
    @Inject(RESIDENCE_READER_PORT)
    private readonly reader: ResidenceReaderPort,
    @Inject(RESIDENCE_WRITER_PORT)
    private readonly writer: ResidenceWriterPort,
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger: AuditLoggerPort,
  ) {}

  public async execute(command: DeleteQuarterCommand): Promise<void> {
    const quarter = await this.reader.findQuarterById(command.quarterId);
    if (!quarter) {
      throw new NotFoundException(`Le quartier avec l'ID ${command.quarterId} est introuvable.`);
    }

    const buildingsCount = await this.reader.countBuildingsByQuarter(command.quarterId);
    if (buildingsCount > 0) {
      throw new BadRequestException(
        `Impossible de supprimer le quartier "${quarter.name}" car il contient encore ${buildingsCount} bâtiment(s).`,
      );
    }

    await this.writer.deleteQuarter(command.quarterId);

    await this.auditLogger.log(
      AuditLogEntity.create({
        id: crypto.randomUUID(),
        actorId: command.requesterUserId,
        action: 'RESIDENCE.QUARTER.DELETED',
        resourceType: 'quarter',
        resourceId: quarter.id,
        payload: {
          associationId: quarter.associationId,
          name: quarter.name,
        },
        createdAt: new Date(),
      }),
    );
  }
}
