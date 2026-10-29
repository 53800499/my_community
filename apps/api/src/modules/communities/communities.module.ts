import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../platform/database/database.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { CommunitiesController } from './presentation/http/controllers/communities.controller.js';
import { CommunityProposalsController } from './presentation/http/controllers/community-proposals.controller.js';
import { ApproveCommunityUseCase } from './application/commands/approve-community.use-case.js';
import { SubmitProposalUseCase } from './application/commands/submit-proposal.use-case.js';
import { ReviewProposalUseCase } from './application/commands/review-proposal.use-case.js';
import { GetCommunityQuery } from './application/queries/get-community.query.js';
import { ListCommunitiesQuery } from './application/queries/list-communities.query.js';
import { ListProposalsQuery } from './application/queries/list-proposals.query.js';
import { COMMUNITY_READER_PORT } from './application/ports/community-reader.port.js';
import { COMMUNITY_WRITER_PORT } from './application/ports/community-writer.port.js';
import { COMMUNITY_PROPOSAL_READER_PORT } from './application/ports/proposal-reader.port.js';
import { COMMUNITY_PROPOSAL_WRITER_PORT } from './application/ports/proposal-writer.port.js';
import { PrismaCommunityRepository } from './infrastructure/persistence/prisma-community.repository.js';
import { PrismaCommunityProposalRepository } from './infrastructure/persistence/prisma-community-proposal.repository.js';

import { PostsController } from './presentation/http/controllers/posts.controller.js';
import { CreatePostUseCase } from './application/commands/create-post.use-case.js';
import { ListCommunityPostsQuery } from './application/queries/list-community-posts.query.js';
import { ListFeedPostsQuery } from './application/queries/list-feed-posts.query.js';
import { POST_READER_PORT } from './application/ports/post-reader.port.js';
import { POST_WRITER_PORT } from './application/ports/post-writer.port.js';
import { PrismaPostRepository } from './infrastructure/persistence/prisma-post.repository.js';

/**
 * Module Métier : Communautés & Propositions Citoyennes (Niveau 2)
 */
@Module({
  imports: [DatabaseModule, AuditModule, NotificationsModule],
  controllers: [
    CommunitiesController,
    CommunityProposalsController,
    PostsController,
  ],
  providers: [
    PrismaCommunityRepository,
    {
      provide: COMMUNITY_READER_PORT,
      useExisting: PrismaCommunityRepository,
    },
    {
      provide: COMMUNITY_WRITER_PORT,
      useExisting: PrismaCommunityRepository,
    },
    PrismaCommunityProposalRepository,
    {
      provide: COMMUNITY_PROPOSAL_READER_PORT,
      useExisting: PrismaCommunityProposalRepository,
    },
    {
      provide: COMMUNITY_PROPOSAL_WRITER_PORT,
      useExisting: PrismaCommunityProposalRepository,
    },
    PrismaPostRepository,
    {
      provide: POST_READER_PORT,
      useExisting: PrismaPostRepository,
    },
    {
      provide: POST_WRITER_PORT,
      useExisting: PrismaPostRepository,
    },
    ApproveCommunityUseCase,
    SubmitProposalUseCase,
    ReviewProposalUseCase,
    GetCommunityQuery,
    ListCommunitiesQuery,
    ListProposalsQuery,
    CreatePostUseCase,
    ListCommunityPostsQuery,
    ListFeedPostsQuery,
  ],
  exports: [
    COMMUNITY_READER_PORT,
    COMMUNITY_WRITER_PORT,
    COMMUNITY_PROPOSAL_READER_PORT,
    COMMUNITY_PROPOSAL_WRITER_PORT,
    POST_READER_PORT,
    POST_WRITER_PORT,
    ApproveCommunityUseCase,
    SubmitProposalUseCase,
    ReviewProposalUseCase,
    GetCommunityQuery,
    ListCommunitiesQuery,
    ListProposalsQuery,
    CreatePostUseCase,
    ListCommunityPostsQuery,
    ListFeedPostsQuery,
  ],
})
export class CommunitiesModule {}
