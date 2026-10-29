import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, IsOptional } from 'class-validator';

export class RegisterAssociationDto {
  @ApiProperty({
    description: 'Nom officiel de l’association (min 3, max 200 caractères)',
    minLength: 3,
    maxLength: 200,
    example: 'Association des Jeunes d’Akpakpa pour le Développement',
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'Le nom de l’association est obligatoire.' })
  @Length(3, 200, {
    message: 'Le nom doit comporter entre 3 et 200 caractères.',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Sigle ou acronyme usuel (max 50 caractères)',
    maxLength: 50,
    example: 'AJAD',
  })
  @IsOptional()
  @IsString({ message: 'L’acronyme doit être une chaîne de caractères.' })
  @Length(1, 50, {
    message: 'L’acronyme ne peut pas dépasser 50 caractères.',
  })
  acronym?: string;

  @ApiPropertyOptional({
    description: 'Numéro d’enregistrement officiel (RNA ou récépissé préfectoral)',
    example: 'BEN-LIT-2026-A123',
  })
  @IsOptional()
  @IsString({ message: 'Le numéro d’enregistrement doit être une chaîne de caractères.' })
  @Length(2, 100, {
    message: 'Le numéro d’enregistrement doit comporter entre 2 et 100 caractères.',
  })
  registrationNumber?: string;

  @ApiPropertyOptional({
    description: 'Description de la vocation et des activités associatives',
    example: 'Promotion de l’engagement civique, salubrité et éducation populaire.',
  })
  @IsOptional()
  @IsString({ message: 'La description doit être une chaîne de caractères.' })
  @Length(5, 2000, {
    message: 'La description doit comporter au moins 5 caractères.',
  })
  description?: string;
}
