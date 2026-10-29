import { AuditLogEntity } from '../../domain/entities/audit-log.entity.js';

export interface AuditQueryParams {
  resourceType?: string;
  resourceId?: string;
  actorId?: string;
  limit?: number;
}

/**
 * Port Sortant Hexagonal : Consultation et Extraction des Logs d'Audit
 * Conforme ISP (Interface Segregation Principle) :
 * Port de lecture seule (Query-Only) pour les modules d'administration et de conformité.
 */
export abstract class AuditReaderPort {
  abstract findByResource(resourceType: string, resourceId: string): Promise<AuditLogEntity[]>;
  abstract query(params: AuditQueryParams): Promise<AuditLogEntity[]>;
}

export const AUDIT_READER_PORT = Symbol('AUDIT_READER_PORT');
