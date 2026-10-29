import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../platform/database/database.module.js';
import { CommunitiesModule } from '../communities/communities.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { MembershipsController } from './presentation/http/controllers/memberships.controller.js';
import { RequestMembershipUseCase } from './application/commands/request-membership.use-case.js';
import { DecideMembershipUseCase } from './application/commands/decide-membership.use-case.js';
import { AssignRoleUseCase } from './application/commands/assign-role.use-case.js';
import { ListCommunityMembersQuery } from './application/queries/list-community-members.query.js';
import { GetUserMembershipQuery } from './application/queries/get-user-membership.query.js';
import { MEMBERSHIP_READER_PORT } from './application/ports/membership-reader.port.js';
import { MEMBERSHIP_WRITER_PORT } from './application/ports/membership-writer.port.js';
import { PrismaMembershipRepository } from './infrastructure/persistence/prisma-membership.repository.js';

/**
 * Module Métier : Adhésions Communautaires & Rôles Contextuels (Niveau 2)
 */
@Module({
  imports: [DatabaseModule, CommunitiesModule, AuditModule, NotificationsModule],
  controllers: [MembershipsController],
  providers: [
    PrismaMembershipRepository,
    {
      provide: MEMBERSHIP_READER_PORT,
      useExisting: PrismaMembershipRepository,
    },
    {
      provide: MEMBERSHIP_WRITER_PORT,
      useExisting: PrismaMembershipRepository,
    },
    RequestMembershipUseCase,
    DecideMembershipUseCase,
    AssignRoleUseCase,
    ListCommunityMembersQuery,
    GetUserMembershipQuery,
  ],
  exports: [
    MEMBERSHIP_READER_PORT,
    MEMBERSHIP_WRITER_PORT,
    RequestMembershipUseCase,
    DecideMembershipUseCase,
    AssignRoleUseCase,
    ListCommunityMembersQuery,
    GetUserMembershipQuery,
  ],
})
export class MembershipsModule {}
