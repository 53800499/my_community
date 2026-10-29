import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    description: 'Identifiant UUID du bâtiment dans lequel se situe la chambre',
    example: '990e8400-e29b-41d4-a716-446655440022',
    format: 'uuid',
  })
  @IsUUID('4', { message: "L'identifiant du bâtiment doit être un UUID valide." })
  @IsNotEmpty({ message: "L'identifiant du bâtiment est obligatoire." })
  buildingId!: string;

  @ApiProperty({
    description: 'Numéro ou code unique de la chambre dans le bâtiment',
    example: 'CH-102',
    minLength: 1,
    maxLength: 50,
  })
  @IsString({ message: 'Le numéro de chambre doit être une chaîne de caractères.' })
  @Length(1, 50, { message: 'Le numéro de chambre doit contenir entre 1 et 50 caractères.' })
  @IsNotEmpty({ message: 'Le numéro de chambre est obligatoire.' })
  roomNumber!: string;

  @ApiPropertyOptional({
    description: 'Capacité maximale d’accueil en lits de la chambre (ADR-010)',
    example: 2,
    default: 1,
    minimum: 1,
    maximum: 20,
  })
  @IsOptional()
  @IsInt({ message: 'La capacité doit être un nombre entier.' })
  @Min(1, { message: 'La capacité minimale est de 1 lit.' })
  @Max(20, { message: 'La capacité maximale est plafonnée à 20 lits.' })
  capacity?: number;
}
