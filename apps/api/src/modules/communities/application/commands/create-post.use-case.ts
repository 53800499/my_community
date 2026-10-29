import { Injectable, Inject, NotFoundException, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PostEntity, PostVisibilityType } from '../../domain/entities/post.entity.js';
import {
  type PostWriterPort,
  POST_WRITER_PORT,
} from '../ports/post-writer.port.js';
import {
  type CommunityReaderPort,
  COMMUNITY_READER_PORT,
} from '../ports/community-reader.port.js';
import { type AuditLoggerPort, AUDIT_LOGGER_PORT } from '../../../audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../../audit/domain/entities/audit-log.entity.js';

export interface CreatePostCommand {
  communityId: string;
  authorId: string;
  title: string;
  content: string;
  visibility?: PostVisibilityType;
}

/**
 * Cas d'Usage Applicatif : Création d'une Publication Citoyenne (CreatePostUseCase)
 * Conforme SOLID :
 * - SRP : Responsabilité exclusive de valider et persister une nouvelle publication.
 * - DIP : Dépend uniquement des ports abstraits (PostWriterPort, CommunityReaderPort, AuditLoggerPort).
 */
@Injectable()
export class CreatePostUseCase {
  constructor(
    @Inject(POST_WRITER_PORT)
    private readonly postWriter: PostWriterPort,
    @Inject(COMMUNITY_READER_PORT)
    private readonly communityReader: CommunityReaderPort,
    @Optional()
    @Inject(AUDIT_LOGGER_PORT)
    private readonly auditLogger?: AuditLoggerPort,
  ) {}

  async execute(command: CreatePostCommand): Promise<PostEntity> {
    // Vérification de l'existence de la communauté
    const community = await this.communityReader.findById(command.communityId);
    if (!community) {
      throw new NotFoundException(`La communauté ${command.communityId} n'existe pas.`);
    }

    const post = PostEntity.create({
      id: randomUUID(),
      communityId: command.communityId,
      authorId: command.authorId,
      title: command.title,
      content: command.content,
      visibility: command.visibility || 'COMMUNITY',
    });

    await this.postWriter.save(post);

    if (this.auditLogger) {
      const auditLog = AuditLogEntity.create({
        id: randomUUID(),
        actorId: command.authorId,
        action: 'COMMUNITY_POST_CREATED',
        resourceType: 'COMMUNITY_POST',
        resourceId: post.id,
        createdAt: new Date(),
        payload: {
          communityId: post.communityId,
          title: post.title,
        },
      });
      await this.auditLogger.log(auditLog);
    }

    return post;
  }
}
