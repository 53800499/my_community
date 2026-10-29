import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsDateString,
  IsBoolean,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MandateOfficerInputDto {
  @ApiPropertyOptional({ description: 'Identifiant du poste' })
  @IsOptional()
  @IsString()
  positionId?: string;

  @ApiProperty({ description: 'Titre officiel du poste' })
  @IsString()
  @IsNotEmpty()
  positionTitle!: string;

  @ApiProperty({ description: 'Identifiant UUID de l’adhérent' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ description: 'Nom complet de l’adhérent' })
  @IsString()
  @IsNotEmpty()
  userName!: string;

  @ApiProperty({ description: 'Catégorie de rôle (PRESIDENT, SECRETARY, TREASURER, etc.)' })
  @IsString()
  @IsNotEmpty()
  roleCategory!: string;
}

export class CreateAssociationMandateDto {
  @ApiProperty({
    description: 'Titre officiel ou dénomination du mandat (défini librement par l’utilisateur)',
    example: 'Mandat 2026-2028 : Solidarité, Excellence & Emploi',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title!: string;

  @ApiProperty({
    description: 'Période ou année d’exercice (ex: 2026-2028, 2026-2027)',
    example: '2026-2028',
  })
  @IsString()
  @IsNotEmpty()
  academicYear!: string;

  @ApiProperty({
    description: 'Date de début officiel du mandat (ISO 8601)',
    example: '2026-10-01T00:00:00.000Z',
  })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional({
    description: 'Date de fin prévisionnelle du mandat (ISO 8601)',
    example: '2028-09-30T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Notes d’orientation, feuille de route ou vision du mandat',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Identifiant UUID du Président élu pour ce mandat',
  })
  @IsString()
  @IsNotEmpty()
  presidentUserId!: string;

  @ApiProperty({
    description: 'Nom complet du Président élu',
  })
  @IsString()
  @IsNotEmpty()
  presidentName!: string;

  @ApiPropertyOptional({
    description: 'Identifiant UUID du Secrétaire Général',
  })
  @IsOptional()
  @IsString()
  secretaryUserId?: string;

  @ApiPropertyOptional({
    description: 'Nom complet du Secrétaire Général',
  })
  @IsOptional()
  @IsString()
  secretaryName?: string;

  @ApiPropertyOptional({
    description: 'Identifiant UUID du Trésorier Général',
  })
  @IsOptional()
  @IsString()
  treasurerUserId?: string;

  @ApiPropertyOptional({
    description: 'Nom complet du Trésorier Général',
  })
  @IsOptional()
  @IsString()
  treasurerName?: string;

  @ApiPropertyOptional({
    description: 'Membres et responsables de commissions sous ce mandat',
    type: [MandateOfficerInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MandateOfficerInputDto)
  officers?: MandateOfficerInputDto[];

  @ApiPropertyOptional({
    description: 'Activer immédiatement ce mandat comme mandat actif de l’association (défaut: true)',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  setAsActive?: boolean;
}
