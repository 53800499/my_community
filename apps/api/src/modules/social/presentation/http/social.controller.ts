import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../identity/presentation/http/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../identity/presentation/http/decorators/current-user.decorator.js';
import type { UserAccountEntity } from '../../../identity/domain/entities/user-account.entity.js';

// Cas d'usage & Requêtes
import { AddCommentUseCase } from '../../application/commands/add-comment.use-case.js';
import { DeleteCommentUseCase } from '../../application/commands/delete-comment.use-case.js';
import { ToggleReactionUseCase } from '../../application/commands/toggle-reaction.use-case.js';
import { ListPostCommentsQuery } from '../../application/queries/list-post-comments.query.js';
import { GetReactionsSummaryQuery } from '../../application/queries/get-reactions-summary.query.js';

// DTOs
import { AddCommentDto } from './dto/add-comment.dto.js';
import { ToggleReactionDto } from './dto/toggle-reaction.dto.js';
import { CommentResponseDto } from './dto/comment-response.dto.js';
import { ReactionsSummaryResponseDto } from './dto/reactions-summary-response.dto.js';
import type { ReactionTargetType } from '../../domain/entities/reaction.entity.js';

@ApiTags('Social')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('social')
export class SocialController {
  constructor(
    private readonly addCommentUseCase: AddCommentUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase,
    private readonly toggleReactionUseCase: ToggleReactionUseCase,
    private readonly listPostCommentsQuery: ListPostCommentsQuery,
    private readonly getReactionsSummaryQuery: GetReactionsSummaryQuery,
  ) {}

  @Post('posts/:postId/comments')
  @ApiOperation({ summary: 'Ajouter un commentaire ou une réponse sous une publication' })
  @ApiParam({ name: 'postId', description: 'UUID de la publication cible' })
  @ApiResponse({ status: 201, description: 'Commentaire ajouté avec succès', type: CommentResponseDto })
  @ApiResponse({ status: 404, description: 'Publication ou commentaire parent introuvable' })
  public async addComment(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto: AddCommentDto,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<CommentResponseDto> {
    const comment = await this.addCommentUseCase.execute({
      postId,
      authorId: user.id,
      content: dto.content,
      parentId: dto.parentId,
    });
    return CommentResponseDto.fromDomain(comment);
  }

  @Get('posts/:postId/comments')
  @ApiOperation({ summary: 'Lister les commentaires hiérarchisés sous une publication' })
  @ApiParam({ name: 'postId', description: 'UUID de la publication cible' })
  @ApiResponse({ status: 200, description: 'Arborescence des commentaires', type: [CommentResponseDto] })
  public async listComments(
    @Param('postId', ParseUUIDPipe) postId: string,
  ): Promise<CommentResponseDto[]> {
    const tree = await this.listPostCommentsQuery.execute(postId);
    return tree.map((item) => CommentResponseDto.fromDomain(item.comment, item.replies));
  }

  @Delete('comments/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un commentaire' })
  @ApiParam({ name: 'commentId', description: 'UUID du commentaire à supprimer' })
  @ApiResponse({ status: 204, description: 'Commentaire supprimé' })
  @ApiResponse({ status: 403, description: 'Non autorisé à supprimer ce commentaire' })
  @ApiResponse({ status: 404, description: 'Commentaire introuvable' })
  public async deleteComment(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<void> {
    await this.deleteCommentUseCase.execute({
      commentId,
      requesterUserId: user.id,
    });
  }

  @Post('reactions')
  @ApiOperation({ summary: 'Ajouter, changer ou retirer une réaction affective (LIKE, LOVE, etc.)' })
  @ApiResponse({ status: 200, description: 'Réaction basculée' })
  public async toggleReaction(
    @Body() dto: ToggleReactionDto,
    @CurrentUser() user: UserAccountEntity,
  ) {
    return this.toggleReactionUseCase.execute({
      userId: user.id,
      targetType: dto.targetType,
      targetId: dto.targetId,
      reactionType: dto.reactionType,
    });
  }

  @Get('reactions/summary')
  @ApiOperation({ summary: 'Consulter le résumé des réactions pour un contenu (post ou commentaire)' })
  @ApiQuery({ name: 'targetType', enum: ['POST', 'COMMENT'] })
  @ApiQuery({ name: 'targetId', type: String })
  @ApiResponse({ status: 200, description: 'Synthèse des réactions', type: ReactionsSummaryResponseDto })
  public async getReactionsSummary(
    @Query('targetType') targetType: ReactionTargetType,
    @Query('targetId', ParseUUIDPipe) targetId: string,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<ReactionsSummaryResponseDto> {
    const summary = await this.getReactionsSummaryQuery.execute(targetType, targetId, user.id);
    return ReactionsSummaryResponseDto.fromDomain(summary);
  }
}
