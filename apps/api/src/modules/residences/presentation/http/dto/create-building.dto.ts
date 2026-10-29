import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Min,
} from 'class-validator';

export class CreateBuildingDto {
  @ApiProperty({
    description: 'Identifiant UUID du quartier / campus parent',
    example: '880e8400-e29b-41d4-a716-446655440011',
    format: 'uuid',
  })
  @IsUUID('4', { message: "L'identifiant du quartier doit être un UUID valide." })
  @IsNotEmpty({ message: "L'identifiant du quartier est obligatoire." })
  quarterId!: string;

  @ApiProperty({
    description: 'Nom ou libellé du bâtiment (villa, pavillon, cité)',
    example: 'Pavillon A - Hassan II',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Le nom du bâtiment doit être une chaîne de caractères.' })
  @Length(2, 100, { message: 'Le nom du bâtiment doit contenir entre 2 et 100 caractères.' })
  @IsNotEmpty({ message: 'Le nom du bâtiment est obligatoire.' })
  name!: string;

  @ApiProperty({
    description: 'Adresse physique exhaustive du bâtiment',
    example: 'Rue 210, Parcelle B, Zogbadjè',
  })
  @IsString({ message: "L'adresse doit être une chaîne de caractères." })
  @IsNotEmpty({ message: "L'adresse du bâtiment est obligatoire." })
  address!: string;

  @ApiProperty({
    description: 'Nom et prénom(s) du propriétaire ou bailleur légal',
    example: 'Dossou Koffi Félix',
    minLength: 2,
    maxLength: 120,
  })
  @IsString({ message: 'Le nom du bailleur doit être une chaîne de caractères.' })
  @Length(2, 120, { message: 'Le nom du bailleur doit contenir entre 2 et 120 caractères.' })
  @IsNotEmpty({ message: 'Le nom du bailleur est obligatoire.' })
  landlordName!: string;

  @ApiPropertyOptional({
    description: 'Téléphone direct du bailleur (format E.164)',
    example: '+22997001122',
    pattern: '^\\+?[0-9\\s\\-()]{8,18}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s\-()]{8,18}$/, {
    message: 'Le numéro de téléphone du bailleur doit respecter le format international E.164.',
  })
  landlordPhone?: string;

  @ApiPropertyOptional({
    description: 'Coordonnées de paiement des loyers bailleur (IBAN, RIP ou Mobile Money)',
    example: 'MoMo MTN +22997001122 (Dossou Koffi)',
    maxLength: 80,
  })
  @IsOptional()
  @IsString()
  @Length(0, 80, { message: 'Les coordonnées de paiement ne doivent pas dépasser 80 caractères.' })
  landlordIbanOrMomo?: string;

  @ApiPropertyOptional({
    description: "Nombre total d'étages du bâtiment (0 si rez-de-chaussée seul / plain-pied)",
    example: 2,
    default: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Le nombre d’étages doit être un nombre entier.' })
  @Min(0, { message: 'Le nombre d’étages doit être supérieur ou égal à 0 (0 pour rez-de-chaussée uniquement).' })
  floorsCount?: number;
}
