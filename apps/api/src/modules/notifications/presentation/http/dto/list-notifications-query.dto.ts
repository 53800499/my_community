import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class ListNotificationsQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrer pour ne retourner que les notifications non lues (true/false)',
    example: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  @IsBoolean()
  unreadOnly?: boolean;
}
