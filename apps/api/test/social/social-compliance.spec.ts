import { describe, it, expect, vi, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

// Social Domain
import {
  CommentEntity,
  type CommentProps,
} from '../../src/modules/social/domain/entities/comment.entity.js';
import {
  ReactionEntity,
  type ReactionProps,
  type ReactionTargetType,
  type ReactionValueType,
} from '../../src/modules/social/domain/entities/reaction.entity.js';
import { CommentAddedDomainEvent } from '../../src/modules/social/domain/events/comment-added.domain-event.js';
import {
  ReactionToggledDomainEvent,
  type ReactionActionType,
} from '../../src/modules/social/domain/events/reaction-toggled.domain-event.js';

// Social Ports & Use Cases
import type {
  SocialReaderPort,
  ReactionsSummary,
} from '../../src/modules/social/application/ports/social-reader.port.js';
import type { SocialWriterPort } from '../../src/modules/social/application/ports/social-writer.port.js';
import { AddCommentUseCase } from '../../src/modules/social/application/commands/add-comment.use-case.js';
import { DeleteCommentUseCase } from '../../src/modules/social/application/commands/delete-comment.use-case.js';
import { ToggleReactionUseCase } from '../../src/modules/social/application/commands/toggle-reaction.use-case.js';
import { ListPostCommentsQuery } from '../../src/modules/social/application/queries/list-post-comments.query.js';
import { GetReactionsSummaryQuery } from '../../src/modules/social/application/queries/get-reactions-summary.query.js';

// Audit
import type { AuditLoggerPort } from '../../src/modules/audit/application/ports/audit-logger.port.js';
import { AuditLogEntity } from '../../src/modules/audit/domain/entities/audit-log.entity.js';

/**
 * InMemory Social Repository (DIP & LSP compliant test double)
 */
class InMemorySocialRepository implements SocialReaderPort, SocialWriterPort {
  public comments = new Map<string, CommentEntity>();
  public reactions = new Map<string, ReactionEntity>();

  private getReactionKey(userId: string, targetType: string, targetId: string): string {
    return `${userId}:${targetType}:${targetId}`;
  }

  async findCommentById(id: string): Promise<CommentEntity | null> {
    return this.comments.get(id) ?? null;
  }

  async listCommentsByPost(postId: string): Promise<CommentEntity[]> {
    return Array.from(this.comments.values())
      .filter((c) => c.postId === postId && c.status !== 'REMOVED')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async countCommentsByPost(postId: string): Promise<number> {
    const list = await this.listCommentsByPost(postId);
    return list.length;
  }

  async findReaction(
    userId: string,
    targetType: ReactionTargetType,
    targetId: string,
  ): Promise<ReactionEntity | null> {
    return this.reactions.get(this.getReactionKey(userId, targetType, targetId)) ?? null;
  }

  async getReactionsSummary(
    targetType: ReactionTargetType,
    targetId: string,
    currentUserId?: string,
  ): Promise<ReactionsSummary> {
    const matching = Array.from(this.reactions.values()).filter(
      (r) => r.targetType === targetType && r.targetId === targetId,
    );

    const countsByType: Record<ReactionValueType, number> = {
      LIKE: 0,
      LOVE: 0,
      CELEBRATE: 0,
      SUPPORT: 0,
      INSIGHTFUL: 0,
    };

    let userReaction: ReactionValueType | null = null;

    for (const r of matching) {
      countsByType[r.type] += 1;
      if (currentUserId && r.userId === currentUserId) {
        userReaction = r.type;
      }
    }

    return {
      targetType,
      targetId,
      totalCount: matching.length,
      countsByType,
      userReaction,
    };
  }

  async listUserReactions(
    userId: string,
    targetType: ReactionTargetType,
    targetIds: string[],
  ): Promise<ReactionEntity[]> {
    const targetSet = new Set(targetIds);
    return Array.from(this.reactions.values()).filter(
      (r) => r.userId === userId && r.targetType === targetType && targetSet.has(r.targetId),
    );
  }

  async saveComment(comment: CommentEntity): Promise<void> {
    this.comments.set(comment.id, comment);
  }

  async deleteComment(id: string): Promise<void> {
    this.comments.delete(id);
  }

  async saveReaction(reaction: ReactionEntity): Promise<void> {
    this.reactions.set(
      this.getReactionKey(reaction.userId, reaction.targetType, reaction.targetId),
      reaction,
    );
  }

  async deleteReaction(
    userId: string,
    targetType: ReactionTargetType,
    targetId: string,
  ): Promise<void> {
    this.reactions.delete(this.getReactionKey(userId, targetType, targetId));
  }
}

describe('Niveau 4 : Module Social — Conformité SOLID & Règles Métier', () => {
  let repository: InMemorySocialRepository;
  let auditLogger: AuditLoggerPort;
  let eventEmitter: EventEmitter2;

  let addCommentUseCase: AddCommentUseCase;
  let deleteCommentUseCase: DeleteCommentUseCase;
  let toggleReactionUseCase: ToggleReactionUseCase;
  let listPostCommentsQuery: ListPostCommentsQuery;
  let getReactionsSummaryQuery: GetReactionsSummaryQuery;

  const emittedEvents: { name: string; payload: unknown }[] = [];
  const auditLogs: AuditLogEntity[] = [];

  const postId = '11111111-1111-4111-8111-111111111111';
  const authorAliceId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const userBobId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const userCharlieId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

  beforeEach(() => {
    repository = new InMemorySocialRepository();
    emittedEvents.length = 0;
    auditLogs.length = 0;

    eventEmitter = {
      emit: vi.fn((name: string, payload: unknown) => {
        emittedEvents.push({ name, payload });
        return true;
      }),
    } as unknown as EventEmitter2;

    auditLogger = {
      log: vi.fn(async (log: AuditLogEntity) => {
        auditLogs.push(log);
      }),
    };

    addCommentUseCase = new AddCommentUseCase(
      repository,
      repository,
      undefined, // Optional PostReaderPort
      auditLogger,
      eventEmitter,
    );
    deleteCommentUseCase = new DeleteCommentUseCase(repository, repository, auditLogger);
    toggleReactionUseCase = new ToggleReactionUseCase(repository, repository, eventEmitter);
    listPostCommentsQuery = new ListPostCommentsQuery(repository);
    getReactionsSummaryQuery = new GetReactionsSummaryQuery(repository);
  });

  describe('1. Invariants du Domaine Pur (CommentEntity & ReactionEntity)', () => {
    it('Refuse la création de commentaires invalides (vides ou trop longs)', () => {
      expect(() =>
        CommentEntity.create({
          id: randomUUID(),
          postId,
          authorId: authorAliceId,
          content: '',
        }),
      ).toThrow('Le commentaire ne peut pas être vide.');

      expect(() =>
        CommentEntity.create({
          id: randomUUID(),
          postId,
          authorId: authorAliceId,
          content: 'a'.repeat(1001),
        }),
      ).toThrow('Le commentaire ne peut pas excéder 1 000 caractères.');
    });

    it('Gère les transitions de cycle de vie du commentaire (mise à jour, masquage)', () => {
      const comment = CommentEntity.create({
        id: randomUUID(),
        postId,
        authorId: authorAliceId,
        content: 'Commentaire initial',
      });

      expect(comment.status).toBe('PUBLISHED');
      comment.updateContent('Commentaire révisé');
      expect(comment.content).toBe('Commentaire révisé');

      comment.markHidden();
      expect(comment.status).toBe('HIDDEN');

      comment.markRemoved();
      expect(comment.status).toBe('REMOVED');
    });

    it('Refuse les types de réactions ou cibles non conformes', () => {
      expect(() =>
        ReactionEntity.create({
          id: randomUUID(),
          userId: authorAliceId,
          targetType: 'INVALID' as unknown as ReactionTargetType,
          targetId: postId,
          type: 'LIKE',
        }),
      ).toThrow("Le type de cible doit être 'POST' ou 'COMMENT'.");

      expect(() =>
        ReactionEntity.create({
          id: randomUUID(),
          userId: authorAliceId,
          targetType: 'POST',
          targetId: postId,
          type: 'DISLIKE' as unknown as ReactionValueType,
        }),
      ).toThrow('Type de réaction non valide');
    });
  });

  describe('2. Cas d\'Usage : Commentaires & Règle de Profondeur Maximale (Depth = 2)', () => {
    it('Ajoute un commentaire racine et émet l\'événement de domaine', async () => {
      const comment = await addCommentUseCase.execute({
        postId,
        authorId: authorAliceId,
        content: 'Excellente publication pour la commune !',
      });

      expect(comment.id).toBeDefined();
      expect(comment.parentId).toBeNull();
      expect(comment.content).toBe('Excellente publication pour la commune !');

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        CommentAddedDomainEvent.EVENT_NAME,
        expect.any(CommentAddedDomainEvent),
      );
      expect(auditLogs).toHaveLength(1);
      expect(auditLogs[0].action).toBe('SOCIAL_COMMENT_ADDED');
    });

    it('Ajoute une réponse directe rattachée au commentaire racine (Niveau 2)', async () => {
      const rootComment = await addCommentUseCase.execute({
        postId,
        authorId: authorAliceId,
        content: 'Question sur la collecte des déchets ?',
      });

      const reply = await addCommentUseCase.execute({
        postId,
        authorId: userBobId,
        content: 'Le passage est prévu mardi matin.',
        parentId: rootComment.id,
      });

      expect(reply.parentId).toBe(rootComment.id);
    });

    it('Applique la règle de profondeur max (Depth = 2) en aplatissant une réponse sur une réponse', async () => {
      // 1. Commentaire racine (Niveau 1)
      const root = await addCommentUseCase.execute({
        postId,
        authorId: authorAliceId,
        content: 'Idée de tournoi de football inter-quartiers.',
      });

      // 2. Première réponse (Niveau 2)
      const reply1 = await addCommentUseCase.execute({
        postId,
        authorId: userBobId,
        content: 'Très bonne idée, quel terrain ?',
        parentId: root.id,
      });
      expect(reply1.parentId).toBe(root.id);

      // 3. Réponse à la réponse (Devrait être Niveau 3, aplatie automatiquement au Niveau 2 racine)
      const reply2 = await addCommentUseCase.execute({
        postId,
        authorId: userCharlieId,
        content: 'Le terrain de Zogbadjè face au campus.',
        parentId: reply1.id, // Vise la réponse reply1
      });

      // L'invariant aplatit automatiquement le parentId sur la racine root.id !
      expect(reply2.parentId).toBe(root.id);
    });

    it('Rejette la création d\'une réponse si le parent n\'existe pas', async () => {
      await expect(
        addCommentUseCase.execute({
          postId,
          authorId: userBobId,
          content: 'Réponse fantôme',
          parentId: randomUUID(),
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('3. Suppression & Autorisations de Commentaires', () => {
    it('Permet à l\'auteur de supprimer son propre commentaire', async () => {
      const comment = await addCommentUseCase.execute({
        postId,
        authorId: authorAliceId,
        content: 'Mon commentaire à supprimer',
      });

      await deleteCommentUseCase.execute({
        commentId: comment.id,
        requesterUserId: authorAliceId,
      });

      const found = await repository.findCommentById(comment.id);
      expect(found).toBeNull();
    });

    it('Permet à un modérateur de supprimer n\'importe quel commentaire', async () => {
      const comment = await addCommentUseCase.execute({
        postId,
        authorId: authorAliceId,
        content: 'Commentaire modéré',
      });

      await deleteCommentUseCase.execute({
        commentId: comment.id,
        requesterUserId: userBobId,
        isModerator: true,
      });

      const found = await repository.findCommentById(comment.id);
      expect(found).toBeNull();
    });

    it('Interdit la suppression d\'un commentaire par un utilisateur tiers non-modérateur', async () => {
      const comment = await addCommentUseCase.execute({
        postId,
        authorId: authorAliceId,
        content: 'Commentaire protégé',
      });

      await expect(
        deleteCommentUseCase.execute({
          commentId: comment.id,
          requesterUserId: userBobId,
          isModerator: false,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('4. Cas d\'Usage : Réactions Affectives (Toggle Reaction)', () => {
    it('Ajoute une nouvelle réaction LIKE', async () => {
      const res = await toggleReactionUseCase.execute({
        userId: userBobId,
        targetType: 'POST',
        targetId: postId,
        reactionType: 'LIKE',
      });

      expect(res.action).toBe('ADDED');
      expect(res.reactionType).toBe('LIKE');

      const reaction = await repository.findReaction(userBobId, 'POST', postId);
      expect(reaction).toBeDefined();
      expect(reaction?.type).toBe('LIKE');

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        ReactionToggledDomainEvent.EVENT_NAME,
        expect.any(ReactionToggledDomainEvent),
      );
    });

    it('Retire la réaction (Unlike) lorsque l\'utilisateur clique une deuxième fois', async () => {
      // 1. Premier clic -> Ajout
      await toggleReactionUseCase.execute({
        userId: userBobId,
        targetType: 'POST',
        targetId: postId,
        reactionType: 'LIKE',
      });

      // 2. Deuxième clic -> Retrait
      const res = await toggleReactionUseCase.execute({
        userId: userBobId,
        targetType: 'POST',
        targetId: postId,
        reactionType: 'LIKE',
      });

      expect(res.action).toBe('REMOVED');
      expect(res.reactionType).toBeNull();

      const reaction = await repository.findReaction(userBobId, 'POST', postId);
      expect(reaction).toBeNull();
    });

    it('Met à jour le type de réaction si l\'utilisateur choisit une émotion différente (ex: LIKE -> LOVE)', async () => {
      // 1. Ajout initial LIKE
      await toggleReactionUseCase.execute({
        userId: userBobId,
        targetType: 'POST',
        targetId: postId,
        reactionType: 'LIKE',
      });

      // 2. Changement vers LOVE
      const res = await toggleReactionUseCase.execute({
        userId: userBobId,
        targetType: 'POST',
        targetId: postId,
        reactionType: 'LOVE',
      });

      expect(res.action).toBe('UPDATED');
      expect(res.reactionType).toBe('LOVE');

      const reaction = await repository.findReaction(userBobId, 'POST', postId);
      expect(reaction?.type).toBe('LOVE');
    });
  });

  describe('5. Requêtes de Consultation (Tree Comments & Reactions Summary)', () => {
    it('Structure les commentaires d\'un post en arborescence racine / réponses', async () => {
      const root1 = await addCommentUseCase.execute({
        postId,
        authorId: authorAliceId,
        content: 'Premier fil de discussion',
      });

      const reply1 = await addCommentUseCase.execute({
        postId,
        authorId: userBobId,
        content: 'Réponse sous le premier fil',
        parentId: root1.id,
      });

      const root2 = await addCommentUseCase.execute({
        postId,
        authorId: userCharlieId,
        content: 'Second fil indépendant',
      });

      const tree = await listPostCommentsQuery.execute(postId);
      expect(tree).toHaveLength(2);

      const firstBranch = tree.find((t) => t.comment.id === root1.id);
      expect(firstBranch).toBeDefined();
      expect(firstBranch?.replies).toHaveLength(1);
      expect(firstBranch?.replies[0].id).toBe(reply1.id);

      const secondBranch = tree.find((t) => t.comment.id === root2.id);
      expect(secondBranch?.replies).toHaveLength(0);
    });

    it('Calcule la synthèse des réactions avec décompte par émotion et statut utilisateur', async () => {
      // Alice -> LIKE
      await toggleReactionUseCase.execute({
        userId: authorAliceId,
        targetType: 'POST',
        targetId: postId,
        reactionType: 'LIKE',
      });

      // Bob -> LOVE
      await toggleReactionUseCase.execute({
        userId: userBobId,
        targetType: 'POST',
        targetId: postId,
        reactionType: 'LOVE',
      });

      // Charlie -> LIKE
      await toggleReactionUseCase.execute({
        userId: userCharlieId,
        targetType: 'POST',
        targetId: postId,
        reactionType: 'LIKE',
      });

      const summaryAlice = await getReactionsSummaryQuery.execute('POST', postId, authorAliceId);
      expect(summaryAlice.totalCount).toBe(3);
      expect(summaryAlice.countsByType.LIKE).toBe(2);
      expect(summaryAlice.countsByType.LOVE).toBe(1);
      expect(summaryAlice.countsByType.CELEBRATE).toBe(0);
      expect(summaryAlice.userReaction).toBe('LIKE');

      const summaryBob = await getReactionsSummaryQuery.execute('POST', postId, userBobId);
      expect(summaryBob.userReaction).toBe('LOVE');

      const anonymousSummary = await getReactionsSummaryQuery.execute('POST', postId);
      expect(anonymousSummary.userReaction).toBeNull();
    });
  });
});
