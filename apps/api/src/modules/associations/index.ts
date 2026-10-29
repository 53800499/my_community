/**
 * Façade Publique Stricte du Module Associations (Niveau 3)
 */

// Module
export { AssociationsModule } from './associations.module.js';

// Domaine
export { AssociationEntity } from './domain/entities/association.entity.js';
export type { AssociationProps } from './domain/entities/association.entity.js';

export { AssociationMemberEntity } from './domain/entities/association-member.entity.js';
export type {
  AssociationMemberProps,
  AssociationRole,
} from './domain/entities/association-member.entity.js';

export { AssociationCommunityLinkEntity } from './domain/entities/association-community-link.entity.js';
export type { AssociationCommunityLinkProps } from './domain/entities/association-community-link.entity.js';

// Ports
export {
  AssociationReaderPort,
  ASSOCIATION_READER_PORT,
} from './application/ports/association-reader.port.js';
export {
  AssociationWriterPort,
  ASSOCIATION_WRITER_PORT,
} from './application/ports/association-writer.port.js';
export {
  AssociationPositionReaderPort,
  ASSOCIATION_POSITION_READER_PORT,
} from './application/ports/association-position-reader.port.js';
export {
  AssociationPositionWriterPort,
  ASSOCIATION_POSITION_WRITER_PORT,
} from './application/ports/association-position-writer.port.js';

// Postes & Organigramme
export { AssociationPositionEntity } from './domain/entities/association-position.entity.js';
export type {
  AssociationPositionProps,
  PositionStatus,
} from './domain/entities/association-position.entity.js';
export { CreateAssociationPositionUseCase } from './application/commands/create-association-position.use-case.js';
export { AssignAssociationPositionUseCase } from './application/commands/assign-association-position.use-case.js';
export { VacateAssociationPositionUseCase } from './application/commands/vacate-association-position.use-case.js';
export { UpdatePositionPermissionsUseCase } from './application/commands/update-position-permissions.use-case.js';
export type { UpdatePositionPermissionsCommand } from './application/commands/update-position-permissions.command.js';
export { ListAssociationPositionsQuery } from './application/queries/list-association-positions.query.js';
export { CreateAssociationPositionDto } from './presentation/http/dto/create-association-position.dto.js';
export { AssignAssociationPositionDto } from './presentation/http/dto/assign-association-position.dto.js';
export { UpdatePositionPermissionsDto } from './presentation/http/dto/update-position-permissions.dto.js';
export { AssociationPositionResponseDto } from './presentation/http/dto/association-position-response.dto.js';
export { AssociationPositionMapper } from './infrastructure/mappers/association-position.mapper.js';

// Cas d'Usage
export { RegisterAssociationUseCase } from './application/commands/register-association.use-case.js';
export type { RegisterAssociationResult } from './application/commands/register-association.use-case.js';
export type { RegisterAssociationCommand } from './application/commands/register-association.command.js';

export { LinkCommunityUseCase } from './application/commands/link-community.use-case.js';
export type { LinkCommunityCommand } from './application/commands/link-community.command.js';

export { ManageAssociationMemberUseCase } from './application/commands/manage-association-member.use-case.js';
export type { ManageAssociationMemberCommand } from './application/commands/manage-association-member.command.js';

// Requêtes
export { ListAssociationsQuery } from './application/queries/list-associations.query.js';
export { GetAssociationQuery } from './application/queries/get-association.query.js';
export type { GetAssociationResult } from './application/queries/get-association.query.js';

// DTOs & Mappers
export { AssociationResponseDto } from './presentation/http/dto/association-response.dto.js';
export { AssociationMemberResponseDto } from './presentation/http/dto/association-member-response.dto.js';
export { RegisterAssociationDto } from './presentation/http/dto/register-association.dto.js';
export { ManageAssociationMemberDto } from './presentation/http/dto/manage-association-member.dto.js';
export { AssociationMapper } from './infrastructure/mappers/association.mapper.js';
