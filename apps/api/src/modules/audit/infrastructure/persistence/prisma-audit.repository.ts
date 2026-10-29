import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/database/prisma.service.js';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity.js';
import { AuditLoggerPort } from '../../application/ports/audit-logger.port.js';
import { AuditReaderPort, AuditQueryParams } from '../../application/ports/audit-reader.port.js';
import { AuditLogMapper } from '../mappers/audit-log.mapper.js';

/**
 * Adaptateur de Persistance Prisma pour le Journal d'Audit
 * Conforme LSP & DIP : Implémente fidèlement AuditLoggerPort et AuditReaderPort.
 */
@Injectable()
export class PrismaAuditRepository implements AuditLoggerPort, AuditReaderPort {
  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditLogEntity): Promise<void> {
    const data = AuditLogMapper.toPrismaCreateInput(entry);
    await this.prisma.auditLog.create({ data });
  }

  async findByResource(resourceType: string, resourceId: string): Promise<AuditLogEntity[]> {
    const records = await this.prisma.auditLog.findMany({
      where: { resourceType, resourceId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(AuditLogMapper.toDomain);
  }

  async query(params: AuditQueryParams): Promise<AuditLogEntity[]> {
    const records = await this.prisma.auditLog.findMany({
      where: {
        ...(params.resourceType ? { resourceType: params.resourceType } : {}),
        ...(params.resourceId ? { resourceId: params.resourceId } : {}),
        ...(params.actorId ? { actorId: params.actorId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: params.limit ?? 50,
    });
    return records.map(AuditLogMapper.toDomain);
  }
}
