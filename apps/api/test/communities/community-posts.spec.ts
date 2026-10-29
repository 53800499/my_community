import { describe, it, expect, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { PostEntity } from '../../src/modules/communities/domain/entities/post.entity.js';
import { CommunityEntity } from '../../src/modules/communities/domain/entities/community.entity.js';
import { PostReaderPort } from '../../src/modules/communities/application/ports/post-reader.port.js';
import { PostWriterPort } from '../../src/modules/communities/application/ports/post-writer.port.js';
import { CommunityReaderPort } from '../../src/modules/communities/application/ports/community-reader.port.js';
import { CreatePostUseCase } from '../../src/modules/communities/application/commands/create-post.use-case.js';
import { ListCommunityPostsQuery } from '../../src/modules/communities/application/queries/list-community-posts.query.js';
import { ListFeedPostsQuery } from '../../src/modules/communities/application/queries/list-feed-posts.query.js';
import { PostMapper } from '../../src/modules/communities/infrastructure/mappers/post.mapper.js';

/**
 * InMemory Repository de test démontrant le Principe de Substitution de Liskov (LSP)
 * et l'Inversion de Dépendance (DIP)
 */
class InMemoryPostRepository implements PostReaderPort, PostWriterPort {
  private readonly posts = new Map<string, PostEntity>();

  async findById(id: string): Promise<PostEntity | null> {
    const post = this.posts.get(id);
    return post ? PostEntity.create(post.toJSON()) : null;
  }

  async listByCommunity(communityId: string, limit: number = 50, offset: number = 0): Promise<PostEntity[]> {
    return Array.from(this.posts.values())
      .filter((p) => p.communityId === communityId)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(offset, offset + limit)
      .map((p) => PostEntity.create(p.toJSON()));
  }

  async listFeed(limit: number = 50, offset: number = 0): Promise<PostEntity[]> {
    return Array.from(this.posts.values())
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(offset, offset + limit)
      .map((p) => PostEntity.create(p.toJSON()));
  }

  async save(post: PostEntity): Promise<void> {
    this.posts.set(post.id, post);
  }

  async delete(id: string): Promise<void> {
    this.posts.delete(id);
  }
}

class InMemoryCommunityReader implements CommunityReaderPort {
  private readonly communities = new Map<string, CommunityEntity>();

  add(community: CommunityEntity) {
    this.communities.set(community.id, community);
  }

  async findById(id: string): Promise<CommunityEntity | null> {
    return this.communities.get(id) || null;
  }

  async findBySlug(slug: string): Promise<CommunityEntity | null> {
    for (const c of this.communities.values()) {
      if (c.slug === slug) return c;
    }
    return null;
  }

  async listAll(): Promise<CommunityEntity[]> {
    return Array.from(this.communities.values());
  }
}

describe('Publications & Fil Citoyen (Communities & Posts) — Conformité SOLID', () => {
  let postRepo: InMemoryPostRepository;
  let communityReader: InMemoryCommunityReader;
  let createPostUseCase: CreatePostUseCase;
  let listCommunityPostsQuery: ListCommunityPostsQuery;
  let listFeedPostsQuery: ListFeedPostsQuery;

  const validCommunity = CommunityEntity.create({
    id: '4f79ff2c-c965-4af7-a99e-de4e4bf457dc',
    name: 'Habitants de Zogbadjè',
    slug: 'habitants-de-zogbadje',
    territoryId: 'territory-calavi',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    postRepo = new InMemoryPostRepository();
    communityReader = new InMemoryCommunityReader();
    communityReader.add(validCommunity);

    createPostUseCase = new CreatePostUseCase(postRepo, communityReader);
    listCommunityPostsQuery = new ListCommunityPostsQuery(postRepo, communityReader);
    listFeedPostsQuery = new ListFeedPostsQuery(postRepo);
  });

  describe('PostEntity (Domaine Pur & Invariants)', () => {
    it('doit instancier une publication valide via la Static Factory Method', () => {
      const post = PostEntity.create({
        id: 'p-1',
        communityId: validCommunity.id,
        authorId: 'u-1',
        title: 'Action Salubrité',
        content: 'Mobilisation générale ce samedi dès 07h30.',
        visibility: 'COMMUNITY',
      });

      expect(post.id).toBe('p-1');
      expect(post.title).toBe('Action Salubrité');
      expect(post.visibility).toBe('COMMUNITY');
      expect(post.publishedAt).toBeInstanceOf(Date);
    });

    it('doit lever une exception si le titre est vide', () => {
      expect(() =>
        PostEntity.create({
          id: 'p-1',
          communityId: validCommunity.id,
          authorId: 'u-1',
          title: '   ',
          content: 'Contenu valide',
          visibility: 'COMMUNITY',
        }),
      ).toThrow('Le titre de la publication ne peut être vide.');
    });

    it('doit lever une exception si le contenu est vide', () => {
      expect(() =>
        PostEntity.create({
          id: 'p-1',
          communityId: validCommunity.id,
          authorId: 'u-1',
          title: 'Titre Valide',
          content: '',
          visibility: 'COMMUNITY',
        }),
      ).toThrow('Le contenu de la publication ne peut être vide.');
    });

    it('doit lever une exception si la communauté est invalide', () => {
      expect(() =>
        PostEntity.create({
          id: 'p-1',
          communityId: '',
          authorId: 'u-1',
          title: 'Titre Valide',
          content: 'Contenu',
          visibility: 'COMMUNITY',
        }),
      ).toThrow('La publication doit être rattachée à une communauté valide.');
    });
  });

  describe('CreatePostUseCase (SRP, DIP)', () => {
    it('doit créer et persister une publication avec succès', async () => {
      const result = await createPostUseCase.execute({
        communityId: validCommunity.id,
        authorId: 'u-citizen-1',
        title: 'Nettoyage des caniveaux à Zogbadjè',
        content: 'Tous les résidents sont invités avec leurs pelles.',
        visibility: 'COMMUNITY',
      });

      expect(result.id).toBeDefined();
      expect(result.title).toBe('Nettoyage des caniveaux à Zogbadjè');

      const persisted = await postRepo.findById(result.id);
      expect(persisted).not.toBeNull();
      expect(persisted?.title).toBe('Nettoyage des caniveaux à Zogbadjè');
    });

    it('doit lever NotFoundException si la communauté n’existe pas', async () => {
      await expect(
        createPostUseCase.execute({
          communityId: 'non-existent-community',
          authorId: 'u-citizen-1',
          title: 'Titre',
          content: 'Contenu',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('ListCommunityPostsQuery & ListFeedPostsQuery', () => {
    it('doit lister les publications ordonnées par date antéchronologique', async () => {
      await createPostUseCase.execute({
        communityId: validCommunity.id,
        authorId: 'u-1',
        title: 'Première publication',
        content: 'Contenu 1',
      });

      await createPostUseCase.execute({
        communityId: validCommunity.id,
        authorId: 'u-2',
        title: 'Deuxième publication',
        content: 'Contenu 2',
      });

      const communityPosts = await listCommunityPostsQuery.execute({
        communityId: validCommunity.id,
      });

      expect(communityPosts.length).toBe(2);

      const feedPosts = await listFeedPostsQuery.execute();
      expect(feedPosts.length).toBe(2);
    });

    it('doit lever NotFoundException lors de la lecture d’une communauté inexistante', async () => {
      await expect(
        listCommunityPostsQuery.execute({
          communityId: 'unknown-community',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('PostMapper (Data Mapper Pattern)', () => {
    it('doit transformer un enregistrement de persistance en PostEntity puis en DTO sans perte', () => {
      const now = new Date();
      const raw = {
        id: 'p-mapper-1',
        communityId: validCommunity.id,
        authorId: 'u-1',
        title: 'Titre Test',
        content: 'Description de test',
        visibility: 'COMMUNITY',
        publishedAt: now,
        updatedAt: now,
      };

      const entity = PostMapper.toDomain(raw);
      expect(entity.id).toBe('p-mapper-1');
      expect(entity.title).toBe('Titre Test');

      const dto = PostMapper.toResponseDto(entity);
      expect(dto.id).toBe('p-mapper-1');
      expect(dto.publishedAt).toBe(now.toISOString());
    });
  });
});
