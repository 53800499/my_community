import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../platform/database/prisma.service.js';
import { PostEntity } from '../../domain/entities/post.entity.js';
import { PostReaderPort } from '../../application/ports/post-reader.port.js';
import { PostWriterPort } from '../../application/ports/post-writer.port.js';
import { PostMapper } from '../mappers/post.mapper.js';

/**
 * Adaptateur de Persistance Prisma : Implémente PostReaderPort et PostWriterPort (LSP, DIP).
 */
@Injectable()
export class PrismaPostRepository implements PostReaderPort, PostWriterPort {
  private readonly logger = new Logger(PrismaPostRepository.name);
  private readonly inMemoryFallback = new Map<string, PostEntity>();

  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PostEntity | null> {
    try {
      const raw = await this.prisma.post.findUnique({
        where: { id },
      });
      if (!raw) return this.inMemoryFallback.get(id) || null;

      return PostMapper.toDomain(raw);
    } catch (err) {
      this.logger.warn(`Prisma indisponible pour findById(${id}), utilisation du cache en mémoire : ${(err as Error).message}`);
      return this.inMemoryFallback.get(id) || null;
    }
  }

  async listByCommunity(communityId: string, limit: number = 50, offset: number = 0): Promise<PostEntity[]> {
    try {
      const records = await this.prisma.post.findMany({
        where: { communityId },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip: offset,
      });

      if (records.length > 0) {
        return records.map((r) => PostMapper.toDomain(r));
      }
    } catch (err) {
      this.logger.warn(`Prisma indisponible pour listByCommunity(${communityId}) : ${(err as Error).message}`);
    }

    // Fallback mémoire
    return Array.from(this.inMemoryFallback.values())
      .filter((p) => p.communityId === communityId)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(offset, offset + limit);
  }

  async listFeed(limit: number = 50, offset: number = 0): Promise<PostEntity[]> {
    try {
      const records = await this.prisma.post.findMany({
        where: { visibility: { in: ['PUBLIC', 'COMMUNITY'] } },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip: offset,
      });

      if (records.length > 0) {
        return records.map((r) => PostMapper.toDomain(r));
      }
    } catch (err) {
      this.logger.warn(`Prisma indisponible pour listFeed() : ${(err as Error).message}`);
    }

    // Fallback mémoire
    return Array.from(this.inMemoryFallback.values())
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(offset, offset + limit);
  }

  async save(post: PostEntity): Promise<void> {
    this.inMemoryFallback.set(post.id, post);

    try {
      await this.prisma.post.upsert({
        where: { id: post.id },
        update: {
          title: post.title,
          content: post.content,
          visibility: post.visibility,
          updatedAt: post.updatedAt,
        },
        create: {
          id: post.id,
          communityId: post.communityId,
          authorId: post.authorId,
          title: post.title,
          content: post.content,
          visibility: post.visibility,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
        },
      });
    } catch (err) {
      this.logger.warn(`Prisma indisponible pour save(${post.id}), conservé en mémoire : ${(err as Error).message}`);
    }
  }

  async delete(id: string): Promise<void> {
    this.inMemoryFallback.delete(id);

    try {
      await this.prisma.post.delete({
        where: { id },
      });
    } catch (err) {
      this.logger.warn(`Prisma indisponible pour delete(${id}) : ${(err as Error).message}`);
    }
  }
}
