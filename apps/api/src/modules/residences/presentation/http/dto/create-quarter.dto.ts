import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateQuarterDto {
  @ApiProperty({
    description: "Identifiant UUID de l'association gestionnaire de la résidence/campus",
    example: '770e8400-e29b-41d4-a716-446655440099',
    format: 'uuid',
  })
  @IsUUID('4', { message: "L'identifiant de l'association doit être un UUID valide." })
  @IsNotEmpty({ message: "L'identifiant de l'association est obligatoire." })
  associationId!: string;

  @ApiProperty({
    description: 'Nom ou libellé du quartier / campus / cité universitaire',
    example: 'Campus d’Abomey-Calavi (UAC)',
    minLength: 2,
    maxLength: 120,
  })
  @IsString({ message: 'Le nom du quartier doit être une chaîne de caractères.' })
  @Length(2, 120, { message: 'Le nom du quartier doit contenir entre 2 et 120 caractères.' })
  @IsNotEmpty({ message: 'Le nom du quartier est obligatoire.' })
  name!: string;

  @ApiProperty({
    description: 'Ville d’implantation du campus ou quartier',
    example: 'Abomey-Calavi',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'La ville doit être une chaîne de caractères.' })
  @Length(2, 100, { message: 'La ville doit contenir entre 2 et 100 caractères.' })
  @IsNotEmpty({ message: 'La ville est obligatoire.' })
  city!: string;

  @ApiPropertyOptional({
    description: 'Description détaillée ou historique du quartier / campus',
    example: 'Foyer universitaire principal et résidences associatives affiliées.',
  })
  @IsOptional()
  @IsString({ message: 'La description doit être une chaîne de caractères.' })
  description?: string;
}
