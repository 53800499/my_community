import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class RecordCotisationDto {
  @ApiProperty({
    description: "Identifiant de l'association",
    example: '770e8400-e29b-41d4-a716-446655440099',
  })
  @IsUUID('4')
  @IsNotEmpty()
  associationId!: string;

  @ApiProperty({
    description: 'Identifiant du membre adhérent',
    example: '880e8400-e29b-41d4-a716-446655440011',
  })
  @IsUUID('4')
  @IsNotEmpty()
  memberId!: string;

  @ApiProperty({
    description: 'Montant de la cotisation en XOF',
    example: 1000,
  })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({
    description: 'Période concernée (ex: 2026-10)',
    example: '2026-10',
  })
  @IsString()
  @IsNotEmpty()
  period!: string;

  @ApiPropertyOptional({
    description: 'Moyen de paiement',
    example: 'MOBILE_MONEY',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Notes ou observations',
    example: 'Paiement effectué via MTN Mobile Money',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateBuildingLeaseDto {
  @ApiProperty({
    description: 'Identifiant du bâtiment loué',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID('4')
  @IsNotEmpty()
  buildingId!: string;

  @ApiProperty({
    description: "Identifiant de l'association preneuse du bail",
    example: '770e8400-e29b-41d4-a716-446655440099',
  })
  @IsUUID('4')
  @IsNotEmpty()
  associationId!: string;

  @ApiProperty({
    description: 'Montant du loyer mensuel en Francs CFA (XOF) versé au bailleur',
    example: 350000,
  })
  @IsNumber()
  @IsPositive()
  monthlyRentAmount!: number;

  @ApiPropertyOptional({
    description: 'Jour du mois fixé pour le paiement au propriétaire (1-28)',
    example: 5,
    default: 5,
  })
  @IsOptional()
  @IsNumber()
  paymentDayOfMonth?: number;

  @ApiProperty({
    description: 'Date de début du bail',
    example: '2026-01-01',
  })
  @IsNotEmpty()
  leaseStartDate!: string;

  @ApiPropertyOptional({
    description: 'Date de fin du bail éventuelle',
    example: '2027-12-31',
  })
  @IsOptional()
  leaseEndDate?: string;
}
