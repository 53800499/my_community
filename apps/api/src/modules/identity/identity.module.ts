import { Module, Global } from '@nestjs/common';
import { DatabaseModule } from '../../platform/database/database.module.js';
import { PlatformConfigModule } from '../../platform/config/config.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { IDENTITY_READER_PORT } from './application/ports/identity-reader.port.js';
import { IDENTITY_WRITER_PORT } from './application/ports/identity-writer.port.js';
import { PASSWORD_HASHER_PORT } from './application/ports/password-hasher.port.js';
import { TOKEN_SERVICE_PORT } from './application/ports/token-service.port.js';
import { PrismaIdentityRepository } from './infrastructure/persistence/prisma-identity.repository.js';
import { CryptoPasswordHasherAdapter } from './infrastructure/adapters/crypto-password-hasher.adapter.js';
import { CryptoTokenServiceAdapter } from './infrastructure/adapters/crypto-token-service.adapter.js';
import { RegisterUseCase } from './application/commands/register.use-case.js';
import { LoginUseCase } from './application/commands/login.use-case.js';
import { ValidateSessionQuery } from './application/queries/validate-session.query.js';
import { AuthController } from './presentation/http/controllers/auth.controller.js';
import { JwtAuthGuard } from './presentation/http/guards/jwt-auth.guard.js';
import { PlatformAdminGuard } from './presentation/http/guards/platform-admin.guard.js';

@Global()
@Module({
  imports: [DatabaseModule, PlatformConfigModule, AuditModule],
  controllers: [AuthController],
  providers: [
    PrismaIdentityRepository,
    {
      provide: IDENTITY_READER_PORT,
      useExisting: PrismaIdentityRepository,
    },
    {
      provide: IDENTITY_WRITER_PORT,
      useExisting: PrismaIdentityRepository,
    },
    CryptoPasswordHasherAdapter,
    {
      provide: PASSWORD_HASHER_PORT,
      useExisting: CryptoPasswordHasherAdapter,
    },
    CryptoTokenServiceAdapter,
    {
      provide: TOKEN_SERVICE_PORT,
      useExisting: CryptoTokenServiceAdapter,
    },
    RegisterUseCase,
    LoginUseCase,
    ValidateSessionQuery,
    JwtAuthGuard,
    PlatformAdminGuard,
  ],
  exports: [
    IDENTITY_READER_PORT,
    IDENTITY_WRITER_PORT,
    TOKEN_SERVICE_PORT,
    ValidateSessionQuery,
    JwtAuthGuard,
    PlatformAdminGuard,
  ],
})
export class IdentityModule {}
