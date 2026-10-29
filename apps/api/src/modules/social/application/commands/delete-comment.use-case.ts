import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  SOCIAL_READER_PORT,
  type SocialReaderPort,
} from '../ports/social-reader.port.js';
import {
  SOCIAL_WRITER_PORT,
  type SocialWriterPort,
} from '../ports/social-writer.port.js';
import {
  AUDIT_LOGGER_PORT,
  type AuditLoggerPort,
} from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';

export interface DeleteCommentCommand {
  commentId: string;
  requesterUserId: string;
  isModerator?: boolean;
}

@Injectable()
export class DeleteCommentUseCase {
  constructor(
    @Inject(SOCIAL_READER_PORT)
    private readonly socialReader: SocialReaderPort,
    @Inject(SOCIAL_WRITER_PORT)
    private readonly socialWriter: SocialWriterPort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
  ) {}

  public async execute(command: DeleteCommentCommand): Promise<void> {
    const comment = await this.socialReader.findCommentById(command.commentId);
    if (!comment) {
      throw new NotFoundException(`Le commentaire ${command.commentId} n'existe pas.`);
    }

    const isAuthor = comment.authorId === command.requesterUserId;
    if (!isAuthor && !command.isModerator) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à supprimer ce commentaire.");
    }

    await this.socialWriter.deleteComment(comment.id);

    if (this.auditLogger) {
      await this.auditLogger.log(
        AuditLogEntity.create({
          id: randomUUID(),
          actorId: command.requesterUserId,
          action: 'SOCIAL_COMMENT_DELETED',
          resourceType: 'COMMENT',
          resourceId: comment.id,
          payload: {
            postId: comment.postId,
            deletedByAuthor: isAuthor,
          },
          createdAt: new Date(),
        }),
      );
    }
  }
}
