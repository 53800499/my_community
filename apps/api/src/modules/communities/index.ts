/**
 * Façade Publique Stricte du Module Communautés (Niveau 2)
 */

// Module
export { CommunitiesModule } from './communities.module.js';

// Domaine
export { CommunityEntity } from './domain/entities/community.entity.js';
export type { CommunityProps } from './domain/entities/community.entity.js';
export { CommunityProposalEntity } from './domain/entities/community-proposal.entity.js';
export type {
  CommunityProposalProps,
  ProposalStatus,
} from './domain/entities/community-proposal.entity.js';
export { Slug } from './domain/value-objects/slug.vo.js';
export { CommunityApprovalPolicy } from './domain/policies/community-approval.policy.js';

// Ports
export {
  CommunityReaderPort,
  COMMUNITY_READER_PORT,
} from './application/ports/community-reader.port.js';
export {
  CommunityWriterPort,
  COMMUNITY_WRITER_PORT,
} from './application/ports/community-writer.port.js';
export {
  CommunityProposalReaderPort,
  COMMUNITY_PROPOSAL_READER_PORT,
} from './application/ports/proposal-reader.port.js';
export {
  CommunityProposalWriterPort,
  COMMUNITY_PROPOSAL_WRITER_PORT,
} from './application/ports/proposal-writer.port.js';

// Cas d'Usage
export { ApproveCommunityUseCase } from './application/commands/approve-community.use-case.js';
export type { ApproveCommunityCommand } from './application/commands/approve-community.use-case.js';
export { SubmitProposalUseCase } from './application/commands/submit-proposal.use-case.js';
export type { SubmitProposalCommand } from './application/commands/submit-proposal.command.js';
export { ReviewProposalUseCase } from './application/commands/review-proposal.use-case.js';
export type { ReviewProposalResult } from './application/commands/review-proposal.use-case.js';
export type { ReviewProposalCommand } from './application/commands/review-proposal.command.js';

// Requêtes
export { GetCommunityQuery } from './application/queries/get-community.query.js';
export type { GetCommunityQueryInput } from './application/queries/get-community.query.js';
export { ListCommunitiesQuery } from './application/queries/list-communities.query.js';
export { ListProposalsQuery } from './application/queries/list-proposals.query.js';
export type { ListProposalsParams } from './application/queries/list-proposals.query.js';

// DTOs & Mappers
export { CommunityResponseDto } from './presentation/http/dto/community-response.dto.js';
export { CommunityProposalResponseDto } from './presentation/http/dto/community-proposal-response.dto.js';
export { SubmitProposalDto } from './presentation/http/dto/submit-proposal.dto.js';
export { ReviewProposalDto } from './presentation/http/dto/review-proposal.dto.js';
export { CommunityMapper } from './infrastructure/mappers/community.mapper.js';
export { CommunityProposalMapper } from './infrastructure/mappers/community-proposal.mapper.js';

// Publications & Fil Citoyen
export { PostEntity } from './domain/entities/post.entity.js';
export type { PostEntityProps, PostVisibilityType } from './domain/entities/post.entity.js';
export { POST_READER_PORT } from './application/ports/post-reader.port.js';
export type { PostReaderPort } from './application/ports/post-reader.port.js';
export { POST_WRITER_PORT } from './application/ports/post-writer.port.js';
export type { PostWriterPort } from './application/ports/post-writer.port.js';
export { CreatePostUseCase } from './application/commands/create-post.use-case.js';
export type { CreatePostCommand } from './application/commands/create-post.use-case.js';
export { ListCommunityPostsQuery } from './application/queries/list-community-posts.query.js';
export type { ListCommunityPostsParams } from './application/queries/list-community-posts.query.js';
export { ListFeedPostsQuery } from './application/queries/list-feed-posts.query.js';
export type { ListFeedPostsParams } from './application/queries/list-feed-posts.query.js';
export { CreatePostDto } from './presentation/http/dto/create-post.dto.js';
export { PostResponseDto } from './presentation/http/dto/post-response.dto.js';
export { PostMapper } from './infrastructure/mappers/post.mapper.js';
export { PostsController } from './presentation/http/controllers/posts.controller.js';
