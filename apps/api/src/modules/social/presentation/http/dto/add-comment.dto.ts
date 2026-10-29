import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsUUID } from 'class-validator';

export class AddCommentDto {
  @ApiProperty({
    description: 'Corps du commentaire (maximum 1 000 caractères)',
    example: 'Excellente initiative citoyenne pour notre quartier !',
  })
  @IsNotEmpty({ message: 'Le commentaire ne peut pas être vide.' })
  @IsString({ message: 'Le commentaire doit être une chaîne de caractères.' })
  @MaxLength(1000, { message: 'Le commentaire ne peut pas excéder 1 000 caractères.' })
  content!: string;

  @ApiPropertyOptional({
    description: "Identifiant UUID du commentaire parent si c'est une réponse",
    example: '8a556391-ef17-4861-8ff6-bd5bbf2f7223',
  })
  @IsOptional()
  @IsUUID('4', { message: "L'identifiant parent doit être un UUID valide." })
  parentId?: string;
}
