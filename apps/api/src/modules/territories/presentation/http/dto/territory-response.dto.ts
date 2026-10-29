import { ApiProperty } from '@nestjs/swagger';
import { TerritoryType } from '@prisma/client';

export class TerritoryResponseDto {
  @ApiProperty({
    description: 'Identifiant unique universel (UUID v4) du territoire',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    description: 'Nom officiel du territoire (Pays, Département, Commune, etc.)',
    example: 'Bénin',
  })
  name!: string;

  @ApiProperty({
    description: 'Code administratif officiel ou identifiant unique (ex: ISO BEN, BJ-LIT, etc.)',
    example: 'BEN',
  })
  code!: string;

  @ApiProperty({
    description: 'Échelon géographique administratif',
    enum: TerritoryType,
    example: 'COUNTRY',
  })
  type!: TerritoryType;

  @ApiProperty({
    description: 'UUID du territoire parent dans la hiérarchie géographique (null pour les pays racines)',
    example: null,
    nullable: true,
    format: 'uuid',
  })
  parentId!: string | null;
}
