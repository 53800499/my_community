import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de Réponse pour une Communauté Active
 * Documenté exhaustivement pour Swagger / OpenAPI.
 */
export class CommunityResponseDto {
  @ApiProperty({
    description: 'Identifiant unique de la communauté (UUID v4)',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Nom officiel de la communauté citoyenne',
    example: 'Akpakpa Centre',
  })
  name!: string;

  @ApiProperty({
    description: 'Slug normalisé unique pour URL',
    example: 'akpakpa-centre',
  })
  slug!: string;

  @ApiPropertyOptional({
    description: 'Description détaillée de l’espace communautaire',
    example: 'Espace citoyen et d’échange des riverains du quartier Akpakpa.',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    description: 'Identifiant UUID du territoire rattaché',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  })
  territoryId!: string;

  @ApiProperty({
    description: 'Statut de la communauté',
    enum: ['PENDING', 'ACTIVE', 'SUSPENDED'],
    example: 'ACTIVE',
  })
  status!: 'PENDING' | 'ACTIVE' | 'SUSPENDED';

  @ApiProperty({
    description: 'Date de création au format ISO 8601',
    example: '2026-10-22T10:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Date de dernière modification au format ISO 8601',
    example: '2026-10-22T10:00:00.000Z',
  })
  updatedAt!: string;
}
