// Module
export { SocialModule } from './social.module.js';

// Domaine - Entités
export { CommentEntity } from './domain/entities/comment.entity.js';
export type { CommentProps, CommentStatusType } from './domain/entities/comment.entity.js';

export { ReactionEntity } from './domain/entities/reaction.entity.js';
export type {
  ReactionProps,
  ReactionTargetType,
  ReactionValueType,
} from './domain/entities/reaction.entity.js';

// Domaine - Événements
export { CommentAddedDomainEvent } from './domain/events/comment-added.domain-event.js';
export {
  ReactionToggledDomainEvent,
  type ReactionActionType,
} from './domain/events/reaction-toggled.domain-event.js';

// Ports
export {
  SOCIAL_READER_PORT,
  type SocialReaderPort,
  type ReactionsSummary,
} from './application/ports/social-reader.port.js';

export {
  SOCIAL_WRITER_PORT,
  type SocialWriterPort,
} from './application/ports/social-writer.port.js';

// Cas d'usage
export {
  AddCommentUseCase,
  type AddCommentCommand,
} from './application/commands/add-comment.use-case.js';

export {
  DeleteCommentUseCase,
  type DeleteCommentCommand,
} from './application/commands/delete-comment.use-case.js';

export {
  ToggleReactionUseCase,
  type ToggleReactionCommand,
  type ToggleReactionResult,
} from './application/commands/toggle-reaction.use-case.js';

// Requêtes
export {
  ListPostCommentsQuery,
  type CommentWithReplies,
} from './application/queries/list-post-comments.query.js';

export { GetReactionsSummaryQuery } from './application/queries/get-reactions-summary.query.js';

// Contrôleur & DTOs
export { SocialController } from './presentation/http/social.controller.js';
export { AddCommentDto } from './presentation/http/dto/add-comment.dto.js';
export { ToggleReactionDto } from './presentation/http/dto/toggle-reaction.dto.js';
export { CommentResponseDto } from './presentation/http/dto/comment-response.dto.js';
export { ReactionsSummaryResponseDto } from './presentation/http/dto/reactions-summary-response.dto.js';
