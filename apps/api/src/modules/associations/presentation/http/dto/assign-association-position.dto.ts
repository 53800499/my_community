import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class AssignAssociationPositionDto {
  @ApiProperty({
    description: 'Identifiant UUID de l’utilisateur adhérent nommé à ce poste',
    example: 'd3b07384-d113-494b-9c8e-324b917d23a1',
  })
  @IsString()
  @IsNotEmpty()
  targetUserId: string;

  @ApiProperty({
    description: 'Nom et prénom complet du responsable nommé',
    example: 'Koffi Mensah',
  })
  @IsString()
  @IsNotEmpty()
  targetUserName: string;

  @ApiPropertyOptional({
    description: 'Date de début du mandat officiel',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  termStartDate?: string;

  @ApiPropertyOptional({
    description: 'Date de fin du mandat officiel',
    example: '2028-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  termEndDate?: string;
}
