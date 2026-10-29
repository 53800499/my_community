import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { EventStatus } from '../../../domain/entities/event.entity.js';

export class EventResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  communityId!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  organizerUserId!: string;

  @ApiProperty({ example: 'Opération Salubrité & Arbre Citoyen' })
  title!: string;

  @ApiProperty({ example: 'Rassemblement citoyen pour le nettoyage du quartier.' })
  description!: string;

  @ApiProperty({ example: 'Esplanade du Campus Tankpè, Abomey-Calavi' })
  location!: string;

  @ApiProperty({ example: '2026-11-15T09:00:00.000Z' })
  startsAt!: string;

  @ApiProperty({ example: '2026-11-15T12:00:00.000Z' })
  endsAt!: string;

  @ApiPropertyOptional({ example: 50, nullable: true })
  maxAttendees?: number | null;

  @ApiProperty({ enum: ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'], example: 'SCHEDULED' })
  status!: EventStatus;

  @ApiProperty({ example: 12 })
  attendeesCount!: number;

  @ApiPropertyOptional({ enum: ['CONFIRMED', 'WAITLIST', 'CANCELLED'], nullable: true })
  userRegistrationStatus?: 'CONFIRMED' | 'WAITLIST' | 'CANCELLED' | null;

  @ApiProperty({ example: '2026-10-28T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-28T12:00:00.000Z' })
  updatedAt!: string;
}
