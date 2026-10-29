import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsOptional,
  IsDateString,
  IsNumber,
  IsIn,
} from 'class-validator';

export class UpdateAssociationMandateDto {
  @ApiPropertyOptional({
    description: 'Titre officiel du mandat',
    example: 'Mandat 2026-2028 : Solidarité & Croissance',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @ApiPropertyOptional({
    description: 'Période ou année d’exercice',
    example: '2026-2028',
  })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional({
    description: 'Date de début officiel',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Date de fin',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Statut du mandat',
    enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'],
  })
  @IsOptional()
  @IsIn(['ACTIVE', 'COMPLETED', 'ARCHIVED'])
  status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

  @ApiPropertyOptional({
    description: 'Identifiant du Président',
  })
  @IsOptional()
  @IsString()
  presidentUserId?: string;

  @ApiPropertyOptional({
    description: 'Nom du Président',
  })
  @IsOptional()
  @IsString()
  presidentName?: string;

  @ApiPropertyOptional({
    description: 'Identifiant du Secrétaire',
  })
  @IsOptional()
  @IsString()
  secretaryUserId?: string;

  @ApiPropertyOptional({
    description: 'Nom du Secrétaire',
  })
  @IsOptional()
  @IsString()
  secretaryName?: string;

  @ApiPropertyOptional({
    description: 'Identifiant du Trésorier',
  })
  @IsOptional()
  @IsString()
  treasurerUserId?: string;

  @ApiPropertyOptional({
    description: 'Nom du Trésorier',
  })
  @IsOptional()
  @IsString()
  treasurerName?: string;

  @ApiPropertyOptional({
    description: 'Notes de passation ou bilan moral',
  })
  @IsOptional()
  @IsString()
  handoverNotes?: string;

  @ApiPropertyOptional({
    description: 'Solde de trésorerie transmis en FCFA',
  })
  @IsOptional()
  @IsNumber()
  treasuryTransferredAmount?: number;

  @ApiPropertyOptional({
    description: 'Référence du procès-verbal officiel de passation',
  })
  @IsOptional()
  @IsString()
  pvDocumentRef?: string;
}
