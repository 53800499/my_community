import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResidentContractResponseDto {
  @ApiProperty({ description: 'UUID de l’occupation / contrat' })
  public id!: string;

  @ApiProperty({ description: 'UUID de la chambre' })
  public roomId!: string;

  @ApiProperty({ description: 'Numéro de la chambre' })
  public roomNumber!: string;

  @ApiProperty({ description: 'Nom du bâtiment' })
  public buildingName!: string;

  @ApiProperty({ description: 'Nom du campus / quartier' })
  public quarterName!: string;

  @ApiProperty({ description: 'Ville de résidence' })
  public quarterCity!: string;

  @ApiProperty({ description: 'UUID de l’association gestionnaire' })
  public associationId!: string;

  @ApiPropertyOptional({ description: 'Nom de l’association gestionnaire' })
  public associationName?: string;

  @ApiProperty({ description: 'Date de début du séjour (ISO string)' })
  public startDate!: string;

  @ApiPropertyOptional({ description: 'Date de fin du séjour (ISO string)' })
  public endDate!: string | null;

  @ApiProperty({ description: 'Indique si le bail est actif' })
  public isActive!: boolean;

  @ApiProperty({ description: 'Statut du contrat', example: 'ACTIVE' })
  public status!: string;
}

export class CurrentRoomDetailsDto {
  @ApiProperty({ description: 'UUID de la chambre' })
  public roomId!: string;

  @ApiProperty({ description: 'Numéro de chambre' })
  public roomNumber!: string;

  @ApiProperty({ description: 'Nom du bâtiment' })
  public buildingName!: string;

  @ApiProperty({ description: 'Nom du campus' })
  public quarterName!: string;

  @ApiProperty({ description: 'Ville' })
  public quarterCity!: string;

  @ApiPropertyOptional({ description: 'Nom du bailleur propriétaire' })
  public landlordName?: string;

  @ApiPropertyOptional({ description: 'Téléphone du bailleur propriétaire' })
  public landlordPhone?: string;
}

export class ResidentResponseDto {
  @ApiProperty({ description: 'UUID du citoyen / résident' })
  public userId!: string;

  @ApiProperty({ description: 'Prénom du résident', example: 'Koffi' })
  public firstName!: string;

  @ApiProperty({ description: 'Nom du résident', example: 'Mensah' })
  public lastName!: string;

  @ApiProperty({ description: 'Numéro de téléphone', example: '+229 97 00 00 01' })
  public phoneNumber!: string;

  @ApiPropertyOptional({ description: 'Adresse email', example: 'koffi.mensah@epac.bj' })
  public email?: string | null;

  @ApiPropertyOptional({ description: 'Ville de provenance ou résidence' })
  public city?: string | null;

  @ApiPropertyOptional({ description: 'Clé de l’avatar' })
  public avatarKey?: string | null;

  @ApiProperty({ description: 'Indique si le résident a un bail actif en cours' })
  public isActiveResident!: boolean;

  @ApiPropertyOptional({ description: 'Détails de la chambre actuelle', type: CurrentRoomDetailsDto })
  public currentRoom!: CurrentRoomDetailsDto | null;

  @ApiProperty({ description: 'Nombre total de contrats historiques' })
  public contractsCount!: number;

  @ApiProperty({ description: 'Liste des contrats de séjour', type: [ResidentContractResponseDto] })
  public contracts!: ResidentContractResponseDto[];
}
