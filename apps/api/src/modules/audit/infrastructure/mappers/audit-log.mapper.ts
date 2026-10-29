import { AuditLog as PrismaAuditLog, Prisma } from '@prisma/client';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity.js';

export interface AuditLogResponseDto {
  id: string;
  actorId: string | null;
  action: string;
  resourceType: string;
  resourceId: string;
  payload: Record<string, unknown> | null;
  createdAt: string;
}

/**
 * Data Mapper Pattern : AuditLog (Pragmatique & Découplé)
 * Traduction pure sans framework lourd entre modèle Prisma, Entité Domaine et DTO.
 */
export class AuditLogMapper {
  public static toDomain(record: PrismaAuditLog): AuditLogEntity {
    return AuditLogEntity.create({
      id: record.id,
      actorId: record.actorId,
      action: record.action,
      resourceType: record.resourceType,
      resourceId: record.resourceId,
      payload: (record.payload as Record<string, unknown>) ?? null,
      ipAddress: record.ipAddress,
      userAgent: record.userAgent,
      createdAt: record.createdAt,
    });
  }

  public static toPrismaCreateInput(entity: AuditLogEntity): Prisma.AuditLogCreateInput {
    return {
      id: entity.id,
      actorId: entity.actorId ?? null,
      action: entity.action,
      resourceType: entity.resourceType,
      resourceId: entity.resourceId,
      payload: (entity.payload as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      ipAddress: entity.ipAddress ?? null,
      userAgent: entity.userAgent ?? null,
      createdAt: entity.createdAt,
    };
  }

  public static toResponseDto(entity: AuditLogEntity): AuditLogResponseDto {
    return {
      id: entity.id,
      actorId: entity.actorId ?? null,
      action: entity.action,
      resourceType: entity.resourceType,
      resourceId: entity.resourceId,
      payload: entity.payload ?? null,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
