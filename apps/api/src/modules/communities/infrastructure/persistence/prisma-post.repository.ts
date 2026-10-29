import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/database/prisma.service.js';
import { PostEntity } from '../../domain/entities/post.entity.js';
import { PostReaderPort } from '../../application/ports/post-reader.port.js';
import { PostWriterPort } from '../../application/ports/post-writer.port.js';
import { PostMapper } from '../mappers/post.mapper.js';

/**
 * Adaptateur de Persistance Prisma Pur : Implémente PostReaderPort et PostWriterPort (LSP, DIP).
 * Supprime les mocks / caches mémoire pour s'appuyer strictement sur la base de données PostgreSQL.
 */
@Injectable()
export class PrismaPostRepository implements PostReaderPort, PostWriterPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PostEntity | null> {
    const raw = await this.prisma.post.findUnique({
      where: { id },
    });
    return raw ? PostMapper.toDomain(raw) : null;
  }

  async listByCommunity(communityId: string, limit: number = 50, offset: number = 0): Promise<PostEntity[]> {
    const records = await this.prisma.post.findMany({
      where: { communityId },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return records.map((r) => PostMapper.toDomain(r));
  }

  async listFeed(limit: number = 50, offset: number = 0): Promise<PostEntity[]> {
    const records = await this.prisma.post.findMany({
      where: { visibility: { in: ['PUBLIC', 'COMMUNITY'] } },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return records.map((r) => PostMapper.toDomain(r));
  }

  async save(post: PostEntity): Promise<void> {
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
  }

  async delete(id: string): Promise<void> {
    await this.prisma.post.delete({
      where: { id },
    });
  }
}
