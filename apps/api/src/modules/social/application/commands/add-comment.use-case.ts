import { Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'node:crypto';
import { CommentEntity } from '../../domain/entities/comment.entity.js';
import { CommentAddedDomainEvent } from '../../domain/events/comment-added.domain-event.js';
import {
  SOCIAL_READER_PORT,
  type SocialReaderPort,
} from '../ports/social-reader.port.js';
import {
  SOCIAL_WRITER_PORT,
  type SocialWriterPort,
} from '../ports/social-writer.port.js';
import {
  POST_READER_PORT,
  type PostReaderPort,
} from '../../../communities/application/ports/post-reader.port.js';
import {
  AUDIT_LOGGER_PORT,
  type AuditLoggerPort,
} from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';

export interface AddCommentCommand {
  postId: string;
  authorId: string;
  content: string;
  parentId?: string | null;
}

@Injectable()
export class AddCommentUseCase {
  constructor(
    @Inject(SOCIAL_READER_PORT)
    private readonly socialReader: SocialReaderPort,
    @Inject(SOCIAL_WRITER_PORT)
    private readonly socialWriter: SocialWriterPort,
    @Optional()
    @Inject(POST_READER_PORT)
    private readonly postReader?: PostReaderPort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
    @Optional()
    private readonly eventEmitter?: EventEmitter2,
  ) {}

  public async execute(command: AddCommentCommand): Promise<CommentEntity> {
    if (this.postReader) {
      const post = await this.postReader.findById(command.postId);
      if (!post) {
        throw new NotFoundException(`La publication ${command.postId} n'existe pas.`);
      }
    }

    let effectiveParentId: string | null = null;

    if (command.parentId) {
      const parentComment = await this.socialReader.findCommentById(command.parentId);
      if (!parentComment) {
        throw new NotFoundException(`Le commentaire parent ${command.parentId} n'existe pas.`);
      }
      // Règle d'or de profondeur maximale (Depth = 2) :
      // Si le commentaire ciblé est déjà une réponse, on rattache au parent racine
      effectiveParentId = parentComment.parentId || parentComment.id;
    }

    const comment = CommentEntity.create({
      id: randomUUID(),
      postId: command.postId,
      authorId: command.authorId,
      parentId: effectiveParentId,
      content: command.content,
    });

    await this.socialWriter.saveComment(comment);

    if (this.eventEmitter) {
      this.eventEmitter.emit(
        CommentAddedDomainEvent.EVENT_NAME,
        new CommentAddedDomainEvent(
          comment.id,
          comment.postId,
          comment.authorId,
          comment.parentId,
          comment.createdAt,
        ),
      );
    }

    if (this.auditLogger) {
      await this.auditLogger.log(
        AuditLogEntity.create({
          id: randomUUID(),
          actorId: command.authorId,
          action: 'SOCIAL_COMMENT_ADDED',
          resourceType: 'COMMENT',
          resourceId: comment.id,
          payload: {
            postId: comment.postId,
            parentId: comment.parentId,
          },
          createdAt: new Date(),
        }),
      );
    }

    return comment;
  }
}
