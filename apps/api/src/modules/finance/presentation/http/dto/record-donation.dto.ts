import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class RecordDonationDto {
  @ApiProperty({
    description: "Identifiant de l'association bénéficiaire",
    example: '770e8400-e29b-41d4-a716-446655440099',
  })
  @IsUUID('4')
  @IsNotEmpty()
  associationId!: string;

  @ApiProperty({
    description: 'Nom ou raison sociale du donateur',
    example: 'Fondation d’Aide à l’Éducation',
  })
  @IsString()
  @IsNotEmpty()
  donorName!: string;

  @ApiPropertyOptional({
    description: 'Adresse email du donateur',
    example: 'contact@fondation.org',
  })
  @IsOptional()
  @IsString()
  donorEmail?: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone du donateur',
    example: '+22997000000',
  })
  @IsOptional()
  @IsString()
  donorPhone?: string;

  @ApiProperty({
    description: 'Montant du don en Francs CFA (XOF)',
    example: 50000,
  })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiPropertyOptional({
    description: 'Devise monétaire (par défaut XOF)',
    example: 'XOF',
    default: 'XOF',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Moyen de paiement utilisé',
    example: 'MOBILE_MONEY',
    default: 'MOBILE_MONEY',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Campagne ou événement lié au don',
    example: 'Rentrée Universitaire Solidaire 2026',
  })
  @IsOptional()
  @IsString()
  campaignName?: string;

  @ApiPropertyOptional({
    description: 'Notes ou observations complémentaires',
    example: 'Don fléché pour l’achat de mobilier de résidences',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
