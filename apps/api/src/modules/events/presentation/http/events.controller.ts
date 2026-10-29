import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../identity/presentation/http/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../identity/presentation/http/decorators/current-user.decorator.js';
import { UserAccountEntity } from '../../../identity/domain/entities/user-account.entity.js';
import { CreateEventUseCase } from '../../application/commands/create-event.use-case.js';
import { RegisterAttendeeUseCase } from '../../application/commands/register-attendee.use-case.js';
import { CancelEventUseCase } from '../../application/commands/cancel-event.use-case.js';
import { ListCommunityEventsQuery } from '../../application/queries/list-community-events.query.js';
import { GetEventDetailsQuery } from '../../application/queries/get-event-details.query.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { EventResponseDto } from './dto/event-response.dto.js';
import { EventRegistrationResponseDto } from './dto/event-registration-response.dto.js';
import { EventMapper } from '../../infrastructure/mappers/event.mapper.js';
import type { EventStatus } from '../../domain/entities/event.entity.js';

/**
 * Contrôleur REST : Agenda Citoyen & Événements Communautaires (EventsController)
 * Conforme SOLID :
 * - SRP : Contrôleur mince qui délègue immédiatement aux cas d'usage et requêtes applicatives.
 */
@ApiTags('Événements')
@Controller('events')
export class EventsController {
  constructor(
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly registerAttendeeUseCase: RegisterAttendeeUseCase,
    private readonly cancelEventUseCase: CancelEventUseCase,
    private readonly listCommunityEventsQuery: ListCommunityEventsQuery,
    private readonly getEventDetailsQuery: GetEventDetailsQuery,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un événement citoyen',
    description: 'Crée un nouvel événement communautaire (atelier, salubrité, réunion publique).',
  })
  @ApiResponse({
    status: 201,
    description: 'Événement créé avec succès.',
    type: EventResponseDto,
  })
  async createEvent(
    @CurrentUser() currentUser: UserAccountEntity,
    @Body() dto: CreateEventDto,
  ): Promise<EventResponseDto> {
    const event = await this.createEventUseCase.execute({
      communityId: dto.communityId,
      organizerUserId: currentUser.id,
      title: dto.title,
      description: dto.description,
      location: dto.location,
      startsAt: new Date(dto.startsAt),
      endsAt: new Date(dto.endsAt),
      maxAttendees: dto.maxAttendees,
    });
    return EventMapper.toResponseDto(event, 0);
  }

  @Get('community/:communityId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulter l’agenda des événements d’une communauté',
    description: 'Renvoie la liste chronologique des événements programmés dans une communauté.',
  })
  @ApiParam({
    name: 'communityId',
    description: 'Identifiant UUID de la communauté',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'],
    description: 'Filtrer par statut',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des événements récupérée avec succès.',
    type: [EventResponseDto],
  })
  async listByCommunity(
    @Param('communityId') communityId: string,
    @Query('status') status?: EventStatus,
  ): Promise<EventResponseDto[]> {
    const events = await this.listCommunityEventsQuery.execute({
      communityId,
      status,
    });
    return events.map((e) => EventMapper.toResponseDto(e));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulter les détails d’un événement',
    description: 'Renvoie les informations complètes d’un événement et le nombre d’inscrits.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant UUID de l’événement',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Détails de l’événement récupérés.',
    type: EventResponseDto,
  })
  async getDetails(
    @Param('id') eventId: string,
    @CurrentUser() currentUser?: UserAccountEntity,
  ): Promise<EventResponseDto> {
    const result = await this.getEventDetailsQuery.execute({
      eventId,
      currentUserId: currentUser?.id,
    });
    return EventMapper.toResponseDto(
      result.event,
      result.attendeesCount,
      result.userRegistrationStatus,
    );
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'S’inscrire à un événement citoyen',
    description: 'Inscrit le citoyen connecté à l’événement ou l’ajoute sur liste d’attente si complet.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant UUID de l’événement',
    format: 'uuid',
  })
  @ApiResponse({
    status: 201,
    description: 'Inscription enregistrée avec succès.',
    type: EventRegistrationResponseDto,
  })
  async register(
    @Param('id') eventId: string,
    @CurrentUser() currentUser: UserAccountEntity,
  ): Promise<EventRegistrationResponseDto> {
    const registration = await this.registerAttendeeUseCase.execute({
      eventId,
      userId: currentUser.id,
    });
    return EventMapper.toRegistrationResponseDto(registration);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Annuler un événement citoyen',
    description: 'Permet à l’organisateur ou à un administrateur d’annuler l’événement.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant UUID de l’événement',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Événement annulé avec succès.',
  })
  async cancel(
    @Param('id') eventId: string,
    @CurrentUser() currentUser: UserAccountEntity,
  ): Promise<void> {
    await this.cancelEventUseCase.execute({
      eventId,
      requesterUserId: currentUser.id,
      isPrivileged: false,
    });
  }
}
