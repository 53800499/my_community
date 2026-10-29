import { Inject, Injectable } from '@nestjs/common';
import type { ReactionTargetType } from '../../domain/entities/reaction.entity.js';
import {
  SOCIAL_READER_PORT,
  type SocialReaderPort,
  type ReactionsSummary,
} from '../ports/social-reader.port.js';

@Injectable()
export class GetReactionsSummaryQuery {
  constructor(
    @Inject(SOCIAL_READER_PORT)
    private readonly socialReader: SocialReaderPort,
  ) {}

  public async execute(
    targetType: ReactionTargetType,
    targetId: string,
    currentUserId?: string,
  ): Promise<ReactionsSummary> {
    return this.socialReader.getReactionsSummary(targetType, targetId, currentUserId);
  }
}
