import { ApiProperty } from '@nestjs/swagger';

export class PostResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Identifiant unique de la publication (UUID v4)',
  })
  id!: string;

  @ApiProperty({
    example: '4f79ff2c-c965-4af7-a99e-de4e4bf457dc',
    description: 'Identifiant unique de la communauté',
  })
  communityId!: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    description: 'Identifiant de l’auteur de la publication',
  })
  authorId!: string;

  @ApiProperty({
    example: 'Journée de Salubrité à Bidossessi',
    description: 'Titre de la publication citoyenne',
  })
  title!: string;

  @ApiProperty({
    example: 'Grande journée de salubrité ce samedi dès 07h30...',
    description: 'Contenu détaillé de la publication',
  })
  content!: string;

  @ApiProperty({
    example: 'COMMUNITY',
    enum: ['PUBLIC', 'COMMUNITY', 'ASSOCIATION_MEMBERS'],
    description: 'Niveau de visibilité de la publication',
  })
  visibility!: string;

  @ApiProperty({
    example: '2026-10-28T10:00:00.000Z',
    description: 'Horodatage de publication ISO 8601',
  })
  publishedAt!: string;

  @ApiProperty({
    example: '2026-10-28T10:00:00.000Z',
    description: 'Horodatage de dernière mise à jour ISO 8601',
  })
  updatedAt!: string;
}
