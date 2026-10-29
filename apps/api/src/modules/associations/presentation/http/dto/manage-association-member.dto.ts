import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsIn } from 'class-validator';
import type { AssociationRole } from '../../../domain/entities/association-member.entity.js';

export class ManageAssociationMemberDto {
  @ApiProperty({
    description: 'Identifiant UUID du citoyen concerné',
    format: 'uuid',
    example: 'd3b07384-d113-494b-9c8e-324b917d23a1',
  })
  @IsUUID('4', { message: 'L’identifiant du citoyen doit être un UUID v4 valide.' })
  @IsNotEmpty({ message: 'L’identifiant du citoyen est obligatoire.' })
  targetUserId!: string;

  @ApiProperty({
    description: 'Rôle associatif à attribuer',
    enum: ['MEMBER', 'PRESIDENT', 'SECRETARY', 'TREASURER', 'BOARD_MEMBER'],
    example: 'TREASURER',
  })
  @IsNotEmpty({ message: 'Le rôle est obligatoire.' })
  @IsIn(['MEMBER', 'PRESIDENT', 'SECRETARY', 'TREASURER', 'BOARD_MEMBER'], {
    message: 'Rôle associatif invalide.',
  })
  role!: AssociationRole;

  @ApiProperty({
    description: 'Action : ADD, UPDATE ou REMOVE',
    enum: ['ADD', 'UPDATE', 'REMOVE'],
    example: 'ADD',
  })
  @IsNotEmpty({ message: 'L’action est obligatoire.' })
  @IsIn(['ADD', 'UPDATE', 'REMOVE'], {
    message: 'L’action doit être ADD, UPDATE ou REMOVE.',
  })
  action!: 'ADD' | 'UPDATE' | 'REMOVE';
}
