import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, MinLength } from 'class-validator';

export class CreateAssociationPositionDto {
  @ApiProperty({
    description: 'Titre officiel du poste dans l’association',
    example: 'Chargé aux Résidences & Logements',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  title: string;

  @ApiPropertyOptional({
    description: 'Rôle système de base (RBAC)',
    enum: ['MEMBER', 'PRESIDENT', 'SECRETARY', 'TREASURER', 'BOARD_MEMBER'],
    default: 'BOARD_MEMBER',
  })
  @IsOptional()
  @IsEnum(['MEMBER', 'PRESIDENT', 'SECRETARY', 'TREASURER', 'BOARD_MEMBER'])
  roleCategory?: 'MEMBER' | 'PRESIDENT' | 'SECRETARY' | 'TREASURER' | 'BOARD_MEMBER';

  @ApiPropertyOptional({
    description: 'Pôle ou département organisationnel',
    example: 'Commission Logements & Résidences',
    default: 'Bureau Exécutif',
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    description: 'Description des attributions et missions du poste',
    example: 'Supervise la gestion locative des résidences, les contrats d’occupations et la médiation des résidents.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Identifiant de l’utilisateur à nommer immédiatement (optionnel)',
  })
  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @ApiPropertyOptional({
    description: 'Nom complet du membre nommé',
  })
  @IsOptional()
  @IsString()
  assignedUserName?: string;
}
