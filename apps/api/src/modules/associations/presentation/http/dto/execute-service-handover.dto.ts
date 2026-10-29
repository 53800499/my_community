import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsNumber,
  IsDateString,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OfficerAssignmentDto {
  @ApiProperty({
    description: 'Identifiant UUID de l’adhérent nommé',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    description: 'Nom et prénom complet du responsable',
    example: 'Koffi Mensah',
  })
  @IsString()
  @IsNotEmpty()
  userName!: string;
}

export class OtherOfficerAssignmentDto extends OfficerAssignmentDto {
  @ApiProperty({
    description: 'Identifiant UUID du poste de l’organigramme',
    example: 'stat-log-association-id',
  })
  @IsString()
  @IsNotEmpty()
  positionId!: string;
}

export class ExecuteServiceHandoverDto {
  @ApiProperty({
    description: 'Intitulé officiel ou thématique de la nouvelle mandature',
    example: 'Mandat 2025-2026 : Innovation, Solidarité & Logements',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  mandateTitle!: string;

  @ApiProperty({
    description: 'Année académique ou exercice officiel',
    example: '2025-2026',
  })
  @IsString()
  @IsNotEmpty()
  academicYear!: string;

  @ApiPropertyOptional({
    description: 'Date officielle de la cérémonie de passation (ISO 8601)',
    example: '2025-10-15T10:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  handoverDate?: string;

  @ApiPropertyOptional({
    description: 'Remarques statutaires, passation de documents et archives',
    example: 'Remise des registres d’adhésion, des clés du local et du sceau officiel.',
  })
  @IsOptional()
  @IsString()
  handoverNotes?: string;

  @ApiPropertyOptional({
    description: 'Solde net de trésorerie transmis en FCFA (XOF)',
    example: 450000,
  })
  @IsOptional()
  @IsNumber()
  treasuryTransferredAmount?: number;

  @ApiPropertyOptional({
    description: 'Référence du procès-verbal officiel de passation de service',
    example: 'PV-HANDOVER-2025-001',
  })
  @IsOptional()
  @IsString()
  pvDocumentRef?: string;

  @ApiProperty({
    description: 'Nouveau Président élu',
    type: OfficerAssignmentDto,
  })
  @ValidateNested()
  @Type(() => OfficerAssignmentDto)
  newPresident!: OfficerAssignmentDto;

  @ApiPropertyOptional({
    description: 'Nouveau Secrétaire Général nommé',
    type: OfficerAssignmentDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OfficerAssignmentDto)
  newSecretary?: OfficerAssignmentDto;

  @ApiPropertyOptional({
    description: 'Nouveau Trésorier Général nommé',
    type: OfficerAssignmentDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OfficerAssignmentDto)
  newTreasurer?: OfficerAssignmentDto;

  @ApiPropertyOptional({
    description: 'Autres responsables de commissions ou postes spécifiques',
    type: [OtherOfficerAssignmentDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OtherOfficerAssignmentDto)
  otherOfficers?: OtherOfficerAssignmentDto[];
}
