import { Module, Global } from '@nestjs/common';
import { DatabaseModule } from '../../platform/database/database.module.js';
import { AUDIT_LOGGER_PORT } from './application/ports/audit-logger.port.js';
import { AUDIT_READER_PORT } from './application/ports/audit-reader.port.js';
import { PrismaAuditRepository } from './infrastructure/persistence/prisma-audit.repository.js';
import { RecordAuditLogUseCase } from './application/commands/record-audit-log.use-case.js';
import { GetResourceAuditLogsQuery } from './application/queries/get-resource-audit-logs.query.js';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [
    PrismaAuditRepository,
    {
      provide: AUDIT_LOGGER_PORT,
      useExisting: PrismaAuditRepository,
    },
    {
      provide: AUDIT_READER_PORT,
      useExisting: PrismaAuditRepository,
    },
    RecordAuditLogUseCase,
    GetResourceAuditLogsQuery,
  ],
  exports: [
    AUDIT_LOGGER_PORT,
    AUDIT_READER_PORT,
    RecordAuditLogUseCase,
    GetResourceAuditLogsQuery,
  ],
})
export class AuditModule {}
