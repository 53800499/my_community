import { describe, it, expect, beforeEach } from 'vitest';
import { AuditLogEntity } from '../../src/modules/audit/domain/entities/audit-log.entity.js';
import { AuditLoggerPort } from '../../src/modules/audit/application/ports/audit-logger.port.js';
import { AuditReaderPort, AuditQueryParams } from '../../src/modules/audit/application/ports/audit-reader.port.js';
import { RecordAuditLogUseCase } from '../../src/modules/audit/application/commands/record-audit-log.use-case.js';
import { GetResourceAuditLogsQuery } from '../../src/modules/audit/application/queries/get-resource-audit-logs.query.js';

class InMemoryAuditRepository implements AuditLoggerPort, AuditReaderPort {
  private readonly items: AuditLogEntity[] = [];

  async log(entry: AuditLogEntity): Promise<void> {
    this.items.push(entry);
  }

  async findByResource(resourceType: string, resourceId: string): Promise<AuditLogEntity[]> {
    return this.items.filter(
      (item) => item.resourceType === resourceType && item.resourceId === resourceId,
    );
  }

  async query(params: AuditQueryParams): Promise<AuditLogEntity[]> {
    return this.items.filter((item) => {
      if (params.resourceType && item.resourceType !== params.resourceType) return false;
      if (params.resourceId && item.resourceId !== params.resourceId) return false;
      if (params.actorId && item.actorId !== params.actorId) return false;
      return true;
    });
  }
}

describe('Module Audit — Conformité Hexagonale & SOLID', () => {
  let repository: InMemoryAuditRepository;
  let recordUseCase: RecordAuditLogUseCase;
  let getQuery: GetResourceAuditLogsQuery;

  beforeEach(() => {
    repository = new InMemoryAuditRepository();
    recordUseCase = new RecordAuditLogUseCase(repository);
    getQuery = new GetResourceAuditLogsQuery(repository);
  });

  it('[SRP] Entité AuditLog : Valide les invariants obligatoires (action, ressource)', () => {
    expect(() =>
      AuditLogEntity.create({
        id: 'a1',
        action: '',
        resourceType: 'COMMUNITY',
        resourceId: 'c1',
        createdAt: new Date(),
      }),
    ).toThrow("L'action auditée ne peut pas être vide.");

    expect(() =>
      AuditLogEntity.create({
        id: 'a1',
        action: 'CREATE',
        resourceType: '',
        resourceId: 'c1',
        createdAt: new Date(),
      }),
    ).toThrow('Le type de ressource est obligatoire pour la traçabilité.');

    expect(() =>
      AuditLogEntity.create({
        id: 'a1',
        action: 'CREATE',
        resourceType: 'COMMUNITY',
        resourceId: '',
        createdAt: new Date(),
      }),
    ).toThrow("L'identifiant de la ressource auditée est obligatoire.");
  });

  it('[LSP & DIP] RecordAuditLogUseCase : Enregistre une trace immuable via le port abstrait', async () => {
    const log = await recordUseCase.execute({
      actorId: 'admin-1',
      action: 'community_approved',
      resourceType: 'COMMUNITY',
      resourceId: 'c-cotonou',
      payload: { name: 'Cotonou Littoral' },
    });

    expect(log.id).toBeDefined();
    expect(log.action).toBe('COMMUNITY_APPROVED'); // Normalisation en majuscules

    const stored = await repository.findByResource('COMMUNITY', 'c-cotonou');
    expect(stored.length).toBe(1);
    expect(stored[0]?.actorId).toBe('admin-1');
  });

  it('[ISP] GetResourceAuditLogsQuery : Interroge les logs d\'audit sans dépendance d\'écriture', async () => {
    await recordUseCase.execute({
      actorId: 'admin-1',
      action: 'COMMUNITY_PROPOSED',
      resourceType: 'COMMUNITY',
      resourceId: 'c-porto-novo',
    });
    await recordUseCase.execute({
      actorId: 'admin-2',
      action: 'COMMUNITY_APPROVED',
      resourceType: 'COMMUNITY',
      resourceId: 'c-porto-novo',
    });

    const logs = await getQuery.execute({
      resourceType: 'COMMUNITY',
      resourceId: 'c-porto-novo',
    });

    expect(logs.length).toBe(2);
    expect(logs[0]?.action).toBe('COMMUNITY_PROPOSED');
    expect(logs[1]?.action).toBe('COMMUNITY_APPROVED');
  });
});
