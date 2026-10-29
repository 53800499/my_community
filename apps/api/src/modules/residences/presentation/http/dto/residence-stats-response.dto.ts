import { ApiProperty } from '@nestjs/swagger';

export class ResidenceStatsResponseDto {
  @ApiProperty({ example: 4, description: 'Nombre total de campus ou quartiers' })
  totalQuarters!: number;

  @ApiProperty({ example: 12, description: 'Nombre total de bâtiments gérés' })
  totalBuildings!: number;

  @ApiProperty({ example: 85, description: 'Nombre total de chambres physiques' })
  totalRooms!: number;

  @ApiProperty({ example: 140, description: 'Capacité totale d’accueil en lits' })
  totalCapacity!: number;

  @ApiProperty({ example: 52, description: 'Nombre de chambres actuellement occupées' })
  occupiedRooms!: number;

  @ApiProperty({ example: 30, description: 'Nombre de chambres disponibles à l’attribution' })
  availableRooms!: number;

  @ApiProperty({ example: 3, description: 'Nombre de chambres actuellement en travaux ou maintenance' })
  maintenanceRooms!: number;

  @ApiProperty({ example: 68, description: 'Nombre total de baux d’occupation en cours' })
  activeOccupations!: number;

  @ApiProperty({ example: 61.2, description: 'Taux d’occupation en pourcentage' })
  occupancyRate!: number;
}
