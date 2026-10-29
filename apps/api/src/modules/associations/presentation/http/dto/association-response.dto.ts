import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssociationMemberResponseDto } from './association-member-response.dto.js';

export class AssociationResponseDto {
  @ApiProperty({
    description: 'Identifiant unique de l’association (UUID v4)',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Nom officiel de l’association',
    example: 'Association des Jeunes d’Akpakpa pour le Développement',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Acronyme ou sigle usuel',
    example: 'AJAD',
    nullable: true,
  })
  acronym!: string | null;

  @ApiPropertyOptional({
    description: 'Numéro d’enregistrement officiel (RNA ou récépissé de déclaration)',
    example: 'BEN-LIT-2026-A123',
    nullable: true,
  })
  registrationNumber!: string | null;

  @ApiPropertyOptional({
    description: 'Description de la vocation et des activités associatives',
    example: 'Promotion de l’engagement civique, salubrité et éducation populaire.',
    nullable: true,
  })
  description!: string | null;

  @ApiPropertyOptional({
    description: 'Typologie statutaire de l’association (PROFESSIONAL, EDUCATIONAL, COMMUNITY, etc.)',
    example: 'PROFESSIONAL',
    enum: ['COMMUNITY', 'EDUCATIONAL', 'PROFESSIONAL', 'CULTURAL', 'SPORT', 'HUMANITARIAN'],
  })
  category?: string;

  @ApiPropertyOptional({
    description: 'Membres du bureau et adhérents déclarés',
    type: [AssociationMemberResponseDto],
    nullable: true,
  })
  members?: AssociationMemberResponseDto[];

  @ApiPropertyOptional({
    description: 'Identifiants UUID des communautés citoyennes rattachées (multi-rattachement)',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    nullable: true,
  })
  linkedCommunityIds?: string[];

  @ApiProperty({
    description: 'Date de déclaration au format ISO 8601',
    example: '2026-10-22T10:00:00.000Z',
  })
  createdAt!: string;
}
