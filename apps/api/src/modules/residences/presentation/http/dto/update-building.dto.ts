import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class UpdateBuildingDto {
  @ApiPropertyOptional({
    description: 'Nouveau nom du bâtiment',
    example: 'Bâtiment B — Mandela (Rénové)',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Le nom du bâtiment doit être une chaîne de caractères.' })
  @Length(2, 100, { message: 'Le nom du bâtiment doit contenir entre 2 et 100 caractères.' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Adresse physique ou repère géographique',
    example: 'Campus Universitaire, Allée Nelson Mandela, Cotonou',
  })
  @IsOptional()
  @IsString({ message: "L'adresse doit être une chaîne de caractères." })
  address?: string;

  @ApiPropertyOptional({
    description: 'Nom et prénom du propriétaire bailleur légal',
    example: 'Hervé Dossou',
    maxLength: 120,
  })
  @IsOptional()
  @IsString({ message: 'Le nom du bailleur doit être une chaîne de caractères.' })
  @Length(2, 120, { message: 'Le nom du bailleur doit comporter entre 2 et 120 caractères.' })
  landlordName?: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone de contact du propriétaire bailleur',
    example: '+229 97 12 34 56',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Le numéro de téléphone du bailleur doit être une chaîne de caractères.' })
  landlordPhone?: string;

  @ApiPropertyOptional({
    description: 'Coordonnées de paiement des loyers (IBAN ou MoMo)',
    example: 'MTN Mobile Money : +229 97 12 34 56',
    maxLength: 80,
  })
  @IsOptional()
  @IsString({ message: 'Le moyen de paiement du bailleur doit être une chaîne de caractères.' })
  landlordIbanOrMomo?: string;

  @ApiPropertyOptional({
    description: 'Nombre d’étages (0 si rez-de-chaussée seul)',
    example: 4,
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Le nombre d’étages doit être un nombre entier.' })
  @Min(0, { message: 'Le nombre d’étages doit être supérieur ou égal à 0 (0 pour rez-de-chaussée seul).' })
  floorsCount?: number;
}
