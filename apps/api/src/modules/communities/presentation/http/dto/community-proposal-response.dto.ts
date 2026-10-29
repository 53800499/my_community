import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ProposalStatus } from '../../../domain/entities/community-proposal.entity.js';

/**
 * DTO de Réponse pour une Proposition Citoyenne de Communauté
 * Documenté exhaustivement pour Swagger / OpenAPI.
 */
export class CommunityProposalResponseDto {
  @ApiProperty({
    description: 'Identifiant unique de la proposition (UUID v4)',
    format: 'uuid',
    example: 'd9b2e841-8c4d-4b42-a279-994fbc266d51',
  })
  id!: string;

  @ApiProperty({
    description: 'Nom proposé pour la future communauté citoyenne',
    example: 'Akpakpa Centre',
  })
  name!: string;

  @ApiProperty({
    description: 'Description de la communauté et de ses objectifs',
    example: 'Espace citoyen et d’échange pour les résidents et commerçants du quartier Akpakpa.',
  })
  description!: string;

  @ApiProperty({
    description: 'Justification de l’intérêt territorial et citoyen',
    example: 'Besoin d’un canal unifié pour coordonner les actions de propreté et la sécurité locale.',
  })
  justification!: string;

  @ApiProperty({
    description: 'Identifiant du territoire concerné (UUID v4)',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  })
  territoryId!: string;

  @ApiProperty({
    description: 'Identifiant du citoyen auteur de la proposition (UUID v4)',
    format: 'uuid',
    example: 'd3b07384-d113-494b-9c8e-324b917d23a1',
  })
  proposedById!: string;

  @ApiProperty({
    description: 'Statut actuel de l’instruction de la proposition',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    example: 'PENDING',
  })
  status!: ProposalStatus;

  @ApiPropertyOptional({
    description: 'Identifiant de l’administrateur ayant instruit la proposition (null si en attente)',
    format: 'uuid',
    example: null,
    nullable: true,
  })
  reviewedById!: string | null;

  @ApiPropertyOptional({
    description: 'Date d’instruction au format ISO 8601 (null si en attente)',
    example: null,
    nullable: true,
  })
  reviewedAt!: string | null;

  @ApiPropertyOptional({
    description: 'Motif explicatif en cas de refus administratif',
    example: null,
    nullable: true,
  })
  rejectionReason!: string | null;

  @ApiProperty({
    description: 'Date et heure de soumission au format ISO 8601',
    example: '2026-10-22T10:00:00.000Z',
  })
  createdAt!: string;
}
