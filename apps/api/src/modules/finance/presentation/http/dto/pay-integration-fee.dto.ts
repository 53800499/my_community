import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class CallIntegrationFeeDueDto {
  @ApiProperty({
    description: "Identifiant du contrat d'occupation de chambre",
    example: '440e8400-e29b-41d4-a716-446655440044',
  })
  @IsUUID('4')
  @IsNotEmpty()
  occupationId!: string;

  @ApiProperty({
    description: "Identifiant de l'étudiant entrant",
    example: '880e8400-e29b-41d4-a716-446655440011',
  })
  @IsUUID('4')
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    description: 'Identifiant du barème applicable',
    example: '330e8400-e29b-41d4-a716-446655440033',
  })
  @IsUUID('4')
  @IsNotEmpty()
  planId!: string;

  @ApiPropertyOptional({
    description: 'Date limite de paiement',
    example: '2026-11-15',
  })
  @IsOptional()
  dueDate?: string;
}

export class PayIntegrationFeeDto {
  @ApiProperty({
    description: 'Montant versé pour cette tranche en XOF',
    example: 20000,
  })
  @IsNumber()
  @IsPositive({ message: 'Le montant versé doit être supérieur à zéro.' })
  amount!: number;

  @ApiProperty({
    description: 'Mode de paiement (CASH, MOBILE_MONEY, BANK_TRANSFER)',
    example: 'MOBILE_MONEY',
  })
  @IsString()
  @IsNotEmpty()
  paymentMethod!: string;
}
