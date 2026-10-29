import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({
    description: 'Identifiant unique UUID du profil',
    example: '880e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    description: 'Identifiant unique UUID de l’utilisateur associé',
    example: 'd3b07384-d113-494b-9c8e-324b917d23a1',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    description: 'Prénom du citoyen',
    example: 'Alice',
  })
  firstName!: string;

  @ApiProperty({
    description: 'Nom de famille du citoyen',
    example: 'Bio',
  })
  lastName!: string;

  @ApiProperty({
    description: 'Nom complet concaténé',
    example: 'Alice Bio',
  })
  fullName!: string;

  @ApiProperty({
    description: 'Clé d’accès de l’avatar sur le stockage d’objets S3 / MinIO (ou null)',
    example: 'avatars/d3b07384-d113.webp',
    nullable: true,
  })
  avatarKey!: string | null;

  @ApiProperty({
    description: 'Biographie ou présentation personnelle du citoyen',
    example: 'Habitante engagée du quartier Cadjèhoun à Cotonou.',
    nullable: true,
  })
  bio!: string | null;

  @ApiProperty({
    description: 'Ville ou commune de résidence principale',
    example: 'Cotonou',
    nullable: true,
  })
  city!: string | null;

  @ApiProperty({
    description: 'Horodatage ISO-8601 de création',
    example: '2026-10-22T10:00:00.000Z',
    format: 'date-time',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Horodatage ISO-8601 de dernière modification',
    example: '2026-10-22T10:00:00.000Z',
    format: 'date-time',
  })
  updatedAt!: string;
}
