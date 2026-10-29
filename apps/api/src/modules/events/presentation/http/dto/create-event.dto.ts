import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  IsUUID,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    description: 'Identifiant UUID de la communauté organisatrice',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: "L'identifiant de la communauté doit être un UUID v4 valide." })
  @IsNotEmpty({ message: "L'identifiant de la communauté est obligatoire." })
  communityId!: string;

  @ApiProperty({
    description: "Titre de l'événement citoyen",
    maxLength: 200,
    example: 'Opération Salubrité & Arbre Citoyen',
  })
  @IsString({ message: 'Le titre doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'Le titre est obligatoire.' })
  @MaxLength(200, { message: 'Le titre ne peut pas dépasser 200 caractères.' })
  title!: string;

  @ApiProperty({
    description: "Description complète et déroulement de l'événement",
    example: 'Rassemblement citoyen pour le nettoyage du quartier et la plantation de jeunes pousses.',
  })
  @IsString({ message: 'La description doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'La description est obligatoire.' })
  description!: string;

  @ApiProperty({
    description: 'Lieu ou adresse du rassemblement',
    example: 'Esplanade du Campus Tankpè, Abomey-Calavi',
  })
  @IsString({ message: 'Le lieu doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'Le lieu est obligatoire.' })
  location!: string;

  @ApiProperty({
    description: 'Date et heure de début au format ISO 8601',
    example: '2026-11-15T09:00:00Z',
  })
  @IsDateString({}, { message: 'La date de début doit être au format ISO 8601 valide.' })
  @IsNotEmpty({ message: 'La date de début est obligatoire.' })
  startsAt!: string;

  @ApiProperty({
    description: 'Date et heure de fin au format ISO 8601',
    example: '2026-11-15T12:00:00Z',
  })
  @IsDateString({}, { message: 'La date de fin doit être au format ISO 8601 valide.' })
  @IsNotEmpty({ message: 'La date de fin est obligatoire.' })
  endsAt!: string;

  @ApiPropertyOptional({
    description: "Nombre maximum de participants (jauge d'inscription)",
    example: 50,
  })
  @IsOptional()
  @IsInt({ message: 'La capacité maximale doit être un entier.' })
  @Min(1, { message: 'La capacité maximale doit être au moins 1.' })
  maxAttendees?: number;
}
