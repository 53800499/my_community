import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../identity/presentation/http/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../../identity/presentation/http/decorators/current-user.decorator.js';
import { UserAccountEntity } from '../../../../identity/domain/entities/user-account.entity.js';
import { SubmitProposalUseCase } from '../../../application/commands/submit-proposal.use-case.js';
import { ReviewProposalUseCase } from '../../../application/commands/review-proposal.use-case.js';
import { ListProposalsQuery } from '../../../application/queries/list-proposals.query.js';
import { SubmitProposalDto } from '../dto/submit-proposal.dto.js';
import { ReviewProposalDto } from '../dto/review-proposal.dto.js';
import { CommunityProposalResponseDto } from '../dto/community-proposal-response.dto.js';
import { CommunityProposalMapper } from '../../../infrastructure/mappers/community-proposal.mapper.js';

/**
 * Contrôleur REST : Propositions Citoyennes de Communautés (CommunityProposalsController)
 * Conforme SOLID :
 * - Contrôleur mince : validation des DTOs et délégation aux cas d'usage applicatifs.
 * - Sécurisation JWT & Contextuelle.
 */
@ApiTags('Propositions Citoyennes')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommunityProposalsController {
  constructor(
    private readonly submitProposalUseCase: SubmitProposalUseCase,
    private readonly reviewProposalUseCase: ReviewProposalUseCase,
    private readonly listProposalsQuery: ListProposalsQuery,
  ) {}

  @Post('community-proposals')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Soumettre une proposition citoyenne',
    description: 'Permet à tout citoyen authentifié de soumettre une initiative de création de communauté rattachée à un territoire (commune, arrondissement, village/quartier).',
  })
  @ApiResponse({
    status: 201,
    description: 'Proposition soumise avec succès.',
    type: CommunityProposalResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Champs invalides ou non conformes aux contraintes.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentification JWT requise.',
  })
  async submitProposal(
    @CurrentUser() currentUser: UserAccountEntity,
    @Body() dto: SubmitProposalDto,
  ): Promise<CommunityProposalResponseDto> {
    const proposal = await this.submitProposalUseCase.execute({
      name: dto.name,
      description: dto.description,
      justification: dto.justification,
      territoryId: dto.territoryId,
      proposedById: currentUser.id,
    });

    return CommunityProposalMapper.toResponseDto(proposal);
  }

  @Get('community-proposals/my')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mes propositions citoyennes',
    description: 'Consulte l’historique et l’état d’instruction de l’ensemble des propositions soumises par le citoyen actuellement connecté.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste de mes propositions récupérée avec succès.',
    type: [CommunityProposalResponseDto],
  })
  async getMyProposals(
    @CurrentUser() currentUser: UserAccountEntity,
  ): Promise<CommunityProposalResponseDto[]> {
    const proposals = await this.listProposalsQuery.execute({
      proposedById: currentUser.id,
    });

    return proposals.map((p) => CommunityProposalMapper.toResponseDto(p));
  }

  @Get('admin/community-proposals')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Propositions en attente d’instruction (Administration)',
    description: 'Consulte la liste des propositions citoyennes nécessitant une revue administrative.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des propositions administratives.',
    type: [CommunityProposalResponseDto],
  })
  async listAdminProposals(): Promise<CommunityProposalResponseDto[]> {
    const proposals = await this.listProposalsQuery.execute({
      status: 'PENDING',
    });

    return proposals.map((p) => CommunityProposalMapper.toResponseDto(p));
  }

  @Post('admin/community-proposals/:id/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Instruire une proposition citoyenne (Administration)',
    description: 'Décision administrative d’approbation (créant automatiquement l’espace communautaire et notifiant l’auteur) ou de rejet argumenté.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant unique de la proposition (UUID v4)',
    format: 'uuid',
    example: 'd9b2e841-8c4d-4b42-a279-994fbc266d51',
  })
  @ApiResponse({
    status: 200,
    description: 'Proposition instruite avec succès.',
    type: CommunityProposalResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données de revue invalides (motif de rejet manquant).',
  })
  @ApiResponse({
    status: 404,
    description: 'Proposition introuvable.',
  })
  @ApiResponse({
    status: 409,
    description: 'La proposition a déjà été instruite.',
  })
  async reviewProposal(
    @CurrentUser() currentUser: UserAccountEntity,
    @Param('id') id: string,
    @Body() dto: ReviewProposalDto,
  ): Promise<CommunityProposalResponseDto> {
    const { proposal } = await this.reviewProposalUseCase.execute({
      proposalId: id,
      reviewerId: currentUser.id,
      decision: dto.decision,
      rejectionReason: dto.rejectionReason,
    });

    return CommunityProposalMapper.toResponseDto(proposal);
  }
}
