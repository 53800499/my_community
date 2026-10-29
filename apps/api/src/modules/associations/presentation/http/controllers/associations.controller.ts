import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../identity/presentation/http/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../../identity/presentation/http/decorators/current-user.decorator.js';
import { UserAccountEntity } from '../../../../identity/domain/entities/user-account.entity.js';
import { RegisterAssociationUseCase } from '../../../application/commands/register-association.use-case.js';
import { LinkCommunityUseCase } from '../../../application/commands/link-community.use-case.js';
import { ManageAssociationMemberUseCase } from '../../../application/commands/manage-association-member.use-case.js';
import { CreateAssociationPositionUseCase } from '../../../application/commands/create-association-position.use-case.js';
import { AssignAssociationPositionUseCase } from '../../../application/commands/assign-association-position.use-case.js';
import { VacateAssociationPositionUseCase } from '../../../application/commands/vacate-association-position.use-case.js';
import { UpdatePositionPermissionsUseCase } from '../../../application/commands/update-position-permissions.use-case.js';
import { ExecuteServiceHandoverUseCase } from '../../../application/commands/execute-service-handover.use-case.js';
import { CreateAssociationMandateUseCase } from '../../../application/commands/create-association-mandate.use-case.js';
import { UpdateAssociationMandateUseCase } from '../../../application/commands/update-association-mandate.use-case.js';
import { ActivateAssociationMandateUseCase } from '../../../application/commands/activate-association-mandate.use-case.js';
import { UpdateMemberProfessionalInfoUseCase } from '../../../application/commands/update-member-professional-info.use-case.js';
import { ListAssociationsQuery } from '../../../application/queries/list-associations.query.js';
import { GetAssociationQuery } from '../../../application/queries/get-association.query.js';
import { ListAssociationPositionsQuery } from '../../../application/queries/list-association-positions.query.js';
import { ListAssociationMandatesQuery } from '../../../application/queries/list-association-mandates.query.js';
import { GetMandateReportQuery } from '../../../application/queries/get-mandate-report.query.js';
import { RegisterAssociationDto } from '../dto/register-association.dto.js';
import { ManageAssociationMemberDto } from '../dto/manage-association-member.dto.js';
import { CreateAssociationPositionDto } from '../dto/create-association-position.dto.js';
import { AssignAssociationPositionDto } from '../dto/assign-association-position.dto.js';
import { UpdatePositionPermissionsDto } from '../dto/update-position-permissions.dto.js';
import { ExecuteServiceHandoverDto } from '../dto/execute-service-handover.dto.js';
import { CreateAssociationMandateDto } from '../dto/create-association-mandate.dto.js';
import { UpdateAssociationMandateDto } from '../dto/update-association-mandate.dto.js';
import { UpdateMemberProfessionalInfoDto } from '../dto/update-member-professional-info.dto.js';
import { AssociationResponseDto } from '../dto/association-response.dto.js';
import { AssociationPositionResponseDto } from '../dto/association-position-response.dto.js';
import { AssociationMemberResponseDto } from '../dto/association-member-response.dto.js';
import { AssociationMandateResponseDto } from '../dto/association-mandate-response.dto.js';
import { AssociationMapper } from '../../../infrastructure/mappers/association.mapper.js';
import { AssociationPositionMapper } from '../../../infrastructure/mappers/association-position.mapper.js';
import { AssociationMandateMapper } from '../../../infrastructure/mappers/association-mandate.mapper.js';
import type { AssociationEntity } from '../../../domain/entities/association.entity.js';
import type { AssociationPositionEntity } from '../../../domain/entities/association-position.entity.js';
import type { AssociationMemberEntity } from '../../../domain/entities/association-member.entity.js';

/**
 * Contrôleur REST : Gestion et Gouvernance des Associations (AssociationsController)
 * Conforme SOLID :
 * - SRP : Contrôleur mince qui valide et achemine les requêtes HTTP vers les cas d'usage et requêtes dédiés.
 * - DIP : Dépend uniquement des abstractions injectées.
 */
@ApiTags('Associations')
@Controller('associations')
export class AssociationsController {
  constructor(
    private readonly listAssociationsQuery: ListAssociationsQuery,
    private readonly getAssociationQuery: GetAssociationQuery,
    private readonly listAssociationPositionsQuery: ListAssociationPositionsQuery,
    private readonly listAssociationMandatesQuery: ListAssociationMandatesQuery,
    private readonly getMandateReportQuery: GetMandateReportQuery,
    private readonly registerAssociationUseCase: RegisterAssociationUseCase,
    private readonly linkCommunityUseCase: LinkCommunityUseCase,
    private readonly manageAssociationMemberUseCase: ManageAssociationMemberUseCase,
    private readonly createAssociationPositionUseCase: CreateAssociationPositionUseCase,
    private readonly assignAssociationPositionUseCase: AssignAssociationPositionUseCase,
    private readonly vacateAssociationPositionUseCase: VacateAssociationPositionUseCase,
    private readonly updatePositionPermissionsUseCase: UpdatePositionPermissionsUseCase,
    private readonly executeServiceHandoverUseCase: ExecuteServiceHandoverUseCase,
    private readonly createAssociationMandateUseCase: CreateAssociationMandateUseCase,
    private readonly updateAssociationMandateUseCase: UpdateAssociationMandateUseCase,
    private readonly activateAssociationMandateUseCase: ActivateAssociationMandateUseCase,
    private readonly updateMemberProfessionalInfoUseCase: UpdateMemberProfessionalInfoUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lister toutes les associations',
    description: 'Récupère la liste de toutes les associations enregistrées dans la plateforme.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des associations récupérée avec succès.',
    type: [AssociationResponseDto],
  })
  public async listAll(): Promise<AssociationResponseDto[]> {
    const list = await this.listAssociationsQuery.execute();
    return list.map((a: AssociationEntity) => AssociationMapper.toResponseDto(a));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulter une association par identifiant',
    description: 'Récupère la fiche détaillée d’une association avec ses membres et communautés rattachées.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant unique (UUID) de l’association',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Association trouvée.',
    type: AssociationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Association introuvable.' })
  public async getById(@Param('id') id: string): Promise<AssociationResponseDto> {
    const result = await this.getAssociationQuery.execute(id);
    return AssociationMapper.toResponseDto(
      result.association,
      result.members,
      result.linkedCommunityIds,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Enregistrer une nouvelle association',
    description: 'Permet à un utilisateur authentifié d’enregistrer une association et d’en devenir le président fondateur.',
  })
  @ApiResponse({
    status: 201,
    description: 'Association enregistrée avec succès.',
    type: AssociationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 401, description: 'Authentification JWT requise.' })
  @ApiResponse({ status: 409, description: 'Numéro d’enregistrement déjà utilisé.' })
  public async register(
    @CurrentUser() user: UserAccountEntity,
    @Body() dto: RegisterAssociationDto,
  ): Promise<AssociationResponseDto> {
    const result = await this.registerAssociationUseCase.execute({
      name: dto.name,
      acronym: dto.acronym,
      registrationNumber: dto.registrationNumber,
      description: dto.description,
      presidentUserId: user.id,
    });

    return AssociationMapper.toResponseDto(
      result.association,
      [result.presidentMember],
      [],
    );
  }

  @Post(':id/communities/:communityId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Rattacher une association à une communauté territoriale',
    description: 'Associe une communauté locale à l’association (multi-rattachement territorial N-N).',
  })
  @ApiParam({ name: 'id', description: 'Identifiant de l’association' })
  @ApiParam({ name: 'communityId', description: 'Identifiant de la communauté' })
  @ApiResponse({ status: 200, description: 'Rattachement territorial effectué avec succès.' })
  @ApiResponse({ status: 401, description: 'Authentification requise.' })
  @ApiResponse({ status: 403, description: 'Action non autorisée (bureau exécutif requis).' })
  @ApiResponse({ status: 404, description: 'Association ou communauté introuvable.' })
  public async linkCommunity(
    @Param('id') id: string,
    @Param('communityId') communityId: string,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<{ success: boolean }> {
    await this.linkCommunityUseCase.execute({
      associationId: id,
      communityId,
      requesterUserId: user.id,
    });
    return { success: true };
  }

  @Get(':id/positions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Organigramme des postes d’une association',
    description: 'Récupère la liste de tous les postes de gouvernance définis dans l’association.',
  })
  @ApiParam({ name: 'id', description: 'Identifiant de l’association' })
  @ApiResponse({
    status: 200,
    description: 'Organigramme récupéré avec succès.',
    type: [AssociationPositionResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Association introuvable.' })
  public async listPositions(
    @Param('id') id: string,
  ): Promise<AssociationPositionResponseDto[]> {
    const positions = await this.listAssociationPositionsQuery.execute(id);
    return positions.map((p: AssociationPositionEntity) => AssociationPositionMapper.toResponseDto(p));
  }

  @Post(':id/positions')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Créer un poste dans l’organigramme',
    description: 'Ajoute un nouveau poste de gouvernance à l’association (réservé au Président).',
  })
  @ApiParam({ name: 'id', description: 'Identifiant de l’association' })
  @ApiResponse({
    status: 201,
    description: 'Poste créé avec succès.',
    type: AssociationPositionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 401, description: 'Authentification requise.' })
  @ApiResponse({ status: 403, description: 'Droit présidentiel requis.' })
  public async createPosition(
    @Param('id') id: string,
    @Body() dto: CreateAssociationPositionDto,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<AssociationPositionResponseDto> {
    const position = await this.createAssociationPositionUseCase.execute({
      associationId: id,
      requesterUserId: user.id,
      title: dto.title,
      roleCategory: dto.roleCategory,
      department: dto.department,
      description: dto.description,
      assignedUserId: dto.assignedUserId,
      assignedUserName: dto.assignedUserName,
    });
    return AssociationPositionMapper.toResponseDto(position);
  }

  @Post(':id/positions/:positionId/assign')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Nommer un responsable à un poste',
    description: 'Affecte un membre adhérent à un poste vacant dans l’organigramme.',
  })
  @ApiParam({ name: 'id', description: 'Identifiant de l’association' })
  @ApiParam({ name: 'positionId', description: 'Identifiant du poste' })
  @ApiResponse({
    status: 200,
    description: 'Responsable nommé avec succès.',
    type: AssociationPositionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Authentification requise.' })
  @ApiResponse({ status: 403, description: 'Droit présidentiel requis.' })
  @ApiResponse({ status: 404, description: 'Poste ou association introuvable.' })
  public async assignPosition(
    @Param('id') id: string,
    @Param('positionId') positionId: string,
    @Body() dto: AssignAssociationPositionDto,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<AssociationPositionResponseDto> {
    const updated = await this.assignAssociationPositionUseCase.execute({
      associationId: id,
      positionId,
      requesterUserId: user.id,
      targetUserId: dto.targetUserId,
      targetUserName: dto.targetUserName,
      termStartDate: dto.termStartDate ? new Date(dto.termStartDate) : undefined,
      termEndDate: dto.termEndDate ? new Date(dto.termEndDate) : undefined,
    });
    return AssociationPositionMapper.toResponseDto(updated);
  }

  @Post(':id/positions/:positionId/vacate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Libérer ou déclarer vacant un poste',
    description: 'Démet le responsable actuel et remet le statut du poste à VACANT.',
  })
  @ApiParam({ name: 'id', description: 'Identifiant de l’association' })
  @ApiParam({ name: 'positionId', description: 'Identifiant du poste' })
  @ApiResponse({
    status: 200,
    description: 'Poste libéré avec succès.',
    type: AssociationPositionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Authentification requise.' })
  @ApiResponse({ status: 403, description: 'Droit présidentiel requis.' })
  @ApiResponse({ status: 404, description: 'Poste introuvable.' })
  public async vacatePosition(
    @Param('id') id: string,
    @Param('positionId') positionId: string,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<AssociationPositionResponseDto> {
    const vacated = await this.vacateAssociationPositionUseCase.execute({
      associationId: id,
      positionId,
      requesterUserId: user.id,
    });
    return AssociationPositionMapper.toResponseDto(vacated);
  }

  @Put(':id/positions/:positionId/permissions')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Configurer les espaces et permissions d’un poste',
    description: 'Définit les espaces fonctionnels autorisés et les permissions granulaires d’un poste.',
  })
  @ApiParam({ name: 'id', description: 'Identifiant de l’association' })
  @ApiParam({ name: 'positionId', description: 'Identifiant du poste' })
  @ApiResponse({
    status: 200,
    description: 'Permissions mises à jour avec succès.',
    type: AssociationPositionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Authentification requise.' })
  @ApiResponse({ status: 403, description: 'Droit présidentiel requis.' })
  @ApiResponse({ status: 404, description: 'Poste introuvable.' })
  public async updatePositionPermissions(
    @Param('id') id: string,
    @Param('positionId') positionId: string,
    @Body() dto: UpdatePositionPermissionsDto,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<AssociationPositionResponseDto> {
    const updated = await this.updatePositionPermissionsUseCase.execute({
      associationId: id,
      positionId,
      requesterUserId: user.id,
      accessSpaces: dto.accessSpaces,
      permissions: dto.permissions,
    });
    return AssociationPositionMapper.toResponseDto(updated);
  }

  @Get(':id/members')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lister les membres d’une association',
    description: 'Renvoie tous les membres et adhérents enregistrés dans l’association.',
  })
  @ApiParam({ name: 'id', description: 'Identifiant de l’association' })
  @ApiResponse({
    status: 200,
    description: 'Liste des membres récupérée avec succès.',
    type: [AssociationMemberResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Association introuvable.' })
  public async listMembers(
    @Param('id') id: string,
  ): Promise<AssociationMemberResponseDto[]> {
    const result = await this.getAssociationQuery.execute(id);
    return result.members.map((m: AssociationMemberEntity) => AssociationMapper.toMemberResponseDto(m));
  }

  @Post(':id/members')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Gérer un membre ou attribuer un rôle au bureau',
    description: 'Permet au Président de nommer un membre à un rôle du bureau ou de le révoquer.',
  })
  @ApiParam({ name: 'id', description: 'Identifiant de l’association' })
  @ApiResponse({
    status: 200,
    description: 'Opération sur le membre effectuée avec succès.',
    type: AssociationMemberResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Authentification requise.' })
  @ApiResponse({ status: 403, description: 'Droit présidentiel requis.' })
  public async manageMember(
    @Param('id') id: string,
    @Body() dto: ManageAssociationMemberDto,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<AssociationMemberResponseDto | null> {
    const member = await this.manageAssociationMemberUseCase.execute({
      associationId: id,
      requesterUserId: user.id,
      targetUserId: dto.targetUserId,
      role: dto.role,
      action: dto.action,
    });

    return member ? AssociationMapper.toMemberResponseDto(member) : null;
  }

  @Get(':id/mandates')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lister les mandatures d’une association',
    description: 'Renvoie l’historique complet des mandats (actifs, passés et archivés) avec les bureaux dirigeants.',
  })
  @ApiParam({ name: 'id', description: 'Identifiant de l’association' })
  @ApiResponse({
    status: 200,
    description: 'Liste des mandatures récupérée avec succès.',
    type: [AssociationMandateResponseDto],
  })
  public async listMandates(
    @Param('id') id: string,
  ): Promise<AssociationMandateResponseDto[]> {
    const mandates = await this.listAssociationMandatesQuery.execute(id);
    return mandates.map((m) => AssociationMandateMapper.toResponseDto(m));
  }

  @Post(':id/mandates')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Définir une nouvelle mandature',
    description: 'Crée une mandature dynamique sans aucune valeur en dur (titre, période d’exercice, président, bureau).',
  })
  @ApiParam({ name: 'id', description: 'Identifiant de l’association' })
  @ApiResponse({
    status: 201,
    description: 'Mandature définie avec succès.',
    type: AssociationMandateResponseDto,
  })
  public async createMandate(
    @Param('id') id: string,
    @Body() dto: CreateAssociationMandateDto,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<AssociationMandateResponseDto> {
    const mandate = await this.createAssociationMandateUseCase.execute({
      associationId: id,
      requesterUserId: user.id,
      title: dto.title,
      academicYear: dto.academicYear,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      description: dto.description,
      presidentUserId: dto.presidentUserId,
      presidentName: dto.presidentName,
      secretaryUserId: dto.secretaryUserId,
      secretaryName: dto.secretaryName,
      treasurerUserId: dto.treasurerUserId,
      treasurerName: dto.treasurerName,
      officers: dto.officers,
      setAsActive: dto.setAsActive,
    });
    return AssociationMandateMapper.toResponseDto(mandate);
  }

  @Put(':id/mandates/:mandateId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Modifier les informations d’une mandature',
    description: 'Permet de mettre à jour le titre, la période, les dates ou le statut d’un mandat existant.',
  })
  @ApiParam({ name: 'id', description: 'Identifiant de l’association' })
  @ApiParam({ name: 'mandateId', description: 'Identifiant du mandat' })
  @ApiResponse({
    status: 200,
    description: 'Mandature mise à jour avec succès.',
    type: AssociationMandateResponseDto,
  })
  public async updateMandate(
    @Param('id') id: string,
    @Param('mandateId') mandateId: string,
    @Body() dto: UpdateAssociationMandateDto,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<AssociationMandateResponseDto> {
    const mandate = await this.updateAssociationMandateUseCase.execute({
      associationId: id,
      mandateId,
      requesterUserId: user.id,
      title: dto.title,
      academicYear: dto.academicYear,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      status: dto.status,
      presidentUserId: dto.presidentUserId,
      presidentName: dto.presidentName,
      secretaryUserId: dto.secretaryUserId,
      secretaryName: dto.secretaryName,
      treasurerUserId: dto.treasurerUserId,
      treasurerName: dto.treasurerName,
      handoverNotes: dto.handoverNotes,
      treasuryTransferredAmount: dto.treasuryTransferredAmount,
      pvDocumentRef: dto.pvDocumentRef,
    });
    return AssociationMandateMapper.toResponseDto(mandate);
  }

  @Post(':id/mandates/:mandateId/activate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Activer une mandature spécifique',
    description: 'Définit le mandat ciblé comme mandat actif de l’association et clôture le mandat précédent.',
  })
  @ApiParam({ name: 'id', description: 'Identifiant de l’association' })
  @ApiParam({ name: 'mandateId', description: 'Identifiant du mandat' })
  @ApiResponse({
    status: 200,
    description: 'Mandature activée avec succès.',
    type: AssociationMandateResponseDto,
  })
  public async activateMandate(
    @Param('id') id: string,
    @Param('mandateId') mandateId: string,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<AssociationMandateResponseDto> {
    const mandate = await this.activateAssociationMandateUseCase.execute({
      associationId: id,
      mandateId,
      requesterUserId: user.id,
    });
    return AssociationMandateMapper.toResponseDto(mandate);
  }

  @Post(':id/handover')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Exécuter la passation de service statutaire',
    description: 'Clôture le mandat sortant, investit le nouveau bureau exécutif, transfère le solde financier et consigne le PV.',
  })
  @ApiParam({ name: 'id', description: 'Identifiant de l’association' })
  @ApiResponse({
    status: 200,
    description: 'Passation de service actée avec succès.',
  })
  public async executeHandover(
    @Param('id') id: string,
    @Body() dto: ExecuteServiceHandoverDto,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<{ previousMandate: AssociationMandateResponseDto | null; newMandate: AssociationMandateResponseDto }> {
    const result = await this.executeServiceHandoverUseCase.execute({
      associationId: id,
      requesterUserId: user.id,
      mandateTitle: dto.mandateTitle,
      academicYear: dto.academicYear,
      handoverDate: dto.handoverDate ? new Date(dto.handoverDate) : undefined,
      handoverNotes: dto.handoverNotes,
      treasuryTransferredAmount: dto.treasuryTransferredAmount,
      pvDocumentRef: dto.pvDocumentRef,
      newPresident: dto.newPresident,
      newSecretary: dto.newSecretary,
      newTreasurer: dto.newTreasurer,
      otherOfficers: dto.otherOfficers,
    });

    return {
      previousMandate: result.previousMandate ? AssociationMandateMapper.toResponseDto(result.previousMandate) : null,
      newMandate: AssociationMandateMapper.toResponseDto(result.newMandate),
    };
  }

  @Get(':id/mandates/:mandateId/report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rapport moral et financier d’un mandat',
    description: 'Synthèse des actions d’audit, adhésions, baux et transactions de trésorerie sur la période du mandat.',
  })
  @ApiParam({ name: 'id', description: 'Identifiant de l’association' })
  @ApiParam({ name: 'mandateId', description: 'Identifiant du mandat' })
  @ApiResponse({ status: 200, description: 'Rapport de mandat récupéré avec succès.' })
  public async getMandateReport(
    @Param('id') id: string,
    @Param('mandateId') mandateId: string,
  ): Promise<any> {
    return this.getMandateReportQuery.execute(id, mandateId);
  }

  @Put(':id/members/:memberId/professional-info')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Renseigner le profil professionnel d’un membre (Réservé associations professionnelles ou éducatives)',
    description: 'Permet à un membre (ou au bureau) d’insérer ses informations professionnelles uniquement si l’association est de type professionnelle ou éducative.',
  })
  @ApiParam({ name: 'id', description: 'Identifiant de l’association' })
  @ApiParam({ name: 'memberId', description: 'Identifiant du membre' })
  @ApiResponse({
    status: 200,
    description: 'Profil professionnel mis à jour avec succès.',
    type: AssociationMemberResponseDto,
  })
  public async updateMemberProfessionalInfo(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberProfessionalInfoDto,
    @CurrentUser() user: UserAccountEntity,
  ): Promise<AssociationMemberResponseDto> {
    const updated = await this.updateMemberProfessionalInfoUseCase.execute({
      associationId: id,
      memberId,
      requesterUserId: user.id,
      professionalInfo: {
        currentJobTitle: dto.currentJobTitle,
        companyOrOrganization: dto.companyOrOrganization,
        industrySector: dto.industrySector,
        yearsOfExperience: dto.yearsOfExperience,
        highestDegree: dto.highestDegree,
        skills: dto.skills,
        linkedinUrl: dto.linkedinUrl,
        portfolioUrl: dto.portfolioUrl,
        professionalBio: dto.professionalBio,
        isAvailableForMentoring: dto.isAvailableForMentoring,
        lookingForOpportunities: dto.lookingForOpportunities,
      },
    });
    return AssociationMapper.toMemberResponseDto(updated);
  }
}