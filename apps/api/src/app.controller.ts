import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service.js';

import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok', description: 'État de santé du service' })
  status!: string;

  @ApiProperty({ example: 'my-community-api', description: 'Nom du service' })
  service!: string;

  @ApiProperty({ example: '2.1', description: 'Version applicative' })
  version!: string;

  @ApiProperty({
    example: '2026-10-22T10:00:00.000Z',
    format: 'date-time',
    description: 'Horodatage serveur au format ISO-8601',
  })
  timestamp!: string;
}

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Sonde de disponibilité (Healthcheck)',
    description: 'Vérifie que le serveur NestJS est démarré et répond aux requêtes.',
  })
  @ApiResponse({
    status: 200,
    description: 'L’API fonctionne correctement.',
    type: HealthResponseDto,
  })
  getHealth(): HealthResponseDto {
    return {
      status: 'ok',
      service: 'my-community-api',
      version: '2.1',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Message de bienvenue' })
  getHello(): string {
    return this.appService.getHello();
  }
}
