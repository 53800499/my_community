import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssociationPositionResponseDto {
  @ApiProperty({ example: 'pos-123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'assoc-123e4567-e89b-12d3-a456-426614174000' })
  associationId: string;

  @ApiProperty({ example: 'Secrétaire Général Adjoint' })
  title: string;

  @ApiProperty({ enum: ['MEMBER', 'PRESIDENT', 'SECRETARY', 'TREASURER', 'BOARD_MEMBER'], example: 'BOARD_MEMBER' })
  roleCategory: string;

  @ApiProperty({ example: 'Administration & Secrétariat' })
  department: string;

  @ApiProperty({ example: 'Assiste le Secrétaire Général dans la tenue des registres et procès-verbaux.' })
  description: string;

  @ApiPropertyOptional({ example: 'usr-456' })
  assignedUserId: string | null;

  @ApiPropertyOptional({ example: 'Awa Diallo' })
  assignedUserName: string | null;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z' })
  termStartDate: string | null;

  @ApiPropertyOptional({ example: '2028-12-31T23:59:59.000Z' })
  termEndDate: string | null;

  @ApiProperty({ example: false })
  isStatutory: boolean;

  @ApiProperty({ enum: ['VACANT', 'OCCUPIED'], example: 'OCCUPIED' })
  status: string;

  @ApiProperty({ example: ['RESIDENCES', 'MEMBERSHIP'], type: [String] })
  accessSpaces: string[];

  @ApiProperty({ example: ['residences:read', 'residences:issue_certificate'], type: [String] })
  permissions: string[];

  @ApiProperty({ example: '2026-10-23T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-10-23T12:00:00.000Z' })
  updatedAt: string;
}
