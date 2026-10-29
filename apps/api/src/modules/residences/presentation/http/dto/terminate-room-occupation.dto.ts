import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class TerminateRoomOccupationDto {
  @ApiPropertyOptional({
    description: 'Date effective de libération de la chambre / fin de séjour (défaut : date courante)',
    example: '2026-12-31T23:59:59.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La date de fin doit être une chaîne au format ISO 8601 valide.' })
  endDate?: string;
}
