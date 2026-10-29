import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AssignRoomOccupationDto {
  @ApiProperty({
    description: 'Identifiant UUID de la chambre attribuée',
    example: 'aa0e8400-e29b-41d4-a716-446655440033',
    format: 'uuid',
  })
  @IsUUID('4', { message: "L'identifiant de la chambre doit être un UUID valide." })
  @IsNotEmpty({ message: "L'identifiant de la chambre est obligatoire." })
  roomId!: string;

  @ApiProperty({
    description: "Identifiant UUID de l'utilisateur résident / occupant (ADR-010)",
    example: 'd3b07384-d113-494b-9c8e-324b917d23a1',
    format: 'uuid',
  })
  @IsUUID('4', { message: "L'identifiant de l'occupant doit être un UUID valide." })
  @IsNotEmpty({ message: "L'identifiant de l'occupant est obligatoire." })
  occupantUserId!: string;

  @ApiProperty({
    description: "Identifiant UUID de l'association gestionnaire",
    example: '770e8400-e29b-41d4-a716-446655440099',
    format: 'uuid',
  })
  @IsUUID('4', { message: "L'identifiant de l'association doit être un UUID valide." })
  @IsNotEmpty({ message: "L'identifiant de l'association est obligatoire." })
  associationId!: string;

  @ApiProperty({
    description: 'Date de début effectif du séjour / bail (ISO 8601)',
    example: '2026-11-01T00:00:00.000Z',
    format: 'date-time',
  })
  @IsDateString({}, { message: 'La date de début doit être une chaîne au format ISO 8601 valide.' })
  @IsNotEmpty({ message: 'La date de début est obligatoire.' })
  startDate!: string;

  @ApiPropertyOptional({
    description: 'Date prévisionnelle de fin de séjour (ISO 8601)',
    example: '2027-06-30T00:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La date de fin doit être une chaîne au format ISO 8601 valide.' })
  endDate?: string;

  @ApiPropertyOptional({
    description: "Autoriser un surplus d'occupants en cas de besoin (ex: chambre 4 places recevant un 5ème occupant)",
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'allowSurplus doit être un booléen.' })
  allowSurplus?: boolean;

  @ApiPropertyOptional({
    description: 'Motif du surplus solidaire admis en cas de besoin',
    example: 'Hébergement d’urgence étudiant en période de rentrée',
  })
  @IsOptional()
  @IsString({ message: 'Le motif de surplus doit être une chaîne de caractères.' })
  surplusReason?: string;
}
