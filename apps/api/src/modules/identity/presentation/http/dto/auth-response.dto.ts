import { ApiProperty } from '@nestjs/swagger';

export class UserAccountResponseDto {
  @ApiProperty({
    description: 'Identifiant unique universel (UUID v4) du compte',
    example: 'd3b07384-d113-494b-9c8e-324b917d23a1',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    description: 'Numéro de téléphone normalisé',
    example: '+22997001122',
  })
  phoneNumber!: string;

  @ApiProperty({
    description: 'Adresse email vérifiée ou null si non renseignée',
    example: 'citoyen@cotonou.bj',
    nullable: true,
  })
  email!: string | null;

  @ApiProperty({
    description: 'Statut du compte utilisateur',
    example: 'ACTIVE',
    enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'LOCKED'],
  })
  status!: string;

  @ApiProperty({
    description: 'Drapeau indiquant si le compte dispose des privilèges de Super-Administrateur de la plateforme',
    example: true,
  })
  isPlatformAdmin!: boolean;

  @ApiProperty({
    description: 'Rôle global attribué sur la plateforme',
    example: 'SUPER_ADMIN',
    enum: ['SUPER_ADMIN', 'ADMIN', 'CITIZEN'],
  })
  role!: string;

  @ApiProperty({
    description: 'Horodatage ISO-8601 de création du compte',
    example: '2026-10-22T10:00:00.000Z',
    format: 'date-time',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Horodatage ISO-8601 de dernière mise à jour',
    example: '2026-10-22T10:00:00.000Z',
    format: 'date-time',
  })
  updatedAt!: string;
}

export class AuthSuccessResponseDto {
  @ApiProperty({
    description: 'Jeton de session JWT signé (Bearer token à passer dans l’en-tête Authorization: Bearer <token>)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkM2IwNzM4NC1kMTEzLTQ5NGItOWM4ZS0zMjRiOTE3ZDIzYTEiLCJpYXQiOjE3Mjk1ODUyMDAsImV4cCI6MTcyOTY3MTYwMH0.xyz...',
  })
  token!: string;

  @ApiProperty({
    description: 'Informations publiques du compte citoyen authentifié',
    type: () => UserAccountResponseDto,
  })
  user!: UserAccountResponseDto;
}
