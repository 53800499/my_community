import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { QuarterEntity } from '../../domain/entities/quarter.entity.js';
import {
  RESIDENCE_WRITER_PORT,
  type ResidenceWriterPort,
} from '../ports/residence-writer.port.js';
import {
  AUDIT_LOGGER_PORT,
  type AuditLoggerPort,
} from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';
import type { CreateQuarterCommand } from './create-quarter.command.js';

export interface CreateQuarterResult {
  id: string;
  associationId: string;
  name: string;
  city: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class CreateQuarterUseCase {
  constructor(
    @Inject(RESIDENCE_WRITER_PORT)
    private readonly writer: ResidenceWriterPort,
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger: AuditLoggerPort,
  ) {}

  public async execute(command: CreateQuarterCommand): Promise<CreateQuarterResult> {
    if (!command.associationId) {
      throw new BadRequestException("L'association de rattachement est requise.");
    }

    const quarter = QuarterEntity.create({
      associationId: command.associationId,
      name: command.name,
      city: command.city,
      description: command.description,
    });

    await this.writer.saveQuarter(quarter);

    await this.auditLogger.log(
      AuditLogEntity.create({
        id: crypto.randomUUID(),
        actorId: command.requesterUserId,
        action: 'residence.quarter.created',
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
