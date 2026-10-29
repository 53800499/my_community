import { Inject, Injectable } from '@nestjs/common';
import type { CommentEntity } from '../../domain/entities/comment.entity.js';
import {
  SOCIAL_READER_PORT,
  type SocialReaderPort,
} from '../ports/social-reader.port.js';

export interface CommentWithReplies {
  comment: CommentEntity;
  replies: CommentEntity[];
}

@Injectable()
export class ListPostCommentsQuery {
  constructor(
    @Inject(SOCIAL_READER_PORT)
    private readonly socialReader: SocialReaderPort,
  ) {}

  public async execute(postId: string): Promise<CommentWithReplies[]> {
    const allComments = await this.socialReader.listCommentsByPost(postId);

    // Séparation des racines (parentId = null) et des réponses
    const rootComments = allComments.filter((c) => !c.parentId);
    const replies = allComments.filter((c) => !!c.parentId);

    // Groupement des réponses par parentId
    const repliesMap = new Map<string, CommentEntity[]>();
    for (const reply of replies) {
      const pId = reply.parentId!;
      if (!repliesMap.has(pId)) {
        repliesMap.set(pId, []);
      }
      repliesMap.get(pId)!.push(reply);
    }

    return rootComments.map((root) => ({
      comment: root,
      replies: repliesMap.get(root.id) || [],
    }));
  }
}
