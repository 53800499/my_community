import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity.js';
import {
  AuditLoggerPort,
  AUDIT_LOGGER_PORT,
  RecordAuditParams,
} from '../ports/audit-logger.port.js';

/**
 * Cas d'Utilisation Applicatif : Enregistrement d'une trace d'audit
 * Conforme SOLID :
 * - SRP : Dédié uniquement à la création et persistance d'une trace d'audit immuable.
 * - ISP : Dépend exclusivement de AuditLoggerPort.
 * - DIP : Dépend de l'abstraction de port injectée par token.
 */
@Injectable()
export class RecordAuditLogUseCase {
  constructor(
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger: AuditLoggerPort,
  ) {}

  async execute(params: RecordAuditParams): Promise<AuditLogEntity> {
    const entry = AuditLogEntity.create({
      id: randomUUID(),
      actorId: params.actorId ?? null,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      payload: params.payload ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      createdAt: new Date(),
    });

    await this.auditLogger.log(entry);
    return entry;
  }
}
