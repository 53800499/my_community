import { Inject, Injectable, Optional } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'node:crypto';
import {
  ReactionEntity,
  type ReactionTargetType,
  type ReactionValueType,
} from '../../domain/entities/reaction.entity.js';
import {
  ReactionToggledDomainEvent,
  type ReactionActionType,
} from '../../domain/events/reaction-toggled.domain-event.js';
import {
  SOCIAL_READER_PORT,
  type SocialReaderPort,
} from '../ports/social-reader.port.js';
import {
  SOCIAL_WRITER_PORT,
  type SocialWriterPort,
} from '../ports/social-writer.port.js';

export interface ToggleReactionCommand {
  userId: string;
  targetType: ReactionTargetType;
  targetId: string;
  reactionType: ReactionValueType;
}

export interface ToggleReactionResult {
  action: ReactionActionType;
  reactionType: ReactionValueType | null;
  targetType: ReactionTargetType;
  targetId: string;
}

@Injectable()
export class ToggleReactionUseCase {
  constructor(
    @Inject(SOCIAL_READER_PORT)
    private readonly socialReader: SocialReaderPort,
    @Inject(SOCIAL_WRITER_PORT)
    private readonly socialWriter: SocialWriterPort,
    @Optional()
    private readonly eventEmitter?: EventEmitter2,
  ) {}

  public async execute(command: ToggleReactionCommand): Promise<ToggleReactionResult> {
    const existing = await this.socialReader.findReaction(
      command.userId,
      command.targetType,
      command.targetId,
    );

    let action: ReactionActionType;
    let resultingReactionType: ReactionValueType | null = null;

    if (existing) {
      if (existing.type === command.reactionType) {
        // Même réaction cliquée -> Retrait (Unlike)
        await this.socialWriter.deleteReaction(
          command.userId,
          command.targetType,
          command.targetId,
        );
        action = 'REMOVED';
        resultingReactionType = null;
      } else {
        // Changement de type de réaction (ex: LIKE -> LOVE)
        existing.changeType(command.reactionType);
        await this.socialWriter.saveReaction(existing);
        action = 'UPDATED';
        resultingReactionType = command.reactionType;
      }
    } else {
      // Nouvelle réaction
      const newReaction = ReactionEntity.create({
        id: randomUUID(),
        userId: command.userId,
        targetType: command.targetType,
        targetId: command.targetId,
        type: command.reactionType,
      });
      await this.socialWriter.saveReaction(newReaction);
      action = 'ADDED';
      resultingReactionType = command.reactionType;
    }

    if (this.eventEmitter) {
      this.eventEmitter.emit(
        ReactionToggledDomainEvent.EVENT_NAME,
        new ReactionToggledDomainEvent(
          command.userId,
          command.targetType,
          command.targetId,
          command.reactionType,
          action,
        ),
      );
    }

    return {
      action,
      reactionType: resultingReactionType,
      targetType: command.targetType,
      targetId: command.targetId,
    };
  }
}
