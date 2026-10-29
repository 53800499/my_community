import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsIn, IsUUID } from 'class-validator';
import type { PostVisibilityType } from '../../../domain/entities/post.entity.js';

export class CreatePostDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    description: 'Identifiant de l’auteur de la publication (UUID v4)',
  })
  @IsUUID('4', { message: 'authorId doit être un UUID v4 valide.' })
  @IsNotEmpty({ message: 'authorId est obligatoire.' })
  authorId!: string;

  @ApiProperty({
    example: 'Grande Journée de Salubrité et d’Embellissement',
    description: 'Titre de la publication (max 255 caractères)',
  })
  @IsString({ message: 'title doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'title est obligatoire.' })
  @MaxLength(255, { message: 'Le titre ne peut pas dépasser 255 caractères.' })
  title!: string;

  @ApiProperty({
    example: 'Rendez-vous samedi à 07h30 pour nettoyer les rues de notre quartier...',
    description: 'Contenu complet de la publication',
  })
  @IsString({ message: 'content doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'content est obligatoire.' })
  content!: string;

  @ApiPropertyOptional({
    example: 'COMMUNITY',
    enum: ['PUBLIC', 'COMMUNITY', 'ASSOCIATION_MEMBERS'],
    default: 'COMMUNITY',
    description: 'Visibilité de la publication citoyenne',
  })
  @IsOptional()
  @IsIn(['PUBLIC', 'COMMUNITY', 'ASSOCIATION_MEMBERS'], {
    message: 'visibility doit être PUBLIC, COMMUNITY ou ASSOCIATION_MEMBERS.',
  })
  visibility?: PostVisibilityType;
}
