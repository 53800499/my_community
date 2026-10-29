import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, IsUUID } from 'class-validator';

/**
 * DTO de Soumission d'une Proposition Citoyenne de Communauté
 * Documenté exhaustivement pour Swagger / OpenAPI avec formats, regex et contraintes.
 */
export class SubmitProposalDto {
  @ApiProperty({
    description: 'Nom souhaité pour la communauté citoyenne (min 2, max 150 caractères)',
    minLength: 2,
    maxLength: 150,
    example: 'Akpakpa Centre',
  })
  @IsString({ message: 'Le nom de la communauté doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'Le nom de la communauté est obligatoire.' })
  @Length(2, 150, {
    message: 'Le nom de la communauté doit comporter entre 2 et 150 caractères.',
  })
  name!: string;

  @ApiProperty({
    description: 'Description claire des objectifs et de la portée de la communauté (min 10 caractères)',
    minLength: 10,
    example: 'Espace citoyen et d’échange pour les résidents et commerçants du quartier Akpakpa.',
  })
  @IsString({ message: 'La description doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'La description est obligatoire.' })
  @Length(10, 2000, {
    message: 'La description doit comporter au moins 10 caractères.',
  })
  description!: string;

  @ApiProperty({
    description: 'Justification citoyenne et pertinence territoriale (min 10 caractères)',
    minLength: 10,
    example: 'Besoin d’un canal unifié pour coordonner les actions de propreté et la sécurité locale.',
  })
  @IsString({ message: 'La justification doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'La justification est obligatoire.' })
  @Length(10, 2000, {
    message: 'La justification doit comporter au moins 10 caractères.',
  })
  justification!: string;

  @ApiProperty({
    description: 'Identifiant UUID du territoire géographique de rattachement',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  })
  @IsUUID('4', { message: 'Le territoire doit être un identifiant UUID v4 valide.' })
  @IsNotEmpty({ message: 'Le territoire de rattachement est obligatoire.' })
  territoryId!: string;
}
