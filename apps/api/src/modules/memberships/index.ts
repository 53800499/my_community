/**
 * Façade Publique Stricte du Module Adhésions (Niveau 2)
 */

// Module
export { MembershipsModule } from './memberships.module.js';

// Domaine
export { CommunityMembershipEntity } from './domain/entities/community-membership.entity.js';
export type {
  CommunityMembershipProps,
  MembershipStatus,
  CommunityRole,
} from './domain/entities/community-membership.entity.js';

// Ports
export {
  MembershipReaderPort,
  MEMBERSHIP_READER_PORT,
} from './application/ports/membership-reader.port.js';
export {
  MembershipWriterPort,
  MEMBERSHIP_WRITER_PORT,
} from './application/ports/membership-writer.port.js';

// Cas d'Usage
export { RequestMembershipUseCase } from './application/commands/request-membership.use-case.js';
export type { RequestMembershipCommand } from './application/commands/request-membership.command.js';

export { DecideMembershipUseCase } from './application/commands/decide-membership.use-case.js';
export type { DecideMembershipCommand } from './application/commands/decide-membership.command.js';

export { AssignRoleUseCase } from './application/commands/assign-role.use-case.js';
export type { AssignRoleCommand } from './application/commands/assign-role.command.js';

// Requêtes
export { ListCommunityMembersQuery } from './application/queries/list-community-members.query.js';
export type { ListCommunityMembersParams } from './application/queries/list-community-members.query.js';

export { GetUserMembershipQuery } from './application/queries/get-user-membership.query.js';
export type { GetUserMembershipParams } from './application/queries/get-user-membership.query.js';

// DTOs & Mappers
export { MembershipResponseDto } from './presentation/http/dto/membership-response.dto.js';
export { DecideMembershipDto } from './presentation/http/dto/decide-membership.dto.js';
export { AssignRoleDto } from './presentation/http/dto/assign-role.dto.js';
export { MembershipMapper } from './infrastructure/mappers/membership.mapper.js';
