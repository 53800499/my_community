import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { NotificationType } from '../../../domain/entities/notification.entity.js';

/**
 * DTO de Réponse pour une Notification Citoyenne
 * Documenté exhaustivement pour Swagger / OpenAPI avec formats, contraintes et exemples.
 */
export class NotificationResponseDto {
  @ApiProperty({
    description: 'Identifiant unique de la notification (UUID v4)',
    format: 'uuid',
    example: 'c76f6fa3-e380-4ec3-ba09-32219c62985f',
  })
  id!: string;

  @ApiProperty({
    description: 'Identifiant unique du citoyen destinataire (UUID v4)',
    format: 'uuid',
    example: 'd3b07384-d113-494b-9c8e-324b917d23a1',
  })
  userId!: string;

  @ApiProperty({
    description: 'Catégorie fonctionnelle de la notification',
    enum: ['INFO', 'ALERT', 'MEMBERSHIP_REQUEST', 'COMMUNITY_STATUS', 'SYSTEM'],
    example: 'COMMUNITY_STATUS',
  })
  type!: NotificationType;

  @ApiProperty({
    description: 'Titre concis de la notification',
    maxLength: 150,
    example: 'Proposition approuvée !',
  })
  title!: string;

  @ApiProperty({
    description: 'Message détaillé ou corps du texte de la notification',
    example: 'Votre proposition pour la communauté Akpakpa Centre a été validée avec succès.',
  })
  message!: string;

  @ApiPropertyOptional({
    description: 'Métadonnées contextuelles au format JSON clé/valeur',
    example: { communityId: 'e5b8e964-b63d-4c33-b4a1-0268595701a2' },
    nullable: true,
  })
  data!: Record<string, unknown> | null;

  @ApiProperty({
    description: 'Statut de consultation par le citoyen (true si lue)',
    example: false,
  })
  isRead!: boolean;

  @ApiPropertyOptional({
    description: 'Date et heure de consultation au format ISO 8601 (null si non lue)',
    example: null,
    nullable: true,
  })
  readAt!: string | null;

  @ApiProperty({
    description: 'Date et heure de création au format ISO 8601',
    example: '2026-10-22T10:30:00.000Z',
  })
  createdAt!: string;
}
