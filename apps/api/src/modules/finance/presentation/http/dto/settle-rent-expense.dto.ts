import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class SettleRentExpenseDto {
  @ApiPropertyOptional({
    description: 'Moyen de paiement utilisé pour payer le bailleur',
    example: 'BANK_TRANSFER',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Notes ou référence bancaire du virement',
    example: 'Virement UBA / Chèque n°0048291',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class GenerateRentExpenseDto {
  @ApiProperty({
    description: 'Identifiant du bail',
    example: '660e8400-e29b-41d4-a716-446655440022',
  })
  @IsUUID('4')
  @IsNotEmpty()
  leaseId!: string;

  @ApiProperty({
    description: 'Mois et année de l’échéance (YYYY-MM)',
    example: '2026-11',
  })
  @IsString()
  @IsNotEmpty()
  monthYear!: string;
}

export class CreateIntegrationFeePlanDto {
  @ApiProperty({
    description: "Identifiant de l'association",
    example: '770e8400-e29b-41d4-a716-446655440099',
  })
  @IsUUID('4')
  @IsNotEmpty()
  associationId!: string;

  @ApiProperty({
    description: 'Année académique (ex: 2026-2027)',
    example: '2026-2027',
  })
  @IsString()
  @IsNotEmpty()
  academicYear!: string;

  @ApiProperty({
    description: 'Intitulé du barème',
    example: 'Forfait Intégration Résidence 2026-2027',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Montant total des frais d’intégration en Francs CFA (XOF)',
    example: 35000,
  })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiPropertyOptional({
    description: 'Nombre de tranches de paiement permises (ex: 2 ou 3)',
    example: 2,
    default: 2,
  })
  @IsOptional()
  @IsNumber()
  installmentsAllowed?: number;
}
