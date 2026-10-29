import { AuditLogEntity } from '../../domain/entities/audit-log.entity.js';

export interface RecordAuditParams {
  actorId?: string | null;
  action: string;
  resourceType: string;
  resourceId: string;
  payload?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Port Sortant Hexagonal : Écriture Immuable dans le Journal d'Audit
 * Conforme ISP (Interface Segregation Principle) :
 * Port d'écriture seule (Insert-Only / Append-Only) consommé par les cas d'usage transversaux.
 */
export abstract class AuditLoggerPort {
  abstract log(entry: AuditLogEntity): Promise<void>;
}

export const AUDIT_LOGGER_PORT = Symbol('AUDIT_LOGGER_PORT');
