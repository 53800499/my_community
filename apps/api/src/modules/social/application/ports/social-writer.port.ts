import type { CommentEntity } from '../../domain/entities/comment.entity.js';
import type {
  ReactionEntity,
  ReactionTargetType,
} from '../../domain/entities/reaction.entity.js';

export const SOCIAL_WRITER_PORT = Symbol('SOCIAL_WRITER_PORT');

export interface SocialWriterPort {
  saveComment(comment: CommentEntity): Promise<void>;
  deleteComment(id: string): Promise<void>;

  saveReaction(reaction: ReactionEntity): Promise<void>;
  deleteReaction(
    userId: string,
    targetType: ReactionTargetType,
    targetId: string,
  ): Promise<void>;
}
