import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsIn } from 'class-validator';
import type { MembershipStatus } from '../../../domain/entities/community-membership.entity.js';

export class DecideMembershipDto {
  @ApiProperty({
    description: 'Décision sur le statut d’adhésion du citoyen',
    enum: ['ACTIVE', 'SUSPENDED', 'REVOKED'],
    example: 'ACTIVE',
  })
  @IsNotEmpty({ message: 'La décision d’adhésion est obligatoire.' })
  @IsIn(['ACTIVE', 'SUSPENDED', 'REVOKED'], {
    message: 'La décision doit être ACTIVE, SUSPENDED ou REVOKED.',
  })
  decision!: MembershipStatus;
}
