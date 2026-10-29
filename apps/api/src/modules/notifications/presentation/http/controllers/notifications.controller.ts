import {
  Controller,
  Get,
  Patch,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../identity/presentation/http/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../../identity/presentation/http/decorators/current-user.decorator.js';
import { UserAccountEntity } from '../../../../identity/domain/entities/user-account.entity.js';
import { ListUserNotificationsQuery } from '../../../application/queries/list-user-notifications.query.js';
import { MarkNotificationAsReadUseCase } from '../../../application/commands/mark-notification-as-read.use-case.js';
import { ListNotificationsQueryDto } from '../dto/list-notifications-query.dto.js';
import { NotificationResponseDto } from '../dto/notification-response.dto.js';
import { NotificationMapper } from '../../../infrastructure/mappers/notification.mapper.js';

/**
 * Contrôleur REST : Centre de Notifications Citoyennes (NotificationsController)
 * Conforme SOLID :
 * - Contrôleur mince : validation DTO et délégation directe aux cas d'usage applicatifs.
 * - Sécurité Contextuelle : Protection IDOR via CurrentUser.
 */
@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly listUserNotificationsQuery: ListUserNotificationsQuery,
    private readonly markNotificationAsReadUseCase: MarkNotificationAsReadUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulter la liste de mes notifications',
    description: 'Renvoie toutes les notifications destinées à l’utilisateur authentifié, ordonnées de la plus récente à la plus ancienne. Permet de filtrer uniquement les non lues.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des notifications récupérée avec succès.',
    type: [NotificationResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Jeton JWT manquant ou invalide.',
  })
  async listMyNotifications(
    @CurrentUser() currentUser: UserAccountEntity,
    @Query() query: ListNotificationsQueryDto,
  ): Promise<NotificationResponseDto[]> {
    const notifications = await this.listUserNotificationsQuery.execute({
      userId: currentUser.id,
      unreadOnly: query.unreadOnly,
    });

    return notifications.map((n) => NotificationMapper.toResponseDto(n));
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marquer une notification comme lue',
    description: 'Bascule l’état de lecture d’une notification reçue vers lue (isRead = true, readAt horodaté). Rejette toute tentative d’accès aux notifications d’autrui (protection IDOR).',
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant unique (UUID v4) de la notification à marquer comme lue',
    format: 'uuid',
    example: 'c76f6fa3-e380-4ec3-ba09-32219c62985f',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marquée comme lue avec succès.',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Jeton JWT manquant ou invalide.',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé : la notification appartient à un autre citoyen.',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification introuvable.',
  })
  async markAsRead(
    @CurrentUser() currentUser: UserAccountEntity,
    @Param('id') id: string,
  ): Promise<NotificationResponseDto> {
    const updated = await this.markNotificationAsReadUseCase.execute({
      notificationId: id,
      userId: currentUser.id,
    });

    return NotificationMapper.toResponseDto(updated);
  }
}
