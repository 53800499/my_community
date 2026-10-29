import { Injectable } from '@nestjs/common';
import type {
  Comment as PrismaComment,
  Reaction as PrismaReaction,
  ReactionType as PrismaReactionType,
  ReactionTargetType as PrismaReactionTargetType,
} from '@prisma/client';
import { PrismaService } from '../../../../platform/database/prisma.service.js';
import type { CommentEntity } from '../../domain/entities/comment.entity.js';
import type {
  ReactionEntity,
  ReactionTargetType,
  ReactionValueType,
} from '../../domain/entities/reaction.entity.js';
import type {
  SocialReaderPort,
  ReactionsSummary,
} from '../../application/ports/social-reader.port.js';
import type { SocialWriterPort } from '../../application/ports/social-writer.port.js';
import { SocialMapper } from '../mappers/social.mapper.js';

@Injectable()
export class PrismaSocialRepository
  implements SocialReaderPort, SocialWriterPort
{
  constructor(private readonly prisma: PrismaService) {}

  public async findCommentById(id: string): Promise<CommentEntity | null> {
    const raw = await this.prisma.comment.findUnique({
      where: { id },
    });
    return raw ? SocialMapper.toCommentEntity(raw) : null;
  }

  public async listCommentsByPost(postId: string): Promise<CommentEntity[]> {
    const records = await this.prisma.comment.findMany({
      where: {
        postId,
        status: { not: 'REMOVED' },
      },
      orderBy: { createdAt: 'asc' },
    });
    return records.map((r: PrismaComment) => SocialMapper.toCommentEntity(r));
  }

  public async countCommentsByPost(postId: string): Promise<number> {
    return this.prisma.comment.count({
      where: {
        postId,
        status: { not: 'REMOVED' },
      },
    });
  }

  public async findReaction(
    userId: string,
    targetType: ReactionTargetType,
    targetId: string,
  ): Promise<ReactionEntity | null> {
    const raw = await this.prisma.reaction.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType: targetType as PrismaReactionTargetType,
          targetId,
        },
      },
    });
    return raw ? SocialMapper.toReactionEntity(raw) : null;
  }

  public async getReactionsSummary(
    targetType: ReactionTargetType,
    targetId: string,
    currentUserId?: string,
  ): Promise<ReactionsSummary> {
    const records = await this.prisma.reaction.findMany({
      where: {
        targetType: targetType as PrismaReactionTargetType,
        targetId,
      },
    });

    const countsByType: Record<ReactionValueType, number> = {
      LIKE: 0,
      LOVE: 0,
      CELEBRATE: 0,
      SUPPORT: 0,
      INSIGHTFUL: 0,
    };

    let userReaction: ReactionValueType | null = null;

    for (const r of records) {
      const type = r.type as ReactionValueType;
      if (countsByType[type] !== undefined) {
        countsByType[type] += 1;
      }
      if (currentUserId && r.userId === currentUserId) {
        userReaction = type;
      }
    }

    return {
      targetType,
      targetId,
      totalCount: records.length,
      countsByType,
      userReaction,
    };
  }

  public async listUserReactions(
    userId: string,
    targetType: ReactionTargetType,
    targetIds: string[],
  ): Promise<ReactionEntity[]> {
    if (targetIds.length === 0) return [];
    const records = await this.prisma.reaction.findMany({
      where: {
        userId,
        targetType: targetType as PrismaReactionTargetType,
        targetId: { in: targetIds },
      },
    });
    return records.map((r: PrismaReaction) => SocialMapper.toReactionEntity(r));
  }

  public async saveComment(comment: CommentEntity): Promise<void> {
    await this.prisma.comment.upsert({
      where: { id: comment.id },
      create: {
        id: comment.id,
        postId: comment.postId,
        authorId: comment.authorId,
        parentId: comment.parentId || null,
        content: comment.content,
        status: comment.status,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      },
      update: {
        content: comment.content,
        status: comment.status,
        updatedAt: comment.updatedAt,
      },
    });
  }

  public async deleteComment(id: string): Promise<void> {
    await this.prisma.comment.delete({
      where: { id },
    });
  }

  public async saveReaction(reaction: ReactionEntity): Promise<void> {
    await this.prisma.reaction.upsert({
      where: {
        userId_targetType_targetId: {
          userId: reaction.userId,
          targetType: reaction.targetType as PrismaReactionTargetType,
          targetId: reaction.targetId,
        },
      },
      create: {
        id: reaction.id,
        userId: reaction.userId,
        targetType: reaction.targetType as PrismaReactionTargetType,
        targetId: reaction.targetId,
        type: reaction.type as PrismaReactionType,
        createdAt: reaction.createdAt,
      },
      update: {
        type: reaction.type as PrismaReactionType,
      },
    });
  }

  public async deleteReaction(
    userId: string,
    targetType: ReactionTargetType,
    targetId: string,
  ): Promise<void> {
    await this.prisma.reaction.deleteMany({
      where: {
        userId,
        targetType: targetType as PrismaReactionTargetType,
        targetId,
      },
    });
  }
}
