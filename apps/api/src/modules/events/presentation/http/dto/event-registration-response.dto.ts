import { ApiProperty } from '@nestjs/swagger';
import type { EventRegistrationStatus } from '../../../domain/entities/event-registration.entity.js';

export class EventRegistrationResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  eventId!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  userId!: string;

  @ApiProperty({ enum: ['CONFIRMED', 'CANCELLED', 'WAITLIST'], example: 'CONFIRMED' })
  status!: EventRegistrationStatus;

  @ApiProperty({ example: '2026-10-28T12:00:00.000Z' })
  registeredAt!: string;

  @ApiProperty({ example: '2026-10-28T12:00:00.000Z' })
  updatedAt!: string;
}
