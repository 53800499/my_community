import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../identity/presentation/http/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../../identity/presentation/http/decorators/current-user.decorator.js';
import { UserAccountEntity } from '../../../../identity/domain/entities/user-account.entity.js';
import { UpdateProfileUseCase } from '../../../application/commands/update-profile.use-case.js';
import { GetUserProfileQuery } from '../../../application/queries/get-user-profile.query.js';
import { UpdateProfileDto } from '../dto/update-profile.dto.js';
import {
  UserMapper,
  UserProfileResponseDto,
} from '../../../infrastructure/mappers/user.mapper.js';

/**
 * Contrôleur REST : Profils Utilisateurs (UsersController)
 * Conforme SOLID : Contrôleur mince, délègue immédiatement aux cas d'usage applicatifs.
 */
@ApiTags('Utilisateurs')
@Controller('users')
export class UsersController {
  constructor(
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly getUserProfileQuery: GetUserProfileQuery,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mon profil citoyen',
    description: 'Consulte le profil de l’utilisateur actuellement connecté via son jeton JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profil récupéré avec succès.',
    type: UserProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Jeton manquant ou expiré.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profil non encore initialisé.',
  })
  async getMyProfile(
    @CurrentUser() user: UserAccountEntity,
  ): Promise<UserProfileResponseDto> {
    const profile = await this.getUserProfileQuery.execute(user.id);
    return UserMapper.toResponseDto(profile);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mettre à jour mon profil citoyen',
    description: 'Met à jour ou initialise le prénom, nom, bio, ville et avatar de l’utilisateur connecté.',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Profil mis à jour avec succès.',
    type: UserProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides (champs obligatoires manquants lors de l’initialisation).',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié.',
  })
  async updateMyProfile(
    @CurrentUser() user: UserAccountEntity,
    @Body() dto: UpdateProfileDto,
    @Req() req: Request,
  ): Promise<UserProfileResponseDto> {
    const updated = await this.updateProfileUseCase.execute({
      userId: user.id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      bio: dto.bio,
      city: dto.city,
      avatarKey: dto.avatarKey,
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });

    return UserMapper.toResponseDto(updated);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulter un profil citoyen public',
    description: 'Affiche la fiche publique d’un citoyen à partir de son identifiant utilisateur.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de l’utilisateur',
    example: 'd3b07384-d113-494b-9c8e-324b917d23a1',
  })
  @ApiResponse({
    status: 200,
    description: 'Fiche publique trouvée.',
    type: UserProfileResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Profil introuvable pour cet identifiant.',
  })
  async getProfileById(
    @Param('id') userId: string,
  ): Promise<UserProfileResponseDto> {
    const profile = await this.getUserProfileQuery.execute(userId);
    return UserMapper.toResponseDto(profile);
  }
}
