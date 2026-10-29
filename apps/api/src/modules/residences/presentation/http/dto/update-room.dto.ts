import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
import type { RoomStatusValue } from '../../../domain/entities/room.entity.js';

export class UpdateRoomDto {
  @ApiPropertyOptional({
    description: 'Nouveau numéro ou code de chambre',
    example: 'B-102-BIS',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Le numéro de chambre doit être une chaîne de caractères.' })
  @Length(1, 50, { message: 'Le numéro de chambre doit comporter entre 1 et 50 caractères.' })
  roomNumber?: string;

  @ApiPropertyOptional({
    description: 'Capacité maximale en lits',
    example: 2,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'La capacité de la chambre doit être un entier.' })
  @Min(1, { message: 'La capacité doit être au moins de 1 lit.' })
  capacity?: number;

  @ApiPropertyOptional({
    description: 'Statut physique ou de disponibilité',
    enum: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'],
    example: 'AVAILABLE',
  })
  @IsOptional()
  @IsIn(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'], {
    message: 'Le statut doit être AVAILABLE, OCCUPIED ou MAINTENANCE.',
  })
  status?: RoomStatusValue;
}
