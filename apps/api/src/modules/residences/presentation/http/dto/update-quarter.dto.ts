import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateQuarterDto {
  @ApiPropertyOptional({
    description: 'Nouveau nom ou libellé du quartier / campus',
    example: 'Campus Universitaire Principal d’Abomey-Calavi',
    minLength: 2,
    maxLength: 120,
  })
  @IsOptional()
  @IsString({ message: 'Le nom du quartier doit être une chaîne de caractères.' })
  @Length(2, 120, { message: 'Le nom du quartier doit contenir entre 2 et 120 caractères.' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Ville d’implantation du campus ou quartier',
    example: 'Abomey-Calavi',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'La ville doit être une chaîne de caractères.' })
  @Length(2, 100, { message: 'La ville doit contenir entre 2 et 100 caractères.' })
  city?: string;

  @ApiPropertyOptional({
    description: 'Description détaillée ou mise à jour',
    example: 'Campus central rénové et agrandi.',
  })
  @IsOptional()
  @IsString({ message: 'La description doit être une chaîne de caractères.' })
  description?: string;
}
