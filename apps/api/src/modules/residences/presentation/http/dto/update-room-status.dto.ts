import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';
import type { RoomStatusValue } from '../../../domain/entities/room.entity.js';

export class UpdateRoomStatusDto {
  @ApiProperty({
    description: 'Nouveau statut de la chambre',
    enum: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'],
    example: 'MAINTENANCE',
  })
  @IsNotEmpty({ message: 'Le statut est obligatoire.' })
  @IsIn(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'], {
    message: 'Le statut doit être AVAILABLE, OCCUPIED ou MAINTENANCE.',
  })
  status!: RoomStatusValue;
}
