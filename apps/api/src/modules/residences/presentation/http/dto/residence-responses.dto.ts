import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuarterResponseDto {
  @ApiProperty({ example: '880e8400-e29b-41d4-a716-446655440011' })
  id!: string;

  @ApiProperty({ example: '770e8400-e29b-41d4-a716-446655440099' })
  associationId!: string;

  @ApiProperty({ example: 'Campus d’Abomey-Calavi (UAC)' })
  name!: string;

  @ApiProperty({ example: 'Abomey-Calavi' })
  city!: string;

  @ApiPropertyOptional({ example: 'Foyer universitaire principal et résidences associatives affiliées.' })
  description!: string | null;

  @ApiProperty({ example: '2026-10-22T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-22T10:00:00.000Z' })
  updatedAt!: string;
}

export class BuildingResponseDto {
  @ApiProperty({ example: '990e8400-e29b-41d4-a716-446655440022' })
  id!: string;

  @ApiProperty({ example: '880e8400-e29b-41d4-a716-446655440011' })
  quarterId!: string;

  @ApiProperty({ example: 'Pavillon A - Hassan II' })
  name!: string;

  @ApiProperty({ example: 'Rue 210, Parcelle B, Zogbadjè' })
  address!: string;

  @ApiProperty({ example: 'Dossou Koffi Félix' })
  landlordName!: string;

  @ApiPropertyOptional({ example: '+22997001122' })
  landlordPhone!: string | null;

  @ApiPropertyOptional({ example: 'MoMo MTN +22997001122 (Dossou Koffi)' })
  landlordIbanOrMomo!: string | null;

  @ApiProperty({ example: 2 })
  floorsCount!: number;

  @ApiProperty({ example: '2026-10-22T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-22T10:00:00.000Z' })
  updatedAt!: string;
}

export class RoomResponseDto {
  @ApiProperty({ example: 'aa0e8400-e29b-41d4-a716-446655440033' })
  id!: string;

  @ApiProperty({ example: '990e8400-e29b-41d4-a716-446655440022' })
  buildingId!: string;

  @ApiProperty({ example: 'CH-102' })
  roomNumber!: string;

  @ApiProperty({ example: 2 })
  capacity!: number;

  @ApiProperty({ example: 'AVAILABLE', enum: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'] })
  status!: string;

  @ApiProperty({ example: '2026-10-22T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-22T10:00:00.000Z' })
  updatedAt!: string;
}

export class RoomOccupationResponseDto {
  @ApiProperty({ example: 'bb0e8400-e29b-41d4-a716-446655440044' })
  id!: string;

  @ApiProperty({ example: 'aa0e8400-e29b-41d4-a716-446655440033' })
  roomId!: string;

  @ApiProperty({ example: 'd3b07384-d113-494b-9c8e-324b917d23a1' })
  occupantUserId!: string;

  @ApiProperty({ example: '770e8400-e29b-41d4-a716-446655440099' })
  associationId!: string;

  @ApiProperty({ example: '2026-11-01T00:00:00.000Z' })
  startDate!: string;

  @ApiPropertyOptional({ example: '2027-06-30T00:00:00.000Z' })
  endDate!: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: 'ACTIVE', enum: ['PENDING', 'ACTIVE', 'TERMINATED', 'CANCELLED'] })
  status!: string;

  @ApiProperty({ example: '2026-10-22T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-22T10:00:00.000Z' })
  updatedAt!: string;
}
