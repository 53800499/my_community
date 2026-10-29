import { PostEntity, PostVisibilityType } from '../../domain/entities/post.entity.js';
import { PostResponseDto } from '../../presentation/http/dto/post-response.dto.js';

export interface PrismaPostRecord {
  id: string;
  communityId: string;
  authorId: string;
  title: string;
  content: string;
  visibility: string;
  publishedAt: Date;
  updatedAt: Date;
}

/**
 * Data Mapper Pattern : Isole les modèles techniques de persistance de l'Entité de Domaine
 */
export class PostMapper {
  public static toDomain(record: PrismaPostRecord): PostEntity {
    return PostEntity.create({
      id: record.id,
      communityId: record.communityId,
      authorId: record.authorId,
      title: record.title,
      content: record.content,
      visibility: record.visibility as PostVisibilityType,
      publishedAt: record.publishedAt,
      updatedAt: record.updatedAt,
    });
  }

  public static toResponseDto(entity: PostEntity): PostResponseDto {
    return {
      id: entity.id,
      communityId: entity.communityId,
      authorId: entity.authorId,
      title: entity.title,
      content: entity.content,
      visibility: entity.visibility,
      publishedAt: entity.publishedAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
