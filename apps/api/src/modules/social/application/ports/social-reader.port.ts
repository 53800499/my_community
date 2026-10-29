import type { CommentEntity } from '../../domain/entities/comment.entity.js';
import type {
  ReactionEntity,
  ReactionTargetType,
  ReactionValueType,
} from '../../domain/entities/reaction.entity.js';

export const SOCIAL_READER_PORT = Symbol('SOCIAL_READER_PORT');

export interface ReactionsSummary {
  targetType: ReactionTargetType;
  targetId: string;
  totalCount: number;
  countsByType: Record<ReactionValueType, number>;
  userReaction?: ReactionValueType | null;
}

export interface SocialReaderPort {
  findCommentById(id: string): Promise<CommentEntity | null>;
  listCommentsByPost(postId: string): Promise<CommentEntity[]>;
  countCommentsByPost(postId: string): Promise<number>;

  findReaction(
    userId: string,
    targetType: ReactionTargetType,
    targetId: string,
  ): Promise<ReactionEntity | null>;
  getReactionsSummary(
    targetType: ReactionTargetType,
    targetId: string,
    currentUserId?: string,
  ): Promise<ReactionsSummary>;
  listUserReactions(
    userId: string,
    targetType: ReactionTargetType,
    targetIds: string[],
  ): Promise<ReactionEntity[]>;
}
