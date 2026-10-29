import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../identity/presentation/http/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../../identity/presentation/http/decorators/current-user.decorator.js';
import { UserAccountEntity } from '../../../../identity/domain/entities/user-account.entity.js';
import { RequestMembershipUseCase } from '../../../application/commands/request-membership.use-case.js';
import { DecideMembershipUseCase } from '../../../application/commands/decide-membership.use-case.js';
import { AssignRoleUseCase } from '../../../application/commands/assign-role.use-case.js';
import { ListCommunityMembersQuery } from '../../../application/queries/list-community-members.query.js';
import { DecideMembershipDto } from '../dto/decide-membership.dto.js';
import { AssignRoleDto } from '../dto/assign-role.dto.js';
import { MembershipResponseDto } from '../dto/membership-response.dto.js';
import { MembershipMapper } from '../../../infrastructure/mappers/membership.mapper.js';
import type { MembershipStatus } from '../../../domain/entities/community-membership.entity.js';

/**
 * Contrôleur REST : Adhésions et Rôles Communautaires (MembershipsController)
 * Conforme SOLID :
 * - Contrôleur mince : validation DTO et délégation aux cas d'usage applicatifs.
 * - Contextual RBAC (doc: docs/security/roles-et-permissions-rbac.md).
 */
@ApiTags('Adhésions Communautaires')
@Controller('communities/:id/memberships')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MembershipsController {
  constructor(
    private readonly requestMembershipUseCase: RequestMembershipUseCase,
    private readonly decideMembershipUseCase: DecideMembershipUseCase,
    private readonly assignRoleUseCase: AssignRoleUseCase,
    private readonly listCommunityMembersQuery: ListCommunityMembersQuery,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Demander à rejoindre une communauté citoyenne',
    description: 'Crée une demande d’adhésion citoyenne en état PENDING pour l’utilisateur actuellement connecté.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant UUID de la communauté à rejoindre',
    format: 'uuid',
  })
  @ApiResponse({
    status: 201,
    description: 'Demande d’adhésion enregistrée avec succès.',
    type: MembershipResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Communauté introuvable.',
  })
  @ApiResponse({
    status: 409,
    description: 'L’utilisateur a déjà une adhésion active ou en attente.',
  })
  async requestMembership(
    @CurrentUser() currentUser: UserAccountEntity,
    @Param('id') communityId: string,
  ): Promise<MembershipResponseDto> {
    const membership = await this.requestMembershipUseCase.execute({
      communityId,
      userId: currentUser.id,
    });
    return MembershipMapper.toResponseDto(membership);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulter les membres d’une communauté',
    description: 'Renvoie la liste des membres affiliés à la communauté avec leurs rôles respectifs.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant UUID de la communauté',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'REVOKED'],
    description: 'Filtrer par statut d’adhésion',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des membres récupérée avec succès.',
    type: [MembershipResponseDto],
  })
  async listMembers(
    @Param('id') communityId: string,
    @Query('status') status?: MembershipStatus,
  ): Promise<MembershipResponseDto[]> {
    const members = await this.listCommunityMembersQuery.execute({
      communityId,
      status,
    });
    return members.map((m) => MembershipMapper.toResponseDto(m));
  }

  @Patch(':userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Décider de l’adhésion d’un citoyen (Gestionnaire local)',
    description: 'Permet à un MANAGER ou ADMIN local de la communauté d’approuver (ACTIVE), suspendre ou révoquer une adhésion.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant UUID de la communauté',
    format: 'uuid',
  })
  @ApiParam({
    name: 'userId',
    description: 'Identifiant UUID du citoyen concerné',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Statut de l’adhésion mis à jour avec succès.',
    type: MembershipResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé : l’opérateur n’a pas les privilèges MANAGER/ADMIN sur cette communauté.',
  })
  @ApiResponse({
    status: 404,
    description: 'Adhésion introuvable.',
  })
  async decideMembership(
    @CurrentUser() currentUser: UserAccountEntity,
    @Param('id') communityId: string,
    @Param('userId') targetUserId: string,
    @Body() dto: DecideMembershipDto,
  ): Promise<MembershipResponseDto> {
    const updated = await this.decideMembershipUseCase.execute({
      communityId,
      targetUserId,
      deciderUserId: currentUser.id,
      decision: dto.decision,
    });
    return MembershipMapper.toResponseDto(updated);
  }

  @Post(':userId/roles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Attribuer ou retirer un rôle local (Administrateur local)',
    description: 'Permet à un ADMIN local d’attribuer ou retirer des rôles contextuels (MODERATOR, MANAGER).',
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant UUID de la communauté',
    format: 'uuid',
  })
  @ApiParam({
    name: 'userId',
    description: 'Identifiant UUID du citoyen concerné',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Rôles mis à jour avec succès.',
    type: MembershipResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé : l’opérateur n’a pas le rôle ADMIN sur cette communauté.',
  })
  @ApiResponse({
    status: 404,
    description: 'Adhésion introuvable.',
  })
  async assignRole(
    @CurrentUser() currentUser: UserAccountEntity,
    @Param('id') communityId: string,
    @Param('userId') targetUserId: string,
    @Body() dto: AssignRoleDto,
  ): Promise<MembershipResponseDto> {
    const updated = await this.assignRoleUseCase.execute({
      communityId,
      targetUserId,
      adminUserId: currentUser.id,
      role: dto.role,
      action: dto.action,
    });
    return MembershipMapper.toResponseDto(updated);
  }
}
