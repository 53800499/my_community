import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdatePositionPermissionsDto {
  @ApiProperty({
    description: 'Espaces fonctionnels autorisés pour ce poste',
    example: ['RESIDENCES', 'MEMBERSHIP'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  accessSpaces: string[];

  @ApiProperty({
    description: 'Permissions granulaires attribuées pour ce poste',
    example: ['residences:read', 'residences:manage_rooms', 'residences:issue_certificate'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
