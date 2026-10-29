import {
  Controller,
  Post,
  Get,
  Patch,
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
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../identity/presentation/http/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../identity/presentation/http/decorators/current-user.decorator.js';
import { UserAccountEntity } from '../../../identity/domain/entities/user-account.entity.js';

// Use cases & Queries
import { CreateQuarterUseCase } from '../../application/commands/create-quarter.use-case.js';
import { UpdateQuarterUseCase } from '../../application/commands/update-quarter.use-case.js';
import { DeleteQuarterUseCase } from '../../application/commands/delete-quarter.use-case.js';

import { CreateBuildingUseCase } from '../../application/commands/create-building.use-case.js';
import { UpdateBuildingUseCase } from '../../application/commands/update-building.use-case.js';
import { DeleteBuildingUseCase } from '../../application/commands/delete-building.use-case.js';

import { CreateRoomUseCase } from '../../application/commands/create-room.use-case.js';
import { UpdateRoomUseCase } from '../../application/commands/update-room.use-case.js';
import { UpdateRoomStatusUseCase } from '../../application/commands/update-room-status.use-case.js';
import { DeleteRoomUseCase } from '../../application/commands/delete-room.use-case.js';

import { AssignRoomOccupationUseCase } from '../../application/commands/assign-room-occupation.use-case.js';
import { TerminateRoomOccupationUseCase } from '../../application/commands/terminate-room-occupation.use-case.js';

import { ListQuartersQuery } from '../../application/queries/list-quarters.query.js';
import { GetQuarterByIdQuery } from '../../application/queries/get-quarter-by-id.query.js';
import { ListBuildingsQuery } from '../../application/queries/list-buildings.query.js';
import { GetBuildingByIdQuery } from '../../application/queries/get-building-by-id.query.js';
import { ListRoomsQuery } from '../../application/queries/list-rooms.query.js';
import { GetRoomByIdQuery } from '../../application/queries/get-room-by-id.query.js';
import { ListOccupationsQuery } from '../../application/queries/list-occupations.query.js';
import { GetResidenceStatsQuery } from '../../application/queries/get-residence-stats.query.js';
import { GetResidentsQuery } from '../../application/queries/get-residents.query.js';
import { GetResidentByIdQuery } from '../../application/queries/get-resident-by-id.query.js';

// DTOs
import { CreateQuarterDto } from './dto/create-quarter.dto.js';
import { UpdateQuarterDto } from './dto/update-quarter.dto.js';
import { CreateBuildingDto } from './dto/create-building.dto.js';
import { UpdateBuildingDto } from './dto/update-building.dto.js';
import { CreateRoomDto } from './dto/create-room.dto.js';
import { UpdateRoomDto } from './dto/update-room.dto.js';
import { UpdateRoomStatusDto } from './dto/update-room-status.dto.js';
import { ResidentResponseDto } from './dto/resident-response.dto.js';
import { AssignRoomOccupationDto } from './dto/assign-room-occupation.dto.js';
import { TerminateRoomOccupationDto } from './dto/terminate-room-occupation.dto.js';
import {
  QuarterResponseDto,
  BuildingResponseDto,
  RoomResponseDto,
  RoomOccupationResponseDto,
} from './dto/residence-responses.dto.js';
import { ResidenceStatsResponseDto } from './dto/residence-stats-response.dto.js';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@ApiTags('Residences')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('residences')
export class ResidencesController {
  constructor(
    private readonly createQuarterUseCase: CreateQuarterUseCase,
    private readonly updateQuarterUseCase: UpdateQuarterUseCase,
    private readonly deleteQuarterUseCase: DeleteQuarterUseCase,
    private readonly createBuildingUseCase: CreateBuildingUseCase,
    private readonly updateBuildingUseCase: UpdateBuildingUseCase,
    private readonly deleteBuildingUseCase: DeleteBuildingUseCase,
    private readonly createRoomUseCase: CreateRoomUseCase,
    private readonly updateRoomUseCase: UpdateRoomUseCase,
    private readonly updateRoomStatusUseCase: UpdateRoomStatusUseCase,
    private readonly deleteRoomUseCase: DeleteRoomUseCase,
    private readonly assignRoomOccupationUseCase: AssignRoomOccupationUseCase,
    private readonly terminateRoomOccupationUseCase: TerminateRoomOccupationUseCase,
    private readonly listQuartersQuery: ListQuartersQuery,
    private readonly getQuarterByIdQuery: GetQuarterByIdQuery,
    private readonly listBuildingsQuery: ListBuildingsQuery,
    private readonly getBuildingByIdQuery: GetBuildingByIdQuery,
    private readonly listRoomsQuery: ListRoomsQuery,
    private readonly getRoomByIdQuery: GetRoomByIdQuery,
    private readonly listOccupationsQuery: ListOccupationsQuery,
    private readonly getResidenceStatsQuery: GetResidenceStatsQuery,
    private readonly getResidentsQuery: GetResidentsQuery,
    private readonly getResidentByIdQuery: GetResidentByIdQuery,
  ) {}

  // ---------------------------------------------------------------------------
  // 0. Statistiques & Vue d'ensemble
  // ---------------------------------------------------------------------------

  @Get('stats')
  @ApiOperation({
    summary: 'Statistiques consolidées du parc résidentiel',
    description: 'Retourne les indicateurs clés : nombre de quartiers, bâtiments, chambres, lits, occupations actives et taux.',
  })
  @ApiQuery({ name: 'associationId', required: false, description: 'Filtrer par association gestionnaire' })
  @ApiResponse({ status: 200, description: 'Statistiques consolidées.', type: ResidenceStatsResponseDto })
  public async getStats(
    @Query('associationId') associationId?: string,
  ): Promise<ResidenceStatsResponseDto> {
    const validAssocId = associationId && UUID_V4_REGEX.test(associationId.trim()) ? associationId.trim() : undefined;
    return this.getResidenceStatsQuery.execute(validAssocId);
  }

  // ---------------------------------------------------------------------------
  // 1. Quartiers / Campus
  // ---------------------------------------------------------------------------

  @Post('quarters')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un quartier ou campus de résidences',
    description: 'Enregistre un nouveau campus ou quartier affilié à une association gestionnaire.',
  })
  @ApiResponse({ status: 201, description: 'Quartier créé avec succès.', type: QuarterResponseDto })
  @ApiResponse({ status: 400, description: 'Données de formulaire invalides.' })
  @ApiResponse({ status: 401, description: 'Jeton JWT manquant ou invalide.' })
  public async createQuarter(
    @Body() dto: CreateQuarterDto,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<QuarterResponseDto> {
    const result = await this.createQuarterUseCase.execute({
      associationId: dto.associationId,
      name: dto.name,
      city: dto.city,
      description: dto.description,
      requesterUserId: user.id,
    });

    return {
      id: result.id,
      associationId: result.associationId,
      name: result.name,
      city: result.city,
      description: result.description,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  @Get('quarters')
  @ApiOperation({
    summary: 'Lister les quartiers d’une association',
    description: 'Retourne tous les quartiers ou campus gérés par une association donnée, ou tous les quartiers si non spécifié.',
  })
  @ApiQuery({ name: 'associationId', required: false, description: 'UUID de l’association' })
  @ApiResponse({ status: 200, description: 'Liste des quartiers retournée.', type: [QuarterResponseDto] })
  public async listQuarters(
    @Query('associationId') associationId?: string,
  ): Promise<QuarterResponseDto[]> {
    const validAssocId = associationId && UUID_V4_REGEX.test(associationId.trim()) ? associationId.trim() : undefined;
    const quarters = await this.listQuartersQuery.execute(validAssocId);
    return quarters.map((q) => ({
      id: q.id,
      associationId: q.associationId,
      name: q.name,
      city: q.city,
      description: q.description,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
    }));
  }

  @Get('quarters/:id')
  @ApiOperation({
    summary: 'Obtenir un quartier par son identifiant',
    description: 'Retourne les détails complets d’un quartier ou campus de résidences.',
  })
  @ApiParam({ name: 'id', description: 'UUID du quartier' })
  @ApiResponse({ status: 200, description: 'Quartier trouvé.', type: QuarterResponseDto })
  @ApiResponse({ status: 404, description: 'Quartier introuvable.' })
  public async getQuarter(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<QuarterResponseDto> {
    const q = await this.getQuarterByIdQuery.execute(id);
    return {
      id: q.id,
      associationId: q.associationId,
      name: q.name,
      city: q.city,
      description: q.description,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
    };
  }

  @Patch('quarters/:id')
  @ApiOperation({
    summary: 'Mettre à jour un quartier de résidences',
    description: 'Modifie le nom, la ville ou la description d’un campus.',
  })
  @ApiParam({ name: 'id', description: 'UUID du quartier à modifier' })
  @ApiResponse({ status: 200, description: 'Quartier mis à jour.', type: QuarterResponseDto })
  @ApiResponse({ status: 404, description: 'Quartier introuvable.' })
  public async updateQuarter(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateQuarterDto,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<QuarterResponseDto> {
    const result = await this.updateQuarterUseCase.execute({
      quarterId: id,
      name: dto.name,
      city: dto.city,
      description: dto.description,
      requesterUserId: user.id,
    });

    return {
      id: result.id,
      associationId: result.associationId,
      name: result.name,
      city: result.city,
      description: result.description,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  @Delete('quarters/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un quartier de résidences',
    description: 'Supprime un quartier uniquement s’il ne contient plus aucun bâtiment.',
  })
  @ApiParam({ name: 'id', description: 'UUID du quartier à supprimer' })
  @ApiResponse({ status: 204, description: 'Quartier supprimé avec succès.' })
  @ApiResponse({ status: 400, description: 'Le quartier contient encore des bâtiments.' })
  @ApiResponse({ status: 404, description: 'Quartier introuvable.' })
  public async deleteQuarter(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<void> {
    await this.deleteQuarterUseCase.execute({
      quarterId: id,
      requesterUserId: user.id,
    });
  }

  // ---------------------------------------------------------------------------
  // 2. Bâtiments
  // ---------------------------------------------------------------------------

  @Post('buildings')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un bâtiment de résidence',
    description: 'Enregistre un nouveau bâtiment loué ou géré par l’association (avec bailleur légal).',
  })
  @ApiResponse({ status: 201, description: 'Bâtiment créé avec succès.', type: BuildingResponseDto })
  @ApiResponse({ status: 400, description: 'Données de formulaire invalides.' })
  @ApiResponse({ status: 404, description: 'Quartier parent introuvable.' })
  public async createBuilding(
    @Body() dto: CreateBuildingDto,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<BuildingResponseDto> {
    const result = await this.createBuildingUseCase.execute({
      quarterId: dto.quarterId,
      name: dto.name,
      address: dto.address,
      landlordName: dto.landlordName,
      landlordPhone: dto.landlordPhone,
      landlordIbanOrMomo: dto.landlordIbanOrMomo,
      floorsCount: dto.floorsCount,
      requesterUserId: user.id,
    });

    return {
      id: result.id,
      quarterId: result.quarterId,
      name: result.name,
      address: result.address,
      landlordName: result.landlordName,
      landlordPhone: result.landlordPhone,
      landlordIbanOrMomo: result.landlordIbanOrMomo,
      floorsCount: result.floorsCount,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  @Get('buildings')
  @ApiOperation({
    summary: 'Lister les bâtiments d’un quartier',
    description: 'Retourne tous les bâtiments rattachés à un quartier ou campus donné, ou tous les bâtiments si non spécifié.',
  })
  @ApiQuery({ name: 'quarterId', required: false, description: 'UUID du quartier parent' })
  @ApiResponse({ status: 200, description: 'Liste des bâtiments retournée.', type: [BuildingResponseDto] })
  public async listBuildings(
    @Query('quarterId') quarterId?: string,
  ): Promise<BuildingResponseDto[]> {
    const validQuarterId = quarterId && UUID_V4_REGEX.test(quarterId.trim()) ? quarterId.trim() : undefined;
    const buildings = await this.listBuildingsQuery.execute(validQuarterId);
    return buildings.map((b) => ({
      id: b.id,
      quarterId: b.quarterId,
      name: b.name,
      address: b.address,
      landlordName: b.landlordName,
      landlordPhone: b.landlordPhone,
      landlordIbanOrMomo: b.landlordIbanOrMomo,
      floorsCount: b.floorsCount,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    }));
  }

  @Get('buildings/:id')
  @ApiOperation({
    summary: 'Obtenir un bâtiment par son identifiant',
    description: 'Retourne les informations complètes d’un bâtiment (adresse, bailleur, étages).',
  })
  @ApiParam({ name: 'id', description: 'UUID du bâtiment' })
  @ApiResponse({ status: 200, description: 'Bâtiment trouvé.', type: BuildingResponseDto })
  @ApiResponse({ status: 404, description: 'Bâtiment introuvable.' })
  public async getBuilding(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<BuildingResponseDto> {
    const b = await this.getBuildingByIdQuery.execute(id);
    return {
      id: b.id,
      quarterId: b.quarterId,
      name: b.name,
      address: b.address,
      landlordName: b.landlordName,
      landlordPhone: b.landlordPhone,
      landlordIbanOrMomo: b.landlordIbanOrMomo,
      floorsCount: b.floorsCount,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    };
  }

  @Patch('buildings/:id')
  @ApiOperation({
    summary: 'Mettre à jour un bâtiment de résidence',
    description: 'Modifie l’adresse, les coordonnées du bailleur ou le nom du bâtiment.',
  })
  @ApiParam({ name: 'id', description: 'UUID du bâtiment' })
  @ApiResponse({ status: 200, description: 'Bâtiment mis à jour.', type: BuildingResponseDto })
  @ApiResponse({ status: 404, description: 'Bâtiment introuvable.' })
  public async updateBuilding(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateBuildingDto,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<BuildingResponseDto> {
    const result = await this.updateBuildingUseCase.execute({
      buildingId: id,
      name: dto.name,
      address: dto.address,
      landlordName: dto.landlordName,
      landlordPhone: dto.landlordPhone,
      landlordIbanOrMomo: dto.landlordIbanOrMomo,
      floorsCount: dto.floorsCount,
      requesterUserId: user.id,
    });

    return {
      id: result.id,
      quarterId: result.quarterId,
      name: result.name,
      address: result.address,
      landlordName: result.landlordName,
      landlordPhone: result.landlordPhone,
      landlordIbanOrMomo: result.landlordIbanOrMomo,
      floorsCount: result.floorsCount,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  @Delete('buildings/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un bâtiment de résidence',
    description: 'Supprime un bâtiment uniquement s’il ne contient plus aucune chambre.',
  })
  @ApiParam({ name: 'id', description: 'UUID du bâtiment à supprimer' })
  @ApiResponse({ status: 204, description: 'Bâtiment supprimé avec succès.' })
  @ApiResponse({ status: 400, description: 'Le bâtiment contient encore des chambres.' })
  @ApiResponse({ status: 404, description: 'Bâtiment introuvable.' })
  public async deleteBuilding(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<void> {
    await this.deleteBuildingUseCase.execute({
      buildingId: id,
      requesterUserId: user.id,
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Chambres
  // ---------------------------------------------------------------------------

  @Post('rooms')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer une chambre dans un bâtiment',
    description: 'Définit une chambre physique, son numéro unique et sa capacité maximale en lits.',
  })
  @ApiResponse({ status: 201, description: 'Chambre créée avec succès.', type: RoomResponseDto })
  @ApiResponse({ status: 400, description: 'Données de formulaire invalides.' })
  @ApiResponse({ status: 404, description: 'Bâtiment introuvable.' })
  @ApiResponse({ status: 409, description: 'Numéro de chambre déjà existant dans ce bâtiment.' })
  public async createRoom(
    @Body() dto: CreateRoomDto,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<RoomResponseDto> {
    const result = await this.createRoomUseCase.execute({
      buildingId: dto.buildingId,
      roomNumber: dto.roomNumber,
      capacity: dto.capacity,
      requesterUserId: user.id,
    });

    return {
      id: result.id,
      buildingId: result.buildingId,
      roomNumber: result.roomNumber,
      capacity: result.capacity,
      status: result.status,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  @Get('rooms')
  @ApiOperation({
    summary: 'Lister les chambres d’un bâtiment',
    description: 'Retourne toutes les chambres physiques situées dans un bâtiment donné, ou toutes les chambres si non spécifié.',
  })
  @ApiQuery({ name: 'buildingId', required: false, description: 'UUID du bâtiment parent' })
  @ApiResponse({ status: 200, description: 'Liste des chambres retournée.', type: [RoomResponseDto] })
  public async listRooms(
    @Query('buildingId') buildingId?: string,
  ): Promise<RoomResponseDto[]> {
    const validBuildingId = buildingId && UUID_V4_REGEX.test(buildingId.trim()) ? buildingId.trim() : undefined;
    const rooms = await this.listRoomsQuery.execute(validBuildingId);
    return rooms.map((r) => ({
      id: r.id,
      buildingId: r.buildingId,
      roomNumber: r.roomNumber,
      capacity: r.capacity,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  @Get('rooms/:id')
  @ApiOperation({
    summary: 'Obtenir une chambre par son identifiant',
    description: 'Retourne les caractéristiques d’une chambre (capacité, statut actuel, numéro).',
  })
  @ApiParam({ name: 'id', description: 'UUID de la chambre' })
  @ApiResponse({ status: 200, description: 'Chambre trouvée.', type: RoomResponseDto })
  @ApiResponse({ status: 404, description: 'Chambre introuvable.' })
  public async getRoom(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<RoomResponseDto> {
    const r = await this.getRoomByIdQuery.execute(id);
    return {
      id: r.id,
      buildingId: r.buildingId,
      roomNumber: r.roomNumber,
      capacity: r.capacity,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }

  @Patch('rooms/:id')
  @ApiOperation({
    summary: 'Mettre à jour une chambre',
    description: 'Modifie le numéro de chambre, sa capacité en lits ou son statut.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la chambre' })
  @ApiResponse({ status: 200, description: 'Chambre mise à jour.', type: RoomResponseDto })
  @ApiResponse({ status: 400, description: 'Violation de contrainte de capacité.' })
  @ApiResponse({ status: 404, description: 'Chambre introuvable.' })
  @ApiResponse({ status: 409, description: 'Numéro de chambre en conflit.' })
  public async updateRoom(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateRoomDto,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<RoomResponseDto> {
    const result = await this.updateRoomUseCase.execute({
      roomId: id,
      roomNumber: dto.roomNumber,
      capacity: dto.capacity,
      status: dto.status,
      requesterUserId: user.id,
    });

    return {
      id: result.id,
      buildingId: result.buildingId,
      roomNumber: result.roomNumber,
      capacity: result.capacity,
      status: result.status,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  @Patch('rooms/:id/status')
  @ApiOperation({
    summary: 'Bascule rapide du statut d’une chambre (Maintenance / Disponible)',
    description: 'Permet de mettre rapidement une chambre en travaux/maintenance ou de la remettre en service.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la chambre' })
  @ApiResponse({ status: 200, description: 'Statut de chambre mis à jour.', type: RoomResponseDto })
  @ApiResponse({ status: 400, description: 'Chambre occupée ne pouvant être mise en maintenance.' })
  public async updateRoomStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateRoomStatusDto,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<Partial<RoomResponseDto>> {
    const result = await this.updateRoomStatusUseCase.execute({
      roomId: id,
      status: dto.status,
      requesterUserId: user.id,
    });

    return {
      id: result.id,
      buildingId: result.buildingId,
      roomNumber: result.roomNumber,
      capacity: result.capacity,
      status: result.status,
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  @Delete('rooms/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer une chambre physique',
    description: 'Supprime une chambre uniquement si elle n’a aucune occupation / bail en cours.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la chambre à supprimer' })
  @ApiResponse({ status: 204, description: 'Chambre supprimée avec succès.' })
  @ApiResponse({ status: 400, description: 'Chambre actuellement occupée.' })
  @ApiResponse({ status: 404, description: 'Chambre introuvable.' })
  public async deleteRoom(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<void> {
    await this.deleteRoomUseCase.execute({
      roomId: id,
      requesterUserId: user.id,
    });
  }

  // ---------------------------------------------------------------------------
  // 4. Occupations de chambres (Contrats de séjour - ADR-010)
  // ---------------------------------------------------------------------------

  @Post('occupations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Attribuer une chambre à un résident (ADR-010)',
    description: 'Assigne un logement physique à un utilisateur avec dates d’occupation et contrôle strict de capacité.',
  })
  @ApiResponse({ status: 201, description: 'Occupation assignée avec succès.', type: RoomOccupationResponseDto })
  @ApiResponse({ status: 400, description: 'Données de formulaire invalides.' })
  @ApiResponse({ status: 404, description: 'Chambre introuvable.' })
  @ApiResponse({ status: 409, description: 'Capacité maximale atteinte ou utilisateur ayant déjà un logement actif.' })
  public async assignOccupation(
    @Body() dto: AssignRoomOccupationDto,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<RoomOccupationResponseDto> {
    const result = await this.assignRoomOccupationUseCase.execute({
      roomId: dto.roomId,
      occupantUserId: dto.occupantUserId,
      associationId: dto.associationId,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      requesterUserId: user.id,
      allowSurplus: dto.allowSurplus,
      surplusReason: dto.surplusReason,
    });

    return {
      id: result.id,
      roomId: result.roomId,
      occupantUserId: result.occupantUserId,
      associationId: result.associationId,
      startDate: result.startDate.toISOString(),
      endDate: result.endDate ? result.endDate.toISOString() : null,
      isActive: result.isActive,
      status: result.status,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  @Patch('occupations/:id/terminate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clôturer ou résilier une occupation de chambre (ADR-010)',
    description: 'Libère la place dans la chambre et stoppe le contrat de séjour sans affecter le compte utilisateur.',
  })
  @ApiParam({ name: 'id', description: 'UUID de l’occupation à résilier' })
  @ApiResponse({ status: 200, description: 'Occupation clôturée avec succès.', type: RoomOccupationResponseDto })
  @ApiResponse({ status: 404, description: 'Occupation introuvable.' })
  @ApiResponse({ status: 409, description: 'Occupation déjà inactive.' })
  public async terminateOccupation(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: TerminateRoomOccupationDto,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<RoomOccupationResponseDto> {
    const result = await this.terminateRoomOccupationUseCase.execute({
      occupationId: id,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      requesterUserId: user.id,
    });

    return {
      id: result.id,
      roomId: result.roomId,
      occupantUserId: result.occupantUserId,
      associationId: result.associationId,
      startDate: result.startDate.toISOString(),
      endDate: result.endDate ? result.endDate.toISOString() : null,
      isActive: result.isActive,
      status: result.status,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  @Get('occupations')
  @ApiOperation({
    summary: 'Lister les occupations de chambres',
    description: 'Recherche et filtre les contrats de séjour selon divers critères (association, chambre, utilisateur, actif).',
  })
  @ApiQuery({ name: 'associationId', required: false, description: 'Filtrer par association' })
  @ApiQuery({ name: 'roomId', required: false, description: 'Filtrer par chambre' })
  @ApiQuery({ name: 'occupantUserId', required: false, description: 'Filtrer par utilisateur résident' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filtrer par statut actif' })
  @ApiResponse({ status: 200, description: 'Liste des occupations retournée.', type: [RoomOccupationResponseDto] })
  public async listOccupations(
    @Query('associationId') associationId?: string,
    @Query('roomId') roomId?: string,
    @Query('occupantUserId') occupantUserId?: string,
    @Query('isActive') isActive?: string,
  ): Promise<RoomOccupationResponseDto[]> {
    const validAssocId = associationId && UUID_V4_REGEX.test(associationId.trim()) ? associationId.trim() : undefined;
    const validRoomId = roomId && UUID_V4_REGEX.test(roomId.trim()) ? roomId.trim() : undefined;
    const validUserId = occupantUserId && UUID_V4_REGEX.test(occupantUserId.trim()) ? occupantUserId.trim() : undefined;
    const occupations = await this.listOccupationsQuery.execute({
      associationId: validAssocId,
      roomId: validRoomId,
      occupantUserId: validUserId,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });

    return occupations.map((o) => ({
      id: o.id,
      roomId: o.roomId,
      occupantUserId: o.occupantUserId,
      associationId: o.associationId,
      startDate: o.startDate.toISOString(),
      endDate: o.endDate ? o.endDate.toISOString() : null,
      isActive: o.isActive,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));
  }

  // ---------------------------------------------------------------------------
  // 5. Répertoire des Résidents & Historique des Baux
  // ---------------------------------------------------------------------------

  @Get('residents')
  @ApiOperation({
    summary: 'Consulter la liste de tous les résidents et leurs contrats',
    description: 'Retourne l’ensemble des citoyens résidents avec l’état de leur bail actif et l’historique complet de leurs contrats de séjour.',
  })
  @ApiQuery({ name: 'associationId', required: false, description: 'Filtrer par association gestionnaire' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filtrer les résidents ayant un bail actif' })
  @ApiResponse({ status: 200, description: 'Liste des résidents retournée avec succès.', type: [ResidentResponseDto] })
  public async getResidents(
    @Query('associationId') associationId?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ResidentResponseDto[]> {
    const validAssocId = associationId && UUID_V4_REGEX.test(associationId.trim()) ? associationId.trim() : undefined;
    const list = await this.getResidentsQuery.execute({
      associationId: validAssocId,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });

    return list.map((r) => ({
      userId: r.userId,
      firstName: r.firstName,
      lastName: r.lastName,
      phoneNumber: r.phoneNumber,
      email: r.email,
      city: r.city,
      avatarKey: r.avatarKey,
      isActiveResident: r.isActiveResident,
      currentRoom: r.currentRoom ?? null,
      contractsCount: r.contractsCount,
      contracts: r.contracts.map((c) => ({
        id: c.id,
        roomId: c.roomId,
        roomNumber: c.roomNumber,
        buildingName: c.buildingName,
        quarterName: c.quarterName,
        quarterCity: c.quarterCity,
        associationId: c.associationId,
        associationName: c.associationName,
        startDate: c.startDate.toISOString(),
        endDate: c.endDate ? c.endDate.toISOString() : null,
        isActive: c.isActive,
        status: c.status,
      })),
    }));
  }

  @Get('residents/:id')
  @ApiOperation({
    summary: 'Obtenir la fiche détaillée d’un résident et ses contrats',
    description: 'Retourne l’identité complète, les coordonnées de contact, la chambre courante et l’historique des baux d’un résident par son userId.',
  })
  @ApiParam({ name: 'id', description: 'UUID du citoyen / résident' })
  @ApiResponse({ status: 200, description: 'Détails du résident trouvés.', type: ResidentResponseDto })
  @ApiResponse({ status: 404, description: 'Résident introuvable.' })
  public async getResident(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ResidentResponseDto> {
    const r = await this.getResidentByIdQuery.execute(id);

    return {
      userId: r.userId,
      firstName: r.firstName,
      lastName: r.lastName,
      phoneNumber: r.phoneNumber,
      email: r.email,
      city: r.city,
      avatarKey: r.avatarKey,
      isActiveResident: r.isActiveResident,
      currentRoom: r.currentRoom ?? null,
      contractsCount: r.contractsCount,
      contracts: r.contracts.map((c) => ({
        id: c.id,
        roomId: c.roomId,
        roomNumber: c.roomNumber,
        buildingName: c.buildingName,
        quarterName: c.quarterName,
        quarterCity: c.quarterCity,
        associationId: c.associationId,
        associationName: c.associationName,
        startDate: c.startDate.toISOString(),
        endDate: c.endDate ? c.endDate.toISOString() : null,
        isActive: c.isActive,
        status: c.status,
      })),
    };
  }
}

