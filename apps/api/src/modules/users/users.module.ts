import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../platform/database/database.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { IdentityModule } from '../identity/identity.module.js';
import { USER_READER_PORT } from './application/ports/user-reader.port.js';
import { USER_WRITER_PORT } from './application/ports/user-writer.port.js';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository.js';
import { UpdateProfileUseCase } from './application/commands/update-profile.use-case.js';
import { GetUserProfileQuery } from './application/queries/get-user-profile.query.js';
import { UsersController } from './presentation/http/controllers/users.controller.js';

@Module({
  imports: [DatabaseModule, AuditModule, IdentityModule],
  controllers: [UsersController],
  providers: [
    PrismaUserRepository,
    {
      provide: USER_READER_PORT,
      useExisting: PrismaUserRepository,
    },
    {
      provide: USER_WRITER_PORT,
      useExisting: PrismaUserRepository,
    },
    UpdateProfileUseCase,
    GetUserProfileQuery,
  ],
  exports: [USER_READER_PORT, USER_WRITER_PORT, GetUserProfileQuery],
})
export class UsersModule {}
