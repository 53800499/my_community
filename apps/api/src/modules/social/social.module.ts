import { Module } from '@nestjs/common';
import { CommunitiesModule } from '../communities/communities.module.js';
import { AuditModule } from '../audit/audit.module.js';

// Ports
import { SOCIAL_READER_PORT } from './application/ports/social-reader.port.js';
import { SOCIAL_WRITER_PORT } from './application/ports/social-writer.port.js';

// Repositories
import { PrismaSocialRepository } from './infrastructure/repositories/prisma-social.repository.js';

// Cas d'usage
import { AddCommentUseCase } from './application/commands/add-comment.use-case.js';
import { DeleteCommentUseCase } from './application/commands/delete-comment.use-case.js';
import { ToggleReactionUseCase } from './application/commands/toggle-reaction.use-case.js';

// Requêtes
import { ListPostCommentsQuery } from './application/queries/list-post-comments.query.js';
import { GetReactionsSummaryQuery } from './application/queries/get-reactions-summary.query.js';

// Controller
import { SocialController } from './presentation/http/social.controller.js';

@Module({
  imports: [CommunitiesModule, AuditModule],
  controllers: [SocialController],
  providers: [
    {
      provide: SOCIAL_READER_PORT,
      useClass: PrismaSocialRepository,
    },
    {
      provide: SOCIAL_WRITER_PORT,
      useClass: PrismaSocialRepository,
    },
    AddCommentUseCase,
    DeleteCommentUseCase,
    ToggleReactionUseCase,
    ListPostCommentsQuery,
    GetReactionsSummaryQuery,
  ],
  exports: [
    SOCIAL_READER_PORT,
    SOCIAL_WRITER_PORT,
    AddCommentUseCase,
    DeleteCommentUseCase,
    ToggleReactionUseCase,
    ListPostCommentsQuery,
    GetReactionsSummaryQuery,
  ],
})
export class SocialModule {}
