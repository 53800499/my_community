import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { RegisterUseCase } from '../../../application/commands/register.use-case.js';
import { LoginUseCase } from '../../../application/commands/login.use-case.js';
import { RegisterDto } from '../dto/register.dto.js';
import { LoginDto } from '../dto/login.dto.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { UserAccountEntity } from '../../../domain/entities/user-account.entity.js';
import {
  IdentityMapper,
  AuthSuccessResponseDto,
  UserAccountResponseDto,
} from '../../../infrastructure/mappers/identity.mapper.js';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

/**
 * Contrôleur REST : Authentification et Identité (AuthController)
 * Conforme SOLID :
 * - Contrôleur mince : délègue immédiatement aux cas d'usage applicatifs.
 * - Aucune logique métier interne.
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Inscription citoyenne',
    description:
      'Crée un nouveau compte citoyen avec validation du numéro de téléphone (Bénin / International), hachage Scrypt et émission d’un jeton de session JWT.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Compte citoyen créé et jeton de session JWT émis avec succès.',
    type: AuthSuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erreur de validation (mot de passe < 8 caractères, format téléphone ou email invalide).',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflit : un compte existe déjà avec ce numéro de téléphone ou cet email.',
  })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
  ): Promise<AuthSuccessResponseDto> {
    const result = await this.registerUseCase.execute({
      phoneNumber: dto.phoneNumber,
      password: dto.password,
      email: dto.email,
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });

    return IdentityMapper.toAuthResponse(result.account, result.token);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connexion citoyenne',
    description:
      'Authentifie un citoyen à l’aide de son identifiant (numéro de téléphone ou email) et de son mot de passe.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie et émission d’un jeton JWT valide pour 7 jours.',
    type: AuthSuccessResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Identifiants incorrects (mot de passe erroné ou utilisateur introuvable).',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé : compte suspendu ou verrouillé.',
  })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<AuthSuccessResponseDto> {
    const result = await this.loginUseCase.execute({
      identifier: dto.identifier,
      password: dto.password,
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });

    return IdentityMapper.toAuthResponse(result.account, result.token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Consultation du compte connecté',
    description:
      'Retourne les informations du compte actuellement authentifié à l’aide du jeton Bearer JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Compte utilisateur actif récupéré avec succès.',
    type: UserAccountResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié : jeton JWT manquant, invalide ou expiré.',
  })
  async getProfile(
    @CurrentUser() user: UserAccountEntity,
  ): Promise<UserAccountResponseDto> {
    return IdentityMapper.toUserDto(user);
  }
}
