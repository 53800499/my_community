import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AssociationRole } from '../../../domain/entities/association-member.entity.js';

export class AssociationMemberResponseDto {
  @ApiProperty({
    description: 'Identifiant unique de l’affiliation (UUID v4)',
    format: 'uuid',
    example: 'd9b2e841-8c4d-4b42-a279-994fbc266d51',
  })
  id!: string;

  @ApiProperty({
    description: 'Identifiant de l’association (UUID v4)',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  associationId!: string;

  @ApiProperty({
    description: 'Identifiant de l’utilisateur (UUID v4)',
    format: 'uuid',
    example: 'd3b07384-d113-494b-9c8e-324b917d23a1',
  })
  userId!: string;

  @ApiProperty({
    description: 'Rôle associatif attribué',
    enum: ['MEMBER', 'PRESIDENT', 'SECRETARY', 'TREASURER', 'BOARD_MEMBER'],
    example: 'PRESIDENT',
  })
  role!: AssociationRole;

  @ApiProperty({
    description: 'Date de rattachement au format ISO 8601',
    example: '2026-10-22T10:00:00.000Z',
  })
  joinedAt!: string;

  @ApiPropertyOptional({
    description: 'Informations professionnelles du membre (si association professionnelle ou éducative)',
  })
  professionalInfo?: any;
}
