import type {
  Comment as PrismaComment,
  Reaction as PrismaReaction,
  CommentStatus as PrismaCommentStatus,
  ReactionType as PrismaReactionType,
  ReactionTargetType as PrismaReactionTargetType,
} from '@prisma/client';
import {
  CommentEntity,
  type CommentStatusType,
} from '../../domain/entities/comment.entity.js';
import {
  ReactionEntity,
  type ReactionTargetType,
  type ReactionValueType,
} from '../../domain/entities/reaction.entity.js';

export class SocialMapper {
  public static toCommentEntity(raw: PrismaComment): CommentEntity {
    return CommentEntity.create({
      id: raw.id,
      postId: raw.postId,
      authorId: raw.authorId,
      parentId: raw.parentId,
      content: raw.content,
      status: raw.status as CommentStatusType,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toReactionEntity(raw: PrismaReaction): ReactionEntity {
    return ReactionEntity.create({
      id: raw.id,
      userId: raw.userId,
      targetType: raw.targetType as ReactionTargetType,
      targetId: raw.targetId,
      type: raw.type as ReactionValueType,
      createdAt: raw.createdAt,
    });
  }
}
