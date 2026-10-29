import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import type { UpdateQuarterCommand } from './update-quarter.command.js';

export interface UpdateQuarterResult {
  id: string;
  associationId: string;
  name: string;
  city: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UpdateQuarterUseCase {
  constructor(
    @Inject(RESIDENCE_READER_PORT)
    private readonly reader: ResidenceReaderPort,
    @Inject(RESIDENCE_WRITER_PORT)
    private readonly writer: ResidenceWriterPort,
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger: AuditLoggerPort,
  ) {}

  public async execute(command: UpdateQuarterCommand): Promise<UpdateQuarterResult> {
    const quarter = await this.reader.findQuarterById(command.quarterId);
    if (!quarter) {
      throw new NotFoundException(`Le quartier avec l'ID ${command.quarterId} est introuvable.`);
    }

    quarter.updateDetails({
      name: command.name,
      city: command.city,
      description: command.description,
    });

    await this.writer.saveQuarter(quarter);

    await this.auditLogger.log(
      AuditLogEntity.create({
        id: crypto.randomUUID(),
        actorId: command.requesterUserId,
        action: 'RESIDENCE.QUARTER.UPDATED',
        resourceType: 'quarter',
        resourceId: quarter.id,
        payload: {
          associationId: quarter.associationId,
          name: quarter.name,
          city: quarter.city,
        },
        createdAt: new Date(),
      }),
    );

    return {
      id: quarter.id,
      associationId: quarter.associationId,
      name: quarter.name,
      city: quarter.city,
      description: quarter.description,
      createdAt: quarter.createdAt,
      updatedAt: quarter.updatedAt,
    };
  }
}
