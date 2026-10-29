import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../platform/database/database.module.js';
import { CommunitiesModule } from '../communities/communities.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { AssociationsController } from './presentation/http/controllers/associations.controller.js';
import { RegisterAssociationUseCase } from './application/commands/register-association.use-case.js';
import { LinkCommunityUseCase } from './application/commands/link-community.use-case.js';
import { ManageAssociationMemberUseCase } from './application/commands/manage-association-member.use-case.js';
import { CreateAssociationPositionUseCase } from './application/commands/create-association-position.use-case.js';
import { AssignAssociationPositionUseCase } from './application/commands/assign-association-position.use-case.js';
import { VacateAssociationPositionUseCase } from './application/commands/vacate-association-position.use-case.js';
import { UpdatePositionPermissionsUseCase } from './application/commands/update-position-permissions.use-case.js';
import { ExecuteServiceHandoverUseCase } from './application/commands/execute-service-handover.use-case.js';
import { CreateAssociationMandateUseCase } from './application/commands/create-association-mandate.use-case.js';
import { UpdateAssociationMandateUseCase } from './application/commands/update-association-mandate.use-case.js';
import { ActivateAssociationMandateUseCase } from './application/commands/activate-association-mandate.use-case.js';
import { UpdateMemberProfessionalInfoUseCase } from './application/commands/update-member-professional-info.use-case.js';
import { ListAssociationsQuery } from './application/queries/list-associations.query.js';
import { GetAssociationQuery } from './application/queries/get-association.query.js';
import { ListAssociationPositionsQuery } from './application/queries/list-association-positions.query.js';
import { ListAssociationMandatesQuery } from './application/queries/list-association-mandates.query.js';
import { GetMandateReportQuery } from './application/queries/get-mandate-report.query.js';
import { ASSOCIATION_READER_PORT } from './application/ports/association-reader.port.js';
import { ASSOCIATION_WRITER_PORT } from './application/ports/association-writer.port.js';
import { ASSOCIATION_POSITION_READER_PORT } from './application/ports/association-position-reader.port.js';
import { ASSOCIATION_POSITION_WRITER_PORT } from './application/ports/association-position-writer.port.js';
import {
  ASSOCIATION_MANDATE_READER_PORT,
} from './application/ports/association-mandate-reader.port.js';
import {
  ASSOCIATION_MANDATE_WRITER_PORT,
} from './application/ports/association-mandate-writer.port.js';
import { PrismaAssociationRepository } from './infrastructure/persistence/prisma-association.repository.js';
import { PrismaAssociationPositionRepository } from './infrastructure/persistence/prisma-association-position.repository.js';
import { PrismaAssociationMandateRepository } from './infrastructure/persistence/prisma-association-mandate.repository.js';

/**
 * Module Métier : Associations & Multi-Rattachements N-N (Niveau 3)
 */
@Module({
  imports: [DatabaseModule, CommunitiesModule, AuditModule],
  controllers: [AssociationsController],
  providers: [
    PrismaAssociationRepository,
    PrismaAssociationPositionRepository,
    PrismaAssociationMandateRepository,
    {
      provide: ASSOCIATION_READER_PORT,
      useExisting: PrismaAssociationRepository,
    },
    {
      provide: ASSOCIATION_WRITER_PORT,
      useExisting: PrismaAssociationRepository,
    },
    {
      provide: ASSOCIATION_POSITION_READER_PORT,
      useExisting: PrismaAssociationPositionRepository,
    },
    {
      provide: ASSOCIATION_POSITION_WRITER_PORT,
      useExisting: PrismaAssociationPositionRepository,
    },
    {
      provide: ASSOCIATION_MANDATE_READER_PORT,
      useExisting: PrismaAssociationMandateRepository,
    },
    {
      provide: ASSOCIATION_MANDATE_WRITER_PORT,
      useExisting: PrismaAssociationMandateRepository,
    },
    RegisterAssociationUseCase,
    LinkCommunityUseCase,
    ManageAssociationMemberUseCase,
    CreateAssociationPositionUseCase,
    AssignAssociationPositionUseCase,
    VacateAssociationPositionUseCase,
    UpdatePositionPermissionsUseCase,
    ExecuteServiceHandoverUseCase,
    CreateAssociationMandateUseCase,
    UpdateAssociationMandateUseCase,
    ActivateAssociationMandateUseCase,
    UpdateMemberProfessionalInfoUseCase,
    ListAssociationsQuery,
    GetAssociationQuery,
    ListAssociationPositionsQuery,
    ListAssociationMandatesQuery,
    GetMandateReportQuery,
  ],
  exports: [
    ASSOCIATION_READER_PORT,
    ASSOCIATION_WRITER_PORT,
    ASSOCIATION_POSITION_READER_PORT,
    ASSOCIATION_POSITION_WRITER_PORT,
    ASSOCIATION_MANDATE_READER_PORT,
    ASSOCIATION_MANDATE_WRITER_PORT,
    RegisterAssociationUseCase,
    LinkCommunityUseCase,
    ManageAssociationMemberUseCase,
    CreateAssociationPositionUseCase,
    AssignAssociationPositionUseCase,
    VacateAssociationPositionUseCase,
    UpdatePositionPermissionsUseCase,
    ExecuteServiceHandoverUseCase,
    CreateAssociationMandateUseCase,
    UpdateAssociationMandateUseCase,
    ActivateAssociationMandateUseCase,
    UpdateMemberProfessionalInfoUseCase,
    ListAssociationsQuery,
    GetAssociationQuery,
    ListAssociationPositionsQuery,
    ListAssociationMandatesQuery,
    GetMandateReportQuery,
  ],
})
export class AssociationsModule {}
