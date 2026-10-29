import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CommentEntity } from '../../../domain/entities/comment.entity.js';

export class CommentResponseDto {
  @ApiProperty({ example: '8a556391-ef17-4861-8ff6-bd5bbf2f7223' })
  id!: string;

  @ApiProperty({ example: '4f79ff2c-c965-4af7-a99e-de4e4bf457dc' })
  postId!: string;

  @ApiProperty({ example: '3c89ff2c-c965-4af7-a99e-de4e4bf457d1' })
  authorId!: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  parentId!: string | null;

  @ApiProperty({ example: 'Excellente initiative citoyenne pour notre quartier !' })
  content!: string;

  @ApiProperty({ example: 'PUBLISHED' })
  status!: string;

  @ApiPropertyOptional({ type: () => [CommentResponseDto] })
  replies?: CommentResponseDto[];

  @ApiProperty({ example: '2026-10-28T16:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-28T16:00:00.000Z' })
  updatedAt!: string;

  public static fromDomain(
    entity: CommentEntity,
    replies?: CommentEntity[],
  ): CommentResponseDto {
    const dto = new CommentResponseDto();
    dto.id = entity.id;
    dto.postId = entity.postId;
    dto.authorId = entity.authorId;
    dto.parentId = entity.parentId || null;
    dto.content = entity.content;
    dto.status = entity.status;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    if (replies) {
      dto.replies = replies.map((r) => CommentResponseDto.fromDomain(r));
    }
    return dto;
  }
}
