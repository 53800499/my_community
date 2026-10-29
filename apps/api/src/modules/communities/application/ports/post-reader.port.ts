import { PostEntity } from '../../domain/entities/post.entity.js';

export const POST_READER_PORT = Symbol('POST_READER_PORT');

/**
 * Port Abstrait de Lecture : Consultation des Publications (ISP, DIP)
 */
export interface PostReaderPort {
  findById(id: string): Promise<PostEntity | null>;
  listByCommunity(communityId: string, limit?: number, offset?: number): Promise<PostEntity[]>;
  listFeed(limit?: number, offset?: number): Promise<PostEntity[]>;
}
