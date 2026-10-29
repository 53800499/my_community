import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class RecordExpenseDto {
  @ApiProperty({
    description: "Identifiant de l'association débitée",
    example: '770e8400-e29b-41d4-a716-446655440099',
  })
  @IsUUID('4')
  @IsNotEmpty()
  associationId!: string;

  @ApiProperty({
    description: 'Intitulé ou motif de la dépense',
    example: 'Achat de fournitures pour le bureau',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Catégorie de la dépense (ex: LOGISTIQUE, LOYER_BAILLEUR, EVENEMENT, EQUIPEMENT, AIDE_SOCIALE, AUTRE)',
    example: 'EQUIPEMENT',
  })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiProperty({
    description: 'Montant de la dépense en Francs CFA (XOF)',
    example: 45000,
  })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiPropertyOptional({
    description: 'Devise de la dépense',
    example: 'XOF',
    default: 'XOF',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: 'Bénéficiaire, fournisseur ou prestataire',
    example: 'Librairie Universitaire Moderne',
  })
  @IsString()
  @IsNotEmpty()
  beneficiary!: string;

  @ApiPropertyOptional({
    description: 'Moyen de paiement (CASH, MOBILE_MONEY, BANK_TRANSFER, CHECK)',
    example: 'MOBILE_MONEY',
    default: 'MOBILE_MONEY',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Statut initial (PAID si directement décaissé, PENDING_APPROVAL si soumis à validation)',
    example: 'PAID',
    default: 'PAID',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Référence du reçu ou numéro de facture justificative',
    example: 'FAC-2026-089',
  })
  @IsOptional()
  @IsString()
  receiptRef?: string;

  @ApiPropertyOptional({
    description: 'Notes ou justificatifs complémentaires',
    example: 'Facture validée par le trésorier adjoint',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApproveExpenseDto {
  @ApiPropertyOptional({
    description: 'Commentaires de validation éventuels',
    example: 'Dépense conforme au budget alloué',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
