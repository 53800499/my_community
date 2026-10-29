import { ApiProperty } from '@nestjs/swagger';
import type {
  MembershipStatus,
  CommunityRole,
} from '../../../domain/entities/community-membership.entity.js';

/**
 * DTO de Réponse pour une Adhésion Communautaire
 * Documenté exhaustivement pour Swagger / OpenAPI.
 */
export class MembershipResponseDto {
  @ApiProperty({
    description: 'Identifiant unique de l’adhésion (UUID v4)',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  })
  id!: string;

  @ApiProperty({
    description: 'Identifiant de la communauté d’appartenance (UUID v4)',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  communityId!: string;

  @ApiProperty({
    description: 'Identifiant du citoyen adhérent (UUID v4)',
    format: 'uuid',
    example: 'd3b07384-d113-494b-9c8e-324b917d23a1',
  })
  userId!: string;

  @ApiProperty({
    description: 'Statut de l’adhésion dans la communauté',
    enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'REVOKED'],
    example: 'ACTIVE',
  })
  status!: MembershipStatus;

  @ApiProperty({
    description: 'Rôles contextuels locaux attribués au citoyen',
    enum: ['MEMBER', 'MODERATOR', 'MANAGER', 'ADMIN'],
    isArray: true,
    example: ['MEMBER'],
  })
  roles!: CommunityRole[];

  @ApiProperty({
    description: 'Date de première adhésion ou demande au format ISO 8601',
    example: '2026-10-22T10:00:00.000Z',
  })
  joinedAt!: string;

  @ApiProperty({
    description: 'Date de dernière modification au format ISO 8601',
    example: '2026-10-22T10:00:00.000Z',
  })
  updatedAt!: string;
}
