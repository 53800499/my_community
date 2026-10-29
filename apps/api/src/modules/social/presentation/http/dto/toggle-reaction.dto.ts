import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsIn, IsUUID } from 'class-validator';
import type {
  ReactionTargetType,
  ReactionValueType,
} from '../../../domain/entities/reaction.entity.js';

export class ToggleReactionDto {
  @ApiProperty({
    description: 'Type de cible de la réaction',
    enum: ['POST', 'COMMENT'],
    example: 'POST',
  })
  @IsNotEmpty({ message: 'Le type de cible est obligatoire.' })
  @IsIn(['POST', 'COMMENT'], { message: "Le type de cible doit être 'POST' ou 'COMMENT'." })
  targetType!: ReactionTargetType;

  @ApiProperty({
    description: 'Identifiant UUID de la publication ou du commentaire ciblé',
    example: '8a556391-ef17-4861-8ff6-bd5bbf2f7223',
  })
  @IsNotEmpty({ message: "L'identifiant de la cible est obligatoire." })
  @IsUUID('4', { message: "L'identifiant de la cible doit être un UUID valide." })
  targetId!: string;

  @ApiProperty({
    description: 'Type de réaction affective',
    enum: ['LIKE', 'LOVE', 'CELEBRATE', 'SUPPORT', 'INSIGHTFUL'],
    example: 'LIKE',
  })
  @IsNotEmpty({ message: 'Le type de réaction est obligatoire.' })
  @IsIn(['LIKE', 'LOVE', 'CELEBRATE', 'SUPPORT', 'INSIGHTFUL'], {
    message: 'Type de réaction non valide.',
  })
  reactionType!: ReactionValueType;
}
