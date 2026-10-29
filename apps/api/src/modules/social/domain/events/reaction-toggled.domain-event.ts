import type { ReactionTargetType, ReactionValueType } from '../entities/reaction.entity.js';

export type ReactionActionType = 'ADDED' | 'UPDATED' | 'REMOVED';

export class ReactionToggledDomainEvent {
  public static readonly EVENT_NAME = 'social.reaction.toggled';

  constructor(
    public readonly userId: string,
    public readonly targetType: ReactionTargetType,
    public readonly targetId: string,
    public readonly reactionType: ReactionValueType,
    public readonly action: ReactionActionType,
    public readonly timestamp: Date = new Date(),
  ) {}
}
