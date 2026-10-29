import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsIn } from 'class-validator';
import type { CommunityRole } from '../../../domain/entities/community-membership.entity.js';

export class AssignRoleDto {
  @ApiProperty({
    description: 'Rôle local concerné dans la communauté',
    enum: ['MEMBER', 'MODERATOR', 'MANAGER', 'ADMIN'],
    example: 'MODERATOR',
  })
  @IsNotEmpty({ message: 'Le rôle est obligatoire.' })
  @IsIn(['MEMBER', 'MODERATOR', 'MANAGER', 'ADMIN'], {
    message: 'Le rôle doit être MEMBER, MODERATOR, MANAGER ou ADMIN.',
  })
  role!: CommunityRole;

  @ApiProperty({
    description: 'Action à effectuer : ajout (ADD) ou retrait (REMOVE)',
    enum: ['ADD', 'REMOVE'],
    example: 'ADD',
  })
  @IsNotEmpty({ message: 'L’action est obligatoire.' })
  @IsIn(['ADD', 'REMOVE'], {
    message: 'L’action doit être ADD ou REMOVE.',
  })
  action!: 'ADD' | 'REMOVE';
}
