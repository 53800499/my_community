import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ReactionsSummary } from '../../../application/ports/social-reader.port.js';

export class ReactionsSummaryResponseDto {
  @ApiProperty({ example: 'POST' })
  targetType!: string;

  @ApiProperty({ example: '4f79ff2c-c965-4af7-a99e-de4e4bf457dc' })
  targetId!: string;

  @ApiProperty({ example: 42 })
  totalCount!: number;

  @ApiProperty({
    example: {
      LIKE: 25,
      LOVE: 10,
      CELEBRATE: 5,
      SUPPORT: 2,
      INSIGHTFUL: 0,
    },
  })
  countsByType!: Record<string, number>;

  @ApiPropertyOptional({ example: 'LIKE', nullable: true })
  userReaction?: string | null;

  public static fromDomain(summary: ReactionsSummary): ReactionsSummaryResponseDto {
    const dto = new ReactionsSummaryResponseDto();
    dto.targetType = summary.targetType;
    dto.targetId = summary.targetId;
    dto.totalCount = summary.totalCount;
    dto.countsByType = summary.countsByType;
    dto.userReaction = summary.userReaction || null;
    return dto;
  }
}
