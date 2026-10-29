import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateTransactionDto {
  @ApiPropertyOptional({
    description: "Identifiant de l'association",
    example: '770e8400-e29b-41d4-a716-446655440099',
  })
  @IsOptional()
  @IsUUID('4')
  associationId?: string;

  @ApiProperty({
    description: 'Montant de la transaction en Francs CFA (XOF)',
    example: 25000,
  })
  @IsNumber()
  @IsPositive({ message: 'Le montant doit être supérieur à zéro.' })
  amount!: number;

  @ApiProperty({
    description: 'Type de flux financier',
    enum: ['INCOME', 'EXPENSE', 'TRANSFER', 'ADJUSTMENT'],
    example: 'INCOME',
  })
  @IsIn(['INCOME', 'EXPENSE', 'TRANSFER', 'ADJUSTMENT'])
  type!: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'ADJUSTMENT';

  @ApiPropertyOptional({
    description: 'Référence externe de paiement (ex: MOMO-BJ-...)',
    example: 'MTN-BJ-84729103',
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({
    description: 'Description du motif de paiement',
    example: 'Versement trimestriel des cotisations',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Catégorie comptable',
    example: 'COTISATION',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Moyen de paiement utilisé',
    example: 'MOBILE_MONEY',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

export class CreateAdjustmentDto {
  @ApiProperty({
    description: 'Montant rectificatif en XOF',
    example: 5000,
  })
  @IsNumber()
  @IsPositive({ message: "Le montant d'ajustement doit être supérieur à zéro." })
  adjustmentAmount!: number;

  @ApiProperty({
    description: "Motif obligatoire de l'ajustement comptable compensatoire",
    example: 'Rectification erreur de saisie caisse Mobile Money',
  })
  @IsString()
  @IsNotEmpty({ message: "Le motif de l'ajustement est obligatoire." })
  reason!: string;
}
