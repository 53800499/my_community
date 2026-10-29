import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ListCommunitiesQuery } from '../../../application/queries/list-communities.query.js';
import { GetCommunityQuery } from '../../../application/queries/get-community.query.js';
import { DeleteCommunityUseCase } from '../../../application/commands/delete-community.use-case.js';
import { CommunityResponseDto } from '../dto/community-response.dto.js';
import { CommunityMapper } from '../../../infrastructure/mappers/community.mapper.js';
import { JwtAuthGuard } from '../../../../identity/presentation/http/guards/jwt-auth.guard.js';
import { PlatformAdminGuard } from '../../../../identity/presentation/http/guards/platform-admin.guard.js';
import { CurrentUser } from '../../../../identity/presentation/http/decorators/current-user.decorator.js';
import { UserAccountEntity } from '../../../../identity/domain/entities/user-account.entity.js';

/**
 * Contrôleur REST : Exploration et Gestion des Communautés (CommunitiesController)
 * Conforme SOLID : Contrôleur mince, délégation directe aux requêtes et cas d'usage applicatifs.
 */
@ApiTags('Communautés')
@Controller('communities')
export class CommunitiesController {
  constructor(
    private readonly listCommunitiesQuery: ListCommunitiesQuery,
    private readonly getCommunityQuery: GetCommunityQuery,
    private readonly deleteCommunityUseCase: DeleteCommunityUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Explorer les communautés citoyennes',
    description: 'Renvoie la liste des communautés actives et ouvertes aux citoyens.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des communautés récupérée avec succès.',
    type: [CommunityResponseDto],
  })
  async listAll(): Promise<CommunityResponseDto[]> {
    const list = await this.listCommunitiesQuery.execute();
    return list.map((c) => CommunityMapper.toResponseDto(c));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Fiche d’une communauté',
    description: 'Consulte les informations publiques détaillées d’une communauté par son identifiant unique.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant unique (UUID v4) de la communauté',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Détails de la communauté récupérés avec succès.',
    type: CommunityResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Communauté introuvable.',
  })
  async getById(@Param('id') id: string): Promise<CommunityResponseDto> {
    const community = await this.getCommunityQuery.execute({ communityId: id });
    return CommunityMapper.toResponseDto(community);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PlatformAdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Supprimer / Dissoudre un espace communautaire',
    description: 'Supprime un espace communautaire. Réservé strictement aux Super-Administrateurs de la plateforme avec confirmation de sécurité.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant unique de la communauté à dissoudre',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'confirmationName',
    required: false,
    description: 'Nom exact de la communauté pour double validation anti-erreur',
  })
  @ApiResponse({
    status: 200,
    description: 'Communauté dissoute et supprimée avec succès.',
  })
  @ApiResponse({
    status: 403,
    description: "Accès refusé : Seule l'Administration Générale peut dissoudre un espace communautaire.",
  })
  async deleteCommunity(
    @CurrentUser() currentUser: UserAccountEntity,
    @Param('id') id: string,
    @Query('confirmationName') confirmationName?: string,
  ): Promise<{ success: boolean; communityId: string }> {
    return this.deleteCommunityUseCase.execute({
      communityId: id,
      userId: currentUser.id,
      isPlatformAdmin: currentUser.isPlatformAdmin,
      confirmationName,
    });
  }
}
