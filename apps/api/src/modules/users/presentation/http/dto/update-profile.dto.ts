import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Prénom du citoyen',
    example: 'Alice',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Le prénom doit être une chaîne de caractères.' })
  @MaxLength(100, { message: 'Le prénom ne peut pas dépasser 100 caractères.' })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Nom de famille du citoyen',
    example: 'Bio',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Le nom de famille doit être une chaîne de caractères.' })
  @MaxLength(100, { message: 'Le nom de famille ne peut pas dépasser 100 caractères.' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Courte biographie ou présentation citoyenne',
    example: 'Habitante engagée de Cotonou, active dans les initiatives locales de quartier.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'La biographie doit être une chaîne de caractères.' })
  @MaxLength(1000, { message: 'La biographie ne peut pas dépasser 1000 caractères.' })
  bio?: string;

  @ApiPropertyOptional({
    description: 'Ville ou commune de résidence principale',
    example: 'Cotonou',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'La ville doit être une chaîne de caractères.' })
  @MaxLength(100, { message: 'La ville ne peut pas dépasser 100 caractères.' })
  city?: string;

  @ApiPropertyOptional({
    description: 'Clé d’accès S3 de l’avatar téléchargé',
    example: 'avatars/d3b07384-d113-494b-9c8e-324b917d23a1.webp',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'La clé avatar doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'La clé avatar ne peut pas dépasser 255 caractères.' })
  avatarKey?: string;
}
