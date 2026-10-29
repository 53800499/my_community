import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsIn, IsString, IsOptional, Length } from 'class-validator';

/**
 * DTO d'Instruction Administrative d'une Proposition de Communauté
 * Documenté exhaustivement pour Swagger / OpenAPI.
 */
export class ReviewProposalDto {
  @ApiProperty({
    description: 'Décision administrative de validation ou de rejet',
    enum: ['APPROVED', 'REJECTED'],
    example: 'APPROVED',
  })
  @IsNotEmpty({ message: 'La décision administrative est obligatoire.' })
  @IsIn(['APPROVED', 'REJECTED'], {
    message: 'La décision doit être soit APPROVED, soit REJECTED.',
  })
  decision!: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({
    description: 'Motif explicatif obligatoire en cas de rejet (min 5 caractères)',
    minLength: 5,
    example: 'Le territoire spécifié est déjà couvert par la communauté Cotonou Littoral.',
  })
  @IsOptional()
  @IsString({ message: 'Le motif de rejet doit être une chaîne de caractères.' })
  @Length(5, 1000, {
    message: 'Le motif de rejet doit comporter au moins 5 caractères.',
  })
  rejectionReason?: string;
}
