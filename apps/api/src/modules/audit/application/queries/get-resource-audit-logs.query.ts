import { Injectable, Inject } from '@nestjs/common';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity.js';
import {
  AuditReaderPort,
  AUDIT_READER_PORT,
} from '../ports/audit-reader.port.js';

export interface GetResourceAuditLogsInput {
  resourceType: string;
  resourceId: string;
}

/**
 * Cas d'Utilisation de Lecture (Query) : Consultation de l'historique d'audit d'une ressource
 * Conforme SOLID :
 * - SRP : Dédié exclusivement à l'extraction de l'audit pour une ressource.
 * - ISP : Dépend STRICTEMENT de AuditReaderPort.
 */
@Injectable()
export class GetResourceAuditLogsQuery {
  constructor(
    @Inject(AUDIT_READER_PORT)
    private readonly auditReader: AuditReaderPort,
  ) {}

  async execute(input: GetResourceAuditLogsInput): Promise<AuditLogEntity[]> {
    return this.auditReader.findByResource(input.resourceType, input.resourceId);
  }
}
